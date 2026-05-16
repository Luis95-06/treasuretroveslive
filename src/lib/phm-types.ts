export type AuditCategory = {
  score: number; // 1–10
  notes: string;
};

export type LeadAudit = {
  website: AuditCategory;
  google: AuditCategory;
  instagram: AuditCategory;
  tiktok: AuditCategory & { followerCount: string };
  ordering: AuditCategory;
};

export type PipelineStage = "audited" | "contacted" | "responded" | "client";

export type OutreachTemplateSent = "dm" | "email" | "call" | null;

export type Lead = {
  id: string;
  restaurantName: string;
  auditDate: string; // ISO string
  audit: LeadAudit;
  overallScore: number; // 0–10, average of 5 categories
  weaknessSummary: string;
  stage: PipelineStage;
  lastAction: string;
  outreachTemplateSent: OutreachTemplateSent;
};

export type GeneratedTemplates = {
  dm: string;
  email: string;
  call: string;
};
