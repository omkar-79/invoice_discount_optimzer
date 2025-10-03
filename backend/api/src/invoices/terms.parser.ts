export type ParsedTerms = { discountPct: number; discountDays: number; netDays: number } | null;

/** Parses strings like "2/10 net 30", "1/10 NET45", "n/30" */
export function parseTerms(raw: string): ParsedTerms {
  const s = raw.toLowerCase().replace(/\s+/g, '').trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})net(\d{1,3})$/);
  if (m) {
    const discountPct = Number(m[1]);        // 2 -> 2%
    const discountDays = Number(m[2]);       // 10 days
    const netDays = Number(m[3]);            // 30 days
    if (discountPct > 0 && discountDays > 0 && netDays > discountDays) {
      return { discountPct, discountDays, netDays };
    }
  }
  // handle n/30 (no discount)
  const n = s.match(/^n\/(\d{1,3})$/);
  if (n) return { discountPct: 0, discountDays: 0, netDays: Number(n[1]) };
  return null;
}
