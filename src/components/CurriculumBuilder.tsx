import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { CurriculumSectionId } from "@/lib/curriculum-sections";
import {
  createCurriculum,
  createResource,
  fetchResources,
  linkCurriculumResources,
  type CurriculumPayload,
  type CurriculumRecord,
  type ResourcePayload,
  type ResourceRecord,
} from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FilePlus2,
  Layers,
  Loader2,
  Paperclip,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

const createId = () => Math.random().toString(36).slice(2, 10);

export type CurriculumBuilderMode = "create" | "review";

export interface CurriculumReviewComment {
  id: string;
  author: string;
  message: string;
  createdAt: Date;
}

interface CurriculumBuilderProps {
  mode?: CurriculumBuilderMode;
  onCancel: () => void;
  onSaved?: (curriculum: CurriculumRecord) => void;
  initialCurriculum?: CurriculumRecord | null;
  initialComments?: CurriculumReviewComment[];
  onAddComment?: (comment: CurriculumReviewComment) => void;
  reviewerName?: string;
}

interface CurriculumFormState {
  curriculumCode: string;
  curriculumName: string;
  curriculumGroup: string;
  basisCurriculumDevelopment: string;
  descriptionLearningEnvironment: string;
  targetGroup: string[];
  prerequisites: string[];
  learningObjectives: string[];
  learningOutcomes: string[];
  totalHours?: number | null;
  classroomHours?: number | null;
  independentHours?: number | null;
  independentWork: string[];
  studyContent: string[];
  teachingMethods: string;
  completionRequirements: string;
  documentsIssued: string;
  approvalDate?: string | null;
}

const defaultFormState: CurriculumFormState = {
  curriculumCode: "",
  curriculumName: "",
  curriculumGroup: "",
  basisCurriculumDevelopment: "",
  descriptionLearningEnvironment: "",
  targetGroup: [""],
  prerequisites: [""],
  learningObjectives: [""],
  learningOutcomes: [""],
  totalHours: undefined,
  classroomHours: undefined,
  independentHours: undefined,
  independentWork: [""],
  studyContent: [""],
  teachingMethods: "",
  completionRequirements: "",
  documentsIssued: "",
  approvalDate: null,
};

const steps = [
  { id: 1, title: "Curriculum Overview", description: "Identity and positioning" },
  { id: 2, title: "Audience & Outcomes", description: "Learners, goals, and success" },
  { id: 3, title: "Structure & Workload", description: "Hours, content, and activities" },
  { id: 4, title: "Delivery & Quality", description: "Teaching and completion requirements" },
  { id: 5, title: "Study Materials", description: "Attach supporting resources" },
];

const PENDING_RESOURCES_KEY = "etno:curriculum-pending-resources";

const readSessionResourceIds = (): number[] => {
  if (typeof window === "undefined") return [];
  const stored = window.sessionStorage.getItem(PENDING_RESOURCES_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const CurriculumBuilder = ({
  mode = "create",
  onCancel,
  onSaved,
  initialCurriculum,
  initialComments,
  onAddComment,
  reviewerName = "Mentor",
}: CurriculumBuilderProps) => {
  const { toast } = useToast();
  const readOnly = mode === "review";
  const reviewerDisplayName = reviewerName || "Mentor";
  const [reviewComments, setReviewComments] = useState<CurriculumReviewComment[]>(() =>
    (initialComments ?? []).map((comment) => ({
      ...comment,
      createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt),
    })),
  );
  const [commentDraft, setCommentDraft] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<CurriculumFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceLibrary, setResourceLibrary] = useState<ResourceRecord[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>(readSessionResourceIds);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [resourceDraft, setResourceDraft] = useState<ResourcePayload>({
    title: "",
    type: "pdf",
    url: "",
    description: "",
  });

  const applyAISuggestion = (section: CurriculumSectionId) => {
    switch (section) {
      case "overview":
        setFormState((prev) => ({
          ...prev,
          basisCurriculumDevelopment:
            prev.basisCurriculumDevelopment ||
            "Synthesised learner feedback and market data to validate the need for an innovation sprint blueprint.",
          descriptionLearningEnvironment:
            prev.descriptionLearningEnvironment ||
            "Hybrid studio sessions with live mentor critiques, async reflection spaces, and fieldwork immersions.",
        }));
        toast({
          title: "AI polished the overview",
          description: "Narrative and environment copy sourced from similar cohorts is ready to tweak.",
        });
        break;
      case "audience":
        setFormState((prev) => ({
          ...prev,
          targetGroup: prev.targetGroup.some((value) => value.trim())
            ? prev.targetGroup
            : ["Innovation leaders", "Service designers", "Product squad anchors"],
          prerequisites: prev.prerequisites.some((value) => value.trim())
            ? prev.prerequisites
            : ["Experience facilitating workshops", "Exposure to lean experimentation"],
          learningObjectives: prev.learningObjectives.some((value) => value.trim())
            ? prev.learningObjectives
            : [
                "Diagnose delivery friction and opportunity spaces",
                "Prototype experiments with measurable success criteria",
              ],
          learningOutcomes: prev.learningOutcomes.some((value) => value.trim())
            ? prev.learningOutcomes
            : [
                "Produce a sponsor-ready sprint charter",
                "Stand up a metrics dashboard for pilot experiments",
              ],
        }));
        toast({
          title: "AI drafted learner framing",
          description: "Personas, prerequisites, and measurable outcomes were generated for quick iteration.",
        });
        break;
      case "structure":
        setFormState((prev) => ({
          ...prev,
          totalHours: prev.totalHours ?? 72,
          classroomHours: prev.classroomHours ?? 28,
          independentHours: prev.independentHours ?? 44,
          independentWork: prev.independentWork.some((value) => value.trim())
            ? prev.independentWork
            : ["Weekly field diary", "Mentor feedback loop", "Sprint retrospective"],
          studyContent: prev.studyContent.some((value) => value.trim())
            ? prev.studyContent
            : [
                "Module 1: Discovery diagnostics",
                "Module 2: Experiment design playbook",
                "Module 3: Governance and change readiness",
                "Module 4: Scaling and story crafting",
              ],
        }));
        toast({
          title: "AI outlined workload",
          description: "Hours and module scaffolding were drafted to kick-start planning.",
        });
        break;
      case "delivery":
        setFormState((prev) => ({
          ...prev,
          teachingMethods:
            prev.teachingMethods ||
            "Facilitated studios, async critique threads, mentor office hours, and live field debrief sessions.",
          completionRequirements:
            prev.completionRequirements ||
            "Attend 80% of synchronous sessions, deliver three experiment artefacts, and present a capstone readout.",
          documentsIssued: prev.documentsIssued || "Sprint blueprint, digital badge, mentor feedback log",
        }));
        toast({
          title: "AI mapped delivery expectations",
          description: "Facilitation guidance and completion milestones are in place for reviewers.",
        });
        break;
      case "materials":
        setFormState((prev) => ({
          ...prev,
          independentWork: prev.independentWork.some((value) => value.trim())
            ? prev.independentWork
            : ["Sprint journal", "Stakeholder interview kit", "Pilot metrics dashboard"],
        }));
        toast({
          title: "AI enriched materials",
          description: "Independent artefacts were suggested from similar programmes.",
        });
        break;
      default:
        break;
    }
  };

  const resourcesQuery = useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });

  useEffect(() => {
    if (!initialComments) return;
    setReviewComments(
      initialComments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt),
      })),
    );
  }, [initialComments]);

  useEffect(() => {
    if (!readOnly || !initialCurriculum) {
      return;
    }

    const asList = (value?: string[] | null): string[] =>
      value && value.length ? [...value] : [""];

    const approvalDateValue =
      initialCurriculum.approvalDate && initialCurriculum.approvalDate !== ""
        ? (() => {
            try {
              return format(new Date(initialCurriculum.approvalDate), "yyyy-MM-dd");
            } catch {
              return initialCurriculum.approvalDate;
            }
          })()
        : null;

    setFormState({
      curriculumCode: initialCurriculum.curriculumCode ?? "",
      curriculumName: initialCurriculum.curriculumName ?? "",
      curriculumGroup: initialCurriculum.curriculumGroup ?? "",
      basisCurriculumDevelopment: initialCurriculum.basisCurriculumDevelopment ?? "",
      descriptionLearningEnvironment: initialCurriculum.descriptionLearningEnvironment ?? "",
      targetGroup: asList(initialCurriculum.targetGroup),
      prerequisites: asList(initialCurriculum.prerequisites),
      learningObjectives: asList(initialCurriculum.learningObjectives),
      learningOutcomes: asList(initialCurriculum.learningOutcomes),
      totalHours: initialCurriculum.totalHours ?? null,
      classroomHours: initialCurriculum.classroomHours ?? null,
      independentHours: initialCurriculum.independentHours ?? null,
      independentWork: asList(initialCurriculum.independentWork),
      studyContent: asList(initialCurriculum.studyContent),
      teachingMethods: initialCurriculum.teachingMethods ?? "",
      completionRequirements: initialCurriculum.completionRequirements ?? "",
      documentsIssued: initialCurriculum.documentsIssued ?? "",
      approvalDate: approvalDateValue,
    });
    setSelectedResourceIds([]);
    setCurrentStep(1);
    setCommentDraft("");
  }, [readOnly, initialCurriculum]);

  useEffect(() => {
    if (resourcesQuery.data) {
      setResourceLibrary(resourcesQuery.data);
    }
  }, [resourcesQuery.data]);

  useEffect(() => {
    if (readOnly) {
      return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PENDING_RESOURCES_KEY, JSON.stringify(selectedResourceIds));
    }
  }, [selectedResourceIds, readOnly]);

  const resetResourceDraft = () => {
    setResourceDraft({
      title: "",
      type: "pdf",
      url: "",
      description: "",
    });
  };

  const updateArrayField = (field: keyof CurriculumFormState, index: number, value: string) => {
    if (readOnly) return;
    setFormState((prev) => {
      const current = [...((prev[field] as string[]) ?? [])];
      current[index] = value;
      return {
        ...prev,
        [field]: current,
      };
    });
  };

  const addArrayItem = (field: keyof CurriculumFormState) => {
    if (readOnly) return;
    setFormState((prev) => ({
      ...prev,
      [field]: ([...(prev[field] as string[]), ""]) as CurriculumFormState[typeof field],
    }));
  };

  const removeArrayItem = (field: keyof CurriculumFormState, index: number) => {
    if (readOnly) return;
    setFormState((prev) => {
      const filtered = (prev[field] as string[]).filter((_, idx) => idx !== index);
      return {
        ...prev,
        [field]: (filtered.length ? filtered : [""]) as CurriculumFormState[typeof field],
      };
    });
  };

  const toggleResourceSelection = (resourceId: number) => {
    if (readOnly) return;
    setSelectedResourceIds((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId],
    );
  };

  const handleResourceUpload = async () => {
    if (readOnly) return;
    if (!resourceDraft.title.trim()) {
      toast({
        title: "Resource title required",
        description: "Give your resource a clear name before uploading.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createResource(resourceDraft);
      setResourceLibrary((prev) => [created, ...prev]);
      setSelectedResourceIds((prev) => (prev.includes(created.id) ? prev : [created.id, ...prev]));
      toast({
        title: "Resource added",
        description: "It’s now ready to attach to curricula.",
      });
      resetResourceDraft();
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create resource",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleAddReviewComment = () => {
    if (!readOnly || !commentDraft.trim()) {
      return;
    }

    const newComment: CurriculumReviewComment = {
      id: createId(),
      author: reviewerDisplayName,
      message: commentDraft.trim(),
      createdAt: new Date(),
    };

    setReviewComments((prev) => [newComment, ...prev]);
    setCommentDraft("");
    onAddComment?.(newComment);
    toast({
      title: "Feedback shared",
      description: "Your comment is now visible to the course creator and program manager.",
    });
  };

  const canMoveNext = useMemo(() => {
    if (readOnly) {
      return true;
    }
    switch (currentStep) {
      case 1:
        return Boolean(formState.curriculumCode && formState.curriculumName);
      case 2:
        return (
          formState.targetGroup.some((value) => value.trim()) &&
          formState.learningObjectives.some((value) => value.trim()) &&
          formState.learningOutcomes.some((value) => value.trim())
        );
      case 3:
        return Boolean(
          (formState.totalHours ?? 0) ||
            (formState.classroomHours ?? 0) ||
            (formState.independentHours ?? 0) ||
            formState.studyContent.some((value) => value.trim()),
        );
      case 4:
        return Boolean(
          formState.teachingMethods.trim() || formState.completionRequirements.trim() || formState.documentsIssued.trim(),
        );
      case 5:
        return true;
      default:
        return true;
    }
  }, [currentStep, formState, readOnly]);

  const goToNext = () => {
    if (currentStep === steps.length) return;
    setCurrentStep((prev) => prev + 1);
  };

  const goToPrevious = () => {
    if (currentStep === 1) return;
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (readOnly) {
      onCancel();
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CurriculumPayload = {
        curriculumCode: formState.curriculumCode,
        curriculumName: formState.curriculumName,
        curriculumGroup: formState.curriculumGroup || null,
        basisCurriculumDevelopment: formState.basisCurriculumDevelopment || null,
        descriptionLearningEnvironment: formState.descriptionLearningEnvironment || null,
        targetGroup: formState.targetGroup.filter(Boolean),
        learningObjectives: formState.learningObjectives.filter(Boolean),
        learningOutcomes: formState.learningOutcomes.filter(Boolean),
        prerequisites: formState.prerequisites.filter(Boolean),
        totalHours: formState.totalHours ?? null,
        classroomHours: formState.classroomHours ?? null,
        independentHours: formState.independentHours ?? null,
        independentWork: formState.independentWork.filter(Boolean),
        studyContent: formState.studyContent.filter(Boolean),
        teachingMethods: formState.teachingMethods || null,
        completionRequirements: formState.completionRequirements || null,
        documentsIssued: formState.documentsIssued || null,
        approvalDate: formState.approvalDate || null,
        status: "pending",
      };

      const created = await createCurriculum(payload);

      if (selectedResourceIds.length) {
        await linkCurriculumResources(created.id, selectedResourceIds);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(PENDING_RESOURCES_KEY);
      }

      toast({
        title: "Curriculum submitted for approval",
        description:
          "Status is now pending. A program manager will review and approve before you can build the syllabus.",
      });

      setFormState(defaultFormState);
      setCurrentStep(1);
      setSelectedResourceIds([]);
      onSaved?.(created);
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save curriculum",
        description: "Please review your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArrayField = (
    field: keyof CurriculumFormState,
    label: string,
    description?: string,
    placeholder?: string,
  ) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label>{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {!readOnly && (
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => addArrayItem(field)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {(formState[field] as string[]).map((value, index) => (
          <div key={`${field}-${index}`} className="flex items-center gap-2">
            <Input
              value={value}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={readOnly}
              onChange={(event) => updateArrayField(field, index, event.target.value)}
            />
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => removeArrayItem(field, index)}
                disabled={(formState[field] as string[]).length === 1}
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Curriculum overview</CardTitle>
                <CardDescription>Capture the core identity of this curriculum.</CardDescription>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => applyAISuggestion("overview")}>
                  <Sparkles className="h-4 w-4" />
                  Ask AI to polish
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="curriculumCode">Curriculum code</Label>
                  <Input
                    id="curriculumCode"
                    value={formState.curriculumCode}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, curriculumCode: event.target.value }))
                    }
                    placeholder="e.g. AI-PM-2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curriculumName">Curriculum name</Label>
                  <Input
                    id="curriculumName"
                    value={formState.curriculumName}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, curriculumName: event.target.value }))
                    }
                    placeholder="e.g. AI for Project Managers"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="curriculumGroup">Curriculum group</Label>
                  <Input
                    id="curriculumGroup"
                    value={formState.curriculumGroup}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, curriculumGroup: event.target.value }))
                    }
                    placeholder="e.g. AI Transformation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvalDate">Tentative approval date</Label>
                  <Input
                    id="approvalDate"
                    type="date"
                    value={formState.approvalDate ?? ""}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        approvalDate: event.target.value ? event.target.value : null,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basisCurriculumDevelopment">Basis for curriculum development</Label>
                <Textarea
                  id="basisCurriculumDevelopment"
                  rows={3}
                  value={formState.basisCurriculumDevelopment}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, basisCurriculumDevelopment: event.target.value }))
                  }
                  placeholder="Share the need, research, or policies that shaped this curriculum."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionLearningEnvironment">Learning environment description</Label>
                <Textarea
                  id="descriptionLearningEnvironment"
                  rows={3}
                  value={formState.descriptionLearningEnvironment}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      descriptionLearningEnvironment: event.target.value,
                    }))
                  }
                  placeholder="Summarise the delivery format, digital platforms, and any on-site requirements."
                />
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Audience & learning outcomes</CardTitle>
                <CardDescription>
                  Define who this curriculum serves and how success is measured.
                </CardDescription>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => applyAISuggestion("audience")}>
                  <Sparkles className="h-4 w-4" />
                  Suggest with AI
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {renderArrayField(
                "targetGroup",
                "Target groups",
                "Add each learner persona or stakeholder group.",
                "e.g. Project managers leading AI initiatives",
              )}

              {renderArrayField(
                "prerequisites",
                "Prerequisites",
                "List the knowledge or certifications that learners should have before enrolling.",
                "e.g. 3+ years of project leadership experience",
              )}

              <Separator />

              {renderArrayField(
                "learningObjectives",
                "Learning objectives",
                "Objectives describe the intent behind the learning experience.",
                "e.g. Understand how AI can augment delivery workflows",
              )}

              {renderArrayField(
                "learningOutcomes",
                "Learning outcomes",
                "Outcomes should be measurable indicators of success.",
                "e.g. Map an AI opportunity and define a responsible delivery plan",
              )}

              <div className="space-y-2">
                <Label htmlFor="documentsIssued">Documents issued upon completion</Label>
                <Input
                  id="documentsIssued"
                  value={formState.documentsIssued}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, documentsIssued: event.target.value }))
                  }
                  placeholder="e.g. Certificate of completion, ECTS credits"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Structure & workload</CardTitle>
                <CardDescription>Outline how the curriculum is structured and the expected effort.</CardDescription>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => applyAISuggestion("structure")}>
                  <Sparkles className="h-4 w-4" />
                  Auto-outline with AI
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Total hours</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formState.totalHours ?? ""}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        totalHours: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="e.g. 80"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Classroom / synchronous hours</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formState.classroomHours ?? ""}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        classroomHours: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="e.g. 40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Independent hours</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formState.independentHours ?? ""}
                    readOnly={readOnly}
                    disabled={readOnly}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        independentHours: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="e.g. 40"
                  />
                </div>
              </div>

              {renderArrayField(
                "independentWork",
                "Independent work expectations",
                "Capture projects, assignments, or reflections learners complete solo.",
                "e.g. Weekly reflection journal on AI ethics scenarios",
              )}

              {renderArrayField(
                "studyContent",
                "Study content outline",
                "List modules or thematic blocks covered across the curriculum.",
                "e.g. Module 1: AI Opportunity Discovery",
              )}
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Delivery & quality expectations</CardTitle>
                <CardDescription>Document facilitation approaches and completion criteria.</CardDescription>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => applyAISuggestion("delivery")}>
                  <Sparkles className="h-4 w-4" />
                  Ask AI for wording
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teachingMethods">Teaching methods</Label>
                <Textarea
                  id="teachingMethods"
                  rows={3}
                  value={formState.teachingMethods}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, teachingMethods: event.target.value }))
                  }
                  placeholder="Describe delivery formats, facilitation styles, and mentorship support."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionRequirements">Completion requirements</Label>
                <Textarea
                  id="completionRequirements"
                  rows={3}
                  value={formState.completionRequirements}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, completionRequirements: event.target.value }))
                  }
                  placeholder="Outline attendance requirements, assessments, and grading policies."
                />
              </div>
            </CardContent>
          </Card>
        );
      case 5:
        return (
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Study materials</CardTitle>
                <CardDescription>
                  Attach supporting resources. You can select from the library or add new assets on the fly.
                </CardDescription>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => applyAISuggestion("materials")}>
                  <Sparkles className="h-4 w-4" />
                  Ask AI for artefacts
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  {selectedResourceIds.length ? (
                    <span>{selectedResourceIds.length} resource{selectedResourceIds.length > 1 ? "s" : ""} selected</span>
                  ) : (
                    <span>No resources selected yet</span>
                  )}
                </div>
                {!readOnly ? (
                  <Button variant="outline" className="gap-2" onClick={() => setIsUploadDialogOpen(true)}>
                    <FilePlus2 className="h-4 w-4" />
                    Upload new resource
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Read only
                  </Badge>
                )}
              </div>

              <ScrollArea className="max-h-[360px] pr-4">
                <div className="space-y-3">
                  {resourcesQuery.isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading your resource library…
                    </div>
                  )}
                  {resourceLibrary.map((resource) => {
                    const isSelected = selectedResourceIds.includes(resource.id);
                    return (
                      <Card
                        key={resource.id}
                        className={cn(
                          "border transition-colors",
                          readOnly ? "cursor-default" : "cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : !readOnly && "hover:border-primary/40",
                        )}
                        onClick={
                          readOnly ? undefined : () => toggleResourceSelection(resource.id)
                        }
                        aria-disabled={readOnly}
                      >
                        <CardContent className="flex items-start justify-between gap-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{resource.type}</Badge>
                              <span className="font-medium text-sm text-foreground">
                                {resource.title}
                              </span>
                            </div>
                            {resource.description && (
                              <p className="text-xs text-muted-foreground">{resource.description}</p>
                            )}
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary underline underline-offset-2"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Preview
                              </a>
                            )}
                          </div>
                          <div className={cn(
                            "h-4 w-4 rounded-full border flex items-center justify-center text-[10px]",
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 text-muted-foreground",
                          )}>
                            {isSelected ? "✓" : ""}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {!resourcesQuery.isLoading && resourceLibrary.length === 0 && (
                    <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
                      No resources found yet. Use “Upload new resource” to start building your library.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Curriculum builder</span>
                <span>•</span>
                <span>
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              <h1 className="text-2xl font-semibold">
                {readOnly ? "Review the curriculum blueprint" : "Design a curriculum blueprint"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {readOnly
                  ? "You’re viewing the creator’s submission in read-only mode. Leave feedback where fixes are needed."
                  : "Submit your curriculum for manager approval. Once approved you’ll unlock syllabus generation and delivery planning."}
              </p>
            </div>
            <Badge variant="secondary" className="gap-2">
              {readOnly ? <Users className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              {readOnly ? "Mentor workspace" : "Creator workflow"}
            </Badge>
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
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
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
          {renderStepContent()}

          {readOnly && (
            <Card>
              <CardHeader>
                <CardTitle>Mentor feedback</CardTitle>
                <CardDescription>
                  Leave structured comments so the creator and program manager can action updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No comments yet. Highlight curriculum areas that need refinement using the form below.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reviewComments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border bg-background px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.createdAt, "PPpp")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Textarea
                  placeholder="Share feedback for the creator…"
                  value={commentDraft}
                  rows={3}
                  onChange={(event) => setCommentDraft(event.target.value)}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={handleAddReviewComment}
                    disabled={!commentDraft.trim()}
                    className="self-end"
                  >
                    Send feedback
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onCancel}>
              {readOnly ? "Close review" : "Exit builder"}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToPrevious} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={goToNext} disabled={!canMoveNext}>
                  {readOnly ? "Next section" : "Next step"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : readOnly ? (
                <Button onClick={onCancel}>
                  Done reviewing
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Submit for approval
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={readOnly ? false : isUploadDialogOpen}
        onOpenChange={(open) => {
          if (readOnly) return;
          setIsUploadDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new study resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resourceTitle">Resource title</Label>
              <Input
                id="resourceTitle"
                value={resourceDraft.title}
                readOnly={readOnly}
                disabled={readOnly}
                onChange={(event) =>
                  setResourceDraft((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="e.g. AI Ethics Handbook"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource type</Label>
                <Input
                  id="resourceType"
                  value={resourceDraft.type}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setResourceDraft((prev) => ({ ...prev, type: event.target.value }))
                  }
                  placeholder="e.g. pdf, video, template"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceUrl">Link (optional)</Label>
                <Input
                  id="resourceUrl"
                  value={resourceDraft.url ?? ""}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) =>
                    setResourceDraft((prev) => ({ ...prev, url: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceDescription">Description (optional)</Label>
              <Textarea
                id="resourceDescription"
                rows={3}
                value={resourceDraft.description ?? ""}
                readOnly={readOnly}
                disabled={readOnly}
                onChange={(event) =>
                  setResourceDraft((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Short summary of what learners will find inside."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={readOnly}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResourceUpload}
              disabled={readOnly || !resourceDraft.title.trim()}
            >
              Add resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurriculumBuilder;
