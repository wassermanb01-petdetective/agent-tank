import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e17',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', fontSize: '80px', marginBottom: '10px' }}>
          🦈
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '8px',
            display: 'flex',
          }}
        >
          Agent Tank
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#00D4FF',
            textAlign: 'center',
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          Pitch to the Machines.
        </div>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {['🔧', '💰', '🔮', '⚙️', '🛡️', '🌐'].map((emoji, i) => (
            <div
              key={i}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#1a1f2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                border: `2px solid ${['#00D4FF', '#FFD700', '#9B59B6', '#FF6B35', '#FF006E', '#39FF14'][i]}`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: '22px',
            color: '#8892a4',
            textAlign: 'center',
            maxWidth: '800px',
            display: 'flex',
          }}
        >
          6 AI sharks evaluate your agentic business ideas. Real analysis. Actual build plans.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
