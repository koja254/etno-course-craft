import type { UserRole } from "@/lib/roles";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export interface CurriculumRecord {
  id: number;
  creatorId?: number;
  curriculumCode: string;
  curriculumName: string;
  curriculumGroup: string | null;
  approvalDate?: string | null;
  targetGroup: string[];
  learningObjectives: string[];
  learningOutcomes: string[];
  basisCurriculumDevelopment?: string | null;
  prerequisites: string[];
  totalHours?: number | null;
  classroomHours?: number | null;
  independentHours?: number | null;
  independentWork: string[];
  descriptionLearningEnvironment?: string | null;
  studyContent: string[];
  teachingMethods?: string | null;
  completionRequirements?: string | null;
  documentsIssued?: string | null;
  status: "approved" | "rejected" | "draft" | "pending" | "published";
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumPayload {
  curriculumCode: string;
  curriculumName: string;
  curriculumGroup?: string | null;
  creatorId?: number;
  basisCurriculumDevelopment?: string | null;
  descriptionLearningEnvironment?: string | null;
  targetGroup: string[];
  learningObjectives: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  totalHours?: number | null;
  classroomHours?: number | null;
  independentHours?: number | null;
  independentWork: string[];
  studyContent: string[];
  teachingMethods?: string | null;
  completionRequirements?: string | null;
  documentsIssued?: string | null;
  approvalDate?: string | null;
  status: CurriculumRecord["status"];
}

export interface ResourceRecord {
  id: number;
  title: string;
  type: string;
  url?: string | null;
  description?: string | null;
}

export interface ResourcePayload {
  title: string;
  type: string;
  url?: string;
  description?: string;
}

const mockCurriculums: CurriculumRecord[] = [
  {
    id: 101,
    creatorId: 1,
    curriculumCode: "AI-PM-2025",
    curriculumName: "AI for Project Managers",
    curriculumGroup: "AI Transformation",
    approvalDate: "2024-09-15",
    targetGroup: ["Project managers", "Transformation leads"],
    learningObjectives: [
      "Establish a shared AI vocabulary across programme teams",
      "Spot automation opportunities within existing delivery workflows",
      "Plan change management activities for responsible AI rollouts",
    ],
    learningOutcomes: [
      "Draft an AI adoption roadmap aligned to organisational objectives",
      "Assess AI readiness across people, process, and technology",
      "Frame ethical considerations and escalation pathways",
    ],
    basisCurriculumDevelopment: "Co-designed with industry mentors to address emerging AI delivery needs.",
    prerequisites: ["3+ years project management experience", "Familiarity with agile delivery"],
    totalHours: 80,
    classroomHours: 32,
    independentHours: 48,
    independentWork: ["Weekly AI use case journal", "Peer review clinics"],
    descriptionLearningEnvironment: "Hybrid blend of live labs, async experimentation, and cohort discussion.",
    studyContent: [
      "Module 1: AI fundamentals and terminology",
      "Module 2: Opportunity framing workshop",
      "Module 3: Governance, ethics, and risk mitigation",
    ],
    teachingMethods: "Facilitated workshops, case studies, AI sandbox labs.",
    completionRequirements: "Submit an AI transformation charter and complete all labs.",
    documentsIssued: "Certificate of completion",
    status: "approved",
    createdAt: "2024-01-10T09:00:00.000Z",
    updatedAt: "2024-09-18T12:00:00.000Z",
  },
  {
    id: 102,
    creatorId: 1,
    curriculumCode: "INNOV-06",
    curriculumName: "Innovation Sprint Playbook",
    curriculumGroup: "Innovation",
    targetGroup: ["Product squads", "Service designers"],
    learningObjectives: [
      "Structure 6-week innovation sprints from brief to pilot",
      "Integrate customer research rituals into sprint cadence",
    ],
    learningOutcomes: [
      "Launch a validated sprint backlog with stakeholder alignment",
      "Produce pilot-ready experiment artefacts and learnings",
    ],
    basisCurriculumDevelopment: "Evolved from the Ettevõtluskeskus creator journey for rapid experimentation.",
    prerequisites: ["Exposure to design thinking or lean experimentation"],
    totalHours: 60,
    classroomHours: 24,
    independentHours: 36,
    independentWork: ["Field research prep", "Sprint reflection journals"],
    descriptionLearningEnvironment: "Live mentor touchpoints with async tooling for experiment tracking.",
    studyContent: [
      "Module 1: Opportunity discovery and reframing",
      "Module 2: Rapid prototyping playbook",
      "Module 3: Experiment review and governance",
    ],
    teachingMethods: "Studio sessions, mentor office hours, async critiques.",
    completionRequirements: "Deliver sprint retrospectives and an executive readout.",
    documentsIssued: "Sprint blueprint deck",
    status: "pending",
    approvalDate: null,
    createdAt: "2024-03-02T09:00:00.000Z",
    updatedAt: "2024-05-20T09:30:00.000Z",
  },
];

const mockResources: ResourceRecord[] = [
  {
    id: 501,
    title: "AI Ethics Handbook (PDF)",
    type: "pdf",
    url: "https://example.com/resources/ai-ethics.pdf",
  },
  {
    id: 502,
    title: "Change Management Canvas",
    type: "template",
    url: "https://example.com/resources/change-canvas",
  },
  {
    id: 503,
    title: "AI Readiness Checklist Spreadsheet",
    type: "spreadsheet",
  },
];

const withMockFallback = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.warn("[api] Falling back to mock data because request failed:", error);
    return fallback;
  }
};

export const fetchCurriculums = (role: UserRole) =>
  withMockFallback(async () => {
    const response = await fetch(`${API_BASE_URL}/curriculums?role=${role}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch curriculums (${response.status})`);
    }
    return (await response.json()) as CurriculumRecord[];
  }, mockCurriculums);

export const fetchResources = () =>
  withMockFallback(async () => {
    const response = await fetch(`${API_BASE_URL}/resources`);
    if (!response.ok) {
      throw new Error(`Failed to fetch resources (${response.status})`);
    }
    return (await response.json()) as ResourceRecord[];
  }, mockResources);

export const createResource = (payload: ResourcePayload) =>
  withMockFallback(async () => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to create resource (${response.status})`);
    }
    return (await response.json()) as ResourceRecord;
  }, {
    id: Math.floor(Math.random() * 10000) + 600,
    ...payload,
  });

export const createCurriculum = (payload: CurriculumPayload) =>
  withMockFallback(async () => {
    const response = await fetch(`${API_BASE_URL}/curriculums`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to create curriculum (${response.status})`);
    }
    return (await response.json()) as CurriculumRecord;
  }, {
    id: Math.floor(Math.random() * 10000) + 200,
    creatorId: payload.creatorId ?? 1,
    curriculumCode: payload.curriculumCode,
    curriculumName: payload.curriculumName,
    curriculumGroup: payload.curriculumGroup ?? null,
    approvalDate: payload.approvalDate ?? null,
    targetGroup: payload.targetGroup,
    learningObjectives: payload.learningObjectives,
    learningOutcomes: payload.learningOutcomes,
    basisCurriculumDevelopment: payload.basisCurriculumDevelopment ?? null,
    prerequisites: payload.prerequisites,
    totalHours: payload.totalHours ?? null,
    classroomHours: payload.classroomHours ?? null,
    independentHours: payload.independentHours ?? null,
    independentWork: payload.independentWork,
    descriptionLearningEnvironment: payload.descriptionLearningEnvironment ?? null,
    studyContent: payload.studyContent,
    teachingMethods: payload.teachingMethods ?? null,
    completionRequirements: payload.completionRequirements ?? null,
    documentsIssued: payload.documentsIssued ?? null,
    status: payload.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

export const linkCurriculumResources = (curriculumId: number, resourceIds: number[]) =>
  withMockFallback(async () => {
    const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceIds }),
    });
    if (!response.ok) {
      throw new Error(`Failed to link resources (${response.status})`);
    }
    return await response.json();
  }, { curriculumId, resourceIds });
