import { NextRequest, NextResponse } from 'next/server';
import { LEGENDS, consultLegend, consultBoard } from '@/lib/legends';

export async function GET() {
  return NextResponse.json({
    name: 'Board of Legends',
    description: 'Consult history\'s greatest business minds on your pitch',
    legends: LEGENDS.map(l => ({
      id: l.id,
      name: l.name,
      title: l.title,
      era: l.era,
      domain: l.domain,
      icon: l.icon
    })),
    usage: {
      method: 'POST',
      body: {
        name: 'Your business name',
        description: 'What your business does',
        model: '(optional) Business model',
        market: '(optional) Target market',
        team: '(optional) Team description',
        legends: '(optional) Array of legend IDs, or omit for full board'
      }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.description) {
      return NextResponse.json({ error: 'name and description are required' }, { status: 400 });
    }

    const pitchData = {
      name: body.name,
      description: body.description,
      model: body.model,
      market: body.market,
      team: body.team
    };

    if (body.legends && Array.isArray(body.legends)) {
      const result = await consultBoard(pitchData, body.legends);
      return NextResponse.json(result);
    } else {
      const result = await consultBoard(pitchData);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
