import { useState } from "react";
import Navigation from "@/components/Navigation";
import CourseCard from "@/components/CourseCard";
import AIAssistant from "@/components/AIAssistant";
import CreateCourseWizard from "@/components/CreateCourseWizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Sparkles, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const courses = [
    {
      title: "Digital Marketing Fundamentals",
      status: "published" as const,
      progress: 100,
      duration: "6 weeks",
      learners: 45,
      lastEdited: "2 days ago",
      mentor: "Maria Kask",
    },
    {
      title: "Advanced Business Strategy",
      status: "in-review" as const,
      progress: 85,
      duration: "8 weeks",
      learners: 32,
      lastEdited: "Yesterday",
      mentor: "Jaan Tamm",
    },
    {
      title: "Leadership in the Digital Age",
      status: "draft" as const,
      progress: 45,
      duration: "4 weeks",
      learners: 0,
      lastEdited: "5 hours ago",
    },
    {
      title: "Financial Planning for Entrepreneurs",
      status: "published" as const,
      progress: 100,
      duration: "6 weeks",
      learners: 67,
      lastEdited: "1 week ago",
      mentor: "Anna Saar",
    },
  ];

  if (isCreatingCourse) {
    return <CreateCourseWizard onClose={() => setIsCreatingCourse(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">
              Create, manage, and publish courses with AI assistance
            </p>
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
            <Button onClick={() => setIsCreatingCourse(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Courses", value: "12" },
            { label: "Published", value: "8" },
            { label: "In Draft", value: "3" },
            { label: "Total Learners", value: "234" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>
      </main>

      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};

export default Index;
