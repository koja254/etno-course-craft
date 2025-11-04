import type { CurriculumRecord } from "@/lib/api";

export type CurriculumStatusMeta = {
  label: string;
  tone: "default" | "outline" | "secondary" | "destructive";
};

export const CURRICULUM_STATUS_META: Record<CurriculumRecord["status"], CurriculumStatusMeta> = {
  approved: { label: "Approved", tone: "default" },
  pending: { label: "Pending approval", tone: "secondary" },
  draft: { label: "Draft", tone: "outline" },
  rejected: { label: "Rejected", tone: "destructive" },
  published: { label: "Published", tone: "default" },
};

export const formatCurriculumDate = (isoDate?: string | null): string => {
  if (!isoDate) {
    return "";
  }

  try {
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
};
