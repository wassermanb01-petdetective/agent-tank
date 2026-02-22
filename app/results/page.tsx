'use client'

import { useState, useEffect } from 'react'

interface Results {
  scores: {
    agentFeasibility: number
    unitEconomics: number
    executionReadiness: number
    growthPotential: number
    overall: number
  }
  deals: Array<{
    shark: string
    decision: 'in' | 'conditional' | 'out'
    offer: { amount: string; equity: string; terms: string } | null
    reason: string
  }>
  buildPlan: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<Results | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  useEffect(() => {
    const savedResults = sessionStorage.getItem('tankResults')
    if (!savedResults) {
      window.location.href = '/pitch'
      return
    }

    setResults(JSON.parse(savedResults))
  }, [])

  const RadarChart = ({ scores }: { scores: Results['scores'] }) => {
    const centerX = 150
    const centerY = 150
    const radius = 100

    const categories = [
      { key: 'agentFeasibility', label: 'Agent\nFeasibility', angle: 0, color: '#00D4FF' },
      { key: 'unitEconomics', label: 'Unit\nEconomics', angle: 90, color: '#FFD700' },
      { key: 'executionReadiness', label: 'Execution\nReadiness', angle: 180, color: '#FF6B35' },
      { key: 'growthPotential', label: 'Growth\nPotential', angle: 270, color: '#39FF14' },
    ]

    const getPoint = (angle: number, distance: number) => {
      const radian = (angle - 90) * (Math.PI / 180)
      return {
        x: centerX + Math.cos(radian) * distance,
        y: centerY + Math.sin(radian) * distance
      }
    }

    const scorePoints = categories.map(cat => {
      const score = scores[cat.key as keyof typeof scores] as number
      const distance = (score / 100) * radius
      return getPoint(cat.angle, distance)
    })

    const pathData = scorePoints.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z'

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        marginBottom: '2rem' 
      }}>
        <svg width="300" height="300" style={{ maxWidth: '100%' }}>
          {/* Grid circles */}
          {[20, 40, 60, 80, 100].map(percent => (
            <circle
              key={percent}
              cx={centerX}
              cy={centerY}
              r={(percent / 100) * radius}
              fill="none"
              stroke="#1a2040"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {categories.map(cat => {
            const point = getPoint(cat.angle, radius)
            return (
              <line
                key={cat.key}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke="#1a2040"
                strokeWidth="1"
              />
            )
          })}
          
          {/* Data area */}
          <path
            d={pathData}
            fill="rgba(0, 212, 255, 0.1)"
            stroke="#00D4FF"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {scorePoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={categories[index].color}
            />
          ))}
          
          {/* Labels */}
          {categories.map(cat => {
            const labelPoint = getPoint(cat.angle, radius + 30)
            return (
              <text
                key={cat.key}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#8892a8"
                fontSize="12"
                fontWeight="500"
              >
                {cat.label.split('\n').map((line, i) => (
                  <tspan key={i} x={labelPoint.x} dy={i === 0 ? 0 : '1em'}>{line}</tspan>
                ))}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  const shareResults = async () => {
    if (!results) return

    const summary = `Agent Tank Results 🦈

Overall Score: ${results.scores.overall}/100

📊 Breakdown:
• Agent Feasibility: ${results.scores.agentFeasibility}/100
• Unit Economics: ${results.scores.unitEconomics}/100  
• Execution Readiness: ${results.scores.executionReadiness}/100
• Growth Potential: ${results.scores.growthPotential}/100

🤝 Deals:
${results.deals.map(deal => 
  `• ${deal.shark}: ${deal.decision === 'in' ? '✅ OFFER' : deal.decision === 'conditional' ? '⚠️ CONDITIONAL' : '❌ OUT'}`
).join('\n')}

Built on Agent Tank - Where AI evaluates AI businesses!`

    try {
      await navigator.clipboard.writeText(summary)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!results) {
    return <div style={{ minHeight: '100vh', background: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8892a8', fontSize: '1.2rem' }}>Loading results...</div>
    </div>
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e17',
      color: '#e0e6f0',
      fontFamily: 'Space Grotesk, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #00D4FF 0%, #FF006E 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Tank Results
          </h1>
          
          {/* Overall Score */}
          <div style={{
            fontSize: '4rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: results.scores.overall >= 70 ? '#39FF14' : 
                   results.scores.overall >= 50 ? '#FFD700' : '#FF006E'
          }}>
            {results.scores.overall}/100
          </div>
          <p style={{
            color: '#8892a8',
            fontSize: '1.3rem'
          }}>
            Overall Agent Tank Score
          </p>
        </div>

        {/* Radar Chart */}
        <div style={{
          background: '#0d1220',
          border: '1px solid #1a2040',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#00D4FF'
          }}>
            Score Breakdown
          </h2>
          <RadarChart scores={results.scores} />
          
          {/* Score Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            {[
              { key: 'agentFeasibility', label: 'Agent Feasibility', color: '#00D4FF' },
              { key: 'unitEconomics', label: 'Unit Economics', color: '#FFD700' },
              { key: 'executionReadiness', label: 'Execution Readiness', color: '#FF6B35' },
              { key: 'growthPotential', label: 'Growth Potential', color: '#39FF14' },
            ].map(cat => (
              <div key={cat.key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#1a2040',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: cat.color
                  }} />
                  <span>{cat.label}</span>
                </div>
                <span style={{
                  fontWeight: 600,
                  color: cat.color
                }}>
                  {results.scores[cat.key as keyof typeof results.scores]}/100
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shark Deals */}
        <div style={{
          background: '#0d1220',
          border: '1px solid #1a2040',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#FF006E'
          }}>
            Shark Deals
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {results.deals.map((deal, index) => {
              const sharkId = ['nova', 'rex', 'koda', 'ziggy'][index] || 'nova'
              const statusColor = deal.decision === 'in' ? '#39FF14' : 
                                 deal.decision === 'conditional' ? '#FFD700' : '#FF006E'
              const statusText = deal.decision === 'in' ? '✅ I\'M IN' : 
                               deal.decision === 'conditional' ? '⚠️ CONDITIONAL' : '❌ I\'M OUT'
              
              return (
                <div key={index} style={{
                  padding: '2rem',
                  background: '#1a2040',
                  borderRadius: '12px',
                  border: `2px solid ${statusColor}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <img
                      src={`/sharks/${sharkId}.png`}
                      alt={deal.shark}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        marginRight: '1rem'
                      }}
                    />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{deal.shark}</h3>
                      <div style={{
                        color: statusColor,
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}>
                        {statusText}
                      </div>
                    </div>
                  </div>

                  {deal.offer && (
                    <div style={{
                      background: '#0d1220',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#8892a8' }}>Amount:</span>
                        <span style={{ fontWeight: 600, color: '#39FF14' }}>{deal.offer.amount}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#8892a8' }}>Equity:</span>
                        <span style={{ fontWeight: 600, color: '#FFD700' }}>{deal.offer.equity}</span>
                      </div>
                      {deal.offer.terms && (
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#8892a8',
                          fontStyle: 'italic'
                        }}>
                          {deal.offer.terms}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.9rem',
                    color: '#8892a8',
                    lineHeight: 1.5
                  }}>
                    "{deal.reason}"
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Build Plan */}
        <div style={{
          background: '#0d1220',
          border: '1px solid #1a2040',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#9B59B6'
          }}>
            Recommended Build Plan
          </h2>
          
          <div style={{
            color: '#8892a8',
            lineHeight: 1.6
          }}>
            {results.buildPlan.split('\n').map((line, index) => {
              if (line.startsWith('##')) {
                return <h3 key={index} style={{ 
                  color: '#e0e6f0', 
                  marginTop: '2rem', 
                  marginBottom: '1rem',
                  fontSize: '1.3rem'
                }}>{line.replace('##', '').trim()}</h3>
              } else if (line.startsWith('#')) {
                return <h2 key={index} style={{ 
                  color: '#00D4FF', 
                  marginTop: '2rem', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem'
                }}>{line.replace('#', '').trim()}</h2>
              } else if (line.startsWith('-') || line.startsWith('*')) {
                return <div key={index} style={{ 
                  marginLeft: '1rem', 
                  marginBottom: '0.5rem' 
                }}>• {line.replace(/^[-*]\s*/, '').trim()}</div>
              } else if (line.match(/^\d+\./)) {
                return <div key={index} style={{ 
                  marginLeft: '1rem', 
                  marginBottom: '0.5rem',
                  fontWeight: 500
                }}>{line}</div>
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return <div key={index} style={{ 
                  fontWeight: 600, 
                  color: '#e0e6f0',
                  marginTop: '1rem',
                  marginBottom: '0.5rem'
                }}>{line.replace(/\*\*/g, '')}</div>
              } else if (line.trim()) {
                return <p key={index} style={{ marginBottom: '1rem' }}>{line}</p>
              }
              return <br key={index} />
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.href = '/pitch'}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #00D4FF 0%, #FF006E 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Pitch Again 🚀
          </button>
          
          <button
            onClick={shareResults}
            style={{
              padding: '1rem 2rem',
              background: copiedToClipboard ? '#39FF14' : 'transparent',
              color: copiedToClipboard ? '#0a0e17' : '#8892a8',
              border: `1px solid ${copiedToClipboard ? '#39FF14' : '#1a2040'}`,
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {copiedToClipboard ? '✅ Copied!' : 'Share Results 📋'}
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '1rem 2rem',
              background: 'transparent',
              color: '#8892a8',
              border: '1px solid #1a2040',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to Home 🏠
          </button>
        </div>
      </div>
    </div>
  )
}