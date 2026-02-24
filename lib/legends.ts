import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export interface LegendConfig {
  id: string;
  name: string;
  title: string;
  era: string;
  domain: string;
  color: string;
  icon: string;
}

export interface LegendEvaluation {
  legendId: string;
  legendName: string;
  verdict: 'invest' | 'pass' | 'need_more_info';
  confidence: number;
  reasoning: string;
  key_concern: string;
  what_excites_me: string;
  advice_to_founder: string;
}

export interface BoardConsultation {
  pitchSummary: string;
  evaluations: LegendEvaluation[];
  consensus: string;
  timestamp: string;
}

export const LEGENDS: LegendConfig[] = [
  { id: 'buffett', name: 'Warren Buffett', title: 'The Oracle of Omaha', era: '1960-present', domain: 'Value Investing & Moats', color: '#1a5276', icon: '🏦' },
  { id: 'jobs', name: 'Steve Jobs', title: 'The Visionary', era: '1976-2011', domain: 'Product & Design', color: '#555555', icon: '🍎' },
  { id: 'gates', name: 'Bill Gates', title: 'The Platform King', era: '1975-present', domain: 'Technology & Scale', color: '#00a4ef', icon: '💻' },
  { id: 'munger', name: 'Charlie Munger', title: 'The Rationalist', era: '1960-2023', domain: 'Mental Models & Multidisciplinary Thinking', color: '#8b0000', icon: '🧠' },
  { id: 'thiel', name: 'Peter Thiel', title: 'The Contrarian', era: '1998-present', domain: 'Startups & Monopoly Theory', color: '#4a0080', icon: '🚀' },
  { id: 'dalio', name: 'Ray Dalio', title: 'The Principles Machine', era: '1975-present', domain: 'Systems & Decision-Making', color: '#2e7d32', icon: '📐' },
  { id: 'carnegie', name: 'Andrew Carnegie', title: 'The Steel Titan', era: '1865-1919', domain: 'Industrial Empire Building', color: '#b71c1c', icon: '🏭' },
  { id: 'walton', name: 'Sam Walton', title: 'The Cost Crusader', era: '1962-1992', domain: 'Retail & Operations', color: '#0071ce', icon: '🏪' },
];

function getPrompt(legendId: string): string {
  const promptPath = path.join(process.cwd(), 'knowledge', 'legends', 'prompts', `${legendId}-prompt.md`);
  return fs.readFileSync(promptPath, 'utf-8');
}

function getKnowledge(legendId: string): string {
  const knowledgePath = path.join(process.cwd(), 'knowledge', 'legends', `${legendId}.md`);
  return fs.readFileSync(knowledgePath, 'utf-8');
}

let openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!openai) openai = new OpenAI();
  return openai;
}

export async function consultLegend(legendId: string, pitchData: { name: string; description: string; model?: string; market?: string; team?: string }): Promise<LegendEvaluation> {
  const legend = LEGENDS.find(l => l.id === legendId);
  if (!legend) throw new Error(`Unknown legend: ${legendId}`);
  
  const systemPrompt = getPrompt(legendId);
  const knowledge = getKnowledge(legendId);
  
  const userMessage = `Here is my business pitch for your evaluation:

**Business Name:** ${pitchData.name}
**Description:** ${pitchData.description}
${pitchData.model ? `**Business Model:** ${pitchData.model}` : ''}
${pitchData.market ? `**Target Market:** ${pitchData.market}` : ''}
${pitchData.team ? `**Team:** ${pitchData.team}` : ''}

Please evaluate this pitch using your frameworks and return your assessment as JSON.`;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt + '\n\n---\nREFERENCE KNOWLEDGE:\n' + knowledge },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });

  const raw = JSON.parse(response.choices[0].message.content || '{}');
  return {
    legendId,
    legendName: legend.name,
    verdict: raw.verdict || 'pass',
    confidence: raw.confidence || 50,
    reasoning: raw.reasoning || '',
    key_concern: raw.key_concern || '',
    what_excites_me: raw.what_excites_me || '',
    advice_to_founder: raw.advice_to_founder || ''
  };
}

export async function consultBoard(pitchData: { name: string; description: string; model?: string; market?: string; team?: string }, legendIds?: string[]): Promise<BoardConsultation> {
  const ids = legendIds || LEGENDS.map(l => l.id);
  const evaluations = await Promise.all(ids.map(id => consultLegend(id, pitchData)));
  
  const investCount = evaluations.filter(e => e.verdict === 'invest').length;
  const passCount = evaluations.filter(e => e.verdict === 'pass').length;
  const avgConfidence = Math.round(evaluations.reduce((sum, e) => sum + e.confidence, 0) / evaluations.length);
  
  let consensus: string;
  if (investCount > passCount * 2) consensus = 'Strong Buy — The Board sees significant potential';
  else if (investCount > passCount) consensus = 'Lean Invest — Majority favorable with reservations';
  else if (investCount === passCount) consensus = 'Split Decision — The Board is divided';
  else consensus = 'Lean Pass — Majority see significant concerns';

  return {
    pitchSummary: pitchData.name,
    evaluations,
    consensus: `${consensus} (${investCount} invest, ${passCount} pass, avg confidence ${avgConfidence}%)`,
    timestamp: new Date().toISOString()
  };
}

export function getLegendById(id: string): LegendConfig | undefined {
  return LEGENDS.find(l => l.id === id);
}
