import type { Lead } from "./phm-types";

const KEY = "phm_leads_v1";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveLead(lead: Lead): void {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    leads[idx] = lead;
  } else {
    leads.unshift(lead);
  }
  localStorage.setItem(KEY, JSON.stringify(leads));
}

export function deleteLead(id: string): void {
  const leads = getLeads().filter((l) => l.id !== id);
  localStorage.setItem(KEY, JSON.stringify(leads));
}

export function updateLeadStage(
  id: string,
  patch: Partial<Pick<Lead, "stage" | "lastAction" | "outreachTemplateSent">>
): void {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return;
  Object.assign(lead, patch);
  localStorage.setItem(KEY, JSON.stringify(leads));
}
