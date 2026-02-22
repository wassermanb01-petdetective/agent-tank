'use client'

import { useState } from 'react'
import type { PitchData } from '@/lib/types'

export default function PitchPage() {
  const [formData, setFormData] = useState<PitchData>({
    businessName: '',
    oneLiner: '',
    elevatorPitch: '',
    problem: '',
    agentSolution: '',
    agentArchitecture: '',
    humanInLoop: '',
    revenueModel: '',
    targetMarket: '',
    whyAgentRun: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Store pitch data in sessionStorage for the tank page
      sessionStorage.setItem('pitchData', JSON.stringify(formData))
      
      // Redirect to tank page where the streaming will happen
      window.location.href = '/tank'
    } catch (error) {
      console.error('Error submitting pitch:', error)
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof PitchData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        maxWidth: '800px',
        margin: '0 auto'
      }}>
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
            Pitch Your Agent
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#8892a8',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Present your agentic business idea to our panel of AI-powered sharks. 
            They'll evaluate feasibility, economics, and growth potential.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: '#0d1220',
          border: '1px solid #1a2040',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          {/* Business Overview */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#00D4FF',
              marginBottom: '1.5rem',
              fontWeight: 600
            }}>
              Business Overview
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="What's your business called?"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                One-Liner *
              </label>
              <input
                type="text"
                value={formData.oneLiner}
                onChange={(e) => updateField('oneLiner', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="Describe your business in one compelling sentence"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Elevator Pitch *
              </label>
              <textarea
                value={formData.elevatorPitch}
                onChange={(e) => updateField('elevatorPitch', e.target.value)}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Give us the full elevator pitch - what you do, why it matters, and how you'll win"
              />
            </div>
          </section>

          {/* Problem & Solution */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#FF006E',
              marginBottom: '1.5rem',
              fontWeight: 600
            }}>
              Problem & Solution
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Problem Statement *
              </label>
              <textarea
                value={formData.problem}
                onChange={(e) => updateField('problem', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="What problem are you solving? Why does it matter?"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Agent Solution *
              </label>
              <textarea
                value={formData.agentSolution}
                onChange={(e) => updateField('agentSolution', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="How do AI agents solve this problem better than humans or traditional software?"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Agent Architecture *
              </label>
              <textarea
                value={formData.agentArchitecture}
                onChange={(e) => updateField('agentArchitecture', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Describe your agent stack, models, tools, frameworks. Be specific about your technical approach."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Human-in-the-Loop *
              </label>
              <textarea
                value={formData.humanInLoop}
                onChange={(e) => updateField('humanInLoop', e.target.value)}
                required
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Where and when do humans intervene? How do you handle edge cases?"
              />
            </div>
          </section>

          {/* Business Model */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#FFD700',
              marginBottom: '1.5rem',
              fontWeight: 600
            }}>
              Business Model
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Revenue Model *
              </label>
              <textarea
                value={formData.revenueModel}
                onChange={(e) => updateField('revenueModel', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="How do you make money? What are your unit economics? Include pricing strategy."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
                Target Market *
              </label>
              <textarea
                value={formData.targetMarket}
                onChange={(e) => updateField('targetMarket', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Who are your customers? Market size? How will you reach them?"
              />
            </div>
          </section>

          {/* Strategy */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#39FF14',
              marginBottom: '1.5rem',
              fontWeight: 600
            }}>
              Strategy
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e0e6f0',
                fontWeight: 500
              }}>
              Why Agent-Run? *
              </label>
              <textarea
                value={formData.whyAgentRun}
                onChange={(e) => updateField('whyAgentRun', e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#1a2040',
                  border: '1px solid #2a3650',
                  borderRadius: '12px',
                  color: '#e0e6f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Why is this business perfect for AI agents? What makes it agent-native vs. agent-assisted?"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: isSubmitting ? '#556' : 'linear-gradient(135deg, #00D4FF 0%, #FF006E 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isSubmitting ? 'Entering the Tank...' : 'Face the Sharks 🦈'}
          </button>
        </form>
      </div>
    </div>
  )
}