import type { SharkFeedback } from './types'

export function extractScore(text: string): number {
  const patterns = [
    /(?:score|verdict)[^0-9]*(\d{1,3})\s*(?:\/\s*100)?/i,
    /(\d{1,3})\s*\/\s*100/,
    /(\d{1,3})\s*out of\s*100/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const n = parseInt(m[1])
      if (n >= 1 && n <= 100) return n
    }
  }
  return 45 // default — skeptical baseline
}

export function extractFeedback(text: string, score: number): SharkFeedback {
  // Try to parse structured feedback from the analysis
  const actions: string[] = []

  // Look for numbered improvement items or "To move me..." patterns
  const movePattern = /To move me[^:]*:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|\n\d\.\s|$)/i
  const moveMatch = text.match(movePattern)
  if (moveMatch) {
    const items = moveMatch[1].split(/\n[-•*]\s*|\n\d+\.\s*/).filter(s => s.trim().length > 10)
    actions.push(...items.map(s => s.trim()).slice(0, 3))
  }

  // Fallback: extract sentences containing "need", "must", "should", "address", "missing"
  if (actions.length === 0) {
    const sentences = text.match(/[^.!?]*(?:need|must|should|address|missing|lacking|require)[^.!?]*[.!?]/gi) || []
    actions.push(...sentences.map(s => s.trim()).slice(0, 3))
  }

  // Final fallback
  if (actions.length === 0) {
    actions.push('Provide more specific details in your pitch')
  }

  const targetScore = score < 65 ? 75 : score < 80 ? 85 : 90

  return {
    currentScore: score,
    targetScore,
    actions: actions.slice(0, 3),
  }
}

/**
 * Compute overall score with harsh weighting.
 * Any score below 50 acts as a heavy drag on the overall.
 */
export function computeOverallScore(scores: {
  agentFeasibility: number
  unitEconomics: number
  executionReadiness: number
  growthPotential: number
}): number {
  const values = [
    scores.agentFeasibility,
    scores.unitEconomics,
    scores.executionReadiness,
    scores.growthPotential,
  ]

  // Base: weighted average (feasibility and economics weighted slightly higher)
  const weights = [0.3, 0.3, 0.25, 0.15]
  let weighted = values.reduce((sum, v, i) => sum + v * weights[i], 0)

  // Harsh penalty: any score below 50 drags overall significantly
  for (const v of values) {
    if (v < 50) {
      const deficit = 50 - v
      weighted -= deficit * 0.5 // additional penalty of half the deficit
    }
  }

  return Math.max(1, Math.min(100, Math.round(weighted)))
}

/**
 * Determine deal decision based on new thresholds.
 * In: 80+, Conditional: 65-79, Out: <65
 */
export function getDealDecision(score: number): 'in' | 'conditional' | 'out' {
  if (score >= 80) return 'in'
  if (score >= 65) return 'conditional'
  return 'out'
}
