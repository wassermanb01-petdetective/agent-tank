# Board of Legends

A system that lets users pitch their business ideas to a panel of history's greatest business minds, each powered by AI with authentic voice and evaluation frameworks.

## Architecture

```
knowledge/legends/
├── README.md              ← You are here
├── buffett.md             ← Knowledge file (biography, philosophy, quotes)
├── jobs.md
├── gates.md
├── munger.md
├── thiel.md
├── dalio.md
├── carnegie.md
├── walton.md
└── prompts/
    ├── buffett-prompt.md  ← System prompt (first-person voice + evaluation framework)
    ├── jobs-prompt.md
    ├── gates-prompt.md
    ├── munger-prompt.md
    ├── thiel-prompt.md
    ├── dalio-prompt.md
    ├── carnegie-prompt.md
    └── walton-prompt.md

lib/
└── legends.ts             ← Core library: legend configs, consultLegend(), consultBoard()

app/api/v1/legends/
└── route.ts               ← Next.js API route (GET for info, POST to consult the board)
```

## The 8 Legends

| ID | Name | Focus |
|---|---|---|
| buffett | Warren Buffett | Value investing, moats, long-term durability |
| jobs | Steve Jobs | Product soul, design taste, category creation |
| gates | Bill Gates | Platforms, technical scale, distribution |
| munger | Charlie Munger | Mental models, inversion, incentive alignment |
| thiel | Peter Thiel | Contrarian secrets, monopoly theory, zero-to-one |
| dalio | Ray Dalio | Systems thinking, principles, risk management |
| carnegie | Andrew Carnegie | Vertical integration, cost leadership, industrial scale |
| walton | Sam Walton | Customer value, operations, unit economics |

## How It Works

1. User POSTs a pitch (name, description, optional model/market/team)
2. Each legend receives their system prompt + knowledge file as context
3. GPT-4o generates an in-character evaluation returning structured JSON
4. All evaluations run in parallel via `Promise.all`
5. Board consensus is computed from vote counts and confidence scores

## API Usage

```bash
# Get legend info
GET /api/v1/legends

# Consult the full board
POST /api/v1/legends
{ "name": "Acme Corp", "description": "We sell rocket-powered roller skates" }

# Consult specific legends
POST /api/v1/legends
{ "name": "Acme Corp", "description": "...", "legends": ["buffett", "thiel"] }
```

## Response Format

Each legend returns:
```json
{
  "verdict": "invest | pass | need_more_info",
  "confidence": 0-100,
  "reasoning": "Core analysis",
  "key_concern": "Biggest risk",
  "what_excites_me": "What caught their eye",
  "advice_to_founder": "Direct advice in character"
}
```
