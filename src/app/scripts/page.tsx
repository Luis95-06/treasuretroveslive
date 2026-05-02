"use client";

import { useState } from "react";
import { Copy, ChevronLeft, ChevronRight, FileText } from "lucide-react";

type ScriptAngle = "problem_solution" | "review" | "unboxing" | "trending";
type ProductCategory = "beauty" | "apparel" | "accessories" | "household" | "health" | "other";

type GeneratedScript = {
  hookVariants: string[];
  bodyVariants: string[];
  ctaVariants: string[];
  hashtags: string[];
};

const ANGLES: { value: ScriptAngle; label: string; desc: string }[] = [
  { value: "problem_solution", label: "Problem/Solution", desc: "Hook with a pain point, reveal your product as the fix" },
  { value: "review", label: "Honest Review", desc: "Authentic review format — pros, cons, verdict" },
  { value: "unboxing", label: "Unboxing", desc: "Live unboxing reaction — suspense builds interest" },
  { value: "trending", label: "Trending", desc: "Ride the hype — why everyone's talking about it" },
];

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "beauty", label: "Beauty & Skincare" },
  { value: "apparel", label: "Apparel & Fashion" },
  { value: "accessories", label: "Accessories & Tech" },
  { value: "household", label: "Household & Home" },
  { value: "health", label: "Health & Wellness" },
  { value: "other", label: "Other" },
];

export default function ScriptsPage() {
  const [form, setForm] = useState({
    productName: "",
    angle: "problem_solution" as ScriptAngle,
    category: "beauty" as ProductCategory,
    benefit: "",
    problem: "",
  });
  const [result, setResult] = useState<GeneratedScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [hookIdx, setHookIdx] = useState(0);
  const [bodyIdx, setBodyIdx] = useState(0);
  const [copied, setCopied] = useState("");

  async function generate() {
    if (!form.productName || !form.benefit) return;
    setLoading(true);
    setHookIdx(0);
    setBodyIdx(0);
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function copyAll() {
    if (!result) return;
    const text = [
      `HOOK:\n${result.hookVariants[hookIdx]}`,
      `\nBODY:\n${result.bodyVariants[bodyIdx]}`,
      `\nCTA:\n${result.ctaVariants[0]}`,
      `\nHASHTAGS:\n${result.hashtags.join(" ")}`,
    ].join("\n");
    copyText(text, "all");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Script Generator</h1>
        <p className="text-sm text-gray-400 mt-0.5">Generate TikTok video scripts for any product — no AI API needed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Phone Cases & Screen Protectors"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Main Benefit</label>
            <input
              type="text"
              placeholder="e.g. drops without cracking, absorbs in 30 seconds"
              value={form.benefit}
              onChange={(e) => setForm({ ...form, benefit: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
            />
          </div>

          {form.angle === "problem_solution" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Problem (for Problem/Solution angle)</label>
              <input
                type="text"
                placeholder="e.g. cracked phone screens, clogged pores"
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Video Angle</label>
            <div className="space-y-2">
              {ANGLES.map((a) => (
                <label key={a.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.angle === a.value ? "border-pink-500 bg-pink-500/10" : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}>
                  <input
                    type="radio"
                    value={a.value}
                    checked={form.angle === a.value}
                    onChange={() => setForm({ ...form, angle: a.value })}
                    className="mt-0.5 accent-pink-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Niche / Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <button
            onClick={generate}
            disabled={loading || !form.productName || !form.benefit}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? "Generating..." : "Generate Script"}
          </button>
        </div>

        {/* Output */}
        <div>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Fill in the form and click Generate</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  <Copy className="w-3 h-3" />
                  {copied === "all" ? "Copied!" : "Copy All"}
                </button>
              </div>

              <ScriptBlock
                label="Hook"
                sublabel="First 3 seconds"
                color="amber"
                variants={result.hookVariants}
                idx={hookIdx}
                onPrev={() => setHookIdx(Math.max(0, hookIdx - 1))}
                onNext={() => setHookIdx(Math.min(result.hookVariants.length - 1, hookIdx + 1))}
                onCopy={() => copyText(result.hookVariants[hookIdx], "hook")}
                copied={copied === "hook"}
              />

              <ScriptBlock
                label="Body"
                sublabel="Main content"
                color="blue"
                variants={result.bodyVariants}
                idx={bodyIdx}
                onPrev={() => setBodyIdx(Math.max(0, bodyIdx - 1))}
                onNext={() => setBodyIdx(Math.min(result.bodyVariants.length - 1, bodyIdx + 1))}
                onCopy={() => copyText(result.bodyVariants[bodyIdx], "body")}
                copied={copied === "body"}
              />

              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-pink-300 uppercase tracking-wide">CTA</span>
                    <span className="text-xs text-gray-500 ml-2">Call to action</span>
                  </div>
                  <button onClick={() => copyText(result.ctaVariants[0], "cta")} className="text-gray-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-gray-200">{result.ctaVariants[0]}</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Hashtags</span>
                  <button onClick={() => copyText(result.hashtags.join(" "), "tags")} className="text-gray-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScriptBlock({
  label, sublabel, color, variants, idx, onPrev, onNext, onCopy, copied,
}: {
  label: string; sublabel: string; color: string; variants: string[]; idx: number;
  onPrev: () => void; onNext: () => void; onCopy: () => void; copied: boolean;
}) {
  const colorMap: Record<string, string> = {
    amber: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  };
  return (
    <div className={`rounded-xl p-4 border ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${color === "amber" ? "text-yellow-300" : "text-blue-300"}`}>{label}</span>
          <span className="text-xs text-gray-500 ml-2">{sublabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onPrev} disabled={idx === 0} className="text-gray-400 hover:text-white disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500">{idx + 1}/{variants.length}</span>
          <button onClick={onNext} disabled={idx === variants.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={onCopy} className="ml-1 text-gray-400 hover:text-white">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{variants[idx]}</p>
      {copied && <p className="text-xs text-green-400 mt-1">Copied!</p>}
    </div>
  );
}
