import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CURRICULUM_SECTIONS, getCurriculumSectionSummary, getSectionLabel, type CurriculumSectionId } from "@/lib/curriculum-sections";
import type { CurriculumRecord } from "@/lib/api";
import type { MentorReviewThread, MentorReviewThreadStatus } from "@/lib/mentor-review";
import type { UserRole } from "@/lib/roles";
import { MessageSquare, ShieldCheck, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurriculumCollaborationPanelProps {
  open: boolean;
  role: UserRole;
  curriculum: CurriculumRecord | null;
  curriculumStatus?: CurriculumRecord["status"];
  threads: MentorReviewThread[];
  onClose: () => void;
  onMentorComment?: (sectionId: CurriculumSectionId, message: string) => void;
  onCreatorRespond?: (threadId: string, message: string) => void;
  onManagerDecision?: (threadId: string, decision: MentorReviewThreadStatus, message: string) => void;
  onManagerApproveCurriculum?: (message?: string) => void;
  onManagerRequestChanges?: (message?: string) => void;
  onPublishCourse?: () => void;
  canPublish?: boolean;
}

const statusMeta: Record<
  MentorReviewThreadStatus,
  { label: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }
> = {
  pending: { label: "Awaiting creator response", badgeVariant: "secondary" },
  approved: { label: "Approved by manager", badgeVariant: "default" },
  declined: { label: "Needs revision", badgeVariant: "destructive" },
};

const CurriculumCollaborationPanel = ({
  open,
  role,
  curriculum,
  curriculumStatus,
  threads,
  onClose,
  onMentorComment,
  onCreatorRespond,
  onManagerDecision,
  onManagerApproveCurriculum,
  onManagerRequestChanges,
  onPublishCourse,
  canPublish,
}: CurriculumCollaborationPanelProps) => {
  const [selectedSection, setSelectedSection] = useState<CurriculumSectionId>("overview");
  const [mentorComment, setMentorComment] = useState("");
  const [creatorReplies, setCreatorReplies] = useState<Record<string, string>>({});
  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({});
  const [curriculumDecisionNote, setCurriculumDecisionNote] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!open) {
      setMentorComment("");
      setCreatorReplies({});
      setManagerNotes({});
      setCurriculumDecisionNote("");
      setSelectedSection("overview");
      setShowPreview(false);
      setIsExpanded(false);
    }
  }, [open]);

  const totals = useMemo(() => ({
    total: threads.length,
    pending: threads.filter((thread) => thread.status === "pending").length,
    approved: threads.filter((thread) => thread.status === "approved").length,
    declined: threads.filter((thread) => thread.status === "declined").length,
  }), [threads]);

  if (!curriculum) {
    return null;
  }

  const handleMentorSubmit = () => {
    if (!mentorComment.trim() || !onMentorComment) return;
    onMentorComment(selectedSection, mentorComment.trim());
    setMentorComment("");
  };

  const handleCreatorSubmit = (threadId: string) => {
    if (!onCreatorRespond) return;
    const message = creatorReplies[threadId]?.trim();
    if (!message) return;
    onCreatorRespond(threadId, message);
    setCreatorReplies((prev) => ({ ...prev, [threadId]: "" }));
  };

  const handleManagerSubmit = (threadId: string, decision: MentorReviewThreadStatus) => {
    if (!onManagerDecision) return;
    const message = managerNotes[threadId]?.trim();
    if (!message) return;
    onManagerDecision(threadId, decision, message);
    setManagerNotes((prev) => ({ ...prev, [threadId]: "" }));
  };

  const renderRoleActions = () => {
    switch (role) {
      case "mentor":
        return (
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Add mentor feedback</CardTitle>
              <CardDescription>Anchor your comment to a section so the creator sees exactly what to change.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mentor-section-select">Section</Label>
                <Select value={selectedSection} onValueChange={(value) => setSelectedSection(value as CurriculumSectionId)}>
                  <SelectTrigger id="mentor-section-select">
                    <SelectValue placeholder="Choose section" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRICULUM_SECTIONS.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mentor-comment">Comment</Label>
                <Textarea
                  id="mentor-comment"
                  value={mentorComment}
                  onChange={(event) => setMentorComment(event.target.value)}
                  placeholder="Share what needs to change, why it matters, and any supporting context…"
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Comments appear in real-time for creators and managers.
              </div>
              <Button onClick={handleMentorSubmit} disabled={!mentorComment.trim()}>
                Send feedback
              </Button>
            </CardFooter>
          </Card>
        );
      case "course-creator":
        return (
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Creator handoff</CardTitle>
              <CardDescription>Reply to mentor feedback once you’ve implemented the changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {threads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No mentor feedback yet. Once mentor comments arrive, respond here.</p>
              ) : (
                threads.map((thread) => (
                  <div key={thread.id} className="space-y-2 rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{getSectionLabel(thread.sectionId)}</span>
                      <Badge variant={statusMeta[thread.status].badgeVariant} className="text-[10px]">
                        {statusMeta[thread.status].label}
                      </Badge>
                    </div>
                    <div className="space-y-2 rounded-md border border-dashed bg-background p-3">
                      {thread.messages.map((message) => (
                        <div key={message.id} className="text-xs">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">{message.author}</span>
                            <span>
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-foreground">{message.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`creator-reply-${thread.id}`}>Reply to mentor</Label>
                      <Textarea
                        id={`creator-reply-${thread.id}`}
                        value={creatorReplies[thread.id] ?? ""}
                        onChange={(event) =>
                          setCreatorReplies((prev) => ({
                            ...prev,
                            [thread.id]: event.target.value,
                          }))
                        }
                        placeholder="Describe the change you made or explain what you need from the mentor…"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button size="sm" onClick={() => handleCreatorSubmit(thread.id)} disabled={!creatorReplies[thread.id]?.trim()}>
                          Send update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      case "program-manager":
        return (
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Manager actions</CardTitle>
              <CardDescription>Approve or request changes before publishing to the university landing page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Landing page preview</p>
                    <p className="text-xs text-muted-foreground">Review the generated layout before publishing.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview((previous) => !previous)}>
                    {showPreview ? "Hide preview" : "Preview landing page"}
                  </Button>
                </div>
                {showPreview && (
                  <div className="space-y-3 overflow-hidden rounded-lg border bg-background shadow-sm">
                    <div className="relative h-32 bg-gradient-to-r from-primary/80 to-primary">
                      <div className="absolute inset-0 flex flex-col justify-end p-4 text-primary-foreground">
                        <p className="text-xs uppercase tracking-wide">Featured curriculum</p>
                        <h3 className="text-lg font-semibold">{curriculum.curriculumName}</h3>
                        <p className="text-xs text-primary-foreground/80">{curriculum.curriculumGroup ?? "Innovation"}</p>
                      </div>
                    </div>
                    <div className="space-y-3 px-4 pb-4">
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {curriculum.targetGroup.slice(0, 3).map((audience) => (
                          <Badge key={audience} variant="outline">{audience}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(curriculum.basisCurriculumDevelopment && curriculum.basisCurriculumDevelopment.slice(0, 140)) ||
                          "Empower teams to run high-impact innovation sprints with structured mentor support."}
                        {(curriculum.basisCurriculumDevelopment && curriculum.basisCurriculumDevelopment.length > 140) ? "…" : ""}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-md border bg-muted/30 p-3">
                          <p className="text-xs font-medium text-foreground">Key outcomes</p>
                          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                            {(curriculum.learningOutcomes.slice(0, 3).length ? curriculum.learningOutcomes.slice(0, 3) : ["Outcome narrative coming soon", "Define experiments", "Measure adoption"]).map((outcome) => (
                              <li key={outcome} className="flex gap-2">
                                <span>•</span>
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-md border bg-muted/30 p-3">
                          <p className="text-xs font-medium text-foreground">Programme snapshot</p>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Total hours</span>
                            <span>{curriculum.totalHours ?? "—"}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Independent work</span>
                            <span>{curriculum.independentHours ?? "—"} hrs</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Documents issued</span>
                            <span>{curriculum.documentsIssued ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {threads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Mentor feedback threads will appear here once they’re created.</p>
              ) : (
                threads.map((thread) => (
                  <div key={thread.id} className="space-y-2 rounded-lg border bg-muted/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{getSectionLabel(thread.sectionId)}</span>
                        <span className="text-[11px] text-muted-foreground">
                          Last update{" "}
                          {formatDistanceToNow(
                            new Date(thread.messages[thread.messages.length - 1]?.createdAt ?? Date.now()),
                            { addSuffix: true },
                          )}
                        </span>
                      </div>
                      <Badge variant={statusMeta[thread.status].badgeVariant} className="text-[10px]">
                        {statusMeta[thread.status].label}
                      </Badge>
                    </div>
                    <div className="space-y-2 rounded-md border border-dashed bg-background p-3">
                      {thread.messages.map((message) => (
                        <div key={message.id} className="text-xs">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">{message.author}</span>
                            <span>
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-foreground">{message.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`manager-note-${thread.id}`}>Manager note</Label>
                      <Textarea
                        id={`manager-note-${thread.id}`}
                        value={managerNotes[thread.id] ?? ""}
                        onChange={(event) =>
                          setManagerNotes((prev) => ({
                            ...prev,
                            [thread.id]: event.target.value,
                          }))
                        }
                        placeholder="Explain the decision so the creator knows the next step…"
                        rows={3}
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManagerSubmit(thread.id, "declined")}
                          disabled={!managerNotes[thread.id]?.trim()}
                        >
                          Request update
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleManagerSubmit(thread.id, "approved")}
                          disabled={!managerNotes[thread.id]?.trim()}
                        >
                          Approve fix
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="curriculum-decision-note">Decision note</Label>
                <Textarea
                  id="curriculum-decision-note"
                  value={curriculumDecisionNote}
                  onChange={(event) => setCurriculumDecisionNote(event.target.value)}
                  placeholder="Share context for approving or requesting changes across the whole curriculum."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Curriculum status:{" "}
                <span className="font-semibold text-foreground capitalize">
                  {curriculumStatus ?? curriculum.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!onManagerRequestChanges) return;
                    onManagerRequestChanges(curriculumDecisionNote.trim() || undefined);
                    setCurriculumDecisionNote("");
                  }}
                >
                  Request revisions
                </Button>
                <Button
                  onClick={() => {
                    if (!onManagerApproveCurriculum) return;
                    onManagerApproveCurriculum(curriculumDecisionNote.trim() || undefined);
                    setCurriculumDecisionNote("");
                  }}
                >
                  Approve curriculum
                </Button>
                <Button
                  variant="secondary"
                  onClick={onPublishCourse}
                  disabled={!canPublish}
                >
                  Publish landing page
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          "flex h-full w-full flex-col gap-6 overflow-y-auto transition-all duration-200 sm:w-auto",
          isExpanded
            ? "sm:max-w-[96vw] sm:w-[min(1200px,96vw)]"
            : "sm:max-w-4xl sm:w-[min(920px,90vw)]",
        )}
      >
        <SheetHeader className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <SheetTitle>{curriculum.curriculumName}</SheetTitle>
              <SheetDescription>
                {role === "mentor"
                  ? "Add targeted comments and collaborate with the creator and manager in real-time."
                  : role === "course-creator"
                    ? "Review mentor feedback, reply with updates, and prep for manager approval."
                    : "Evaluate mentor and creator activity before approving and publishing the curriculum."}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded((prev) => !prev)} className="self-start md:self-auto">
              {isExpanded ? "Collapse view" : "Expand view"}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4 animate-pulse text-primary" />
            Live updates enabled — everyone sees responses instantly.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Open {totals.pending}</Badge>
            <Badge variant="outline">Approved {totals.approved}</Badge>
            <Badge variant="outline">Declined {totals.declined}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {CURRICULUM_SECTIONS.map((section) => {
            const sectionThreads = threads.filter((thread) => thread.sectionId === section.id);
            const summary = getCurriculumSectionSummary(curriculum, section.id);

            return (
              <Card key={section.id} className="border">
                <CardHeader>
                  <CardTitle className="text-base">{section.label}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                    {summary.map((item, index) => (
                      <div key={`${section.id}-summary-${index}`} className="rounded-md border bg-muted/30 px-3 py-2">
                        {item}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Feedback threads</p>
                      <Badge variant="outline" className="text-xs">
                        {sectionThreads.length} {sectionThreads.length === 1 ? "thread" : "threads"}
                      </Badge>
                    </div>

                    {sectionThreads.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {role === "mentor"
                          ? "No feedback here yet. Use the form below to start a thread."
                          : "No active threads from the mentor yet."}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {sectionThreads.map((thread) => {
                          const meta = statusMeta[thread.status];
                          return (
                            <div key={thread.id} className={cn("space-y-3 rounded-lg border px-3 py-3", thread.status === "declined" && "border-destructive/40")}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <Badge variant={meta.badgeVariant} className="text-[11px]">
                                  {meta.label}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                  Updated{" "}
                                  {formatDistanceToNow(
                                    new Date(thread.messages[thread.messages.length - 1]?.createdAt ?? Date.now()),
                                    { addSuffix: true },
                                  )}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {thread.messages.map((message) => (
                                  <div key={message.id} className="rounded-md border border-dashed px-3 py-2">
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                      <span className="font-medium text-foreground">{message.author}</span>
                                      <span>
                                        {formatDistanceToNow(new Date(message.createdAt), {
                                          addSuffix: true,
                                        })}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-foreground">{message.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {renderRoleActions()}
      </SheetContent>
    </Sheet>
  );
};

export default CurriculumCollaborationPanel;
