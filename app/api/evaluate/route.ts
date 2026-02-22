import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import type { PitchData, SharkEvaluation, TankResults, Scores, DealOutcome } from '@/lib/types'
import { SHARKS, DIRECTOR_SYSTEM } from '@/lib/sharks'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function POST(req: NextRequest) {
  try {
    const pitchData: PitchData = await req.json()
    const sessionId = nanoid()

    // Create sessions directory if it doesn't exist
    const sessionsDir = '/tmp/agent-tank-sessions'
    if (!existsSync(sessionsDir)) {
      await mkdir(sessionsDir, { recursive: true })
    }

    // Store initial pitch data
    const sessionFile = path.join(sessionsDir, `${sessionId}.json`)
    await writeFile(sessionFile, JSON.stringify({
      id: sessionId,
      pitch: pitchData,
      timestamp: Date.now(),
      status: 'evaluating'
    }))

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Format pitch for sharks
          const pitchText = `
Business: ${pitchData.businessName}
One-liner: ${pitchData.oneLiner}

Elevator Pitch:
${pitchData.elevatorPitch}

Problem:
${pitchData.problem}

Agent Solution:
${pitchData.agentSolution}

Agent Architecture:
${pitchData.agentArchitecture}

Human-in-the-Loop:
${pitchData.humanInLoop}

Revenue Model:
${pitchData.revenueModel}

Target Market:
${pitchData.targetMarket}

Why Agent-Run:
${pitchData.whyAgentRun}
          `.trim()

          const evaluations: SharkEvaluation[] = []

          // Evaluate each shark in parallel but stream results as they complete
          const sharkPromises = SHARKS.map(async (shark) => {
            try {
              const completion = await getOpenAI().chat.completions.create({
                model: 'gpt-4o',
                messages: [
                  { role: 'system', content: shark.system },
                  { role: 'user', content: pitchText }
                ],
                temperature: 0.7,
              })

              const analysis = completion.choices[0]?.message?.content || 'No analysis provided'
              
              // Extract score from the analysis (look for score pattern)
              const scoreMatch = analysis.match(/score[:\s]*(\d+)/i)
              let score = scoreMatch ? parseInt(scoreMatch[1]) : 50

              // Ensure score is within valid range
              score = Math.max(1, Math.min(100, score))

              const evaluation: SharkEvaluation = {
                shark: shark.id,
                analysis,
                score
              }

              evaluations.push(evaluation)

              // Stream this shark's evaluation
              const eventData = JSON.stringify({
                shark: shark.id,
                name: shark.name,
                title: shark.title,
                emoji: shark.emoji,
                color: shark.color,
                analysis,
                score
              })

              controller.enqueue(encoder.encode(`event: shark\ndata: ${eventData}\n\n`))

              return evaluation
            } catch (error) {
              console.error(`Error evaluating shark ${shark.id}:`, error)
              const evaluation: SharkEvaluation = {
                shark: shark.id,
                analysis: `Error occurred during evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                score: 0
              }
              evaluations.push(evaluation)
              return evaluation
            }
          })

          // Wait for all sharks to complete
          await Promise.all(sharkPromises)

          // Now get director results
          try {
            const evaluationSummary = evaluations.map(e => 
              `${SHARKS.find(s => s.id === e.shark)?.name}: Score ${e.score}/100\n${e.analysis}\n`
            ).join('\n---\n')

            const directorPrompt = `
Here are the shark evaluations for the pitch:

PITCH SUMMARY:
Business: ${pitchData.businessName}
One-liner: ${pitchData.oneLiner}

SHARK EVALUATIONS:
${evaluationSummary}

Based on these evaluations, provide your director analysis.
            `.trim()

            const directorCompletion = await getOpenAI().chat.completions.create({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: DIRECTOR_SYSTEM },
                { role: 'user', content: directorPrompt }
              ],
              temperature: 0.3,
            })

            const directorResponse = directorCompletion.choices[0]?.message?.content || ''

            // Parse director response
            const scoresMatch = directorResponse.match(/---SCORES---[\s\S]*?(\{[^}]+\})/)
            const dealsMatch = directorResponse.match(/---DEALS---[\s\S]*?(\[[^\]]+\])/)
            const buildPlanMatch = directorResponse.match(/---BUILDPLAN---[\s\S]*?(.*)$/)

            let scores: Scores = {
              agentFeasibility: evaluations.find(e => e.shark === 'nova')?.score || 50,
              unitEconomics: evaluations.find(e => e.shark === 'rex')?.score || 50,
              executionReadiness: evaluations.find(e => e.shark === 'koda')?.score || 50,
              growthPotential: evaluations.find(e => e.shark === 'ziggy')?.score || 50,
              overall: 50
            }

            let deals: DealOutcome[] = []

            // Try to parse scores
            if (scoresMatch) {
              try {
                const parsedScores = JSON.parse(scoresMatch[1])
                scores = { ...scores, ...parsedScores }
                scores.overall = Math.round((scores.agentFeasibility + scores.unitEconomics + scores.executionReadiness + scores.growthPotential) / 4)
              } catch (e) {
                console.error('Error parsing scores:', e)
              }
            }

            // Try to parse deals
            if (dealsMatch) {
              try {
                deals = JSON.parse(dealsMatch[1])
              } catch (e) {
                console.error('Error parsing deals:', e)
                // Generate fallback deals based on scores
                deals = SHARKS.map(shark => {
                  const evaluation = evaluations.find(e => e.shark === shark.id)
                  const score = evaluation?.score || 50
                  
                  if (score >= 70) {
                    return {
                      shark: shark.name,
                      decision: 'in' as const,
                      offer: {
                        amount: `$${Math.round(100 + (score - 70) * 10)}K`,
                        equity: `${Math.round(8 + (80 - score) * 0.2)}%`,
                        terms: `Subject to ${shark.title.toLowerCase()} due diligence`
                      },
                      reason: `Strong score of ${score}/100 in my area of expertise`
                    }
                  } else if (score >= 50) {
                    return {
                      shark: shark.name,
                      decision: 'conditional' as const,
                      offer: null,
                      reason: `Conditional on addressing concerns raised in evaluation`
                    }
                  } else {
                    return {
                      shark: shark.name,
                      decision: 'out' as const,
                      offer: null,
                      reason: `Score of ${score}/100 is below my threshold`
                    }
                  }
                })
              }
            }

            const buildPlan = buildPlanMatch ? buildPlanMatch[1].trim() : `
## Quick Build Plan

### Recommended Agent Stack
- **Framework**: LangChain or CrewAI for agent orchestration
- **Models**: OpenAI GPT-4o for reasoning, Claude-3.5 for analysis
- **Tools**: Custom APIs and integrations based on your architecture

### MVP Features
1. Core agent functionality
2. Basic user interface
3. Essential integrations
4. Monitoring and logging

### Timeline
- **Week 1-2**: Core agent development
- **Week 3-4**: Integration and testing
- **Month 2**: MVP deployment and iteration

### First Steps
1. Set up development environment
2. Implement core agent logic
3. Build initial user interface
            `.trim()

            // Save full results to session file
            const finalResults: TankResults = {
              pitch: pitchData,
              evaluations,
              scores,
              deals,
              buildPlan
            }

            await writeFile(sessionFile, JSON.stringify({
              ...finalResults,
              id: sessionId,
              timestamp: Date.now(),
              status: 'complete'
            }))

            // Stream final results
            controller.enqueue(encoder.encode(`event: results\ndata: ${JSON.stringify({
              scores,
              deals,
              buildPlan,
              sessionId
            })}\n\n`))

          } catch (error) {
            console.error('Director evaluation error:', error)
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({
              error: 'Failed to generate final results'
            })}\n\n`))
          }

          controller.close()
          
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Evaluation API error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}