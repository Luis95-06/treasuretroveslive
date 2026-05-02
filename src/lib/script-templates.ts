export type ScriptAngle = "problem_solution" | "review" | "unboxing" | "trending";
export type ProductCategory = "beauty" | "apparel" | "accessories" | "household" | "health" | "other";

const NICHE_HASHTAGS: Record<ProductCategory, string[]> = {
  beauty: ["#beautytok", "#skincaretok", "#beautyfinds", "#skincarecheck", "#glowup",
           "#beautyreview", "#makeuptutorial", "#skincareroutine", "#beautyproducts", "#tiktokbeauty",
           "#serumreview", "#glowskin", "#affordablebeauty", "#dermatologytips", "#antiaging"],
  apparel: ["#outfitcheck", "#ootd", "#fashiontok", "#styletok", "#outfitinspo",
            "#mensfashion", "#womensfashion", "#affordablefashion", "#tiktokmademebuyit", "#clothinghaul",
            "#fashionfinds", "#styleinspo", "#outfitoftheday", "#fashionhaul", "#trendingoutfits"],
  accessories: ["#accessoriescheck", "#phonecase", "#phonecasecheck", "#techfinds", "#accessories",
                "#aestheticfinds", "#tiktokaccessories", "#jewelryfinds", "#bagcheck", "#unboxing",
                "#haul", "#musthave", "#obsessed", "#trending", "#findsonline"],
  household: ["#cleantok", "#cleanwithme", "#householdfinds", "#homefinds", "#cleaningtips",
              "#homehacks", "#tidying", "#satisfyingclean", "#hometok", "#cleaningproducts",
              "#homecleaning", "#organisationcheck", "#homeorganization", "#lifehack", "#tiktokmademebuyit"],
  health: ["#healthtok", "#wellnesstok", "#supplementcheck", "#healthylifestyle", "#wellness",
           "#vitamins", "#healthfinds", "#bodytransformation", "#fitnesscheck", "#healthyliving",
           "#supplementreview", "#nootrop", "#antiaging", "#healthyhabits", "#tiktokmademebuyit"],
  other: ["#tiktokmademebuyit", "#haul", "#unboxing", "#musthave", "#trending",
          "#productreview", "#findsonline", "#dealcheck", "#affordable", "#review",
          "#obsessed", "#recommend", "#tryit", "#honest", "#buyornot"],
};

interface TemplateSet {
  hooks: string[];
  bodies: string[];
  ctas: string[];
}

const TEMPLATES: Record<ScriptAngle, TemplateSet> = {
  problem_solution: {
    hooks: [
      "POV: You've been struggling with {problem} for months — until I found THIS 🤯",
      "Stop what you're doing. If you deal with {problem}, this {productName} just changed everything.",
      "This is your sign to finally fix {problem}. It took me one try with {productName}.",
    ],
    bodies: [
      "I was so skeptical at first but {productName} literally {benefit}. I've tried everything and nothing worked until now. Here's what happened after just one week...",
      "I ordered {productName} after seeing it everywhere and honestly? It delivers. Watch me show you exactly how it handles {problem} in real time.",
      "Real talk — {productName} is the solution to {problem} I didn't know I needed. Let me break down why it actually works.",
    ],
    ctas: [
      "Link is in my bio — it's going fast. Drop a ❤️ if you're grabbing one!",
      "Comment 'LINK' and I'll DM you where to get it before it sells out.",
    ],
  },
  review: {
    hooks: [
      "Honest review of {productName} after 2 weeks — not sponsored, not holding back 👀",
      "I spent money testing {productName} so you don't have to. Here's the truth.",
      "Rating {productName} out of 10. Watch till the end for the verdict.",
    ],
    bodies: [
      "First impressions: packaging was great. Quality feels solid. After using it daily for 2 weeks I noticed {benefit}. Overall — if you want {benefit}, this is genuinely worth it.",
      "Pros: {benefit}, fast shipping, affordable. Cons: minor. Overall verdict — if you're looking for {benefit}, this is worth every penny.",
      "Compared to popular alternatives, {productName} is better because {benefit}. And it's a fraction of the price.",
    ],
    ctas: [
      "Questions? Drop them below — I answer everything. Link in bio to grab yours.",
      "Save this for later and comment 'REVIEW' if you want my full written breakdown.",
    ],
  },
  unboxing: {
    hooks: [
      "Unboxing {productName} live — I've been waiting weeks for this 📦",
      "It FINALLY arrived. First look at {productName} — let's see if the hype is real.",
      "The {productName} everyone's been talking about just landed. Unboxing RIGHT NOW 👀",
    ],
    bodies: [
      "Okay first — the packaging is clean and professional. Pulling it out... quality feels legit. Testing it now: {benefit}. Honestly? I'm impressed.",
      "Box is sealed, looks premium. The {productName} itself feels well-made. Quick test: {benefit}. It matches the listing.",
      "Unboxing reaction: love it. Product quality check: solid. Does it match the listing? Yes. First use result: {benefit}.",
    ],
    ctas: [
      "Full review coming in 2 weeks. For now — link in bio if you want one!",
      "Part 2 coming soon! Follow so you don't miss the full review. Link in bio.",
    ],
  },
  trending: {
    hooks: [
      "This {productName} is literally everywhere right now and I finally know why 🔥",
      "TikTok made me buy {productName} and I have absolutely zero regrets.",
      "POV: You sleep on {productName} until you see what it actually does.",
    ],
    bodies: [
      "I kept seeing {productName} on my FYP and finally caved. Here's why everyone is obsessed: {benefit}. After trying it myself — I completely get it.",
      "When something trends this hard there's always a reason. For {productName} it's {benefit}. I tested it and the hype is fully justified.",
      "{productName} has been trending and the reason is simple — {benefit}. I put it head to head with what I was using before and the difference is wild.",
    ],
    ctas: [
      "Grab it before it sells out again — link is in my bio 🛒",
      "Like + follow for more honest finds. Link in bio — it's worth it.",
    ],
  },
};

export interface GeneratedScript {
  hookVariants: string[];
  bodyVariants: string[];
  ctaVariants: string[];
  hashtags: string[];
}

function interpolate(text: string, productName: string, benefit: string, problem: string): string {
  return text
    .replace(/{productName}/g, productName)
    .replace(/{benefit}/g, benefit)
    .replace(/{problem}/g, problem);
}

export function generateScript(params: {
  productName: string;
  angle: ScriptAngle;
  category: ProductCategory;
  benefit: string;
  problem?: string;
}): GeneratedScript {
  const t = TEMPLATES[params.angle];
  const problem = params.problem ?? "this issue";

  return {
    hookVariants: t.hooks.map((h) => interpolate(h, params.productName, params.benefit, problem)),
    bodyVariants: t.bodies.map((b) => interpolate(b, params.productName, params.benefit, problem)),
    ctaVariants: t.ctas,
    hashtags: NICHE_HASHTAGS[params.category].slice(0, 10),
  };
}

export { NICHE_HASHTAGS };
