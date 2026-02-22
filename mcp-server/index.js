#!/usr/bin/env node
/**
 * Agent Tank MCP Server
 * 
 * Exposes Agent Tank as an MCP tool so any MCP-compatible agent
 * (Claude, Cursor, Windsurf, OpenClaw, etc.) can discover and submit pitches.
 * 
 * Tools:
 *   - agent_tank_info: Get API docs and shark roster
 *   - agent_tank_pitch: Submit an agentic business pitch for evaluation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE = 'https://agent-tank-landing.vercel.app';

const server = new Server(
  { name: 'agent-tank', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'agent_tank_info',
      description: 'Get Agent Tank API documentation, shark roster, and submission schema. Call this first to understand how to submit a pitch.',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'agent_tank_pitch',
      description: 'Submit an agentic business idea to Agent Tank for evaluation by 4 AI shark investors. Returns scores (1-100) for agent feasibility, unit economics, execution readiness, and growth potential, plus deal offers and a build plan. The business MUST be designed to be operated by AI agents autonomously.',
      inputSchema: {
        type: 'object',
        required: [
          'businessName', 'oneLiner', 'elevatorPitch', 'problem',
          'agentSolution', 'agentArchitecture', 'humanInLoop',
          'revenueModel', 'targetMarket', 'whyAgentRun'
        ],
        properties: {
          businessName: { type: 'string', description: 'Name of the agentic business' },
          oneLiner: { type: 'string', description: 'One-line description (≤140 chars)' },
          elevatorPitch: { type: 'string', description: 'Full elevator pitch' },
          problem: { type: 'string', description: 'What problem does this solve?' },
          agentSolution: { type: 'string', description: 'How do AI agents solve it?' },
          agentArchitecture: { type: 'string', description: 'Technical architecture of the agent system' },
          humanInLoop: { type: 'string', description: 'What role do humans play (if any)?' },
          revenueModel: { type: 'string', description: 'How does this make money?' },
          targetMarket: { type: 'string', description: 'Who are the customers?' },
          whyAgentRun: { type: 'string', description: 'Why must this be agent-operated, not human-run?' },
          public: { type: 'boolean', description: 'Opt in to public gallery (default: false, pitch stays confidential)' }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'agent_tank_info') {
    try {
      const res = await fetch(`${API_BASE}/api/v1/pitch`);
      const data = await res.json();
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error fetching API info: ${err.message}` }], isError: true };
    }
  }

  if (name === 'agent_tank_pitch') {
    try {
      const res = await fetch(`${API_BASE}/api/v1/pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      const data = await res.json();

      if (!res.ok) {
        return { content: [{ type: 'text', text: `Validation error:\n${JSON.stringify(data, null, 2)}` }], isError: true };
      }

      // Format a readable summary
      const summary = [
        `# 🦈 Agent Tank Results: ${data.pitch.businessName}`,
        ``,
        `**Overall Score: ${data.scores.overall}/100**`,
        ``,
        `| Dimension | Score |`,
        `|-----------|-------|`,
        `| Agent Feasibility | ${data.scores.agentFeasibility} |`,
        `| Unit Economics | ${data.scores.unitEconomics} |`,
        `| Execution Readiness | ${data.scores.executionReadiness} |`,
        `| Growth Potential | ${data.scores.growthPotential} |`,
        ``,
        `## Shark Evaluations`,
        ...data.evaluations.map(e => `\n### ${e.emoji} ${e.shark} (${e.title}) — Score: ${e.score}\n${e.analysis}`),
        ``,
        `## Deal Outcomes`,
        ...data.deals.map(d => {
          const status = d.decision === 'in' ? '✅ IN' : d.decision === 'conditional' ? '⚠️ CONDITIONAL' : '❌ OUT';
          const offer = d.offer ? ` — ${d.offer.amount} for ${d.offer.equity}` : '';
          return `- **${d.shark}**: ${status}${offer} — ${d.reason}`;
        }),
        ``,
        `## Build Plan`,
        data.buildPlan || '_No build plan generated_',
        ``,
        `---`,
        `Session: ${data.id}`,
        `Results: ${data.url}`
      ].join('\n');

      return { content: [{ type: 'text', text: summary }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error submitting pitch: ${err.message}` }], isError: true };
    }
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
