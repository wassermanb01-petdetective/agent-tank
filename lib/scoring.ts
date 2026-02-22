export function extractScore(text: string): number {
  // Look for patterns like "Score: 72" or "72/100" or "score (1-100 ...): 72"
  const patterns = [
    /(?:score|verdict)[^0-9]*(\d{1,3})\s*(?:\/\s*100)?/i,
    /(\d{1,3})\s*\/\s*100/,
    /(\d{1,3})\s*out of\s*100/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const n = parseInt(m[1])
      if (n >= 1 && n <= 100) return n
    }
  }
  return 50 // default
}
