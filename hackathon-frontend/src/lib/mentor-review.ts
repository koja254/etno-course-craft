import type { CurriculumSectionId } from "@/lib/curriculum-sections";

export type MentorReviewThreadStatus = "pending" | "approved" | "declined";

export type MentorReviewMessageRole = "mentor" | "creator" | "program-manager";

export interface MentorReviewMessage {
  id: string;
  author: string;
  role: MentorReviewMessageRole;
  message: string;
  createdAt: string;
}

export interface MentorReviewThread {
  id: string;
  sectionId: CurriculumSectionId;
  status: MentorReviewThreadStatus;
  messages: MentorReviewMessage[];
}
