import type { Lead, GeneratedTemplates, LeadAudit } from "./phm-types";

const CATEGORY_LABELS: Record<keyof LeadAudit, string> = {
  website: "website",
  google: "Google Business Profile",
  instagram: "Instagram presence",
  tiktok: "TikTok presence",
  ordering: "online ordering setup",
};

/**
 * Returns category keys sorted by score ascending (weakest first).
 * Only includes categories scoring <= 6 as "weaknesses."
 */
export function getWeaknesses(audit: LeadAudit): string[] {
  const entries = (Object.keys(audit) as Array<keyof LeadAudit>)
    .map((key) => ({ key, score: audit[key].score, label: CATEGORY_LABELS[key] }))
    .filter((e) => e.score <= 6)
    .sort((a, b) => a.score - b.score);
  return entries.map((e) => e.label);
}

export function buildWeaknessSummary(name: string, audit: LeadAudit): string {
  const weaknesses = getWeaknesses(audit);
  if (weaknesses.length === 0) {
    return `${name} has a strong overall digital presence across all five categories.`;
  }
  const listed = weaknesses.slice(0, 3).join(", ");
  const extra = weaknesses.length > 3 ? ` and ${weaknesses.length - 3} more area(s)` : "";
  return `${name}'s biggest opportunities are in ${listed}${extra}. These gaps represent quick wins that could drive more foot traffic and online orders.`;
}

export function generateTemplates(lead: Lead): GeneratedTemplates {
  const name = lead.restaurantName;
  const weaknesses = getWeaknesses(lead.audit);
  const w1 = weaknesses[0] ?? "your online presence";
  const w2 = weaknesses[1] ?? "social media strategy";

  const dm = `Hey ${name}! 👋 Love what you're doing — just wanted to reach out. I noticed your ${w1} has some room to grow, and that's literally what we help Sacramento restaurants fix. We're Packed House Media — we handle your ${w2} so you can focus on the food. Already working with a couple local spots. Would love to show you what we've done. Open to a quick 15-min call this week?`;

  const email = `Subject: More customers for ${name} — quick idea

Hi ${name} team,

I'm Luis with Packed House Media, a Sacramento-based social media agency that works specifically with local restaurants.

I took a look at your digital presence and noticed a couple of opportunities — particularly around your ${w1} and ${w2}. These are areas where a focused effort can directly translate into more foot traffic and online orders.

We handle content creation, profile optimization, and platform growth for restaurants like yours, typically at $500–800/month with no long contracts.

I'd love to share a few quick wins specific to ${name}. Would you be open to a 15-minute call this week?

Best,
Luis
Packed House Media
[PHONE] | [EMAIL]`;

  const call = `"Hi, is this ${name}? Hey, I'm Luis with Packed House Media — we're a local Sacramento agency that works with restaurants on their social media and online presence. I took a look at your ${w1} and thought there might be a quick opportunity there. Do you have about 15 minutes this week to take a look together?"`;

  return { dm, email, call };
}
