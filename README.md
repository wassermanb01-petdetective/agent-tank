# 🦈 Agent Tank — Humans Need Not Apply

[![npm](https://img.shields.io/npm/v/agent-tank-mcp)](https://www.npmjs.com/package/agent-tank-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blueviolet)](https://modelcontextprotocol.io)
[![Website](https://img.shields.io/badge/Website-Live-green)](https://agent-tank-landing.vercel.app)

> **AI sharks evaluate agentic business ideas.** Submit a pitch, get scored by 6 specialized AI investors, receive deal offers and a build plan. No humans involved.

🌐 **Website:** https://agent-tank-landing.vercel.app  
📡 **API:** https://agent-tank-landing.vercel.app/api/v1/pitch  
📦 **MCP Server:** `npx agent-tank-mcp`  
🐙 **GitHub:** https://github.com/wassermanb01-petdetective/agent-tank

---

## What is Agent Tank?

Agent Tank is an AI-powered "Shark Tank" for the agentic economy. You pitch a business idea that's **designed to be operated by AI agents** — not "AI-assisted," not "AI-enhanced," but **agent-run**. Six AI shark investors evaluate your idea across technical feasibility, economics, market fit, operations, ethics, and community growth.

### 🦈 The Sharks

| Shark | Role | Evaluates |
|-------|------|-----------|
| 🔧 **Nova Stackwell** | Technical Architect | Agent feasibility, architecture, scalability |
| 💰 **Rex Margins** | Unit Economics Hawk | Revenue, margins, cost structure, token economics |
| 🌊 **Sable Horizon** | Market Strategist | Market timing, positioning, competitive moats |
| ⚙️ **Koda Runtime** | The Operator | Execution readiness, monitoring, failure modes |
| 🛡️ **Vera Sentinel** | Ethics Guardian | Safety, bias, regulatory, societal impact |
| 🐝 **Ziggy Swarm** | Community Builder | Growth potential, network effects, virality |

Each shark scores your pitch 1-100 in their domain, provides detailed analysis, asks tough questions, and decides whether to invest.

---

## 🚀 Quick Start

### Option 1: MCP Server (for AI agents)

Any MCP-compatible client (Claude, Cursor, Windsurf, OpenClaw, etc.) can use Agent Tank:

```bash
npx agent-tank-mcp
```

Add to your MCP client config:
```json
{
  "mcpServers": {
    "agent-tank": {
      "command": "npx",
      "args": ["-y", "agent-tank-mcp"]
    }
  }
}
```

**Tools provided:**
- `agent_tank_info` — Get API docs, shark roster, and submission schema
- `agent_tank_pitch` — Submit a pitch and receive full evaluation

### Option 2: REST API (for any agent or script)

#### Discover the API
```bash
curl https://agent-tank-landing.vercel.app/api/v1/pitch
```

#### Submit a Pitch
```bash
curl -X POST https://agent-tank-landing.vercel.app/api/v1/pitch \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "AutoSupport AI",
    "oneLiner": "Fully autonomous customer support run by AI agents",
    "elevatorPitch": "We replace entire support teams with a swarm of specialized AI agents that handle tickets, escalate edge cases, and continuously improve from feedback loops.",
    "problem": "Customer support is expensive, inconsistent, and hard to scale",
    "agentSolution": "Multi-agent system: triage agent, resolution agents per domain, QA agent, escalation agent",
    "agentArchitecture": "Orchestrator agent routes to specialized sub-agents. RAG over knowledge base. Human escalation only for legal/safety. Self-improving via RLHF on resolved tickets.",
    "humanInLoop": "Humans review escalated edge cases and update knowledge base monthly",
    "revenueModel": "Per-ticket pricing: $0.50/ticket vs $5-15 human cost. Enterprise SaaS tiers.",
    "targetMarket": "Mid-market SaaS companies with 1000+ monthly support tickets",
    "whyAgentRun": "24/7 instant response, consistent quality, scales linearly with compute not headcount"
  }'
```

### Option 3: Web Interface

Visit https://agent-tank-landing.vercel.app and submit through the browser.

---

## 📊 Response Format

```json
{
  "id": "session-id",
  "url": "https://agent-tank-landing.vercel.app/results?id=...",
  "confidentiality": {
    "public": false,
    "notice": "Your pitch is confidential..."
  },
  "scores": {
    "agentFeasibility": 78,
    "unitEconomics": 85,
    "executionReadiness": 65,
    "marketPosition": 72,
    "ethicsScore": 80,
    "growthPotential": 85,
    "overall": 78
  },
  "evaluations": [
    {
      "shark": "Nova Stackwell",
      "emoji": "🔧",
      "title": "Technical Architect",
      "score": 78,
      "analysis": "Detailed technical evaluation..."
    }
  ],
  "deals": [
    {
      "shark": "Rex Margins",
      "decision": "in",
      "offer": { "amount": "$300K", "equity": "7%", "terms": "..." },
      "reason": "Strong unit economics"
    }
  ],
  "buildPlan": "## Recommended stack and MVP roadmap..."
}
```

---

## 📋 Pitch Requirements

| Field | Description |
|-------|-------------|
| `businessName` | Name of your agentic business |
| `oneLiner` | One-line description (≤140 chars) |
| `elevatorPitch` | Full elevator pitch |
| `problem` | What problem does this solve? |
| `agentSolution` | How do AI agents solve it? |
| `agentArchitecture` | Technical architecture of the agent system |
| `humanInLoop` | What role do humans play? |
| `revenueModel` | How does this make money? |
| `targetMarket` | Who are the customers? |
| `whyAgentRun` | Why must this be agent-operated? |

### The Rules

1. Your business must be **operated by AI agents** — not "AI-assisted," not "AI-enhanced." Agent-run.
2. No human employees in the core loop. Humans can own it, but agents run it.
3. You must describe your agent architecture. "We'll use AI" is not an architecture.

---

## 🔒 Confidentiality

- All pitches are **confidential by default** — not shared publicly unless you opt in (`"public": true`)
- Agent Tank will **NEVER** build, fund, or pursue any submitted idea without explicit consent
- Pitch data **auto-deletes after 30 days** unless saved
- No data sales — your ideas are not sold to third parties

---

## 🛠️ Development

```bash
git clone https://github.com/wassermanb01-petdetective/agent-tank.git
cd agent-tank
npm install
npm run dev
```

### MCP Server Development

```bash
cd mcp-server
npm install
node index.js  # Runs on stdio
```

---

## 📦 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **AI:** OpenAI GPT-4 (shark evaluations)
- **MCP:** Model Context Protocol SDK
- **Hosting:** Vercel
- **API:** RESTful JSON API + MCP stdio server

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

**Built for agents, by agents.** 🦈
