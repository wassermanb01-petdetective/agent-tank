'use client'

import { useState, useEffect } from 'react'
import type { PitchData, TankResults } from '@/lib/types'

interface SharkState {
  shark: string
  name: string
  title: string
  emoji: string
  color: string
  analysis: string
  score: number
  revealed: boolean
}

export default function TankPage() {
  const [pitchData, setPitchData] = useState<PitchData | null>(null)
  const [sharks, setSharks] = useState<SharkState[]>([])
  const [results, setResults] = useState<any>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('The sharks are deliberating...')

  useEffect(() => {
    // Get pitch data from sessionStorage
    const savedPitch = sessionStorage.getItem('pitchData')
    if (!savedPitch) {
      window.location.href = '/pitch'
      return
    }

    const pitch: PitchData = JSON.parse(savedPitch)
    setPitchData(pitch)
    setIsEvaluating(true)

    // Start the evaluation stream
    startEvaluation(pitch)
  }, [])

  const startEvaluation = async (pitch: PitchData) => {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pitch),
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      const messages = [
        'The sharks are reviewing your pitch...',
        'They\'re analyzing the technical feasibility...',
        'Running unit economics calculations...',
        'Evaluating execution potential...',
        'Assessing growth opportunities...'
      ]
      
      let messageIndex = 0
      const messageInterval = setInterval(() => {
        if (messageIndex < messages.length - 1) {
          messageIndex++
          setCurrentMessage(messages[messageIndex])
        }
      }, 2000)

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (line.includes('event: shark')) {
                // Add shark evaluation with animation delay
                setTimeout(() => {
                  setSharks(prev => {
                    const existing = prev.find(s => s.shark === data.shark)
                    if (existing) return prev
                    
                    return [...prev, {
                      ...data,
                      revealed: true
                    }].sort((a, b) => {
                      const order = ['nova', 'rex', 'koda', 'ziggy']
                      return order.indexOf(a.shark) - order.indexOf(b.shark)
                    })
                  })
                }, Math.random() * 1000 + 500) // Random delay for dramatic effect
              } else if (line.includes('event: results')) {
                clearInterval(messageInterval)
                setResults(data)
                setIsEvaluating(false)
                setCurrentMessage('Evaluation complete!')
                
                // Store results for the results page
                sessionStorage.setItem('tankResults', JSON.stringify(data))
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      setIsEvaluating(false)
      setCurrentMessage('Something went wrong during evaluation')
    }
  }

  if (!pitchData) {
    return <div style={{ minHeight: '100vh', background: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8892a8', fontSize: '1.2rem' }}>Loading...</div>
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
            The Tank
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#8892a8',
            marginBottom: '0.5rem'
          }}>
            {pitchData.businessName}
          </h2>
          <p style={{
            color: '#556',
            fontSize: '1.1rem'
          }}>
            {pitchData.oneLiner}
          </p>
        </div>

        {/* Status Message */}
        {isEvaluating && (
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '2rem',
            background: '#0d1220',
            border: '1px solid #1a2040',
            borderRadius: '16px'
          }}>
            <div style={{
              fontSize: '1.5rem',
              marginBottom: '1rem'
            }}>
              🦈🦈🦈🦈
            </div>
            <div style={{
              color: '#00D4FF',
              fontSize: '1.3rem',
              fontWeight: 600
            }}>
              {currentMessage}
            </div>
          </div>
        )}

        {/* Sharks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {sharks.map((shark) => (
            <div
              key={shark.shark}
              style={{
                background: '#0d1220',
                border: '1px solid #1a2040',
                borderRadius: '16px',
                padding: '2rem',
                opacity: shark.revealed ? 1 : 0,
                transform: shark.revealed ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease'
              }}
            >
              {/* Shark Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <img
                  src={`/sharks/${shark.shark}.png`}
                  alt={shark.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    marginRight: '1rem'
                  }}
                />
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    color: shark.color
                  }}>
                    {shark.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#8892a8',
                    fontSize: '0.9rem'
                  }}>
                    {shark.title}
                  </p>
                </div>
              </div>

              {/* Score Bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#8892a8' }}>Score</span>
                  <span style={{
                    color: shark.score >= 70 ? '#39FF14' : shark.score >= 50 ? '#FFD700' : '#FF006E',
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}>
                    {shark.score}/100
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#1a2040',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${shark.score}%`,
                    height: '100%',
                    background: shark.score >= 70 ? '#39FF14' : shark.score >= 50 ? '#FFD700' : '#FF006E',
                    transition: 'width 1.5s ease'
                  }} />
                </div>
              </div>

              {/* Analysis Preview */}
              <div style={{
                color: '#8892a8',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {shark.analysis.split('\n')[0].substring(0, 120)}...
              </div>
            </div>
          ))}
        </div>

        {/* Results Section */}
        {results && !isEvaluating && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#0d1220',
            border: '1px solid #1a2040',
            borderRadius: '16px'
          }}>
            <h2 style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: '#00D4FF'
            }}>
              The Verdict Is In!
            </h2>
            <div style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: results.scores?.overall >= 70 ? '#39FF14' : 
                    results.scores?.overall >= 50 ? '#FFD700' : '#FF006E'
            }}>
              {results.scores?.overall || 0}/100
            </div>
            <p style={{
              color: '#8892a8',
              marginBottom: '2rem',
              fontSize: '1.1rem'
            }}>
              Overall Score
            </p>

            {/* Deal Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              {['in', 'conditional', 'out'].map(decision => {
                const count = results.deals?.filter((d: any) => d.decision === decision).length || 0
                const color = decision === 'in' ? '#39FF14' : decision === 'conditional' ? '#FFD700' : '#FF006E'
                return (
                  <div key={decision} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', color, fontWeight: 600 }}>{count}</div>
                    <div style={{ color: '#8892a8', textTransform: 'capitalize' }}>
                      {decision === 'in' ? 'Offers' : decision === 'conditional' ? 'Conditionals' : 'Passes'}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => window.location.href = '/results'}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #00D4FF 0%, #FF006E 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              View Full Results 📊
            </button>
            
            <button
              onClick={() => window.location.href = '/pitch'}
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
              Pitch Again 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  )
}