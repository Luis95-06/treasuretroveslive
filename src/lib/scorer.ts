export interface ScoreInput {
  cvr: number;       // 0–100 (percent)
  cpa: number;       // USD
  growthPct: number; // percent, can be negative
  impressions: number;
}

export function computeScore(p: ScoreInput): number {
  // CVR: max 40 pts — 100% CVR = full score
  const cvrScore = Math.min(p.cvr / 100, 1) * 40;

  // CPA: max 30 pts — $0 = full, $5+ = 0
  const cpaScore = Math.max(0, 1 - p.cpa / 5) * 30;

  // Growth: max 20 pts — +100% = full, 0% = 10, -100% = 0
  const growthScore = Math.min(Math.max((p.growthPct + 100) / 200, 0), 1) * 20;

  // Impressions: max 10 pts — log scale, 100M+ = full
  const impScore = Math.min(Math.log10(Math.max(p.impressions, 1)) / 8, 1) * 10;

  return Math.round((cvrScore + cpaScore + growthScore + impScore) * 10) / 10;
}

export const BUY_NOW_THRESHOLDS = {
  minCvr: 5,
  maxCpa: 1.0,
  minScore: 65,
};

export function isBuyNow(p: ScoreInput & { score: number }): boolean {
  return (
    p.cvr >= BUY_NOW_THRESHOLDS.minCvr &&
    p.cpa <= BUY_NOW_THRESHOLDS.maxCpa &&
    p.score >= BUY_NOW_THRESHOLDS.minScore
  );
}
