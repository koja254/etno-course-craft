import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import AIAssistant from "@/components/AIAssistant";
import CurriculumBuilder from "@/components/CurriculumBuilder";
import CreatorDashboard from "@/components/CreatorDashboard";
import MentorDashboard from "@/components/MentorDashboard";
import CurriculumCollaborationPanel from "@/components/CurriculumCollaborationPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles } from "lucide-react";
import { ALL_ROLES, ROLE_DETAILS } from "@/lib/roles";
import { useUserRole } from "@/hooks/use-user-role";
import { fetchCurriculums, type CurriculumRecord } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { getSectionLabel, type CurriculumSectionId } from "@/lib/curriculum-sections";
import type { MentorReviewThread, MentorReviewThreadStatus } from "@/lib/mentor-review";

const createId = () => Math.random().toString(36).slice(2, 10);

const buildInitialMentorThreads = (): Record<number, MentorReviewThread[]> => {
  const now = Date.now();
  return {
    101: [
      {
        id: "seed-101-1",
        sectionId: "delivery",
        status: "approved",
        messages: [
          {
            id: "seed-101-1a",
            author: "Mentor",
            role: "mentor",
            message: "Consider calling out how facilitation rotates between mentors.",
            createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
          },
          {
            id: "seed-101-1b",
            author: "Course Creator",
            role: "creator",
            message: "Added a facilitation note and marked the update complete.",
            createdAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
          },
        ],
      },
    ],
    102: [
      {
        id: "seed-102-1",
        sectionId: "structure",
        status: "pending",
        messages: [
          {
            id: "seed-102-1a",
            author: "Mentor",
            role: "mentor",
            message: "Week 4 looks heavy. Suggest trimming independent hours or adding a buffer.",
            createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
          },
        ],
      },
    ],
  };
};

const Index = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCreatingCurriculum, setIsCreatingCurriculum] = useState(false);
  const [mentorReviewCurriculum, setMentorReviewCurriculum] = useState<CurriculumRecord | null>(null);
  const [mentorThreadsByCurriculum, setMentorThreadsByCurriculum] = useState<Record<number, MentorReviewThread[]>>(
    buildInitialMentorThreads,
  );
  const [curriculumStatuses, setCurriculumStatuses] = useState<Record<number, CurriculumRecord["status"]>>({});
  const [publishedCourseFlags, setPublishedCourseFlags] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const simulationTimeouts = useRef<number[]>([]);
  const { role: activeRole, setRole: setActiveRole } = useUserRole();

  useEffect(() => {
    return () => {
      simulationTimeouts.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      simulationTimeouts.current = [];
    };
  }, []);

  const handleAddMentorComment = (curriculumId: number, sectionId: CurriculumSectionId, message: string) => {
    const sectionLabel = getSectionLabel(sectionId);
    const mentorLabel = ROLE_DETAILS["mentor"].label;
    const newThread: MentorReviewThread = {
      id: createId(),
      sectionId,
      status: "pending",
      messages: [
        {
          id: createId(),
          author: mentorLabel,
          role: "mentor",
          message,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setMentorThreadsByCurriculum((previous) => {
      const current = previous[curriculumId] ?? [];
      return {
        ...previous,
        [curriculumId]: [newThread, ...current],
      };
    });

    toast({
      title: "Feedback sent",
      description: `Shared under ${sectionLabel}. We'll ping the creator automatically.`,
    });

    const timeoutId = window.setTimeout(() => {
      const responseStatus: MentorReviewThreadStatus = Math.random() > 0.35 ? "approved" : "declined";
      const creatorMessage =
        responseStatus === "approved"
          ? `Creator approved the update for ${sectionLabel}.`
          : `Creator needs another revision in ${sectionLabel}.`;

      setMentorThreadsByCurriculum((previous) => {
        const threads = previous[curriculumId] ?? [];
        return {
          ...previous,
          [curriculumId]: threads.map((thread) => {
            if (thread.id !== newThread.id) {
              return thread;
            }

            return {
              ...thread,
              status: responseStatus,
              messages: [
                ...thread.messages,
                {
                  id: createId(),
                  author: "Course Creator",
                  role: "creator",
                  message: creatorMessage,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }),
        };
      });

      toast({
        title: responseStatus === "approved" ? "Creator approved your suggestion" : "Creator responded",
        description: creatorMessage,
      });

      simulationTimeouts.current = simulationTimeouts.current.filter((id) => id !== timeoutId);
    }, 4000 + Math.random() * 4000);

    simulationTimeouts.current.push(timeoutId);
  };

  const handleCreatorResponse = (curriculumId: number, threadId: string, message: string) => {
    const creatorLabel = ROLE_DETAILS["course-creator"].label;
    setMentorThreadsByCurriculum((previous) => {
      const threads = previous[curriculumId] ?? [];
      return {
        ...previous,
        [curriculumId]: threads.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                status: thread.status === "declined" ? "pending" : thread.status,
                messages: [
                  ...thread.messages,
                  {
                    id: createId(),
                    author: creatorLabel,
                    role: "creator",
                    message,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : thread,
        ),
      };
    });

    toast({
      title: "Creator replied",
      description: "Your update is shared with the mentor and manager instantly.",
    });
  };

  const handleManagerDecision = (
    curriculumId: number,
    threadId: string,
    decision: MentorReviewThreadStatus,
    message: string,
  ) => {
    const managerLabel = ROLE_DETAILS["program-manager"].label;
    setMentorThreadsByCurriculum((previous) => {
      const threads = previous[curriculumId] ?? [];
      return {
        ...previous,
        [curriculumId]: threads.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                status: decision,
                messages: [
                  ...thread.messages,
                  {
                    id: createId(),
                    author: managerLabel,
                    role: "program-manager",
                    message,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : thread,
        ),
      };
    });

    toast({
      title: decision === "approved" ? "Thread approved" : "Thread sent back",
      description: decision === "approved" ? "Creator can move forward." : "Creator has been asked for another revision.",
    });
  };

  const handleManagerCurriculumDecision = (
    curriculumId: number,
    nextStatus: CurriculumRecord["status"],
    note?: string,
  ) => {
    setCurriculumStatuses((previous) => ({
      ...previous,
      [curriculumId]: nextStatus,
    }));

    setMentorReviewCurriculum((current) =>
      current && current.id === curriculumId
        ? {
            ...current,
            status: nextStatus,
          }
        : current,
    );

    toast({
      title: nextStatus === "approved" ? "Curriculum approved" : "Revisions requested",
      description: note || (nextStatus === "approved" ? "Creator can proceed to publishing." : "Creator will rework the draft."),
    });
  };

  const handlePublishCourse = (curriculumId: number) => {
    setPublishedCourseFlags((previous) => ({
      ...previous,
      [curriculumId]: true,
    }));

    setCurriculumStatuses((previous) => ({
      ...previous,
      [curriculumId]: "published",
    }));

    setMentorReviewCurriculum((current) =>
      current && current.id === curriculumId
        ? {
            ...current,
            status: "published",
          }
        : current,
    );

    toast({
      title: "Landing page published",
      description: "The AI-generated course page is now live on the university portal.",
    });
  };

  const curriculumsQuery = useQuery({
    queryKey: ["curriculums", activeRole],
    queryFn: () => fetchCurriculums(activeRole),
    enabled: activeRole === "course-creator" ? !isCreatingCurriculum : true,
  });

  const selectedCurriculumThreads = mentorReviewCurriculum
    ? mentorThreadsByCurriculum[mentorReviewCurriculum.id] ?? []
    : [];

  const augmentedCurriculums = useMemo(() => {
    if (!curriculumsQuery.data) return undefined;
    return curriculumsQuery.data.map((curriculum) => ({
      ...curriculum,
      status: curriculumStatuses[curriculum.id] ?? curriculum.status,
    }));
  }, [curriculumsQuery.data, curriculumStatuses]);

  const publishedCurriculums = useMemo(() => {
    if (!augmentedCurriculums) return [] as CurriculumRecord[];
    return augmentedCurriculums.filter((curriculum) =>
      (curriculumStatuses[curriculum.id] ?? curriculum.status) === "published" || publishedCourseFlags[curriculum.id],
    );
  }, [augmentedCurriculums, curriculumStatuses, publishedCourseFlags]);

  if (activeRole === "course-creator" && isCreatingCurriculum) {
    return (
      <CurriculumBuilder
        onCancel={() => setIsCreatingCurriculum(false)}
        onSaved={() => {
          setIsCreatingCurriculum(false);
          curriculumsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Workspace</h1>
            <p className="text-muted-foreground">
              {activeRole === "course-creator"
                ? "Draft curricula, collaborate with mentors, and publish approved programmes."
                : activeRole === "mentor"
                  ? "Review curricula in read-only mode, leave structured comments, and track responses."
                  : "Review curricula alongside creators, manage approvals, and unlock syllabus builds."}
            </p>
            <div className="mt-4 space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Collaborate as
              </Label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((role) => (
                  <Button
                    key={role}
                    variant={activeRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveRole(role)}
                    className="gap-2"
                  >
                    <span>{ROLE_DETAILS[role].label}</span>
                    <span className="text-xs text-muted-foreground">
                      {ROLE_DETAILS[role].shorthand}
                    </span>
                  </Button>
                ))}
              </div>
              <p className="max-w-xl text-xs text-muted-foreground">
                {ROLE_DETAILS[activeRole].description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAIOpen(!isAIOpen)}
              className="relative"
            >
              <Sparkles className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
            {activeRole === "course-creator" ? (
              <Button onClick={() => setIsCreatingCurriculum(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Curriculum
              </Button>
            ) : null}
          </div>
        </div>

        {publishedCurriculums.length > 0 && (
          <section className="mb-10 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Published landing pages</h2>
                <p className="text-sm text-muted-foreground">These curricula are live on the university homepage after manager approval.</p>
              </div>
              <Badge variant="secondary" className="w-fit">Live preview</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publishedCurriculums.map((curriculum) => (
                <Card key={`published-${curriculum.id}`} className="border shadow-sm">
                  <div className="relative h-28 bg-gradient-to-r from-primary/80 to-primary">
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-primary-foreground">
                      <p className="text-[11px] uppercase tracking-wide">Featured programme</p>
                      <h3 className="text-lg font-semibold">{curriculum.curriculumName}</h3>
                      <span className="text-xs text-primary-foreground/80">
                        {curriculum.curriculumGroup ?? "Innovation"}
                      </span>
                    </div>
                  </div>
                  <CardContent className="space-y-3 pt-4">
                    <p className="text-sm text-muted-foreground">
                      {(curriculum.descriptionLearningEnvironment && curriculum.descriptionLearningEnvironment.slice(0, 140)) ||
                        "Designed to accelerate change-ready teams through guided experimentation and mentor cadence."}
                      {(curriculum.descriptionLearningEnvironment && curriculum.descriptionLearningEnvironment.length > 140) ? "…" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {(curriculum.targetGroup.slice(0, 3).length ? curriculum.targetGroup.slice(0, 3) : ["Leaders", "Designers", "Analysts"]).map((audience) => (
                        <Badge key={`${curriculum.id}-aud-${audience}`} variant="outline">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Total hours:</span> {curriculum.totalHours ?? "—"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMentorReviewCurriculum(curriculum)}
                    >
                      View page
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {activeRole === "mentor" ? (
          <MentorDashboard
            curriculums={augmentedCurriculums}
            isLoading={curriculumsQuery.isLoading}
            onOpenCurriculum={(curriculum) => {
              setMentorReviewCurriculum(curriculum);
            }}
            threadsByCurriculum={mentorThreadsByCurriculum}
          />
        ) : (
          <CreatorDashboard
            curriculums={augmentedCurriculums}
            isLoading={curriculumsQuery.isLoading}
            onCreateCurriculum={
              activeRole === "course-creator" ? () => setIsCreatingCurriculum(true) : undefined
            }
            onOpenCollaboration={(curriculum) => {
              setMentorReviewCurriculum(curriculum);
            }}
            threadsByCurriculum={mentorThreadsByCurriculum}
          />
        )}
      </main>
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        role={activeRole}
        curriculums={augmentedCurriculums}
        threadsByCurriculum={mentorThreadsByCurriculum}
        publishedCurriculumsCount={publishedCurriculums.length}
        onOpenCollaboration={(curriculum) => setMentorReviewCurriculum(curriculum)}
        onCreateCurriculum={activeRole === "course-creator" ? () => setIsCreatingCurriculum(true) : undefined}
      />
      <CurriculumCollaborationPanel
        open={Boolean(mentorReviewCurriculum)}
        role={activeRole}
        curriculum={mentorReviewCurriculum}
        curriculumStatus={mentorReviewCurriculum ? curriculumStatuses[mentorReviewCurriculum.id] ?? mentorReviewCurriculum.status : undefined}
        threads={selectedCurriculumThreads}
        onMentorComment={(sectionId, message) => {
          if (!mentorReviewCurriculum) return;
          handleAddMentorComment(mentorReviewCurriculum.id, sectionId, message);
        }}
        onCreatorRespond={(threadId, message) => {
          if (!mentorReviewCurriculum) return;
          handleCreatorResponse(mentorReviewCurriculum.id, threadId, message);
        }}
        onManagerDecision={(threadId, decision, message) => {
          if (!mentorReviewCurriculum) return;
          handleManagerDecision(mentorReviewCurriculum.id, threadId, decision, message);
        }}
        onManagerApproveCurriculum={(note) => {
          if (!mentorReviewCurriculum) return;
          handleManagerCurriculumDecision(mentorReviewCurriculum.id, "approved", note);
        }}
        onManagerRequestChanges={(note) => {
          if (!mentorReviewCurriculum) return;
          handleManagerCurriculumDecision(mentorReviewCurriculum.id, "rejected", note);
        }}
        onPublishCourse={() => {
          if (!mentorReviewCurriculum) return;
          handlePublishCourse(mentorReviewCurriculum.id);
        }}
        canPublish={Boolean(
          mentorReviewCurriculum &&
            (curriculumStatuses[mentorReviewCurriculum.id] ?? mentorReviewCurriculum.status) === "approved" &&
            !publishedCourseFlags[mentorReviewCurriculum.id],
        )}
        onClose={() => setMentorReviewCurriculum(null)}
      />
    </div>
  );
};

export default Index;
