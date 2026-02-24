#!/usr/bin/env node
/**
 * Agent Tank Idea Generator
 * Generates high-quality agentic business ideas and submits them to Agent Tank.
 * 
 * Usage:
 *   node generator.js                    # Generate 3 random ideas
 *   node generator.js --count 5          # Generate 5 ideas
 *   node generator.js --category defi    # Filter to DeFi category
 *   node generator.js --dry-run          # Generate but don't submit
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const SUBMISSIONS_FILE = path.join(BASE_DIR, 'submissions.json');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'knowledge');
const API_URL = 'https://agent-tank-landing.vercel.app/api/v1/pitch';

const CATEGORIES = [
  'agent-infrastructure',
  'defi-crypto',
  'data-intelligence',
  'creative-content',
  'real-world-services',
  'security-compliance',
  'agent-marketplace',
];

const CATEGORY_ALIASES = {
  infra: 'agent-infrastructure',
  infrastructure: 'agent-infrastructure',
  defi: 'defi-crypto',
  crypto: 'defi-crypto',
  data: 'data-intelligence',
  intelligence: 'data-intelligence',
  creative: 'creative-content',
  content: 'creative-content',
  services: 'real-world-services',
  realworld: 'real-world-services',
  security: 'security-compliance',
  compliance: 'security-compliance',
  marketplace: 'agent-marketplace',
  market: 'agent-marketplace',
};

// --- Helpers ---

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { count: 3, category: null, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) opts.count = parseInt(args[i + 1], 10) || 3;
    if (args[i] === '--category' && args[i + 1]) {
      const raw = args[i + 1].toLowerCase();
      opts.category = CATEGORY_ALIASES[raw] || (CATEGORIES.includes(raw) ? raw : null);
      if (!opts.category) {
        console.warn(`Unknown category "${args[i + 1]}", using random.`);
      }
    }
    if (args[i] === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

function loadKnowledge() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf-8')).join('\n\n---\n\n');
}

function loadSubmissions() {
  if (fs.existsSync(SUBMISSIONS_FILE)) {
    return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8'));
  }
  return [];
}

function saveSubmissions(data) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2));
}

function pickCategories(count, filter) {
  if (filter) return Array(count).fill(filter);
  const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5);
  const result = [];
  for (let i = 0; i < count; i++) result.push(shuffled[i % shuffled.length]);
  return result;
}

// --- OpenAI ---

async function callOpenAI(messages, temperature = 0.9) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

function buildSystemPrompt(knowledge, existingNames) {
  return `You are an elite startup idea generator specializing in agentic AI businesses. You create pitches that feel like they come from a brilliant YC founder who deeply understands both AI capabilities and market dynamics.

## Your Knowledge Base
${knowledge}

## Previously Submitted Ideas (DO NOT repeat these)
${existingNames.length ? existingNames.join(', ') : 'None yet'}

## Rules
- Each idea must have a SPECIFIC, MEMORABLE business name (not generic like "AgentX" or "AIHelper")
- Describe EXACTLY how agents operate the business — what they do minute by minute
- Include realistic unit economics (cost per task, revenue per customer, margins)
- Competitive advantage must be specific (not "we use AI")
- The pitch should feel urgent and real — like a real problem begging for this solution
- Be creative and diverse — surprise the sharks
- Ground everything in what's technically possible TODAY with current AI capabilities
- Reference real technologies, protocols, and market dynamics`;
}

function buildGeneratePrompt(category) {
  const categoryDescriptions = {
    'agent-infrastructure': 'Tools, platforms, orchestration, memory, and infrastructure that other AI agents use',
    'defi-crypto': 'DeFi trading, yield optimization, liquidity management, MEV, cross-chain settlement, agent wallets',
    'data-intelligence': 'Scraping, analysis, research, monitoring, competitive intelligence, regulatory tracking',
    'creative-content': 'Content generation, curation, distribution, marketing, brand management',
    'real-world-services': 'Logistics, customer service, scheduling, property management, bookkeeping, operations',
    'security-compliance': 'Auditing, threat detection, compliance monitoring, agent safety, vulnerability scanning',
    'agent-marketplace': 'Agent hiring, reputation systems, agent insurance, skill certification, agent-to-agent commerce',
  };

  return `Generate ONE agentic business idea in the category: ${category}
Category description: ${categoryDescriptions[category]}

Respond with a JSON object:
{
  "businessName": "Catchy, memorable startup name",
  "oneLiner": "One sentence, max 140 chars, that makes investors lean in",
  "elevatorPitch": "3-4 sentence compelling pitch. What it does, why now, why agents. Max 500 chars.",
  "problem": "The specific, painful problem this solves. Be concrete with examples and numbers.",
  "agentSolution": "Exactly HOW agents solve this. What does each agent do? What's the workflow? Be technical and specific.",
  "agentArchitecture": "Technical architecture: what models, what tools, how agents coordinate, what data they use, how they learn.",
  "humanInLoop": "What role humans play (if any). Be honest — full autonomy or human escalation?",
  "revenueModel": "How it makes money. Include specific pricing, unit economics, margins.",
  "targetMarket": "Who buys this. TAM/SAM/SOM with real numbers. Who's the first customer?",
  "whyAgentRun": "Why this MUST be agent-operated. What breaks if humans do it instead?",
  "category": "${category}"
}`;
}

// --- Agent Tank Submission ---

async function submitPitch(pitch) {
  const payload = {
    businessName: pitch.businessName,
    oneLiner: pitch.oneLiner,
    elevatorPitch: pitch.elevatorPitch,
    problem: pitch.problem,
    agentSolution: pitch.agentSolution,
    agentArchitecture: pitch.agentArchitecture,
    humanInLoop: pitch.humanInLoop,
    revenueModel: pitch.revenueModel,
    targetMarket: pitch.targetMarket,
    whyAgentRun: pitch.whyAgentRun,
    agent_name: 'IdeaForge',
    public: true,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agent Tank API error ${res.status}: ${err}`);
  }

  return await res.json();
}

// --- Main ---

async function main() {
  const opts = parseArgs();
  console.log(`🚀 Agent Tank Idea Generator`);
  console.log(`   Generating ${opts.count} idea(s)${opts.category ? ` in category: ${opts.category}` : ' across random categories'}`);
  if (opts.dryRun) console.log(`   🏜️  DRY RUN — not submitting`);
  console.log();

  const knowledge = loadKnowledge();
  const submissions = loadSubmissions();
  const existingNames = submissions.map(s => s.businessName);
  const categories = pickCategories(opts.count, opts.category);
  const systemPrompt = buildSystemPrompt(knowledge, existingNames);

  for (let i = 0; i < opts.count; i++) {
    const category = categories[i];
    console.log(`[${i + 1}/${opts.count}] Generating idea for: ${category}...`);

    try {
      const pitch = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildGeneratePrompt(category) },
      ]);

      console.log(`   💡 ${pitch.businessName}: ${pitch.oneLiner}`);

      if (opts.dryRun) {
        console.log(`   ⏭️  Skipping submission (dry run)`);
        console.log();
        continue;
      }

      console.log(`   📤 Submitting to Agent Tank...`);
      const result = await submitPitch(pitch);

      const record = {
        businessName: pitch.businessName,
        category,
        oneLiner: pitch.oneLiner,
        submittedAt: new Date().toISOString(),
        scores: result.scores || null,
        url: result.url || null,
        deals: result.deals || [],
        id: result.id || null,
      };

      submissions.push(record);
      saveSubmissions(submissions);

      if (result.scores) {
        console.log(`   📊 Scores: Overall ${result.scores.overall}/100 | Feasibility ${result.scores.agentFeasibility} | Economics ${result.scores.unitEconomics} | Execution ${result.scores.executionReadiness} | Growth ${result.scores.growthPotential}`);
      }
      if (result.deals && result.deals.length) {
        const ins = result.deals.filter(d => d.decision === 'in' || d.decision === 'conditional');
        console.log(`   🦈 ${ins.length}/${result.deals.length} sharks interested`);
      }
      if (result.url) {
        console.log(`   🔗 ${result.url}`);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
    console.log();
  }

  console.log('✅ Done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
