import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurriculumRecord } from "@/lib/api";
import type { MentorReviewThread } from "@/lib/mentor-review";
import type { UserRole } from "@/lib/roles";
import { ROLE_DETAILS } from "@/lib/roles";

type AssistantTab = "focus" | "actions" | "history";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  curriculums?: CurriculumRecord[];
  threadsByCurriculum?: Record<number, MentorReviewThread[]>;
  publishedCurriculumsCount?: number;
  onOpenCollaboration?: (curriculum: CurriculumRecord) => void;
  onCreateCurriculum?: () => void;
}

const AIAssistant = ({
  isOpen,
  onClose,
  role,
  curriculums = [],
  threadsByCurriculum,
  publishedCurriculumsCount = 0,
  onOpenCollaboration,
  onCreateCurriculum,
}: AIAssistantProps) => {
  const [activeTab, setActiveTab] = useState<AssistantTab>("focus");

  const roleLabel = ROLE_DETAILS[role].label;

  const drafts = useMemo(
    () => curriculums.filter((curriculum) => curriculum.status === "draft" || curriculum.status === "pending"),
    [curriculums],
  );

  const pendingThreads = useMemo(() => {
    if (!threadsByCurriculum) return [] as Array<{ curriculum: CurriculumRecord; count: number }>;
    return curriculums
      .map((curriculum) => ({
        curriculum,
        count: (threadsByCurriculum[curriculum.id] ?? []).filter((thread) => thread.status !== "approved").length,
      }))
      .filter((item) => item.count > 0);
  }, [curriculums, threadsByCurriculum]);

  const recentCurriculum = curriculums[0];
  const openThreadTotal = pendingThreads.reduce((total, item) => total + item.count, 0);

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-50 h-full w-full bg-card shadow-xl transition-transform duration-300 sm:w-[420px]",
        "border-l",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">AI Assistant</span>
              <span className="text-xs text-muted-foreground">Built-in context for fast handoffs</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 border-b bg-muted/30 p-2">
          {([
            { id: "focus", label: "Where you left" },
            { id: "actions", label: "Quick actions" },
            { id: "history", label: "Recent activity" },
          ] satisfies Array<{ id: AssistantTab; label: string }>).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {activeTab === "focus" && (
            <div className="space-y-3">
              <Card className="border-primary/20 bg-primary/5 p-4">
                <h3 className="text-sm font-semibold text-foreground">Welcome back, {roleLabel} 👋</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role === "course-creator" &&
                    (drafts.length
                      ? `You have ${drafts.length} draft${drafts.length === 1 ? "" : "s"} waiting for mentor collaboration.`
                      : "No drafts need attention right now. Start a new curriculum or review published ones.")}
                  {role === "mentor" &&
                    (openThreadTotal
                      ? `There ${(openThreadTotal === 1 ? "is" : "are")} ${openThreadTotal} open thread${
                          openThreadTotal === 1 ? "" : "s"
                        } awaiting your feedback.`
                      : "Everything is quiet from the creators. We'll alert you when new drafts arrive.")}
                  {role === "program-manager" &&
                    (publishedCurriculumsCount
                      ? `${publishedCurriculumsCount} landing page${
                          publishedCurriculumsCount === 1 ? " is" : "s are"
                        } live. Review pending curricula before publishing more.`
                      : "No curricula have been published yet. Approve drafts to launch their landing pages.") }
                </p>
              </Card>

              {recentCurriculum && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Most recent curriculum</p>
                      <h4 className="text-sm font-semibold text-foreground">{recentCurriculum.curriculumName}</h4>
                      <p className="text-xs text-muted-foreground">Status: {recentCurriculum.status}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => onOpenCollaboration?.(recentCurriculum)}
                  >
                    Open collaboration hub
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeTab === "actions" && (
            <div className="space-y-3">
              {role === "course-creator" && (
                <>
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium text-foreground">Kick off a new draft</h4>
                        <p className="text-xs text-muted-foreground">
                          AI assists each step with ready-made copy and mentor collaboration built in.
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={onCreateCurriculum}>
                      Create curriculum
                    </Button>
                  </Card>

                  {pendingThreads.length > 0 && (
                    <Card className="p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-medium text-foreground">Respond to mentor feedback</h4>
                          <p className="text-xs text-muted-foreground">
                            {openThreadTotal} open thread{openThreadTotal === 1 ? "" : "s"} need your update.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {pendingThreads.slice(0, 4).map(({ curriculum, count }) => (
                          <Button
                            key={`creator-thread-${curriculum.id}`}
                            size="sm"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => onOpenCollaboration?.(curriculum)}
                          >
                            <span>{curriculum.curriculumName}</span>
                            <span className="text-xs text-muted-foreground">{count} open</span>
                          </Button>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}

              {role === "mentor" && (
                <Card className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-medium text-foreground">Review drafts awaiting feedback</h4>
                      <p className="text-xs text-muted-foreground">
                        Jump into the collaboration hub for aligned commenting and creator handoffs.
                      </p>
                    </div>
                  </div>
                  {pendingThreads.length ? (
                    <div className="space-y-1.5">
                      {pendingThreads.slice(0, 5).map(({ curriculum, count }) => (
                        <Button
                          key={`mentor-thread-${curriculum.id}`}
                          size="sm"
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => onOpenCollaboration?.(curriculum)}
                        >
                          <span>{curriculum.curriculumName}</span>
                          <span className="text-xs text-muted-foreground">{count} open</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">
                      All clear for now. The assistant will remind you when creators respond.
                    </p>
                  )}
                </Card>
              )}

              {role === "program-manager" && (
                <>
                  <Card className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium text-foreground">Approve or request changes</h4>
                        <p className="text-xs text-muted-foreground">
                          Review AI previews, collaborator threads, and publish the landing page once satisfied.
                        </p>
                      </div>
                    </div>
                    {drafts.length ? (
                      <div className="space-y-1.5">
                        {drafts.slice(0, 4).map((curriculum) => (
                          <Button
                            key={`manager-curriculum-${curriculum.id}`}
                            size="sm"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => onOpenCollaboration?.(curriculum)}
                          >
                            <span>{curriculum.curriculumName}</span>
                            <span className="text-xs text-muted-foreground">{curriculum.status}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground">
                        No curricula awaiting your decision right now.
                      </p>
                    )}
                  </Card>

                  <Card className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium text-foreground">Published landing pages</h4>
                        <p className="text-xs text-muted-foreground">
                          {publishedCurriculumsCount} curriculum{publishedCurriculumsCount === 1 ? " is" : "s are"} live on
                          the university homepage.
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {pendingThreads.length === 0 && drafts.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">
                  Nothing to surface yet. The assistant will highlight new collaboration events here.
                </p>
              ) : (
                <Card className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Recent collaboration</span>
                  </div>
                  <div className="space-y-2">
                    {pendingThreads.slice(0, 6).map(({ curriculum, count }) => (
                      <div key={`history-${curriculum.id}`} className="space-y-1 rounded-md border border-dashed p-3 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="font-medium text-foreground">{curriculum.curriculumName}</span>
                          <Badge variant="outline">{count} open</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {curriculum.status === "approved"
                            ? "Ready for your final publishing review."
                            : "Mentor feedback is still in progress. Align with the creator before approving."}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="border-t bg-muted/30 p-4">
          <Button className="w-full gap-2" onClick={() => recentCurriculum && onOpenCollaboration?.(recentCurriculum)}>
            <Target className="h-4 w-4" />
            Jump back into collaboration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
