import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CurriculumRecord } from "@/lib/api";
import type { MentorReviewThread } from "@/lib/mentor-review";
import { CURRICULUM_STATUS_META, formatCurriculumDate } from "@/lib/curriculum-metadata";
import { CalendarCheck, FileText, Sparkles, Workflow } from "lucide-react";

interface CreatorDashboardProps {
  curriculums: CurriculumRecord[] | undefined;
  isLoading: boolean;
  onCreateCurriculum?: () => void;
  onOpenCollaboration?: (curriculum: CurriculumRecord) => void;
  threadsByCurriculum?: Record<number, MentorReviewThread[]>;
}

const CreatorDashboard = ({
  curriculums,
  isLoading,
  onCreateCurriculum,
  onOpenCollaboration,
  threadsByCurriculum,
}: CreatorDashboardProps) => {
  const hasCurriculums = Boolean(curriculums && curriculums.length > 0);
  const canCreate = Boolean(onCreateCurriculum);
  const canCollaborate = Boolean(onOpenCollaboration);

  return (
    <div className="space-y-6">
      <Card className="border-dashed bg-muted/30">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-primary">Creator workflow</p>
            </div>
            <CardTitle className="text-lg">Curriculum portfolio</CardTitle>
            <CardDescription>
              Every syllabus begins with an approved curriculum. Draft, submit for approval, then generate your syllabus with AI.
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={onCreateCurriculum} className="gap-2">
              <FileText className="h-4 w-4" />
              New curriculum
            </Button>
          )}
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
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-lg">Your curriculum library is empty</CardTitle>
              <CardDescription>
                Start by drafting a curriculum. Once approved, you’ll unlock syllabus generation and course scheduling.
              </CardDescription>
            </div>
            {canCreate && (
              <Button onClick={onCreateCurriculum} className="gap-2">
                <FileText className="h-4 w-4" />
                Create your first curriculum
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {hasCurriculums && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {curriculums!.map((curriculum) => {
            const statusMeta = CURRICULUM_STATUS_META[curriculum.status];
            const totalHours = curriculum.totalHours ?? "—";
            const threads = threadsByCurriculum?.[curriculum.id] ?? [];
            const openThreads = threads.filter((thread) => thread.status !== "approved").length;
            return (
              <Card key={curriculum.id} className="border">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{curriculum.curriculumName}</p>
                      <p className="text-xs text-muted-foreground">{curriculum.curriculumCode}</p>
                    </div>
                    <Badge variant={statusMeta.tone}>{statusMeta.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>
                      {curriculum.approvalDate
                        ? `Approved ${formatCurriculumDate(curriculum.approvalDate)}`
                        : "Awaiting approval"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Curriculum group</p>
                      <p>{curriculum.curriculumGroup ?? "Not specified"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-right">Total hours</p>
                      <p className="text-right">{totalHours}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Status</p>
                      <p>{statusMeta.label}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">AI support</p>
                      <p>Use the collaboration hub to request AI polish or mentor feedback per section.</p>
                    </div>
                  </div>
                  {canCollaborate && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => onOpenCollaboration?.(curriculum)}
                    >
                      <Workflow className="h-4 w-4" />
                      Open collaboration hub
                      {openThreads > 0 && (
                        <Badge variant="secondary" className="ml-auto text-[11px]">
                          {openThreads} open
                        </Badge>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CreatorDashboard;
