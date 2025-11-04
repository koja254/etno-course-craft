import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurriculumRecord } from "@/lib/api";
import { CURRICULUM_STATUS_META, formatCurriculumDate } from "@/lib/curriculum-metadata";
import { getSectionLabel } from "@/lib/curriculum-sections";
import type { MentorReviewThread } from "@/lib/mentor-review";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ShieldCheck, Workflow } from "lucide-react";

interface MentorDashboardProps {
  curriculums: CurriculumRecord[] | undefined;
  isLoading: boolean;
  onOpenCurriculum?: (curriculum: CurriculumRecord) => void;
  threadsByCurriculum?: Record<number, MentorReviewThread[]>;
}

const mentorStatusCopy: Record<
  CurriculumRecord["status"],
  { summary: string; commentHint: string }
> = {
  approved: {
    summary: "Curriculum is approved. Capture final delivery notes before hand-off.",
    commentHint: "Confirm readiness or flag last-mile adjustments in the comments.",
  },
  pending: {
    summary: "Creator is awaiting approval. Your review helps unblock the workflow.",
    commentHint: "Highlight gaps or risks that the creator should address.",
  },
  draft: {
    summary: "This draft is still in motion. Early mentor feedback keeps momentum high.",
    commentHint: "Share directional guidance; editing stays with the creator.",
  },
  rejected: {
    summary: "The draft is being reworked after review. Clarify blockers for the creator.",
    commentHint: "Document what must change so the creator can resubmit with confidence.",
  },
  published: {
    summary: "Curriculum is live. Capture delivery insights for future iterations.",
    commentHint: "Note improvements or learner signals for the next version.",
  },
};

const MentorDashboard = ({ curriculums, isLoading, onOpenCurriculum, threadsByCurriculum }: MentorDashboardProps) => {
  const hasCurriculums = Boolean(curriculums && curriculums.length > 0);

  return (
    <div className="space-y-6">
      <Card className="border-dashed bg-muted/30">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Workflow className="h-4 w-4" />
            Creator journey touchpoint
          </div>
          <CardTitle className="text-lg">Mentor review workspace</CardTitle>
          <CardDescription>
            You land in the final stage of the creator journey. Browse the latest curriculum draft, leave
            structured comments, and track responses from the program manager or creator.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="border">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !hasCurriculums && (
        <Card className="border border-dashed bg-background">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-lg">No curricula assigned yet</CardTitle>
              <CardDescription>
                Program managers will invite you when a creator is ready for mentor feedback. You’ll appear as
                a reviewer only once the draft is locked for comments.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      {hasCurriculums && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {curriculums!.map((curriculum) => {
            const statusMeta = CURRICULUM_STATUS_META[curriculum.status];
            const statusGuidance = mentorStatusCopy[curriculum.status];
            const approvedDate = curriculum.approvalDate ? formatCurriculumDate(curriculum.approvalDate) : null;
            const targetGroupSummary =
              Array.isArray(curriculum.targetGroup) && curriculum.targetGroup.length > 0
                ? curriculum.targetGroup.join(", ")
                : "Not specified";
            const objectivePreview = Array.isArray(curriculum.learningObjectives)
              ? curriculum.learningObjectives.slice(0, 2)
              : [];
            const hasMoreObjectives =
              Array.isArray(curriculum.learningObjectives) &&
              curriculum.learningObjectives.length > objectivePreview.length;
            const studyPreview = Array.isArray(curriculum.studyContent)
              ? curriculum.studyContent.slice(0, 2)
              : [];
            const hasMoreStudy =
              Array.isArray(curriculum.studyContent) &&
              curriculum.studyContent.length > studyPreview.length;
            const threads = threadsByCurriculum?.[curriculum.id] ?? [];
            const pendingCount = threads.filter((thread) => thread.status === "pending").length;
            const approvedCount = threads.filter((thread) => thread.status === "approved").length;
            const declinedCount = threads.filter((thread) => thread.status === "declined").length;
            const lastCreatorResponse = threads
              .flatMap((thread) =>
                thread.messages
                  .filter((message) => message.role === "creator")
                  .map((message) => ({ thread, message })),
              )
              .sort(
                (a, b) =>
                  new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime(),
              )[0];
            const handleOpen = () => {
              if (onOpenCurriculum) {
                onOpenCurriculum(curriculum);
              }
            };

            return (
              <Card key={curriculum.id} className="border">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{curriculum.curriculumName}</p>
                      <p className="text-xs text-muted-foreground">{curriculum.curriculumCode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusMeta.tone}>{statusMeta.label}</Badge>
                      <Badge variant="outline" className="border-dashed text-xs">
                        Read only
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    {statusGuidance.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Curriculum group</span>
                      <span>{curriculum.curriculumGroup ?? "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total hours</span>
                      <span>{curriculum.totalHours ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Approval stage</span>
                      <span>
                        {approvedDate ? `Approved ${approvedDate}` : "Awaiting sign-off"}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Learner profile</p>
                      <p>{targetGroupSummary}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Key objectives</p>
                      {objectivePreview.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-4 marker:text-primary">
                          {objectivePreview.map((objective) => (
                            <li key={objective}>{objective}</li>
                          ))}
                          {hasMoreObjectives && (
                            <li className="italic text-muted-foreground/80">More objectives in curriculum</li>
                          )}
                        </ul>
                      ) : (
                        <p>Not specified</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Study content</p>
                      {studyPreview.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-4 marker:text-primary">
                          {studyPreview.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                          {hasMoreStudy && (
                            <li className="italic text-muted-foreground/80">More content in curriculum</li>
                          )}
                        </ul>
                      ) : (
                        <p>Not specified</p>
                      )}
                    </div>
                    {curriculum.basisCurriculumDevelopment && (
                      <div>
                        <p className="font-medium text-foreground">Why it exists</p>
                        <p>{curriculum.basisCurriculumDevelopment}</p>
                      </div>
                    )}
                    {curriculum.descriptionLearningEnvironment && (
                      <div>
                        <p className="font-medium text-foreground">Learning environment</p>
                        <p>{curriculum.descriptionLearningEnvironment}</p>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Creator approvals</p>
                    {threads.length === 0 ? (
                      <p>No mentor feedback shared yet. Add a comment to kick off the workflow.</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">Open {pendingCount}</Badge>
                          <Badge variant="outline">Approved {approvedCount}</Badge>
                          <Badge variant="outline">Declined {declinedCount}</Badge>
                        </div>
                        {lastCreatorResponse ? (
                          <p>
                            {lastCreatorResponse.thread.status === "approved" ? "Approved" : "Needs updates"} on{" "}
                            {getSectionLabel(lastCreatorResponse.thread.sectionId)} •{" "}
                            {formatDistanceToNow(new Date(lastCreatorResponse.message.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        ) : (
                          <p>Creator is still reviewing your active threads.</p>
                        )}
                      </>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Commentary channel</p>
                    <p>{statusGuidance.commentHint}</p>
                  </div>
                  <Button className="w-full gap-2" variant="outline" onClick={handleOpen} disabled={!onOpenCurriculum}>
                    <MessageSquare className="h-4 w-4" />
                    Open review workspace
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
