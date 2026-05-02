"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Zap, TrendingUp } from "lucide-react";

type Opportunity = {
  id: number;
  cvr: number | null;
  cpa: number | null;
  growthPct: number | null;
  impressions: number | null;
  score: number | null;
  isBuyNow: boolean;
  product: { id: number; name: string; category: string };
};

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((d) => { setItems(d); setLoading(false); });
  }, []);

  const buyNow = items.filter((i) => i.isBuyNow);
  const rest = items.filter((i) => !i.isBuyNow);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Opportunities</h1>
        <p className="text-sm text-gray-400 mt-0.5">Products ranked by profit score — focus on Buy Now first</p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          {buyNow.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-semibold text-yellow-300 uppercase tracking-wide">Buy Now</h2>
                <span className="text-xs text-gray-500">CVR ≥ 5%, CPA ≤ $1.00, Score ≥ 65</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buyNow.map((item) => (
                  <div key={item.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{item.product.category}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded">
                        {item.score?.toFixed(0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <Stat label="CVR" value={item.cvr != null ? formatPercent(item.cvr) : "—"} color="text-green-400" />
                      <Stat label="CPA" value={item.cpa != null ? formatCurrency(item.cpa) : "—"} color="text-yellow-400" />
                      <Stat label="Growth" value={item.growthPct != null ? `+${item.growthPct}%` : "—"} color="text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Full Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="pb-3 pr-4 text-gray-400 font-medium">Rank</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium">Product</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium">Category</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium text-right">CVR</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium text-right">CPA</th>
                    <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Growth</th>
                    <th className="pb-3 text-gray-400 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 pr-4 text-gray-500 font-mono">#{i + 1}</td>
                      <td className="py-3 pr-4 font-medium text-white">
                        {item.product.name}
                        {item.isBuyNow && <Zap className="w-3 h-3 text-yellow-400 inline ml-1.5" />}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full capitalize">
                          {item.product.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-green-400">
                        {item.cvr != null ? formatPercent(item.cvr) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-right text-yellow-400">
                        {item.cpa != null ? formatCurrency(item.cpa) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {item.growthPct != null ? (
                          <span className={item.growthPct >= 0 ? "text-green-400" : "text-red-400"}>
                            {item.growthPct >= 0 ? "+" : ""}{item.growthPct}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <ScoreBadge score={item.score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-500">—</span>;
  const color = score >= 80 ? "bg-green-500/20 text-green-300" : score >= 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-gray-700 text-gray-400";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score.toFixed(0)}</span>;
}
