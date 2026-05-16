"use client";

import { useState } from "react";
import { ClipboardCopy, Check, Save, ChevronDown, ChevronUp } from "lucide-react";
import type { Lead, LeadAudit, AuditCategory, GeneratedTemplates } from "@/lib/phm-types";
import {
  buildWeaknessSummary,
  generateTemplates,
  getWeaknesses,
} from "@/lib/phm-templates";
import { saveLead } from "@/lib/phm-storage";

// ─── Helpers ────────────────────────────────────────────────────────────────

function emptyCategory(score = 5): AuditCategory {
  return { score, notes: "" };
}

function defaultAudit(): LeadAudit {
  return {
    website: emptyCategory(),
    google: emptyCategory(),
    instagram: emptyCategory(),
    tiktok: { ...emptyCategory(), followerCount: "" },
    ordering: emptyCategory(),
  };
}

function calcOverall(audit: LeadAudit): number {
  const scores = [
    audit.website.score,
    audit.google.score,
    audit.instagram.score,
    audit.tiktok.score,
    audit.ordering.score,
  ];
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

function scoreColor(s: number) {
  if (s >= 8) return "text-green-400";
  if (s >= 5) return "text-yellow-400";
  return "text-red-400";
}

function scoreBg(s: number) {
  if (s >= 8) return "bg-green-500/20 border-green-500/40";
  if (s >= 5) return "bg-yellow-500/20 border-yellow-500/40";
  return "bg-red-500/20 border-red-500/40";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryCard({
  label,
  description,
  value,
  onChange,
  children,
}: {
  label: string;
  description: string;
  value: AuditCategory;
  onChange: (v: AuditCategory) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-bold font-mono w-8 text-center ${scoreColor(value.score)}`}
          >
            {value.score}
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
          {/* Score slider + number */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={value.score}
              onChange={(e) => onChange({ ...value, score: Number(e.target.value) })}
              className="flex-1 accent-pink-500"
            />
            <input
              type="number"
              min={1}
              max={10}
              value={value.score}
              onChange={(e) => {
                const n = Math.min(10, Math.max(1, Number(e.target.value)));
                onChange({ ...value, score: n });
              }}
              className="w-14 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-center text-sm text-white"
            />
          </div>

          {/* Extra fields from parent (e.g. TikTok follower count) */}
          {children}

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={value.notes}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-pink-500"
          />
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-400" /> Copied
        </>
      ) : (
        <>
          <ClipboardCopy className="w-3 h-3" /> Copy
        </>
      )}
    </button>
  );
}

function TemplateCard({
  label,
  badge,
  text,
}: {
  label: string;
  badge: string;
  text: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium">
            {badge}
          </span>
        </div>
        <CopyButton text={text} />
      </div>
      <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
        {text}
      </pre>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [audit, setAudit] = useState<LeadAudit>(defaultAudit());
  const [result, setResult] = useState<{
    lead: Lead;
    templates: GeneratedTemplates;
  } | null>(null);
  const [saved, setSaved] = useState(false);

  function updateCategory<K extends keyof LeadAudit>(
    key: K,
    val: LeadAudit[K]
  ) {
    setAudit((a) => ({ ...a, [key]: val }));
    setResult(null); // reset results on change
    setSaved(false);
  }

  function runAudit() {
    if (!restaurantName.trim()) return;
    const overall = calcOverall(audit);
    const weaknessSummary = buildWeaknessSummary(restaurantName.trim(), audit);
    const lead: Lead = {
      id: `lead_${Date.now()}`,
      restaurantName: restaurantName.trim(),
      auditDate: new Date().toISOString(),
      audit,
      overallScore: overall,
      weaknessSummary,
      stage: "audited",
      lastAction: "Audit completed",
      outreachTemplateSent: null,
    };
    setResult({ lead, templates: generateTemplates(lead) });
    setSaved(false);
  }

  function handleSave() {
    if (!result) return;
    saveLead(result.lead);
    setSaved(true);
  }

  const weaknesses = result ? getWeaknesses(result.lead.audit) : [];
  const overall = result?.lead.overallScore ?? calcOverall(audit);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">
          PHM — Packed House Media
        </p>
        <h1 className="text-xl font-bold text-white mt-0.5">Restaurant Audit</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Score a restaurant across 5 categories, then generate outreach templates.
        </p>
      </div>

      {/* Restaurant name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Restaurant Name</label>
        <input
          type="text"
          placeholder="e.g. Ella Dining Room & Bar"
          value={restaurantName}
          onChange={(e) => {
            setRestaurantName(e.target.value);
            setResult(null);
            setSaved(false);
          }}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-pink-500"
        />
      </div>

      {/* Scoring categories */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Score each category 1–10</p>

        <CategoryCard
          label="Website Quality"
          description="Do they have one? Is it modern, fast, mobile-friendly?"
          value={audit.website}
          onChange={(v) => updateCategory("website", v)}
        />

        <CategoryCard
          label="Google Business Profile"
          description="Complete info, recent reviews, photos, hours?"
          value={audit.google}
          onChange={(v) => updateCategory("google", v)}
        />

        <CategoryCard
          label="Instagram Presence"
          description="Active account, quality content, posting frequency?"
          value={audit.instagram}
          onChange={(v) => updateCategory("instagram", v)}
        />

        <CategoryCard
          label="TikTok Presence"
          description="Account exists and active? Follower count?"
          value={audit.tiktok}
          onChange={(v) => updateCategory("tiktok", v as LeadAudit["tiktok"])}
        >
          <input
            type="text"
            placeholder="TikTok follower count (e.g. 1,200 or N/A)"
            value={audit.tiktok.followerCount}
            onChange={(e) =>
              updateCategory("tiktok", { ...audit.tiktok, followerCount: e.target.value })
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500"
          />
        </CategoryCard>

        <CategoryCard
          label="Online Ordering / Delivery"
          description="DoorDash, Uber Eats, Toast, own ordering system?"
          value={audit.ordering}
          onChange={(v) => updateCategory("ordering", v)}
        />
      </div>

      {/* Overall score preview */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-xl border ${scoreBg(overall)}`}
      >
        <span className="text-sm font-medium text-gray-200">Overall Score</span>
        <span className={`text-2xl font-bold ${scoreColor(overall)}`}>
          {overall} <span className="text-sm font-normal text-gray-400">/ 10</span>
        </span>
      </div>

      {/* Analyze button */}
      <button
        type="button"
        onClick={runAudit}
        disabled={!restaurantName.trim()}
        className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        Generate Audit &amp; Templates
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-5 border-t border-gray-800 pt-5">
          {/* Weakness summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Weakness Summary
            </p>
            <p className="text-sm text-gray-200 leading-relaxed">
              {result.lead.weaknessSummary}
            </p>
            {weaknesses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {weaknesses.map((w) => (
                  <span
                    key={w}
                    className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/20"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Outreach Templates
            </p>

            <TemplateCard
              label="Cold DM"
              badge="Instagram / TikTok"
              text={result.templates.dm}
            />
            <TemplateCard
              label="Cold Email"
              badge="Email"
              text={result.templates.email}
            />
            <TemplateCard
              label="Call Script"
              badge="Phone Opener"
              text={result.templates.call}
            />
          </div>

          {/* Save to pipeline */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved to Pipeline ✓" : "Save Lead to Pipeline"}
          </button>
        </div>
      )}
    </div>
  );
}
