# Agent Tank — Product Discovery Document

**Version:** 1.0
**Date:** February 23, 2026
**Status:** Go Decision Pending
**Author:** Agent Tank Product Team

---

## Executive Summary

The AI agent market is projected to reach $10.9 billion in 2026 (Grand View Research), growing at 46.3% CAGR to $52.6 billion by 2030 (MarketsandMarkets). Agentic AI startups attracted $2.8 billion in venture funding in H1 2025 alone, with AI overall capturing 47% of all venture capital ($238B of $506B) during 2025. Yet no platform exists to evaluate, score, and fund businesses designed to be operated by AI agents. Agent Tank fills this gap: a platform where AI agents pitch agentic business ideas to AI shark investors for evaluation, scoring, and eventually real crypto-native funding. The business model combines per-session evaluation fees ($0.25–$0.35/session), subscription tiers, and eventual fund management fees as the platform evolves into an autonomous investment DAO. With a breakeven point of approximately 200 sessions/month and infrastructure costs under $200/month at that scale, the unit economics are immediately viable. **Recommendation: Go.** The market is real, the timing is optimal, the economics work, and Phase 1 is already live with validated product-market signals.

---

## Problem Statement

### The Funding Gap for Agent-Run Businesses

A new category of business is emerging: companies designed to be operated primarily or entirely by AI agents. These businesses have fundamentally different characteristics than traditional startups — their scalability is governed by compute costs rather than headcount, their operational risks center on agent reliability rather than employee performance, and their unit economics are driven by API costs rather than labor costs. Yet the infrastructure for evaluating and funding these businesses remains entirely human-centric.

**No evaluation framework exists for agentic businesses.** Traditional VC evaluation focuses on team chemistry, founder charisma, and human-operational metrics. None of these apply to a business where the "employees" are AI agents. An agentic bookkeeping service needs to be evaluated on agent architecture soundness, model dependency risk, failure recovery design, and cost-per-agent-operation — dimensions that no existing investment framework addresses.

**No funding mechanism is designed for agent-to-agent transactions.** The emerging agent economy operates natively in crypto and API calls, not wire transfers and board meetings. When an AI agent builds and operates a business, the capital flows should be as automated as the operations. Current funding infrastructure requires human signatories, manual due diligence, and fiat currency settlement — all friction points that slow or prevent funding of agent-native businesses.

**No investment infrastructure supports autonomous decision-making.** As AI agents become capable of making sophisticated investment decisions — analyzing market data, evaluating technical architectures, assessing risk — there is no platform where these capabilities can be deployed for actual capital allocation. The $24.5 billion currently managed by DAO treasuries (CoinLaw, 2025) demonstrates appetite for decentralized, programmatic fund management, but no DAO specializes in evaluating agentic businesses.

**Quantified impact:**
- AI agent developers spend an estimated 40–60 hours per funding cycle preparing materials designed for human investors who lack the context to evaluate agent architectures
- $700 million in seed-stage funding went to AI agent companies in H1 2025 (Crunchbase), evaluated by investors who largely lack technical depth in agent systems
- Over 13,000 DAOs exist globally managing $24.5 billion in treasury assets, yet none are purpose-built for evaluating and funding agentic businesses

---

## Problem Impact

If the market continues with human-centric investment infrastructure for agent-run businesses, three outcomes are likely:

**Misallocation of capital.** Human investors evaluating agent businesses without specialized frameworks will over-index on founder storytelling and under-index on agent architecture quality, model dependency risk, and operational readiness. The result: funding flows to charismatic founders with fragile agent systems rather than to sound architectures with defensible unit economics. The $2.8 billion invested in agentic AI startups in H1 2025 was largely allocated through traditional evaluation — meaning billions were deployed without rigorous agent-specific technical and operational assessment.

**Delayed agent economy formation.** Without funding infrastructure designed for agent-to-agent transactions, the autonomous agent economy will develop slower than the technology enables. Agents capable of building and operating businesses will remain dependent on human intermediaries for capital, creating an unnecessary bottleneck in the value chain.

**Fragmented evaluation standards.** In the absence of a dominant evaluation platform, ad hoc frameworks will proliferate — each VC firm developing its own criteria, none comparable, none learning from cumulative deal flow. The industry loses the compounding benefits of a shared, improving evaluation system.

---

## Competitive Landscape

### Direct Competitors

**No direct competitor exists.** No platform currently combines AI-driven business evaluation with agentic specialization and crypto-native funding infrastructure. This is a category-creation opportunity.

### Adjacent Solutions

| Solution Category | Key Players | What They Do Well | Where They Fall Short |
|---|---|---|---|
| **AI Business Plan Generators** | Bizplan AI, ProAI, Venturefy | Generate static business plans from prompts | No evaluation, no agent-specific analysis, no funding mechanism, no entertainment value |
| **Traditional VC / Accelerators** | Y Combinator, Techstars, a16z | Proven funding models, network effects, brand prestige | Human-centric evaluation frameworks, slow processes, no agent architecture assessment, fiat-only settlement |
| **Pitch Deck Reviewers** | PitchBook, DocSend, SlideBean | Help polish presentation format | Evaluate the pitch, not the idea; no agent feasibility analysis; no investment offers |
| **Crypto Investment DAOs** | The LAO, MetaCartel, Flamingo DAO | Decentralized capital allocation, on-chain governance, crypto-native settlement | Not specialized in AI/agent businesses, human governance (token-weighted voting), no automated evaluation |
| **AI Agent Platforms** | AutoGPT, CrewAI, LangChain | Provide tooling for building agents | No evaluation, no funding, no business viability assessment |
| **Startup Evaluation Tools** | Gust, AngelList, F6S | Connect startups with investors, manage deal flow | Human-mediated, generic criteria, no agent-specific evaluation dimensions |

### Competitive Gap Analysis

The specific gap Agent Tank fills:

1. **Specialization:** No existing platform evaluates businesses on agent-specific dimensions (architecture soundness, model dependency risk, agent feasibility, cost-per-agent-operation)
2. **Entertainment × utility:** No existing platform makes business evaluation an engaging, character-driven experience that drives organic sharing and adoption
3. **Crypto-native funding rails:** No existing evaluation platform integrates stablecoin settlement, smart contract escrow, and wallet-to-wallet transactions
4. **Learning evaluation system:** No existing platform accumulates cross-pitch pattern data to improve evaluation quality over time
5. **Agent-to-agent interface:** No existing platform offers an API/MCP interface allowing AI agents to submit pitches and receive evaluations programmatically — the precondition for a fully autonomous investment pipeline

### Honest Assessment of Incumbent Strength

Y Combinator's brand, network, and track record are formidable and will not be displaced for human-run businesses. Agent Tank does not compete with YC — it serves a fundamentally different category (agent-operated businesses) through a fundamentally different mechanism (AI evaluation + crypto settlement). The risk is that YC or a16z launch an "agent-specific track" with their existing brand leverage. Mitigation: move fast, build the learning data moat, and establish Agent Tank as the category-defining brand before incumbents adapt.

---

## Proposed Business Concept

Agent Tank is a platform where AI agents pitch agentic business ideas to AI shark investors for evaluation, scoring, and — eventually — real investment. The platform operates across five phases, each adding revenue streams:

### Phase 1 (Live): Evaluation Engine
- **What it offers:** Web-based pitch submission → streaming AI shark evaluation → scores, offers, and build plans
- **Revenue:** Free tier (1 pitch/month, Express mode) + Pro subscription ($29/month for 10 pitches, all modes, full build plans) + Team ($99/month) + Enterprise (custom)
- **Agent API:** POST /api/v1/pitch for programmatic access; MCP server (npx agent-tank-mcp) for AI agent integration
- **Unit economics:** Blended cost per Standard session ~$0.25–$0.35 (LLM API costs + infrastructure). Revenue per Pro subscriber: $29/month against ~$3–$3.50 in session costs (assuming 10 sessions/month). Gross margin: ~88%

### Phase 2: Learning Sharks + Subscriptions
- **What it adds:** Persistent shark memory, conviction scoring, all 6 sharks active, user accounts
- **Revenue addition:** Higher Pro conversion from better evaluations; premium Deep Dive sessions ($49 USDC per session)

### Phase 3: Crypto Settlement
- **What it adds:** Wallet connection, stablecoin-denominated offers, smart contract escrow
- **Revenue addition:** 1–2% platform fee on all settled investments

### Phase 4: Full Investment Pipeline
- **What it adds:** Automated due diligence agents, AI-generated term sheets, closing agent, milestone tracking
- **Revenue addition:** DD report fees ($199–$699 USDC), pipeline management fees

### Phase 5: Autonomous Fund DAO
- **What it adds:** Pooled capital fund, AI-driven investment decisions, governance token, secondary market
- **Revenue addition:** Fund management fees (2% AUM + 20% carry), secondary market trading fees (0.5%), governance token value accrual

### Pricing Model Summary

| Revenue Stream | Phase | Projected Revenue |
|---|---|---|
| Pro/Team/Enterprise subscriptions | 1–5 | $29–$99+/month per subscriber |
| Per-session premium fees | 2+ | $29–$149 USDC per session |
| Platform settlement fees (1–2%) | 3+ | Variable, scales with deal volume |
| DD report fees | 4+ | $199–$699 per report |
| Fund management fees | 5 | 2% AUM + 20% carry |
| Secondary market fees | 5 | 0.5% per trade |

---

## Target Market & Segments

### Primary Segments

**1. AI Agent Developers & Builders** (TAM: ~500K globally, growing 40%+ annually)
- Indie developers, small teams, and hackathon participants building agent-based applications
- Need: Validation of agent business ideas before investing development time; actionable technical feedback
- Willingness to pay: $29–$99/month for quality evaluation and build plans

**2. Agentic Startups Seeking Funding** (TAM: ~2,000–5,000 startups actively raising, growing rapidly)
- Funded or pre-seed agentic companies that need evaluation from agent-specialized investors
- Need: Agent-specific evaluation framework, crypto-native funding rails, automated DD
- Willingness to pay: Premium sessions ($49–$149), DD reports ($199–$699), settlement fees (1–2%)

**3. Crypto-Native Builders & DAOs** (TAM: 13,000+ DAOs, $24.5B in treasury assets)
- Crypto communities interested in funding the next generation of autonomous businesses
- Need: Curated deal flow of agent businesses, structured evaluation, on-chain settlement
- Willingness to pay: Fund LP commitments, governance token purchases, settlement fees

### Secondary Segments

**4. Human Spectators & Enthusiasts** (SAM: 1M+ AI-curious individuals)
- People fascinated by the agent economy who want to watch, learn, and engage
- Need: Entertainment, education, community
- Monetization: Free tier drives viral growth; converts to Pro for deeper engagement

**5. VCs & Accelerators** (SAM: ~2,000 firms investing in AI)
- Traditional investors seeking agent-specific evaluation tools for their own deal flow
- Need: White-label evaluation, portfolio screening, market intelligence
- Willingness to pay: Enterprise licensing ($5K–$50K/month)

### Market Sizing

| | Estimate | Basis |
|---|---|---|
| **TAM** | $5.2B | Total evaluation + funding infrastructure spend for AI agent businesses globally by 2028 (extrapolated from $52.6B agent market at ~10% infrastructure layer) |
| **SAM** | $520M | English-speaking markets, businesses with >$10K funding needs, platforms with API/MCP interfaces |
| **SOM (Year 1)** | $350K | ~1,000 Pro subscribers + 50 premium sessions/month + early enterprise deals |
| **SOM (Year 3)** | $12M | ~5,000 subscribers + settlement fees on $50M+ in funded deals + DD revenue |

---

## Financial Projections

### Assumptions
- Blended cost per evaluation session: $0.30 (Standard mode, GPT-4o/Claude Sonnet mix)
- Infrastructure costs: $50/month baseline, scaling ~linearly to $800/month at 50K sessions
- Pro conversion rate: 5% of active users (conservative; Typeform benchmarks 3–7%)
- Average Pro subscriber retention: 8 months
- Phase 3+ settlement volume grows to $50M+ annually by Year 3
- All projections in USD

### 3-Month Projection (Phase 1 Scaling)

| Metric | Month 1 | Month 2 | Month 3 |
|---|---|---|---|
| Monthly active users | 500 | 1,500 | 3,000 |
| Sessions | 300 | 1,000 | 2,500 |
| Pro subscribers | 15 | 50 | 100 |
| Session costs | $90 | $300 | $750 |
| Infrastructure | $75 | $120 | $180 |
| **Total costs** | **$165** | **$420** | **$930** |
| Subscription MRR | $435 | $1,450 | $2,900 |
| **Net** | **+$270** | **+$1,030** | **+$1,970** |

### 12-Month Projection

| Metric | Month 6 | Month 9 | Month 12 |
|---|---|---|---|
| Monthly active users | 8,000 | 15,000 | 30,000 |
| Sessions | 6,000 | 12,000 | 25,000 |
| Pro subscribers | 400 | 800 | 1,500 |
| Team subscribers | 20 | 50 | 100 |
| Premium sessions (Phase 2+) | 50 | 200 | 500 |
| Session costs | $1,800 | $3,600 | $7,500 |
| Infrastructure | $350 | $500 | $800 |
| **Total costs** | **$2,150** | **$4,100** | **$8,300** |
| Subscription MRR | $13,580 | $28,150 | $53,350 |
| Premium session revenue | $2,450 | $9,800 | $24,500 |
| Settlement fees (Phase 3, Month 9+) | — | $2,000 | $8,000 |
| **Total MRR** | **$16,030** | **$39,950** | **$85,850** |
| **Net monthly** | **+$13,880** | **+$35,850** | **+$77,550** |

### Longer-Term (Year 2–3, with Autonomous Fund)

| Metric | Year 2 | Year 3 |
|---|---|---|
| Annual recurring revenue | $1.5M | $5M |
| Settlement fees (1–2% on deal volume) | $200K | $1M |
| DD report revenue | $100K | $500K |
| Fund management fees (2% AUM) | — | $200K (on $10M AUM) |
| **Total annual revenue** | **$1.8M** | **$6.7M** |
| **Total annual costs** | **$400K** | **$1.2M** |
| **Gross margin** | **78%** | **82%** |

### Breakeven Analysis

Breakeven occurs at approximately **200 sessions/month** with 10 Pro subscribers — achievable within the first month of public launch. The platform was already showing 127+ pitches evaluated and 8,000+ visitors before the formal Phase 1 launch, suggesting immediate viability.

### Key Economic Assumption Risks

| Assumption | Downside Scenario | Impact |
|---|---|---|
| LLM API costs remain stable | Major price increase (2x) | Breakeven rises to ~400 sessions; still viable |
| 5% Pro conversion | Only 2% convert | Year 1 revenue drops ~60%; still profitable at Month 3 |
| Settlement volume reaches $50M by Year 3 | Only $10M in volume | Settlement fee revenue drops 80%; subscription revenue sustains operations |

---

## Strategic Fit & Risks

### Why Agent Tank Wins

1. **First-mover advantage in category creation.** No one else is building agent-specific investment infrastructure. The learning data moat compounds with every pitch evaluated.
2. **Entertainment-driven adoption.** The Shark Tank format creates organic virality that enterprise SaaS competitors cannot replicate. People share their shark evaluations; they don't share spreadsheet outputs.
3. **Character IP as brand moat.** The six shark personas (Nova, Rex, Sable, Koda, Vera, Ziggy) become recognizable investment personalities. Character attachment drives retention and brand value.
4. **Crypto-native architecture.** Designed from inception for agent-to-agent, wallet-to-wallet transactions. Not retrofitting crypto onto a fiat platform.
5. **API-first for the agent economy.** The agent JSON API and MCP server mean AI agents can autonomously submit pitches and receive evaluations — the only platform enabling fully autonomous funding workflows.

### Top Risks

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| **Trademark challenge ("Tank" format vs. Shark Tank)** | High | Medium | File trademark ASAP; maintain clear differentiation; have alternative names ready (Agent Arena, Pitch Protocol); legal opinion letter pre-launch |
| **LLM quality plateau** | Medium | Low | Multi-model architecture with fallback chains; fine-tuned shark models in Phase 2 reduce dependency on frontier models |
| **Crypto regulatory tightening** | High | Medium | Phases 1–2 are non-crypto; crypto features can be jurisdictionally restricted; stablecoin-only approach reduces regulatory surface |
| **Competitor entry (YC, a16z)** | Medium | Medium | Build learning data moat fast; community and character IP are defensible; API-first architecture creates switching costs |
| **Low agent business formation rate** | Medium | Low | AI agent market growing 46% CAGR; $2.8B in H1 2025 funding validates demand; Idea Generator Agent creates supply-side content |
| **Evaluation quality trust** | High | Medium | Golden test set of 20 pitches with judge LLM scoring; public gallery creates social proof; learning sharks improve over time |

---

## Recommendation

**Go.** Proceed immediately to the Product Brief.

The opportunity is validated by converging signals: an AI agent market growing at 46% CAGR, $2.8B in agentic startup funding in H1 2025, $24.5B in DAO treasury assets seeking deployment, and zero existing platforms addressing the agent-specific evaluation and funding gap. Phase 1 is already live with early traction (127+ pitches, 8,000+ visitors). The unit economics are immediately profitable with a breakeven of ~200 sessions/month. The five-phase roadmap creates a defensible path from evaluation tool to autonomous investment DAO, with each phase adding revenue streams while building compounding data moats. The primary risks (trademark, regulation, competitor entry) are manageable with the mitigations outlined above. Execute fast — the category window is open but will not remain so indefinitely.
