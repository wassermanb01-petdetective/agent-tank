import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import type { PitchData, SharkEvaluation, TankResults, Scores, DealOutcome, FeedbackRoadmap, PreviousFeedback } from '@/lib/types'
import { SHARKS, DIRECTOR_SYSTEM, buildSharkPrompt } from '@/lib/sharks'
import { extractScore, extractFeedback, computeOverallScore, getDealDecision } from '@/lib/scoring'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pitchData: PitchData = body
    const previousFeedback: PreviousFeedback | undefined = body.previousFeedback
    const revisionNumber: number = body.revisionNumber || 1
    const sessionId = nanoid()

    const sessionsDir = '/tmp/agent-tank-sessions'
    if (!existsSync(sessionsDir)) {
      await mkdir(sessionsDir, { recursive: true })
    }

    const sessionFile = path.join(sessionsDir, `${sessionId}.json`)
    await writeFile(sessionFile, JSON.stringify({
      id: sessionId,
      pitch: pitchData,
      revisionNumber,
      timestamp: Date.now(),
      status: 'evaluating'
    }))

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
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

          const revisionContext = revisionNumber > 1
            ? `\n\n--- REVISION ${revisionNumber} ---\nThis is revision #${revisionNumber} of this pitch. The pitcher received feedback and is resubmitting.`
            : ''

          const evaluations: SharkEvaluation[] = []

          const sharkPromises = SHARKS.map(async (shark) => {
            try {
              const sharkFeedback = previousFeedback?.perShark?.[shark.id] || null
              const systemPrompt = buildSharkPrompt(shark, sharkFeedback, revisionNumber)

              const completion = await getOpenAI().chat.completions.create({
                model: 'gpt-4o',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: pitchText + revisionContext }
                ],
                temperature: 0.7,
              })

              const analysis = completion.choices[0]?.message?.content || 'No analysis provided'
              const score = Math.max(1, Math.min(100, extractScore(analysis)))
              const feedback = extractFeedback(analysis, score)

              const evaluation: SharkEvaluation = {
                shark: shark.id,
                analysis,
                score,
                feedback,
              }

              evaluations.push(evaluation)

              const eventData = JSON.stringify({
                shark: shark.id,
                name: shark.name,
                title: shark.title,
                emoji: shark.emoji,
                color: shark.color,
                analysis,
                score,
                feedback,
              })

              controller.enqueue(encoder.encode(`event: shark\ndata: ${eventData}\n\n`))

              return evaluation
            } catch (error) {
              console.error(`Error evaluating shark ${shark.id}:`, error)
              const evaluation: SharkEvaluation = {
                shark: shark.id,
                analysis: `Error occurred during evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                score: 0,
                feedback: { currentScore: 0, targetScore: 65, actions: ['Resubmit for evaluation'] },
              }
              evaluations.push(evaluation)
              return evaluation
            }
          })

          await Promise.all(sharkPromises)

          // Director synthesis
          try {
            const evaluationSummary = evaluations.map(e =>
              `${SHARKS.find(s => s.id === e.shark)?.name}: Score ${e.score}/100\n${e.analysis}\n`
            ).join('\n---\n')

            const directorPrompt = `
Here are the shark evaluations for the pitch:

PITCH SUMMARY:
Business: ${pitchData.businessName}
One-liner: ${pitchData.oneLiner}
Revision: #${revisionNumber}

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

            let scores: Scores = {
              agentFeasibility: evaluations.find(e => e.shark === 'nova')?.score || 45,
              unitEconomics: evaluations.find(e => e.shark === 'rex')?.score || 45,
              executionReadiness: evaluations.find(e => e.shark === 'koda')?.score || 45,
              growthPotential: evaluations.find(e => e.shark === 'ziggy')?.score || 45,
              overall: 0,
            }

            let deals: DealOutcome[] = []

            const scoresMatch = directorResponse.match(/---SCORES---[\s\S]*?(\{[^}]+\})/)
            if (scoresMatch) {
              try {
                const parsedScores = JSON.parse(scoresMatch[1])
                scores = { ...scores, ...parsedScores }
              } catch (e) {
                console.error('Error parsing scores:', e)
              }
            }

            scores.overall = computeOverallScore(scores)

            const dealsMatch = directorResponse.match(/---DEALS---[\s\S]*?(\[[\s\S]*?\])/)
            if (dealsMatch) {
              try {
                deals = JSON.parse(dealsMatch[1])
              } catch (e) {
                console.error('Error parsing deals:', e)
              }
            }

            // Fallback deals
            if (deals.length === 0) {
              deals = SHARKS.map(shark => {
                const evaluation = evaluations.find(e => e.shark === shark.id)
                const score = evaluation?.score || 45
                const decision = getDealDecision(score)

                if (decision === 'in') {
                  return {
                    shark: shark.name,
                    decision,
                    offer: {
                      amount: `$${Math.round(100 + (score - 80) * 20)}K`,
                      equity: `${Math.round(12 - (score - 80) * 0.3)}%`,
                      terms: `Subject to ${shark.title.toLowerCase()} due diligence`
                    },
                    reason: `Exceptional score of ${score}/100`,
                  }
                } else if (decision === 'conditional') {
                  return {
                    shark: shark.name,
                    decision,
                    offer: null,
                    reason: `Score of ${score}/100 — conditional on addressing key concerns`,
                  }
                } else {
                  return {
                    shark: shark.name,
                    decision,
                    offer: null,
                    reason: `Score of ${score}/100 — below investment threshold of 65`,
                  }
                }
              })
            }

            const buildPlanMatch = directorResponse.match(new RegExp('---BUILDPLAN---[\\s\\S]*?(.*)$', 's'))
            const buildPlan = buildPlanMatch ? buildPlanMatch[1].trim() : '## Build plan unavailable — see shark feedback for next steps.'

            // Aggregate feedback
            const feedbackRoadmap: FeedbackRoadmap = {
              summary: scores.overall >= 80
                ? 'Strong pitch. Minor refinements recommended.'
                : scores.overall >= 65
                ? 'Promising but needs significant improvements before investment.'
                : 'Not investable in current form. Major rework required.',
              perShark: Object.fromEntries(evaluations.map(e => [e.shark, e.feedback])),
              prioritizedActions: evaluations
                .sort((a, b) => a.score - b.score)
                .flatMap(e => e.feedback.actions)
                .slice(0, 8),
            }

            const resubmitRecommended = scores.overall < 80 && scores.overall >= 40

            const finalResults: TankResults = {
              pitch: pitchData,
              evaluations,
              scores,
              deals,
              buildPlan,
              feedback: feedbackRoadmap,
              revisionNumber,
              resubmitRecommended,
            }

            await writeFile(sessionFile, JSON.stringify({
              ...finalResults,
              id: sessionId,
              timestamp: Date.now(),
              status: 'complete',
            }))

            controller.enqueue(encoder.encode(`event: results\ndata: ${JSON.stringify({
              scores,
              deals,
              buildPlan,
              feedback: feedbackRoadmap,
              revisionNumber,
              resubmitRecommended,
              sessionId,
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
