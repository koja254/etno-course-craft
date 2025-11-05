import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseCardProps {
  title: string;
  status: "draft" | "published" | "in-review";
  progress: number;
  duration: string;
  learners: number;
  lastEdited: string;
  mentor?: string;
}

const CourseCard = ({
  title,
  status,
  progress,
  duration,
  learners,
  lastEdited,
  mentor,
}: CourseCardProps) => {
  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-success text-success-foreground",
    "in-review": "bg-warning text-warning-foreground",
  };

  const statusLabels = {
    draft: "Draft",
    published: "Published",
    "in-review": "In Review",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
            <Badge className={statusColors[status]} variant="secondary">
              {statusLabels[status]}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{learners} learners</span>
          </div>
        </div>

        {mentor && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">{mentor[0]}</span>
            </div>
            <span className="text-sm text-muted-foreground">{mentor}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{lastEdited}</span>
        </div>
        <Button size="sm" variant="ghost" className="text-primary">
          Continue editing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
