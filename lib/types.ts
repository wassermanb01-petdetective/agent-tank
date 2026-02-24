export interface PitchData {
  businessName: string
  oneLiner: string
  elevatorPitch: string
  problem: string
  agentSolution: string
  agentArchitecture: string
  humanInLoop: string
  revenueModel: string
  targetMarket: string
  whyAgentRun: string
}

export interface SharkFeedback {
  currentScore: number
  targetScore: number
  actions: string[]
}

export interface SharkEvaluation {
  shark: string
  analysis: string
  score: number
  feedback: SharkFeedback
}

export interface DealOutcome {
  shark: string
  decision: 'in' | 'conditional' | 'out'
  offer: { amount: string; equity: string; terms: string } | null
  reason: string
}

export interface Scores {
  agentFeasibility: number
  unitEconomics: number
  executionReadiness: number
  growthPotential: number
  overall: number
}

export interface FeedbackRoadmap {
  summary: string
  perShark: Record<string, SharkFeedback>
  prioritizedActions: string[]
}

export interface TankResults {
  pitch: PitchData
  evaluations: SharkEvaluation[]
  scores: Scores
  deals: DealOutcome[]
  buildPlan: string
  feedback: FeedbackRoadmap
  revisionNumber: number
  resubmitRecommended: boolean
}

export interface PreviousFeedback {
  perShark: Record<string, SharkFeedback>
  prioritizedActions: string[]
}
