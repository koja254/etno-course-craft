export type UserRole = "program-manager" | "course-creator" | "mentor";

export const ALL_ROLES: UserRole[] = ["program-manager", "course-creator", "mentor"];

interface RoleDetail {
  label: string;
  shorthand: string;
  description: string;
  collaborationTip: string;
  capabilities: string[];
}

export const ROLE_DETAILS: Record<UserRole, RoleDetail> = {
  "program-manager": {
    label: "Program Manager",
    shorthand: "Super Admin",
    description:
      "Owns the portfolio. Can configure templates, assign mentors, finalise schedules, and publish courses.",
    collaborationTip:
      "You can edit every field, invite collaborators, finalise schedules, and publish the course when it is ready.",
    capabilities: [
      "Create and publish courses",
      "Assign mentors and manage schedules",
      "Approve and resolve collaborator feedback",
    ],
  },
  "course-creator": {
    label: "Course Creator",
    shorthand: "Content Lead",
    description:
      "Shapes the learning experience. Works with the program manager on content, outcomes, and curriculum.",
    collaborationTip:
      "Focus on crafting course content. Scheduling and publishing will be handled by the program manager.",
    capabilities: [
      "Edit course basics, outcomes, and curriculum",
      "Use AI drafting tools for rapid iteration",
      "Collaborate via comments and mark items resolved",
    ],
  },
  mentor: {
    label: "Mentor",
    shorthand: "Reviewer",
    description:
      "Subject-matter reviewer who supports delivery. Reviews the curriculum and leaves structured feedback.",
    collaborationTip:
      "Browse the draft, leave comments, and discuss changes. Editing is disabled so version history stays clean.",
    capabilities: [
      "Review the syllabus and schedule",
      "Add contextual comments for the team",
      "Track resolutions from the program manager or course creator",
    ],
  },
};
