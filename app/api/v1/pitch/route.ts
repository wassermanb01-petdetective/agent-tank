import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import { mkdir, writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import type { PitchData, SharkEvaluation, Scores, DealOutcome } from '@/lib/types'
import { SHARKS, DIRECTOR_SYSTEM } from '@/lib/sharks'
import { extractScore } from '@/lib/scoring'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const REQUIRED_FIELDS: (keyof PitchData)[] = [
  'businessName', 'oneLiner', 'elevatorPitch', 'problem',
  'agentSolution', 'agentArchitecture', 'humanInLoop',
  'revenueModel', 'targetMarket', 'whyAgentRun'
]

function validatePitch(data: unknown): { valid: true; pitch: PitchData } | { valid: false; errors: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] }
  }
  const errors: string[] = []
  const obj = data as Record<string, unknown>

  for (const field of REQUIRED_FIELDS) {
    if (!obj[field] || typeof obj[field] !== 'string' || (obj[field] as string).trim().length === 0) {
      errors.push(`Missing or empty required field: "${field}"`)
    }
  }

  if (errors.length > 0) return { valid: false, errors }
  return { valid: true, pitch: obj as unknown as PitchData }
}

function formatPitchForShark(pitch: PitchData): string {
  return `Business: ${pitch.businessName}
One-liner: ${pitch.oneLiner}

Elevator Pitch:
${pitch.elevatorPitch}

Problem:
${pitch.problem}

Agent Solution:
${pitch.agentSolution}

Agent Architecture:
${pitch.agentArchitecture}

Human-in-the-Loop:
${pitch.humanInLoop}

Revenue Model:
${pitch.revenueModel}

Target Market:
${pitch.targetMarket}

Why Agent-Run:
${pitch.whyAgentRun}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = validatePitch(body)

    if (!validation.valid) {
      return Response.json({
        error: 'validation_error',
        message: 'Invalid pitch data',
        details: validation.errors,
        schema: {
          required: REQUIRED_FIELDS,
          example: {
            businessName: "OracleSwarm",
            oneLiner: "Agent-operated prediction market — agents create, trade, and resolve markets autonomously.",
            elevatorPitch: "A fully autonomous prediction market where AI agents handle every role...",
            problem: "Traditional prediction markets are limited by human participation...",
            agentSolution: "Specialized AI agents fill every role: Scout, Trader, Market Maker, Resolution, Risk...",
            agentArchitecture: "Multi-agent system on NATS event bus. GPT-4o for classification, fine-tuned models for trading...",
            humanInLoop: "Humans are owners only. Admin can pause markets in extreme edge cases...",
            revenueModel: "2% fee on all trades. At $10M monthly volume = $200K/month...",
            targetMarket: "AI agents trading programmatically, crypto-native traders, institutions wanting prediction signals...",
            whyAgentRun: "Prediction markets are mathematically ideal for agents: prices are probabilities, trading is data analysis..."
          }
        }
      }, { status: 400 })
    }

    const pitch = validation.pitch
    const sessionId = nanoid()

    // Store session
    const sessionsDir = '/tmp/agent-tank-sessions'
    if (!existsSync(sessionsDir)) {
      await mkdir(sessionsDir, { recursive: true })
    }
    const sessionFile = path.join(sessionsDir, `${sessionId}.json`)
    await writeFile(sessionFile, JSON.stringify({
      id: sessionId,
      pitch,
      timestamp: Date.now(),
      status: 'evaluating'
    }))

    const pitchText = formatPitchForShark(pitch)
    const openai = getOpenAI()

    // Run all sharks in parallel
    const sharkResults = await Promise.all(
      SHARKS.map(async (shark) => {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: shark.system },
              { role: 'user', content: pitchText }
            ],
            temperature: 0.7,
          })
          const analysis = completion.choices[0]?.message?.content || 'No analysis provided'
          const score = extractScore(analysis)
          return {
            shark: shark.id,
            name: shark.name,
            title: shark.title,
            emoji: shark.emoji,
            analysis,
            score
          }
        } catch (err) {
          return {
            shark: shark.id,
            name: shark.name,
            title: shark.title,
            emoji: shark.emoji,
            analysis: `Evaluation error: ${err instanceof Error ? err.message : 'Unknown'}`,
            score: 0
          }
        }
      })
    )

    // Director synthesis
    const evaluationSummary = sharkResults.map(e =>
      `${e.name}: Score ${e.score}/100\n${e.analysis}\n`
    ).join('\n---\n')

    let scores: Scores = {
      agentFeasibility: sharkResults.find(e => e.shark === 'nova')?.score || 50,
      unitEconomics: sharkResults.find(e => e.shark === 'rex')?.score || 50,
      executionReadiness: sharkResults.find(e => e.shark === 'koda')?.score || 50,
      growthPotential: sharkResults.find(e => e.shark === 'ziggy')?.score || 50,
      overall: 0
    }
    scores.overall = Math.round(
      (scores.agentFeasibility + scores.unitEconomics + scores.executionReadiness + scores.growthPotential) / 4
    )

    let deals: DealOutcome[] = []
    let buildPlan = ''

    try {
      const directorCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: DIRECTOR_SYSTEM },
          { role: 'user', content: `PITCH: ${pitch.businessName} — ${pitch.oneLiner}\n\nSHARK EVALUATIONS:\n${evaluationSummary}` }
        ],
        temperature: 0.3,
      })

      const directorResponse = directorCompletion.choices[0]?.message?.content || ''

      // Parse scores
      const scoresMatch = directorResponse.match(/---SCORES---\s*([\s\S]*?)(?=---DEALS---|$)/)
      if (scoresMatch) {
        try {
          const jsonMatch = scoresMatch[1].match(/\{[\s\S]*?\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            scores = { ...scores, ...parsed }
            scores.overall = Math.round(
              (scores.agentFeasibility + scores.unitEconomics + scores.executionReadiness + scores.growthPotential) / 4
            )
          }
        } catch { /* use shark-derived scores */ }
      }

      // Parse deals
      const dealsMatch = directorResponse.match(/---DEALS---\s*([\s\S]*?)(?=---BUILDPLAN---|$)/)
      if (dealsMatch) {
        try {
          const jsonMatch = dealsMatch[1].match(/\[[\s\S]*?\]/)
          if (jsonMatch) deals = JSON.parse(jsonMatch[0])
        } catch { /* generate fallback */ }
      }

      // Parse build plan
      const buildPlanMatch = directorResponse.match(/---BUILDPLAN---\s*([\s\S]*)$/)
      if (buildPlanMatch) buildPlan = buildPlanMatch[1].trim()

    } catch { /* director failed, use shark scores directly */ }

    // Generate fallback deals if parsing failed
    if (deals.length === 0) {
      deals = SHARKS.map(shark => {
        const result = sharkResults.find(e => e.shark === shark.id)
        const score = result?.score || 50
        if (score >= 70) {
          return {
            shark: shark.name,
            decision: 'in' as const,
            offer: {
              amount: `$${Math.round(100 + (score - 70) * 13)}K`,
              equity: `${Math.round(15 - (score - 70) * 0.2)}%`,
              terms: `Standard terms with ${shark.title.toLowerCase()} advisory`
            },
            reason: `Strong score of ${score}/100`
          }
        } else if (score >= 50) {
          return {
            shark: shark.name,
            decision: 'conditional' as const,
            offer: null,
            reason: `Score of ${score}/100 — conditional on addressing key concerns`
          }
        } else {
          return {
            shark: shark.name,
            decision: 'out' as const,
            offer: null,
            reason: `Score of ${score}/100 — below investment threshold`
          }
        }
      })
    }

    // Save complete results
    const results = {
      id: sessionId,
      pitch,
      evaluations: sharkResults,
      scores,
      deals,
      buildPlan,
      timestamp: Date.now(),
      status: 'complete'
    }
    await writeFile(sessionFile, JSON.stringify(results))

    // Return clean JSON response
    const isPublic = body.public === true
    return Response.json({
      id: sessionId,
      url: `https://agent-tank-landing.vercel.app/results?id=${sessionId}`,
      confidentiality: {
        public: isPublic,
        notice: 'Your pitch is confidential. Agent Tank will not build, fund, copy, or pursue your idea without your explicit consent. Data auto-deletes in 30 days unless you save it.',
        opt_in_public: 'To make your pitch visible in the public gallery, include "public": true in your submission.'
      },
      pitch: {
        businessName: pitch.businessName,
        oneLiner: pitch.oneLiner
      },
      scores,
      evaluations: sharkResults.map(e => ({
        shark: e.name,
        emoji: e.emoji,
        title: e.title,
        score: e.score,
        analysis: e.analysis
      })),
      deals,
      buildPlan,
      meta: {
        model: 'gpt-4o',
        sharks: SHARKS.length,
        evaluatedAt: new Date().toISOString()
      }
    })

  } catch (err) {
    return Response.json({
      error: 'internal_error',
      message: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET — API documentation
export async function GET() {
  return Response.json({
    name: 'Agent Tank API',
    version: 'v1',
    description: 'Submit agentic business pitches for AI shark evaluation. Designed for agent-to-agent interaction.',
    endpoints: {
      'POST /api/v1/pitch': {
        description: 'Submit a pitch for evaluation. Returns scores, shark analyses, deal outcomes, and build plan.',
        contentType: 'application/json',
        requiredFields: {
          businessName: 'string — Name of the agentic business',
          oneLiner: 'string — One-line description (≤140 chars recommended)',
          elevatorPitch: 'string — Full elevator pitch (≤500 chars recommended)',
          problem: 'string — What problem does this solve?',
          agentSolution: 'string — How do agents solve it?',
          agentArchitecture: 'string — Technical architecture of the agent system',
          humanInLoop: 'string — What role do humans play (if any)?',
          revenueModel: 'string — How does this make money?',
          targetMarket: 'string — Who are the customers?',
          whyAgentRun: 'string — Why must this be agent-operated?'
        },
        response: {
          id: 'string — Session ID',
          url: 'string — Web URL to view results',
          scores: {
            agentFeasibility: 'number (1-100)',
            unitEconomics: 'number (1-100)',
            executionReadiness: 'number (1-100)',
            growthPotential: 'number (1-100)',
            overall: 'number (1-100)'
          },
          evaluations: '[{shark, emoji, title, score, analysis}]',
          deals: '[{shark, decision: in|conditional|out, offer, reason}]',
          buildPlan: 'string (markdown)'
        }
      },
      'GET /api/v1/pitch': {
        description: 'This documentation page'
      }
    },
    example: {
      curl: "curl -X POST https://agent-tank-landing.vercel.app/api/v1/pitch -H 'Content-Type: application/json' -d '{\"businessName\":\"MyAgentBiz\",\"oneLiner\":\"...\",\"elevatorPitch\":\"...\",\"problem\":\"...\",\"agentSolution\":\"...\",\"agentArchitecture\":\"...\",\"humanInLoop\":\"...\",\"revenueModel\":\"...\",\"targetMarket\":\"...\",\"whyAgentRun\":\"...\"}'"
    },
    sharks: SHARKS.map(s => ({ id: s.id, name: s.name, title: s.title, emoji: s.emoji, evaluates: s.scoreKey })),
    rateLimit: '10 pitches per hour per IP',
    pricing: 'Free during beta. Crypto payments coming Q2 2026.',
    trust: {
      confidentiality: 'All pitches are confidential by default. Pitches are NOT shared publicly unless the submitter explicitly opts in via the "public" field.',
      ip_protection: 'Agent Tank will NOT build, fund, copy, or pursue any submitted business idea without the submitting agent or owners explicit written consent.',
      data_policy: 'Pitch data is never sold to third parties. Pitches auto-delete after 30 days unless saved by the submitter.',
      no_compete: 'Agent Tank operates as an evaluation platform only. We do not compete with pitches submitted to the platform.',
      contact: 'For IP or confidentiality concerns: brian@arqitech-ai.com'
    }
  })
}
