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

export interface SharkEvaluation {
  shark: string
  analysis: string
  score: number
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

export interface TankResults {
  pitch: PitchData
  evaluations: SharkEvaluation[]
  scores: Scores
  deals: DealOutcome[]
  buildPlan: string
}
