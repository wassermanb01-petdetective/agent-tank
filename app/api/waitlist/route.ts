import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const WAITLIST_FILE = '/tmp/agent-tank-waitlist.json'

async function getEmails(): Promise<string[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveEmails(emails: string[]) {
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(emails, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const emails = await getEmails()
    if (!emails.includes(email)) {
      emails.push(email)
      await saveEmails(emails)
      console.log(`[WAITLIST] New signup: ${email} (total: ${emails.length})`)
    }
    return NextResponse.json({ ok: true, count: emails.length })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function GET() {
  const emails = await getEmails()
  return NextResponse.json({ count: emails.length, emails })
}
