import type { CurriculumRecord } from "@/lib/api";
import { formatCurriculumDate } from "@/lib/curriculum-metadata";

export type CurriculumSectionId = "overview" | "audience" | "structure" | "delivery" | "materials";

export interface CurriculumSectionDefinition {
  id: CurriculumSectionId;
  label: string;
  description: string;
}

export const CURRICULUM_SECTIONS: readonly CurriculumSectionDefinition[] = [
  {
    id: "overview",
    label: "Curriculum overview",
    description: "Foundational identity, approval status, and positioning context.",
  },
  {
    id: "audience",
    label: "Audience & outcomes",
    description: "Learner profiles, prerequisites, and measurable outcomes.",
  },
  {
    id: "structure",
    label: "Structure & workload",
    description: "Effort expectations, independent work, and study modules.",
  },
  {
    id: "delivery",
    label: "Delivery & quality",
    description: "Facilitation methods, completion requirements, and documents issued.",
  },
  {
    id: "materials",
    label: "Study materials",
    description: "Supporting resources and independent study artefacts.",
  },
] as const;

export const getSectionLabel = (sectionId: CurriculumSectionId): string => {
  const section = CURRICULUM_SECTIONS.find((item) => item.id === sectionId);
  return section ? section.label : sectionId;
};

export const getCurriculumSectionSummary = (
  curriculum: CurriculumRecord,
  sectionId: CurriculumSectionId,
): string[] => {
  switch (sectionId) {
    case "overview":
      return [
        `Group: ${curriculum.curriculumGroup ?? "Not specified"}`,
        curriculum.approvalDate ? `Approved ${formatCurriculumDate(curriculum.approvalDate)}` : "Awaiting approval",
        curriculum.basisCurriculumDevelopment ?? "No development notes supplied",
      ];
    case "audience":
      return [
        `Target groups: ${curriculum.targetGroup.length ? curriculum.targetGroup.join(", ") : "Not specified"}`,
        `Prerequisites: ${curriculum.prerequisites.length ? curriculum.prerequisites.join(", ") : "Not specified"}`,
        `Objectives: ${curriculum.learningObjectives.length ? curriculum.learningObjectives.join(", ") : "Add objectives"}`,
        `Outcomes: ${curriculum.learningOutcomes.length ? curriculum.learningOutcomes.join(", ") : "Add outcomes"}`,
      ];
    case "structure":
      return [
        `Total hours: ${curriculum.totalHours ?? "—"}`,
        `Classroom hours: ${curriculum.classroomHours ?? "—"}`,
        `Independent hours: ${curriculum.independentHours ?? "—"}`,
        `Study content: ${curriculum.studyContent.length ? curriculum.studyContent.join(", ") : "No modules listed"}`,
      ];
    case "delivery":
      return [
        `Teaching methods: ${curriculum.teachingMethods ?? "Not provided"}`,
        `Completion requirements: ${curriculum.completionRequirements ?? "Not provided"}`,
        `Documents issued: ${curriculum.documentsIssued ?? "Not specified"}`,
      ];
    case "materials":
      return [
        `Independent work: ${curriculum.independentWork.length ? curriculum.independentWork.join(", ") : "No activities listed"}`,
        `Study content: ${curriculum.studyContent.length ? curriculum.studyContent.join(", ") : "No resources linked"}`,
      ];
    default:
      return [];
  }
};
