import { NextRequest, NextResponse } from 'next/server'

// Persistent waitlist storage using GitHub as a free database
// Reads/writes waitlist.json in the agent-tank repo

const GITHUB_REPO = 'wassermanb01-petdetective/agent-tank'
const FILE_PATH = 'data/waitlist.json'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`

// GitHub token for API access — set as env var
const getToken = () => process.env.GITHUB_TOKEN || ''

async function getWaitlist(): Promise<{ emails: string[], sha: string | null }> {
  try {
    const res = await fetch(GITHUB_API, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Accept': 'application/vnd.github+json',
      },
      cache: 'no-store',
    })
    if (res.status === 404) return { emails: [], sha: null }
    if (!res.ok) return { emails: [], sha: null }
    const data = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    const emails = JSON.parse(content)
    return { emails, sha: data.sha }
  } catch {
    return { emails: [], sha: null }
  }
}

async function saveWaitlist(emails: string[], sha: string | null): Promise<boolean> {
  try {
    const content = Buffer.from(JSON.stringify(emails, null, 2)).toString('base64')
    const body: Record<string, unknown> = {
      message: `waitlist: ${emails.length} subscribers`,
      content,
    }
    if (sha) body.sha = sha

    const res = await fetch(GITHUB_API, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const { emails, sha } = await getWaitlist()

    if (emails.includes(normalizedEmail)) {
      return NextResponse.json({ ok: true, count: emails.length, message: 'Already registered' })
    }

    emails.push(normalizedEmail)
    const saved = await saveWaitlist(emails, sha)

    // Always log to Vercel function logs as backup
    console.log(`[WAITLIST_SIGNUP] ${normalizedEmail} | total=${emails.length} | saved=${saved} | ts=${new Date().toISOString()}`)

    if (!saved) {
      return NextResponse.json({ ok: false, error: 'Storage temporarily unavailable' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, count: emails.length })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function GET() {
  const { emails } = await getWaitlist()
  return NextResponse.json({ count: emails.length, emails })
}
