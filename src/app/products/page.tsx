"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatPercent, formatImpressions } from "@/lib/utils";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

type Snapshot = {
  id: number;
  ctr: number | null;
  cvr: number | null;
  cpa: number | null;
  impressions: number | null;
  growthPct: number | null;
  score: number | null;
  scrapedAt: string;
  product: { id: number; name: string; category: string };
};

const CATEGORIES = ["all", "beauty", "apparel", "accessories", "household", "health"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Snapshot[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/products?category=${category}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  async function triggerScrape() {
    setScraping(true);
    setScrapeMsg("");
    const res = await fetch("/api/products/scrape", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setScrapeMsg("Scrape started — check back in 2 minutes.");
    } else {
      setScrapeMsg(data.error ?? "Error starting scrape.");
    }
    setScraping(false);
  }

  useEffect(() => { load(); }, [category]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Product Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">TikTok Creative Center — top trending products</p>
        </div>
        <div className="flex items-center gap-3">
          {scrapeMsg && <span className="text-xs text-gray-400">{scrapeMsg}</span>}
          <button
            onClick={triggerScrape}
            disabled={scraping}
            className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scraping ? "animate-spin" : ""}`} />
            {scraping ? "Starting..." : "Run Scrape"}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
              category === c
                ? "bg-pink-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="pb-3 pr-4 text-gray-400 font-medium">Product</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Category</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">CVR</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">CPA</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">CTR</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Impressions</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Growth</th>
                <th className="pb-3 text-gray-400 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 pr-4 font-medium text-white">{p.product.name}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full capitalize">
                      {p.product.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-green-400">
                    {p.cvr != null ? formatPercent(p.cvr) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right text-yellow-400">
                    {p.cpa != null ? formatCurrency(p.cpa) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-300">
                    {p.ctr != null ? formatPercent(p.ctr) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-300">
                    {p.impressions != null ? formatImpressions(p.impressions) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {p.growthPct != null ? (
                      <span className={`flex items-center justify-end gap-1 ${p.growthPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {p.growthPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {Math.abs(p.growthPct)}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <ScoreBadge score={p.score} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No products found. Try running a scrape or seeding the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-500">—</span>;
  const color = score >= 80 ? "bg-green-500/20 text-green-300" : score >= 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-gray-700 text-gray-400";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score.toFixed(0)}</span>;
}
