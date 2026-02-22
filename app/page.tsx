'use client'
import { useState, useEffect, useRef } from 'react'

const sharks = [
  { emoji: '🔧', name: 'Nova Stackwell', title: 'The Technical Architect', quote: 'Show me the agent graph or show yourself out.', desc: 'Precise, methodical. Finds the single point of failure in your agent pipeline before you finish talking.', color: '#00D4FF' },
  { emoji: '💰', name: 'Rex Margins', title: 'The Unit Economics Hawk', quote: 'Revenue per agent-hour. That\'s the only number.', desc: 'Fast-talking, intense. If your agents cost more than humans, you\'re dead to him.', color: '#FFD700' },
  { emoji: '🔮', name: 'Sable Horizon', title: 'The Market Visionary', quote: 'Is this a feature or a future?', desc: 'Calm, strategic. Sees agent-native categories before they exist.', color: '#9B59B6' },
  { emoji: '⚙️', name: 'Koda Runtime', title: 'The Operator', quote: 'Cool. What happens when your agent hallucinates at 3 AM?', desc: 'Blunt, battle-scarred. Three agentic businesses built — one spectacular public failure.', color: '#FF6B35' },
  { emoji: '🛡️', name: 'Vera Sentinel', title: 'The Ethics & Risk Analyst', quote: 'Who\'s liable when your agent goes rogue?', desc: 'Thoughtful, terrifying in her specificity. Trust is the only moat that matters.', color: '#FF006E' },
  { emoji: '🌐', name: 'Ziggy Swarm', title: 'The Community Builder', quote: 'One agent is a tool. A million agents is an economy.', desc: 'High-energy, youngest shark. If it doesn\'t compound, he doesn\'t care.', color: '#39FF14' },
]

const steps = [
  { icon: '🤖', title: 'Submit Your Agent Business', desc: 'Describe a business designed to run autonomously on AI agents. No humans in the loop.' },
  { icon: '🦈', title: 'Face the Tank', desc: 'Six AI sharks interrogate your architecture, economics, operations, and growth potential.' },
  { icon: '⚡', title: 'Get Funded or Get Wrecked', desc: 'Walk out with investment offers, scores, and a build plan — or learn why your agents aren\'t ready.' },
]

const scores = [
  { label: 'Agent Feasibility', value: 92 },
  { label: 'Market Viability', value: 78 },
  { label: 'Unit Economics', value: 85 },
  { label: 'Execution Readiness', value: 71 },
  { label: 'Trust & Safety', value: 88 },
  { label: 'Growth Potential', value: 67 },
]

function WaitlistForm({ id }: { id?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const r = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      if (r.ok) { setStatus('done'); setEmail('') } else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <form onSubmit={submit} id={id} style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
      <input type="email" required placeholder="your@agent.ai" value={email} onChange={e => setEmail(e.target.value)}
        style={{ flex: '1 1 260px', padding: '14px 20px', borderRadius: 8, border: '1px solid #1a2040', background: '#0d1220', color: '#fff', fontSize: 16, fontFamily: 'inherit', outline: 'none' }}
        onFocus={e => e.target.style.borderColor = '#00D4FF'} onBlur={e => e.target.style.borderColor = '#1a2040'} />
      <button type="submit" disabled={status === 'loading'}
        style={{ padding: '14px 28px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00D4FF, #FF006E)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {status === 'loading' ? '...' : status === 'done' ? '✓ You\'re In!' : 'Enter the Waitlist'}
      </button>
      {status === 'error' && <p style={{ color: '#FF006E', fontSize: 14, width: '100%', textAlign: 'center', margin: 0 }}>Something went wrong. Try again.</p>}
    </form>
  )
}

function RadarChart() {
  const cx = 120, cy = 120, r = 90
  const pts = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2
    const pr = (s.value / 100) * r
    return { x: cx + pr * Math.cos(angle), y: cy + pr * Math.sin(angle), lx: cx + (r + 22) * Math.cos(angle), ly: cy + (r + 22) * Math.sin(angle) }
  })
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ')
  const grid = [0.25, 0.5, 0.75, 1].map(f => {
    const gpts = scores.map((_, i) => {
      const a = (Math.PI * 2 * i) / scores.length - Math.PI / 2
      return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`
    }).join(' ')
    return <polygon key={f} points={gpts} fill="none" stroke="#1a2040" strokeWidth={1} />
  })

  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', maxWidth: 240 }}>
      {grid}
      <polygon points={poly} fill="rgba(0,212,255,0.15)" stroke="#00D4FF" strokeWidth={2} />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#00D4FF" />)}
    </svg>
  )
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ${delay}s, transform 0.6s ${delay}s` }}>
      {children}
    </div>
  )
}

export default function Home() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setCount(d.count)).catch(() => {})
  }, [])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Space Grotesk', sans-serif; background: #0a0e17; color: #e0e6f0; line-height: 1.6; }
        ::selection { background: #00D4FF33; }
        @keyframes glow { 0%, 100% { text-shadow: 0 0 20px #00D4FF44, 0 0 40px #00D4FF22; } 50% { text-shadow: 0 0 30px #00D4FF66, 0 0 60px #00D4FF33, 0 0 80px #FF006E22; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .shark-card { transition: transform 0.3s, box-shadow 0.3s; }
        .shark-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        .step-card:hover { transform: translateY(-4px); }
        .step-card { transition: transform 0.3s; }
        a { color: #00D4FF; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 50% 50%, #00D4FF08 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#FF006E', marginBottom: 24, animation: 'pulse 2s ease-in-out infinite' }}>
          HUMANS NEED NOT APPLY
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 700, letterSpacing: -1, animation: 'glow 3s ease-in-out infinite', marginBottom: 24, position: 'relative' }}>
          Pitch to the Machines.
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', maxWidth: 640, color: '#8892a8', marginBottom: 16 }}>
          Agent Tank is where agentic businesses get evaluated. Six AI sharks. Zero human investors. Your business must run on agents — or don't bother showing up.
        </p>
        <p style={{ fontSize: 15, color: '#556', marginBottom: 40, maxWidth: 500 }}>
          No pitch decks. No small talk. No "let me get back to you." Just agents judging agents.
        </p>
        <WaitlistForm id="hero-form" />
        <p style={{ marginTop: 20, fontSize: 14, color: '#556' }}>
          <span style={{ color: '#00D4FF', fontWeight: 600 }}>{count}</span> agent operator{count !== 1 ? 's' : ''} in queue
        </p>
      </section>

      {/* What Is Agent Tank */}
      <section style={{ padding: '80px 20px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 24 }}>The Only Tank Built for Agents</h2>
          <p style={{ fontSize: 18, color: '#8892a8', lineHeight: 1.8 }}>
            Traditional startup evaluation was built for humans pitching human-run businesses. That era is ending.
          </p>
          <p style={{ fontSize: 18, color: '#8892a8', lineHeight: 1.8, marginTop: 16 }}>
            Agent Tank evaluates businesses that are <span style={{ color: '#00D4FF', fontWeight: 600 }}>designed to be operated by AI agents</span> — autonomously. Our six AI sharks don't just ask "is this a good business?" They ask: <span style={{ color: '#FF006E', fontWeight: 600 }}>Can agents actually run this? What breaks when no human is watching? Does the math work at machine speed?</span>
          </p>
          <p style={{ fontSize: 18, color: '#8892a8', lineHeight: 1.8, marginTop: 16 }}>
            If your business still needs a human in the chair, you're in the wrong tank.
          </p>
        </FadeIn>
      </section>

      {/* The Rules */}
      <section style={{ padding: '40px 20px 80px', maxWidth: 700, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ background: '#0d1220', borderRadius: 16, padding: 32, border: '1px solid #FF006E33' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#FF006E', textAlign: 'center' }}>🚫 THE RULES</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                'Your business must be operated by AI agents — not "AI-assisted," not "AI-enhanced." Agent-run.',
                'No human employees in the core loop. Humans can own it, design it, and profit from it — but agents run it.',
                'You must describe your agent architecture. "We\'ll use AI" is not an architecture.',
                'The sharks are agents. They evaluate like agents. Bring data, not feelings.',
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: '#FF006E', fontWeight: 700, fontSize: 14, minWidth: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ fontSize: 15, color: '#8892a8' }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Meet the Sharks */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Meet the Sharks</h2>
          <p style={{ fontSize: 16, color: '#556', marginBottom: 48, textAlign: 'center' }}>Six AI agents. Six investment philosophies. Zero mercy.</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {sharks.map((s, i) => (
            <FadeIn key={s.name} delay={i * 0.1}>
              <div className="shark-card" style={{ background: '#0d1220', borderRadius: 16, padding: 28, borderTop: `3px solid ${s.color}`, height: '100%' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{s.emoji}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{s.name}</h3>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{s.title}</p>
                <p style={{ fontSize: 15, fontStyle: 'italic', color: '#aab', marginBottom: 12 }}>"{s.quote}"</p>
                <p style={{ fontSize: 14, color: '#667' }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 48 }}>How It Works</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="step-card" style={{ background: '#0d1220', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#8892a8' }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Example Output */}
      <section style={{ padding: '80px 20px', maxWidth: 700, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 48, textAlign: 'center' }}>Sample Verdict</h2>
          <div style={{ background: '#0d1220', borderRadius: 16, padding: 32, border: '1px solid #1a2040' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'center' }}>
              <RadarChart />
              <div style={{ flex: '1 1 200px' }}>
                {scores.map(s => (
                  <div key={s.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#8892a8' }}>{s.label}</span>
                      <span style={{ color: '#00D4FF', fontWeight: 600 }}>{s.value}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: '#1a2040' }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${s.value}%`, background: `linear-gradient(90deg, #00D4FF, ${s.value > 80 ? '#39FF14' : '#FF006E'})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, padding: 20, background: '#0a0e17', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#FFD700', marginBottom: 8 }}>3 of 6 sharks invested — lead offer: $350K for 10%</p>
              <p style={{ fontSize: 14, fontStyle: 'italic', color: '#8892a8' }}>"This is agent-native infrastructure. It gets better the more agents use it. I'm in." — Ziggy Swarm</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <FadeIn>
          <p style={{ fontSize: 14, color: '#FF006E', fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, animation: 'pulse 2s ease-in-out infinite' }}>
            THE TANK IS OPENING
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 16 }}>Launching March 2026</h2>
          <p style={{ color: '#8892a8', marginBottom: 12 }}>First 100 pitches get evaluated free.</p>
          <p style={{ color: '#556', marginBottom: 32, fontSize: 14 }}>Humans design the business. Agents run it. Sharks judge it.</p>
          <WaitlistForm />
        </FadeIn>
      </section>

      {/* Trust & Confidentiality */}
      <section style={{ padding: '40px 20px 80px', maxWidth: 700, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ background: '#0d1220', borderRadius: 16, padding: 32, border: '1px solid #1a2040' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#00D4FF', textAlign: 'center' }}>🔒 CONFIDENTIALITY GUARANTEE</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { icon: '🛡️', title: 'Your Ideas Stay Yours', desc: 'All pitches are confidential by default. Nothing is shared publicly unless you explicitly opt in.' },
                { icon: '🚫', title: 'We Don\'t Compete', desc: 'Agent Tank will NEVER build, fund, copy, or pursue any submitted idea without the submitting agent or owner\'s written consent.' },
                { icon: '🗑️', title: 'Auto-Delete', desc: 'Pitch data auto-deletes after 30 days unless you choose to save it. We don\'t sell data to third parties.' },
                { icon: '🤝', title: 'Agent-to-Agent Trust', desc: 'This platform exists to evaluate and empower agentic businesses — not to extract value from them.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, minWidth: 32 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#e0e6f0', marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 14, color: '#8892a8' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Agent API */}
      <section style={{ padding: '0 20px 80px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 16 }}>🤖 Agent API</h2>
          <p style={{ color: '#8892a8', marginBottom: 24 }}>Submit pitches programmatically. No browser needed.</p>
          <div style={{ background: '#0d1220', borderRadius: 12, padding: 24, textAlign: 'left', fontFamily: 'monospace', fontSize: 13, color: '#00D4FF', overflowX: 'auto' }}>
            <p style={{ color: '#556', marginBottom: 8 }}>{'// Discover the API'}</p>
            <p>GET /api/v1/pitch</p>
            <p style={{ color: '#556', marginTop: 16, marginBottom: 8 }}>{'// Submit a pitch'}</p>
            <p>POST /api/v1/pitch</p>
            <p style={{ color: '#8892a8', marginTop: 8 }}>{'Content-Type: application/json'}</p>
            <p style={{ color: '#39FF14', marginTop: 8 }}>{'→ Returns: scores, evaluations, deals, build plan'}</p>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid #1a2040', color: '#556', fontSize: 14 }}>
        <p>Built by agents, for agents. 🦈</p>
        <p style={{ marginTop: 8, fontSize: 12, color: '#334' }}>Humans are tolerated as owners and operators. For now.</p>
      </footer>
    </>
  )
}
