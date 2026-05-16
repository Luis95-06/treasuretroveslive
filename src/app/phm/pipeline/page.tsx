"use client";

import { useEffect, useState } from "react";
import { Trash2, ChevronRight, ChevronLeft, MessageSquare, Mail, Phone, X } from "lucide-react";
import type { Lead, PipelineStage, OutreachTemplateSent } from "@/lib/phm-types";
import { getLeads, saveLead, deleteLead } from "@/lib/phm-storage";
import { generateTemplates } from "@/lib/phm-templates";

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: "audited", label: "Audited", color: "border-gray-600" },
  { key: "contacted", label: "Contacted", color: "border-blue-500" },
  { key: "responded", label: "Responded", color: "border-yellow-500" },
  { key: "client", label: "Client ✓", color: "border-green-500" },
];

const STAGE_ORDER: PipelineStage[] = ["audited", "contacted", "responded", "client"];

const TEMPLATE_ICONS: Record<NonNullable<OutreachTemplateSent>, React.ReactNode> = {
  dm: <MessageSquare className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  call: <Phone className="w-3 h-3" />,
};

const TEMPLATE_LABELS: Record<NonNullable<OutreachTemplateSent>, string> = {
  dm: "DM sent",
  email: "Email sent",
  call: "Call made",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 8) return "text-green-400";
  if (s >= 5) return "text-yellow-400";
  return "text-red-400";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stageIndex(stage: PipelineStage) {
  return STAGE_ORDER.indexOf(stage);
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function LeadModal({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (l: Lead) => void;
}) {
  const templates = generateTemplates(lead);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function markSent(type: OutreachTemplateSent) {
    const updated: Lead = {
      ...lead,
      outreachTemplateSent: type,
      lastAction: type ? TEMPLATE_LABELS[type] : lead.lastAction,
    };
    saveLead(updated);
    onUpdate(updated);
  }

  const templateList: { key: OutreachTemplateSent; label: string; badge: string; text: string }[] = [
    { key: "dm", label: "Cold DM", badge: "Instagram / TikTok", text: templates.dm },
    { key: "email", label: "Cold Email", badge: "Email", text: templates.email },
    { key: "call", label: "Call Script", badge: "Phone Opener", text: templates.call },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div>
            <p className="text-xs text-pink-400 font-medium">Lead Details</p>
            <h2 className="text-base font-bold text-white mt-0.5">{lead.restaurantName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Audited {formatDate(lead.auditDate)} · Score:{" "}
              <span className={scoreColor(lead.overallScore)}>{lead.overallScore}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Weakness summary */}
          <div className="bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1 font-medium">Weakness Summary</p>
            <p className="text-xs text-gray-300 leading-relaxed">{lead.weaknessSummary}</p>
          </div>

          {/* Audit scores */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Audit Scores</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["Website", lead.audit.website.score],
                  ["Google", lead.audit.google.score],
                  ["Instagram", lead.audit.instagram.score],
                  ["TikTok", lead.audit.tiktok.score],
                  ["Ordering", lead.audit.ordering.score],
                ] as [string, number][]
              ).map(([label, score]) => (
                <div key={label} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Outreach Templates</p>
            <div className="space-y-3">
              {templateList.map(({ key, label, badge, text }) => (
                <div key={key} className="bg-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                        {badge}
                      </span>
                      {lead.outreachTemplateSent === key && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">
                          Sent
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copy(key!, text)}
                        className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                      >
                        {copied === key ? "Copied ✓" : "Copy"}
                      </button>
                      <button
                        onClick={() => markSent(key)}
                        className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                      >
                        Mark Sent
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onMove,
  onDelete,
  onClick,
}: {
  lead: Lead;
  onMove: (direction: "forward" | "back") => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const idx = stageIndex(lead.stage);
  const canForward = idx < STAGE_ORDER.length - 1;
  const canBack = idx > 0;

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-xl p-3 space-y-2 cursor-pointer hover:border-gray-600 transition-colors"
      onClick={onClick}
    >
      {/* Restaurant name + score */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white leading-tight">{lead.restaurantName}</p>
        <span className={`text-sm font-bold shrink-0 ${scoreColor(lead.overallScore)}`}>
          {lead.overallScore}
        </span>
      </div>

      {/* Meta */}
      <p className="text-xs text-gray-500">{formatDate(lead.auditDate)}</p>
      <p className="text-xs text-gray-400 truncate">{lead.lastAction}</p>

      {/* Template badge */}
      {lead.outreachTemplateSent && (
        <div className="flex items-center gap-1 text-xs text-blue-400">
          {TEMPLATE_ICONS[lead.outreachTemplateSent]}
          <span>{TEMPLATE_LABELS[lead.outreachTemplateSent]}</span>
        </div>
      )}

      {/* Actions — stop propagation so clicking buttons doesn't open modal */}
      <div
        className="flex items-center justify-between pt-1 border-t border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1">
          <button
            disabled={!canBack}
            onClick={() => onMove("back")}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-30 text-gray-400 transition-colors"
            title="Move back"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={!canForward}
            onClick={() => onMove("forward")}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-30 text-gray-400 transition-colors"
            title="Move forward"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={() => onDelete()}
          className="p-1 rounded hover:bg-red-900/40 text-gray-600 hover:text-red-400 transition-colors"
          title="Delete lead"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  function moveLeadStage(id: string, direction: "forward" | "back") {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = stageIndex(l.stage);
        const nextIdx = direction === "forward" ? idx + 1 : idx - 1;
        if (nextIdx < 0 || nextIdx >= STAGE_ORDER.length) return l;
        const nextStage = STAGE_ORDER[nextIdx];
        const updated: Lead = {
          ...l,
          stage: nextStage,
          lastAction: `Moved to ${STAGES.find((s) => s.key === nextStage)?.label}`,
        };
        saveLead(updated);
        return updated;
      })
    );
  }

  function handleDelete(id: string) {
    deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  }

  function handleLeadUpdate(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }

  const totalLeads = leads.length;
  const clientCount = leads.filter((l) => l.stage === "client").length;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">
            PHM — Packed House Media
          </p>
          <h1 className="text-xl font-bold text-white mt-0.5">Lead Pipeline</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalLeads} lead{totalLeads !== 1 ? "s" : ""} · {clientCount} client
            {clientCount !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/phm/audit"
          className="px-3 py-2 text-xs rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-semibold transition-colors"
        >
          + New Audit
        </a>
      </div>

      {/* Kanban board — horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => {
          const columnLeads = leads.filter((l) => l.stage === key);
          return (
            <div
              key={key}
              className={`flex-none w-64 bg-gray-900 border-t-2 ${color} rounded-2xl p-3 space-y-3`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{label}</p>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards */}
              {columnLeads.length === 0 && (
                <p className="text-xs text-gray-600 py-4 text-center">No leads here yet</p>
              )}
              {columnLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onMove={(dir) => moveLeadStage(lead.id, dir)}
                  onDelete={() => handleDelete(lead.id)}
                  onClick={() => setSelectedLead(lead)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-gray-400 text-sm">No leads yet.</p>
          <a
            href="/phm/audit"
            className="inline-block text-xs text-pink-400 hover:text-pink-300 underline underline-offset-2"
          >
            Run your first restaurant audit →
          </a>
        </div>
      )}

      {/* Detail modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}
