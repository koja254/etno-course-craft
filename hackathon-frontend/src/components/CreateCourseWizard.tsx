import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Copy,
  FileDown,
  GripVertical,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Plus,
  Share2,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_DETAILS, type UserRole } from "@/lib/roles";

type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

interface CourseBasics {
  title: string;
  field: string;
  targetLearners: string;
  templateId: string;
  durationWeeks: number;
  description: string;
}

interface LearningOutcome {
  id: string;
  text: string;
  source: "template" | "ai" | "custom";
}

interface CurriculumWeek {
  id: string;
  weekNumber: number;
  title: string;
  summary: string;
  topics: string[];
  activities: string[];
  libraryModuleId?: string;
  date?: string;
}

interface MentorProfile {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  email: string;
  timezone: string;
  unavailableDates: string[];
  tags: string[];
}

interface ScheduleSession {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "session" | "webinar";
  isHoliday?: boolean;
  conflictsWithMentor?: boolean;
  conflictNote?: string;
}

interface CommentThread {
  id: string;
  author: string;
  role: string;
  message: string;
  target: string;
  timestamp: string;
  resolved: boolean;
}

interface TemplatePreset {
  id: string;
  label: string;
  durationWeeks: number;
  field: string;
  description: string;
  defaultTitle: string;
  defaultLearners: string;
  defaultDescription: string;
  defaultOutcomes: string[];
  skeletonWeeks: Array<{
    title: string;
    summary: string;
    topics: string[];
    activities: string[];
  }>;
}

interface LibraryModule {
  id: string;
  title: string;
  summary: string;
  topics: string[];
  activities: string[];
  bestFor: string;
}

interface CreateCourseWizardProps {
  onClose: () => void;
  activeRole: UserRole;
}

const steps = [
  { id: 1, name: "Course Basics", description: "Kick off the course blueprint" },
  { id: 2, name: "Learning Outcomes", description: "Set measurable goals" },
  { id: 3, name: "Curriculum Outline", description: "Design the weekly flow" },
  { id: 4, name: "Mentor & Schedule", description: "Coordinate delivery" },
  { id: 5, name: "Publish & Share", description: "Launch the experience" },
];

const DAY_NAME_TO_INDEX: Record<DayName, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

const SESSION_TIME_OPTIONS = ["10:00", "13:00", "16:00", "18:00", "20:00"];
const WEEKDAY_OPTIONS: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const createId = () => Math.random().toString(36).slice(2, 10);

const mentors: MentorProfile[] = [
  {
    id: "john-smith",
    name: "John Smith",
    expertise: "Applied AI & Data Strategy",
    bio: "Seasoned AI program lead who has supported 40+ enterprise teams in bridging strategy and execution.",
    email: "john.smith@example.com",
    timezone: "GMT+3 (Tallinn)",
    unavailableDates: ["2024-10-30", "2024-11-13"],
    tags: ["AI", "Agile delivery", "Change management"],
  },
  {
    id: "liisa-tamm",
    name: "Liisa Tamm",
    expertise: "Innovation Design",
    bio: "Design strategist focused on learner engagement and experimentation frameworks.",
    email: "liisa.tamm@example.com",
    timezone: "GMT+3 (Tallinn)",
    unavailableDates: ["2024-10-16"],
    tags: ["Innovation", "Service design"],
  },
  {
    id: "mario-koppel",
    name: "Mario Köppel",
    expertise: "Data Governance",
    bio: "Former CDO with deep experience in analytics operating models for regulated industries.",
    email: "mario.koppel@example.com",
    timezone: "GMT+3 (Tallinn)",
    unavailableDates: ["2024-11-06"],
    tags: ["Data governance", "Policy"],
  },
];

const templatePresets: TemplatePreset[] = [
  {
    id: "ai-eight-week",
    label: "AI Transformation · 8 weeks",
    durationWeeks: 8,
    field: "AI",
    description:
      "Best for teams leading cross-functional AI initiatives. Includes checkpoints for ethics, experimentation, and change management.",
    defaultTitle: "AI for Project Managers",
    defaultLearners: "Program managers, project leads, and transformation owners",
    defaultDescription:
      "Guide project teams through AI adoption with confidence. Understand the AI lifecycle, assess opportunities, and lead cross-functional delivery with strong governance.",
    defaultOutcomes: [
      "Frame AI opportunities that align with business value and feasibility.",
      "Design responsible AI experiments with clear success metrics.",
      "Lead cross-functional teams through AI project delivery and change management.",
    ],
    skeletonWeeks: [
      {
        title: "Orientation & AI Fundamentals",
        summary: "Kick-off, align expectations, introduce AI vocabulary, and surface learner goals.",
        topics: ["AI landscape overview", "Course roadmap", "Success metrics"],
        activities: ["Course kickoff live session", "Baseline readiness survey"],
      },
      {
        title: "Opportunity Discovery",
        summary: "Explore use-case discovery frameworks and evaluate business value drivers.",
        topics: ["AI opportunity canvas", "Identifying high-impact processes", "Stakeholder mapping"],
        activities: ["Case study analysis", "Opportunity mapping clinic"],
      },
      {
        title: "Data Foundations",
        summary: "Assess what data is needed, who owns it, and how to prepare teams for data work.",
        topics: ["Data discovery interviews", "Governance considerations", "Readiness checklist"],
        activities: ["Data readiness audit template", "Peer review"],
      },
      {
        title: "Experiment Design",
        summary: "Structure lightweight experiments and define evaluation criteria.",
        topics: ["Hypothesis design", "Success metrics", "Risk assessment"],
        activities: ["Experiment storyboard", "Mentor feedback loop"],
      },
      {
        title: "Build & Integrate",
        summary: "Work with partners to iterate on solutions while managing scope and technical trade-offs.",
        topics: ["Working with technical teams", "Integration pathways", "Change control"],
        activities: ["Vendor conversation role-play", "Integration checklist"],
      },
      {
        title: "Ethical AI & Risk",
        summary: "Embed responsible AI considerations and stakeholder communications into delivery plans.",
        topics: ["Responsible AI toolkit", "Risk scenario mapping", "Policy alignment"],
        activities: ["Ethics review lab", "Comms plan draft"],
      },
      {
        title: "Scaling & Adoption",
        summary: "Plan for rollout, capability uplift, and ongoing measurement.",
        topics: ["Enablement strategy", "Change champions", "Runbook templates"],
        activities: ["Adoption storyboard", "Peer feedback"],
      },
      {
        title: "Capstone & Roadmap",
        summary: "Synthesize insights, present capstone roadmaps, and define next steps.",
        topics: ["Roadmap presentations", "Retrospective", "Lessons learned"],
        activities: ["Capstone presentations", "360 feedback cycle"],
      },
    ],
  },
  {
    id: "innovation-six-week",
    label: "Innovation Sprint · 6 weeks",
    durationWeeks: 6,
    field: "Innovation",
    description: "Rapid experimentation template with emphasis on design thinking and lean delivery.",
    defaultTitle: "Innovation Sprint Playbook",
    defaultLearners: "Innovation leads and product strategists",
    defaultDescription:
      "Run structured innovation sprints that move from insights to tested solutions with stakeholder alignment.",
    defaultOutcomes: [
      "Frame strategic innovation challenges with validated insights.",
      "Prototype and test solutions using lean experimentation techniques.",
      "Pitch validated concepts with clear metrics and scaling plans.",
    ],
    skeletonWeeks: [
      {
        title: "Kickoff & Research",
        summary: "Clarify the challenge, align success criteria, and gather insight quickly.",
        topics: ["Stakeholder alignment", "Rapid interviews", "Insight synthesis"],
        activities: ["Kickoff session", "Research canvas"],
      },
      {
        title: "Concept Generation",
        summary: "Move from insights to bold concepts and shortlist high-potential ideas.",
        topics: ["Ideation frameworks", "Impact/effort mapping", "Concept prioritisation"],
        activities: ["Idea jam", "Prioritisation workshop"],
      },
      {
        title: "Prototype Design",
        summary: "Build lightweight prototypes that can be validated quickly with users.",
        topics: ["Prototype fidelity", "Journey mapping", "Feedback loops"],
        activities: ["Prototype lab", "Critique circles"],
      },
      {
        title: "Experiment Planning",
        summary: "Plan experiments, define metrics, and secure approvals.",
        topics: ["Experiment canvas", "Success metrics", "Risk mitigation"],
        activities: ["Experiment planning session", "Stakeholder review"],
      },
      {
        title: "Test & Learn",
        summary: "Run experiments, capture insights, and iterate with speed.",
        topics: ["Live testing", "Insight tracking", "Iteration rhythms"],
        activities: ["Field testing", "Daily stand-ups"],
      },
      {
        title: "Pitch & Scale",
        summary: "Prepare business case, secure sponsorship, and map next steps.",
        topics: ["Storytelling", "Scaling plans", "Stakeholder ask"],
        activities: ["Pitch practice", "Roadmap clinic"],
      },
    ],
  },
];

const libraryModules: LibraryModule[] = [
  {
    id: "ethical-ai",
    title: "Ethical AI Toolkit",
    summary:
      "A reusable ethics module containing facilitation guides, risk checklists, and stakeholder talking points.",
    topics: ["Bias diagnostics", "Governance guardrails", "Communication plan"],
    activities: ["Ethics canvas workshop", "Risk scenario mapping"],
    bestFor: "Weeks focusing on responsible AI or compliance alignment",
  },
  {
    id: "ai-change-management",
    title: "AI Change Management Playbook",
    summary: "Change toolkit for AI initiatives including messaging templates and champions program artifacts.",
    topics: ["Stakeholder mapping", "Champion enablement", "Communication cadences"],
    activities: ["Change narrative storyboard", "Stakeholder Q&A planning"],
    bestFor: "Rollout and adoption phases",
  },
  {
    id: "case-study-pack",
    title: "Case Study: AI in Supply Chain",
    summary:
      "Detailed use case pack with interviews, data snapshots, and guided reflection questions for group discussion.",
    topics: ["Demand forecasting", "Exception handling", "ROI tracking"],
    activities: ["Guided case analysis", "Group presentation"],
    bestFor: "Applied learning weeks",
  },
];

const publicHolidays = [
  {
    id: "autumn-break",
    date: "2024-10-23",
    note: "Public holiday – suggest moving to Thursday",
  },
];

const alignDateToWeekday = (date: Date, dayName: DayName) => {
  const currentDay = date.getDay();
  const target = DAY_NAME_TO_INDEX[dayName];
  const diff = (target + 7 - currentDay) % 7;
  return diff === 0 ? date : addDays(date, diff);
};

const sortSessions = (sessions: ScheduleSession[]) =>
  [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateSchedule = ({
  startDate,
  weeks,
  dayName,
  time,
  mentor,
  outlineTitles,
}: {
  startDate: Date;
  weeks: number;
  dayName: DayName;
  time: string;
  mentor: MentorProfile;
  outlineTitles: string[];
}): ScheduleSession[] => {
  const sessions: ScheduleSession[] = [];

  for (let index = 0; index < weeks; index += 1) {
    const scheduled = addWeeks(startDate, index);
    const alignedDate = alignDateToWeekday(scheduled, dayName);
    const isoDate = alignedDate.toISOString();

    const holiday = publicHolidays.find((item) => isSameDay(new Date(item.date), alignedDate));
    const isHoliday = Boolean(holiday);
    const holidayNote = holiday?.note;

    const mentorConflict = mentor.unavailableDates.some((date) =>
      isSameDay(new Date(date), alignedDate),
    );
    const mentorNote = mentorConflict ? "Mentor unavailable – pick alternative date" : undefined;

    sessions.push({
      id: createId(),
      type: "session",
      title: `Week ${index + 1}: ${outlineTitles[index] ?? `Session ${index + 1}`}`,
      date: isoDate,
      time,
      isHoliday,
      conflictsWithMentor: mentorConflict,
      conflictNote: holidayNote ?? mentorNote,
    });
  }

  return sessions;
};

const generateAISyllabus = ({
  basics,
  outcomes,
  durationWeeks,
}: {
  basics: CourseBasics;
  outcomes: LearningOutcome[];
  durationWeeks: number;
}): CurriculumWeek[] => {
  const trimmedOutcomes = outcomes.map((outcome) =>
    outcome.text.replace(/\.$/, "").slice(0, 120),
  );
  const focus = basics.field || "AI";

  const themeLibrary = [
    {
      title: "Orientation & Shared Vocabulary",
      summary: `Kick-off the cohort, create alignment on ${focus} terminology, and surface expectations for the ${durationWeeks}-week journey.`,
      topics: ["Program launch", "Shared glossary", "Success metrics"],
      activities: ["Kickoff workshop", "Readiness survey"],
    },
    {
      title: "Value Discovery & Use Case Prioritisation",
      summary:
        trimmedOutcomes[0] ??
        `Explore where ${focus.toLowerCase()} can unlock measurable value and frame clear opportunity statements.`,
      topics: ["Business drivers", "Opportunity canvas", "Stakeholder mapping"],
      activities: ["Use case clinic", "Mentor office hours"],
    },
    {
      title: "Data Foundations & Governance",
      summary:
        trimmedOutcomes[1] ??
        "Clarify the data story: what exists, what is needed, and how to steward it responsibly.",
      topics: ["Data readiness", "Governance considerations", "Risk radar"],
      activities: ["Data audit template", "Peer feedback"],
    },
    {
      title: "Experiment Design",
      summary:
        "Prototype low-risk experiments, define evaluation criteria, and align the core squad on success signals.",
      topics: ["Experiment canvas", "Hypothesis design", "Success metrics"],
      activities: ["Experiment storyboard", "Mentor review"],
    },
    {
      title: "Build & Integrate",
      summary:
        "Translate prototypes into tangible build plans while orchestrating technical and business contributors.",
      topics: ["Technical handoff", "Integration patterns", "Scope control"],
      activities: ["Tech alignment session", "Integration checklist"],
    },
    {
      title: "Responsible & Ethical AI",
      summary:
        trimmedOutcomes[2] ??
        "Embed responsible AI and change management practices into delivery and communications.",
      topics: ["Ethics guardrails", "Risk mitigation", "Communication cadences"],
      activities: ["Ethics lab", "Stakeholder comms plan"],
    },
    {
      title: "Adoption & Change Enablement",
      summary: "Plan enablement paths, empower champions, and rehearse the learner communication plan.",
      topics: ["Enablement strategy", "Champion network", "Readiness signals"],
      activities: ["Change playbook mapping", "Town-hall rehearsal"],
    },
    {
      title: "Capstone & Roadmap",
      summary:
        "Synthesize course insights, share roadmaps, and capture commitments for post-course momentum.",
      topics: ["Roadmap showcase", "Retrospective", "Next steps"],
      activities: ["Capstone presentations", "Action planning"],
    },
  ];

  const weeksToUse = themeLibrary.slice(0, durationWeeks);

  return weeksToUse.map((week, index) => ({
    id: createId(),
    weekNumber: index + 1,
    title: week.title,
    summary: week.summary,
    topics: [...week.topics],
    activities: [...week.activities],
  }));
};

const CreateCourseWizard = ({ onClose, activeRole }: CreateCourseWizardProps) => {
  const { toast } = useToast();
  const initialTemplate = templatePresets[0];
  const roleMeta = ROLE_DETAILS[activeRole];
  const isProgramManager = activeRole === "program-manager";
  const isCourseCreator = activeRole === "course-creator";
  const isMentor = activeRole === "mentor";
  const canEditBasics = !isMentor;
  const canEditCurriculum = !isMentor;
  const canUseAI = !isMentor;
  const canManageMentor = isProgramManager;
  const canEditSchedule = isProgramManager;
  const canPublish = isProgramManager;
  const canResolveComments = !isMentor;
  const canNotifyMentor = isProgramManager;

  const [currentStep, setCurrentStep] = useState(1);
  const [publishState, setPublishState] = useState<"draft" | "published">("draft");
  const [courseBasics, setCourseBasics] = useState<CourseBasics>(() => ({
    title: initialTemplate.defaultTitle,
    field: initialTemplate.field,
    targetLearners: initialTemplate.defaultLearners,
    templateId: initialTemplate.id,
    durationWeeks: initialTemplate.durationWeeks,
    description: initialTemplate.defaultDescription,
  }));
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>(() =>
    initialTemplate.defaultOutcomes.map((text) => ({
      id: createId(),
      text,
      source: "template",
    })),
  );
  const [curriculum, setCurriculum] = useState<CurriculumWeek[]>(() =>
    initialTemplate.skeletonWeeks.map((week, index) => ({
      id: createId(),
      weekNumber: index + 1,
      title: week.title,
      summary: week.summary,
      topics: [...week.topics],
      activities: [...week.activities],
    })),
  );
  const [mentorId, setMentorId] = useState(mentors[0].id);
  const [includeIntroWebinar, setIncludeIntroWebinar] = useState(true);
  const [scheduleSettings, setScheduleSettings] = useState<{
    startDate: Date | undefined;
    preferredDay: DayName;
    time: string;
  }>(() => ({
    startDate: alignDateToWeekday(
      new Date(new Date().getFullYear(), 9, 2),
      "Wednesday",
    ),
    preferredDay: "Wednesday",
    time: "18:00",
  }));
  const [sessions, setSessions] = useState<ScheduleSession[]>(() =>
    generateSchedule({
      startDate: alignDateToWeekday(
        new Date(new Date().getFullYear(), 9, 2),
        "Wednesday",
      ),
      weeks: initialTemplate.durationWeeks,
      dayName: "Wednesday",
      time: "18:00",
      mentor: mentors[0],
      outlineTitles: initialTemplate.skeletonWeeks.map((week) => week.title),
    }),
  );
  const [comments, setComments] = useState<CommentThread[]>([
    {
      id: createId(),
      author: "John Smith",
      role: "Mentor",
      message: "I recommend adding a short case study in Week 3 to connect the data work to reality.",
      target: "Week 3 • Data Foundations",
      timestamp: "5 minutes ago",
      resolved: false,
    },
    {
      id: createId(),
      author: "Katri Mõis",
      role: "Subject Matter Expert",
      message: "Outcome 2 looks strong. Let’s keep the wording but add an example when we publish.",
      target: "Learning Outcomes",
      timestamp: "1 hour ago",
      resolved: true,
    },
  ]);
  const [aiOutcomeSuggestions, setAiOutcomeSuggestions] = useState<LearningOutcome[]>([]);
  const [isSuggestingOutcomes, setIsSuggestingOutcomes] = useState(false);
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false);
  const [libraryDialog, setLibraryDialog] = useState<{ open: boolean; targetWeekId: string | null }>({
    open: false,
    targetWeekId: null,
  });
  const [newComment, setNewComment] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());

  const mentor = useMemo(() => mentors.find((item) => item.id === mentorId) ?? mentors[0], [mentorId]);

  const shareableLink = useMemo(
    () =>
      `https://ettevotlus-keskus.ee/courses/${slugify(courseBasics.title || "new-course")}`,
    [courseBasics.title],
  );

  const sessionsWithoutIntro = useMemo(
    () => sessions.filter((session) => session.type === "session"),
    [sessions],
  );

  const courseLastSessionDate = sessionsWithoutIntro.at(-1)
    ? new Date(sessionsWithoutIntro.at(-1)!.date)
    : undefined;

  const commentPlaceholder = isMentor
    ? "Leave mentor feedback for the team…"
    : "Leave a note for the mentor…";
  const publishButtonLabel = canPublish ? "Publish course" : "Awaiting program manager";
  const scheduleCardDescription = canEditSchedule
    ? "Adjust any session inline. Conflicts and holiday clashes appear in color."
    : "Schedule is read only in this view. Loop in the program manager if a change is required.";
  const collaborationNote = isProgramManager
    ? "Coordinate with the course creator on content and keep mentors in the loop via comments."
    : isCourseCreator
    ? "The program manager finalises schedules and publishing. Share updates here and tag the mentor for review."
    : "Content edits are locked in mentor mode. Leave structured feedback so the program manager or course creator can action it.";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLastSavedAt(new Date());
    }, 500);
    return () => clearTimeout(timeout);
  }, [courseBasics, outcomes, curriculum, sessions, comments, mentorId, includeIntroWebinar]);

  useEffect(() => {
    setSessions((prev) => {
      let weekCounter = 0;
      return prev.map((session) => {
        if (session.type === "webinar") {
          return session;
        }
        const title = curriculum[weekCounter]?.title ?? session.title;
        const updated = {
          ...session,
          title: `Week ${weekCounter + 1}: ${title}`,
        };
        weekCounter += 1;
        return updated;
      });
    });
  }, [curriculum]);

  useEffect(() => {
    setCurriculum((previous) =>
      previous.map((week, index) => ({
        ...week,
        date: sessionsWithoutIntro[index]?.date ?? week.date,
      })),
    );
  }, [sessionsWithoutIntro]);

  useEffect(() => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.type === "webinar") {
          return session;
        }
        const date = new Date(session.date);
        const holiday = publicHolidays.find((item) => isSameDay(new Date(item.date), date));
        const mentorConflict = mentor.unavailableDates.some((item) => isSameDay(new Date(item), date));
        return {
          ...session,
          isHoliday: Boolean(holiday),
          conflictsWithMentor: mentorConflict,
          conflictNote: holiday?.note ?? (mentorConflict ? "Mentor unavailable – pick alternative date" : undefined),
        };
      }),
    );
  }, [mentor]);

  useEffect(() => {
    if (!includeIntroWebinar) {
      setSessions((previous) => previous.filter((session) => session.type !== "webinar"));
      return;
    }

    setSessions((previous) => {
      const hasIntro = previous.some((session) => session.type === "webinar");
      if (hasIntro || !scheduleSettings.startDate) {
        return previous;
      }

      const intro = {
        id: createId(),
        type: "webinar" as const,
        title: "Intro Webinar & Platform Walkthrough",
        date: addDays(scheduleSettings.startDate, -7).toISOString(),
        time: scheduleSettings.time,
      };

      return sortSessions([intro, ...previous]);
    });
  }, [includeIntroWebinar, scheduleSettings.startDate, scheduleSettings.time]);

  const updateCourseBasics = (field: keyof CourseBasics, value: string | number) => {
    if (!canEditBasics) return;
    setCourseBasics((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? value : value,
    }));
  };

  const applyTemplate = (templateId: string) => {
    if (!canEditBasics) return;
    const template = templatePresets.find((item) => item.id === templateId);
    if (!template) return;

    updateCourseBasics("templateId", template.id);
    updateCourseBasics("durationWeeks", template.durationWeeks);
    setCourseBasics((prev) => ({
      ...prev,
      title: template.defaultTitle,
      field: template.field,
      targetLearners: template.defaultLearners,
      description: template.defaultDescription,
    }));
    setOutcomes(
      template.defaultOutcomes.map((text) => ({
        id: createId(),
        text,
        source: "template",
      })),
    );
    const refreshedCurriculum = template.skeletonWeeks.map((week, index) => ({
      id: createId(),
      weekNumber: index + 1,
      title: week.title,
      summary: week.summary,
      topics: [...week.topics],
      activities: [...week.activities],
    }));
    setCurriculum(refreshedCurriculum);

    if (scheduleSettings.startDate) {
      const nextSessions = generateSchedule({
        startDate: scheduleSettings.startDate,
        weeks: template.durationWeeks,
        dayName: scheduleSettings.preferredDay,
        time: scheduleSettings.time,
        mentor,
        outlineTitles: refreshedCurriculum.map((week) => week.title),
      });
      setSessions(nextSessions);
    }
  };

  const handleSuggestOutcomes = () => {
    if (!canUseAI) return;
    setIsSuggestingOutcomes(true);

    setTimeout(() => {
      const suggestions = [
        {
          id: createId(),
          text: "Facilitate cross-functional alignment so project teams can scope AI initiatives collaboratively.",
          source: "ai" as const,
        },
        {
          id: createId(),
          text: "Build confidence in evaluating vendors, data partners, and technical feasibility for AI pilots.",
          source: "ai" as const,
        },
        {
          id: createId(),
          text: "Establish a repeatable playbook for measuring impact and communicating AI project results.",
          source: "ai" as const,
        },
      ];
      setAiOutcomeSuggestions(suggestions);
      setIsSuggestingOutcomes(false);
      toast({
        title: "AI drafted three learning outcomes",
        description: "Review and add the ones that resonate.",
      });
    }, 900);
  };

  const handleEnhanceDescription = () => {
    if (!canUseAI) return;
    toast({
      title: "AI polished the description",
      description: "Feel free to tweak the tone or add specifics.",
    });
    setCourseBasics((prev) => ({
      ...prev,
      description:
        "Lead project teams through AI adoption with confidence. Over eight weeks you will unlock a shared vocabulary, learn how to scope responsible experiments, and craft rollout plans that earn stakeholder trust.",
    }));
  };

  const handleAutoGenerateSyllabus = () => {
    if (!canEditCurriculum) return;
    setIsGeneratingSyllabus(true);
    setTimeout(() => {
      const aiWeeks = generateAISyllabus({
        basics: courseBasics,
        outcomes,
        durationWeeks: courseBasics.durationWeeks,
      });
      setCurriculum(aiWeeks);
      toast({
        title: "AI generated a syllabus draft",
        description: "Tweak each week to reflect how you’d deliver it.",
      });
      setIsGeneratingSyllabus(false);
    }, 1100);
  };

  const handleMoveWeek = (index: number, direction: "up" | "down") => {
    if (!canEditCurriculum) return;
    setCurriculum((prev) => {
      const newOrder = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newOrder.length) {
        return prev;
      }
      const [removed] = newOrder.splice(index, 1);
      newOrder.splice(targetIndex, 0, removed);
      return newOrder.map((week, idx) => ({
        ...week,
        weekNumber: idx + 1,
      }));
    });
  };

  const handleApplyLibraryModule = (weekId: string, moduleId: string) => {
    if (!canEditCurriculum) return;
    const module = libraryModules.find((item) => item.id === moduleId);
    if (!module) return;

    setCurriculum((prev) =>
      prev.map((week) =>
        week.id === weekId
          ? {
              ...week,
              summary: module.summary,
              topics: [...module.topics],
              activities: [...module.activities],
              libraryModuleId: module.id,
            }
          : week,
      ),
    );
    setLibraryDialog({ open: false, targetWeekId: null });
    toast({
      title: `“${module.title}” added`,
      description: "Feel free to fine-tune the summary or activities.",
    });
  };

  const handleGenerateSchedule = () => {
    if (!canEditSchedule) {
      toast({
        title: "Schedule is read only",
        description: "Program managers finalise mentor assignments and schedules.",
        variant: "destructive",
      });
      return;
    }
    if (!scheduleSettings.startDate) {
      toast({
        title: "Pick a start date first",
        description: "Select the kick-off date before generating the schedule.",
        variant: "destructive",
      });
      return;
    }

    const nextSessions = generateSchedule({
      startDate: scheduleSettings.startDate,
      weeks: courseBasics.durationWeeks,
      dayName: scheduleSettings.preferredDay,
      time: scheduleSettings.time,
      mentor,
      outlineTitles: curriculum.map((week) => week.title),
    });

    setSessions((previous) => {
      if (!includeIntroWebinar) {
        return sortSessions(nextSessions);
      }

      const existingIntro = previous.find((session) => session.type === "webinar");
      const introSession = {
        id: existingIntro?.id ?? createId(),
        type: "webinar" as const,
        title: "Intro Webinar & Platform Walkthrough",
        date: addDays(scheduleSettings.startDate!, -7).toISOString(),
        time: scheduleSettings.time,
      };

      return sortSessions([introSession, ...nextSessions]);
    });
    toast({
      title: "Schedule generated",
      description: "Conflicts and holiday clashes are highlighted below.",
    });
  };

  const updateSessionDate = (sessionId: string, date: string) => {
    if (!canEditSchedule) return;
    setSessions((prev) => {
      const updated = prev.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        const nextDate = new Date(date);
        const holiday = publicHolidays.find((item) => isSameDay(new Date(item.date), nextDate));
        const mentorConflict =
          session.type === "session"
            ? mentor.unavailableDates.some((item) => isSameDay(new Date(item), nextDate))
            : false;

        return {
          ...session,
          date: nextDate.toISOString(),
          isHoliday: Boolean(holiday),
          conflictsWithMentor: mentorConflict,
          conflictNote:
            session.type === "session"
              ? holiday?.note ?? (mentorConflict ? "Mentor unavailable – pick alternative date" : undefined)
              : undefined,
        };
      });
      return sortSessions(updated);
    });
    toast({
      title: "Session rescheduled",
      description: "Calendar invites will be updated when you integrate the backend.",
    });
  };

  const updateSessionTime = (sessionId: string, time: string) => {
    if (!canEditSchedule) return;
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, time } : session)),
    );
  };

  const handleNotifyMentor = () => {
    if (!canNotifyMentor) {
      toast({
        title: "Only program managers can notify mentors",
        description: "Loop in the program manager when you are ready for mentor review.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Mentor notified",
      description: `${mentor.name} will receive a summary email once integrations are connected.`,
      action: (
        <ToastAction altText="View email draft" onClick={() => {}}>
          View draft
        </ToastAction>
      ),
    });
  };

  const handleAddOutcome = () => {
    if (!canEditCurriculum) return;
    setOutcomes((prev) => [
      ...prev,
      {
        id: createId(),
        text: "",
        source: "custom",
      },
    ]);
  };

  const handleRemoveOutcome = (id: string) => {
    if (!canEditCurriculum) return;
    setOutcomes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTopic = (weekId: string) => {
    if (!canEditCurriculum) return;
    setCurriculum((prev) =>
      prev.map((week) =>
        week.id === weekId
          ? {
              ...week,
              topics: [...week.topics, ""],
            }
          : week,
      ),
    );
  };

  const handleRemoveTopic = (weekId: string, index: number) => {
    if (!canEditCurriculum) return;
    setCurriculum((prev) =>
      prev.map((week) =>
        week.id === weekId
          ? {
              ...week,
              topics: week.topics.filter((_, idx) => idx !== index),
            }
          : week,
      ),
    );
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    setComments((prev) => [
      {
        id: createId(),
        author: "You",
        role: "Program Manager",
        message: newComment.trim(),
        target: "General",
        timestamp: "Just now",
        resolved: false,
      },
      ...prev,
    ]);
    setNewComment("");
  };

  const handlePublish = () => {
    if (!canPublish) {
      toast({
        title: "Awaiting program manager approval",
        description:
          "Only the program manager can publish the landing page. Share your updates via comments.",
        variant: "destructive",
      });
      return;
    }
    setPublishState("published");
    toast({
      title: "Course published!",
      description: "Your landing page is live and ready to share.",
    });
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link copied",
        description: "Share it with learners or your marketing team.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to copy link",
        description: "Copy it manually from the field below.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Course identity</CardTitle>
                    <CardDescription>Provide the essentials that power the wizard.</CardDescription>
                  </div>
                  {!canEditBasics && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Read only
                    </Badge>
                  )}
                </div>
                {!canEditBasics && (
                  <p className="text-xs text-muted-foreground">
                    Program managers or course creators can adjust these fields. Mentors review in read-only mode.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course title</Label>
                    <Input
                      id="title"
                      value={courseBasics.title}
                      readOnly={!canEditBasics}
                      className={cn(!canEditBasics && "bg-muted/60 cursor-not-allowed")}
                      onChange={(event) => updateCourseBasics("title", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field">Focus area</Label>
                    <Input
                      id="field"
                      value={courseBasics.field}
                      readOnly={!canEditBasics}
                      className={cn(!canEditBasics && "bg-muted/60 cursor-not-allowed")}
                      onChange={(event) => updateCourseBasics("field", event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetLearners">Target learners</Label>
                  <Textarea
                    id="targetLearners"
                    rows={2}
                    value={courseBasics.targetLearners}
                    readOnly={!canEditBasics}
                    className={cn(!canEditBasics && "bg-muted/60 cursor-not-allowed")}
                    onChange={(event) => updateCourseBasics("targetLearners", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Course description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={courseBasics.description}
                    readOnly={!canEditBasics}
                    className={cn(!canEditBasics && "bg-muted/60 cursor-not-allowed")}
                    onChange={(event) => updateCourseBasics("description", event.target.value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shared on landing page and in PDF exports.</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={handleEnhanceDescription}
                      disabled={!canUseAI}
                    >
                      <Sparkles className="h-4 w-4" />
                      Ask AI to polish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Template & duration</CardTitle>
                    <CardDescription>
                      Templates pre-fill learning outcomes, weekly structure, and scheduling defaults.
                    </CardDescription>
                  </div>
                  {!canEditBasics && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Read only
                    </Badge>
                  )}
                </div>
                {!canEditBasics && (
                  <p className="text-xs text-muted-foreground">
                    You can preview templates here. Ask a program manager to switch templates if needed.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={courseBasics.templateId}
                  disabled={!canEditBasics}
                  onValueChange={(value) => applyTemplate(value)}
                >
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templatePresets.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid gap-4 lg:grid-cols-3">
                  {templatePresets.map((template) => {
                    const isActive = template.id === courseBasics.templateId;
                    return (
                      <Card
                        key={template.id}
                        className={cn(
                          "border-dashed transition-colors",
                          canEditBasics ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                          isActive ? "border-primary bg-primary/5" : canEditBasics ? "hover:border-primary/60" : "",
                        )}
                        onClick={() => {
                          if (!canEditBasics) return;
                          applyTemplate(template.id);
                        }}
                      >
                        <CardHeader className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{template.label}</CardTitle>
                            {isActive && (
                              <Badge variant="secondary" className="gap-1">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">Learners: </span>
                            {template.defaultLearners}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Outcomes: </span>
                            {template.defaultOutcomes.length} suggested
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Weekly modules: </span>
                            {template.skeletonWeeks.length}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Learning outcomes</CardTitle>
                    <CardDescription>
                      Use AI to draft outcomes, then edit to match your tone and accreditation language.
                    </CardDescription>
                  </div>
                  {!canEditCurriculum && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Read only
                    </Badge>
                  )}
                </div>
                {!canEditCurriculum && (
                  <p className="text-xs text-muted-foreground">
                    Mentors can comment on outcomes. Editing is reserved for program managers and course creators.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-2 md:w-auto"
                  onClick={handleSuggestOutcomes}
                  disabled={!canUseAI || isSuggestingOutcomes}
                >
                  {isSuggestingOutcomes ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Suggest with AI
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {outcomes.map((outcome, index) => (
                  <Card key={outcome.id} className="border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Outcome {index + 1}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {outcome.source === "ai"
                              ? "AI draft"
                              : outcome.source === "template"
                              ? "Template seed"
                              : "Custom"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOutcome(outcome.id)}
                            disabled={!canEditCurriculum || outcomes.length <= 1}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Textarea
                        rows={2}
                        value={outcome.text}
                        readOnly={!canEditCurriculum}
                        className={cn(!canEditCurriculum && "bg-muted/60 cursor-not-allowed")}
                        onChange={(event) =>
                          setOutcomes((prev) =>
                            prev.map((item) =>
                              item.id === outcome.id
                                ? {
                                    ...item,
                                    text: event.target.value,
                                    source: item.source === "template" ? "custom" : item.source,
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleAddOutcome}
                  disabled={!canEditCurriculum}
                >
                  <Plus className="h-4 w-4" />
                  Add another outcome
                </Button>
              </CardContent>
            </Card>

            {aiOutcomeSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI suggestions ready</CardTitle>
                  <CardDescription>
                    Accept the ones that resonate. They’ll appear alongside your existing outcomes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {aiOutcomeSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="border-primary/30 bg-primary/5">
                      <CardHeader className="gap-3">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">Suggested outcome</CardTitle>
                        </div>
                        <CardDescription className="text-sm text-foreground">
                          {suggestion.text}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setOutcomes((prev) => [...prev, suggestion]);
                            setAiOutcomeSuggestions((prev) =>
                              prev.filter((item) => item.id !== suggestion.id),
                            );
                          }}
                          disabled={!canEditCurriculum}
                        >
                          Add to course
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Weekly outline</CardTitle>
                  <CardDescription>
                    Auto-generate a draft, then reorder and enrich each week with reusable modules.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!canEditCurriculum && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Read only
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={handleAutoGenerateSyllabus}
                    disabled={!canUseAI || isGeneratingSyllabus}
                  >
                    {isGeneratingSyllabus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Drafting syllabus…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Auto-generate syllabus
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {curriculum.map((week, index) => (
                  <Card key={week.id} className="bg-muted/30 border-dashed">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="gap-2">
                            <GripVertical className="h-3.5 w-3.5" />
                            Week {index + 1}
                          </Badge>
                          {week.date && (
                            <Badge variant="secondary">
                              {format(new Date(week.date), "d MMM yyyy")}
                            </Badge>
                          )}
                          {week.libraryModuleId && (
                            <Badge variant="default">Library module</Badge>
                          )}
                        </div>
                        <Input
                          value={week.title}
                          readOnly={!canEditCurriculum}
                          className={cn(!canEditCurriculum && "bg-muted/60 cursor-not-allowed")}
                          onChange={(event) =>
                            setCurriculum((prev) =>
                              prev.map((item) =>
                                item.id === week.id
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMoveWeek(index, "up")}
                          disabled={!canEditCurriculum || index === 0}
                        >
                          <Shuffle className="h-4 w-4 rotate-180" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMoveWeek(index, "down")}
                          disabled={!canEditCurriculum || index === curriculum.length - 1}
                        >
                          <Shuffle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() =>
                            setLibraryDialog({
                              open: true,
                              targetWeekId: week.id,
                            })
                          }
                          disabled={!canEditCurriculum}
                        >
                          <Plus className="h-4 w-4" />
                          Add from library
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        rows={3}
                        value={week.summary}
                        readOnly={!canEditCurriculum}
                        className={cn(!canEditCurriculum && "bg-muted/60 cursor-not-allowed")}
                        onChange={(event) =>
                          setCurriculum((prev) =>
                            prev.map((item) =>
                              item.id === week.id
                                ? { ...item, summary: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Topics this week
                        </Label>
                        <div className="space-y-2">
                          {week.topics.map((topic, topicIndex) => (
                            <div className="flex items-center gap-2" key={`${week.id}-topic-${topicIndex}`}>
                              <Input
                                value={topic}
                                placeholder="Topic title"
                                readOnly={!canEditCurriculum}
                                className={cn(!canEditCurriculum && "bg-muted/60 cursor-not-allowed")}
                                onChange={(event) =>
                                  setCurriculum((prev) =>
                                    prev.map((item) =>
                                      item.id === week.id
                                        ? {
                                            ...item,
                                            topics: item.topics.map((itemTopic, idx) =>
                                              idx === topicIndex ? event.target.value : itemTopic,
                                            ),
                                          }
                                        : item,
                                    ),
                                  )
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTopic(week.id, topicIndex)}
                                disabled={!canEditCurriculum}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleAddTopic(week.id)}
                          disabled={!canEditCurriculum}
                        >
                          <Plus className="h-4 w-4" />
                          Add topic
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Suggested activities
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {week.activities.join(" · ")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Mentor assignment</CardTitle>
                    <CardDescription>
                      Tag mentors, review their availability, and notify them once the draft is ready.
                    </CardDescription>
                  </div>
                  {!canManageMentor && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Program manager
                    </Badge>
                  )}
                </div>
                {!canManageMentor && (
                  <p className="text-xs text-muted-foreground">
                    Mentor assignments are controlled by the program manager. You can review the chosen mentor and leave comments below.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <Select value={mentorId} disabled={!canManageMentor} onValueChange={setMentorId}>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} — {profile.expertise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{mentor.name}</span>
                    </div>
                    <Badge variant="outline">{mentor.timezone}</Badge>
                  </div>
                  <p className="text-muted-foreground">{mentor.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={handleNotifyMentor}
                    disabled={!canNotifyMentor}
                  >
                    <Mail className="h-4 w-4" />
                    Notify mentor
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-between"
                            disabled={!canEditSchedule}
                          >
                            {scheduleSettings.startDate ? (
                              format(scheduleSettings.startDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-70" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduleSettings.startDate}
                            onSelect={(date) =>
                              setScheduleSettings((prev) => ({
                                ...prev,
                                startDate: date ?? prev.startDate,
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred weekday</Label>
                      <Select
                        value={scheduleSettings.preferredDay}
                        disabled={!canEditSchedule}
                        onValueChange={(value) =>
                          setScheduleSettings((prev) => ({
                            ...prev,
                            preferredDay: value as DayName,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a weekday" />
                        </SelectTrigger>
                        <SelectContent>
                          {WEEKDAY_OPTIONS.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}s
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Session time</Label>
                      <Select
                        value={scheduleSettings.time}
                        disabled={!canEditSchedule}
                        onValueChange={(value) =>
                          setScheduleSettings((prev) => ({
                            ...prev,
                            time: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {SESSION_TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div>
                      <p className="text-sm font-medium">Intro webinar</p>
                      <p className="text-xs text-muted-foreground">
                        Schedule an optional pre-course orientation for learners.
                      </p>
                    </div>
                    <Switch
                      checked={includeIntroWebinar}
                      onCheckedChange={setIncludeIntroWebinar}
                      disabled={!canEditSchedule}
                    />
                  </div>

                  <Button className="gap-2" onClick={handleGenerateSchedule} disabled={!canEditSchedule}>
                    <CalendarIcon className="h-4 w-4" />
                    Generate schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Schedule preview</CardTitle>
                <CardDescription>{scheduleCardDescription}</CardDescription>
                {!canEditSchedule && (
                  <p className="text-xs text-muted-foreground">
                    Ask the program manager to confirm changes so mentor availability stays in sync.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[520px] pr-4">
                  <div className="space-y-4">
                    {sessions.map((session) => {
                      const ordinal =
                        session.type === "session"
                          ? sessionsWithoutIntro.findIndex((item) => item.id === session.id) + 1
                          : undefined;
                      return (
                        <Card
                          key={session.id}
                          className={cn(
                            "border",
                            session.type === "webinar" ? "border-primary/40 bg-primary/5" : "border-border",
                          )}
                        >
                          <CardContent className="space-y-3 pt-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2 justify-between">
                                <Badge variant={session.type === "webinar" ? "default" : "outline"}>
                                  {session.type === "webinar"
                                    ? "Optional webinar"
                                    : `Session ${ordinal && ordinal > 0 ? ordinal : "?"}`}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{session.time}</span>
                                </div>
                              </div>
                              <p className="font-medium text-sm">{session.title}</p>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                              <Input
                                type="date"
                                value={format(new Date(session.date), "yyyy-MM-dd")}
                                onChange={(event) => updateSessionDate(session.id, event.target.value)}
                                disabled={!canEditSchedule}
                              />
                              <Select
                                value={session.time}
                                onValueChange={(value) => updateSessionTime(session.id, value)}
                                disabled={!canEditSchedule}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SESSION_TIME_OPTIONS.map((timeOption) => (
                                    <SelectItem key={timeOption} value={timeOption}>
                                      {timeOption}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {(session.isHoliday || session.conflictsWithMentor) && (
                              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                {session.conflictNote ??
                                  (session.isHoliday
                                    ? "Public holiday flagged—consider moving this session."
                                    : "Mentor conflict flagged—pick a new slot.")}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Collaboration & comments</CardTitle>
                <CardDescription>
                  Invite mentors or SMEs to co-edit. Everything autosaves so you stay in sync.
                </CardDescription>
                {isMentor ? (
                  <p className="text-xs text-muted-foreground">
                    Mentors can add feedback threads and the program manager or course creator will action them.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Resolve a thread once the requested change is addressed to keep everyone aligned.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={commentPlaceholder}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                  />
                  <Button className="self-start" onClick={addComment}>
                    Comment
                  </Button>
                </div>
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "rounded-lg border bg-muted/40 p-3 text-sm",
                        comment.resolved && "opacity-75",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{comment.author}</span>
                          <Badge variant="outline">{comment.role}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="mt-2 text-muted-foreground">{comment.message}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Thread · {comment.target}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setComments((prev) =>
                              prev.map((item) =>
                                item.id === comment.id
                                  ? { ...item, resolved: !item.resolved }
                                  : item,
                              ),
                            )
                          }
                          disabled={!canResolveComments}
                        >
                          {comment.resolved ? "Reopen" : "Resolve"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 5:
        return (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <Card className="overflow-hidden">
              <CardHeader className="space-y-2 bg-muted/50">
                <CardTitle>Landing page preview</CardTitle>
                <CardDescription>
                  This is what learners will see. Update the content in previous steps if you spot anything.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">
                    {courseBasics.title} — {courseBasics.durationWeeks}-Week Online Course
                  </h3>
                  <p className="text-muted-foreground">{courseBasics.description}</p>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">What you'll learn</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {outcomes.map((outcome) => (
                        <li key={outcome.id} className="flex gap-2">
                          <span>•</span>
                          <span>{outcome.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Meet your mentor</h4>
                    <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{mentor.name}</p>
                      <p>{mentor.expertise}</p>
                      <p className="mt-2">{mentor.bio}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Course schedule</h4>
                  <div className="space-y-3">
                    {sessionsWithoutIntro.map((session, index) => (
                      <div
                        key={session.id}
                        className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3 text-sm"
                      >
                        <div className="font-medium text-primary">Week {index + 1}</div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">
                              {format(new Date(session.date), "d MMM yyyy")}
                            </span>
                            <Badge variant="outline">{session.time}</Badge>
                          </div>
                          <p className="text-muted-foreground">{curriculum[index]?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Launch checklist</CardTitle>
                    <CardDescription>
                      Export assets now. When the backend is ready, each button will call the live endpoints.
                    </CardDescription>
                  </div>
                  {!canPublish && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Program manager
                    </Badge>
                  )}
                </div>
                {!canPublish && (
                  <p className="text-xs text-muted-foreground">
                    The program manager will publish once all feedback is resolved. You can still copy the share link or export drafts.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Shareable link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={shareableLink} readOnly />
                    <Button variant="secondary" className="gap-2" onClick={handleCopyShareLink}>
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>

                <Button className="w-full gap-2" onClick={handlePublish} disabled={!canPublish}>
                  <Share2 className="h-4 w-4" />
                  {publishButtonLabel}
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => toast({
                  title: "Export queued",
                  description: "PDF export will be available when the integration is connected.",
                })}>
                  <FileDown className="h-4 w-4" />
                  Export syllabus PDF
                </Button>

                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={publishState === "published" ? "default" : "outline"}>
                      {publishState === "published" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cohort length</span>
                    <span>{courseBasics.durationWeeks} weeks</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last session</span>
                    <span>
                      {courseLastSessionDate ? format(courseLastSessionDate, "d MMM yyyy") : "TBC"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last saved</span>
                    <span>{format(lastSavedAt, "HH:mm:ss")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const goToNextStep = () => {
    if (currentStep === steps.length) {
      handlePublish();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Course builder wizard</span>
                <span>•</span>
                <span>
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              <h1 className="text-2xl font-semibold">Design a new course experience</h1>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Badge variant={publishState === "published" ? "default" : "outline"}>
                {publishState === "published" ? "Published" : "Draft"} mode
              </Badge>
              <span className="text-muted-foreground">
                Autosaved {format(lastSavedAt, "HH:mm:ss")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground/40 text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.name}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && <Separator orientation="vertical" className="h-10" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="rounded-lg border bg-background p-4 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Collaborating as {roleMeta.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{roleMeta.collaborationTip}</p>
                </div>
              </div>
              <Badge variant="secondary" className="self-start">{roleMeta.shorthand}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{collaborationNote}</p>
            <div className="flex flex-wrap gap-2">
              {roleMeta.capabilities.map((capability) => (
                <Badge key={capability} variant="outline" className="text-xs font-normal">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>
          {renderStepContent()}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onClose}>
              Exit without publishing
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={goToNextStep} disabled={currentStep === steps.length && !canPublish}>
                {currentStep === steps.length ? publishButtonLabel : "Next step"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={libraryDialog.open}
        onOpenChange={(open) => setLibraryDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reuse library</DialogTitle>
            <DialogDescription>
              Drag-and-drop will come once the backend is connected. For now, pick a module to insert.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[420px] pr-4">
            <div className="grid gap-4 md:grid-cols-2">
              {libraryModules.map((module) => (
                <Card key={module.id} className="border-dashed">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription>{module.summary}</CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map((topic) => (
                        <Badge key={topic} variant="outline">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{module.bestFor}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (libraryDialog.targetWeekId) {
                          handleApplyLibraryModule(libraryDialog.targetWeekId, module.id);
                        }
                      }}
                    >
                      Use this module
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLibraryDialog({ open: false, targetWeekId: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCourseWizard;
