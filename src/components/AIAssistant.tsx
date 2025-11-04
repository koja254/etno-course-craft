import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, X, Lightbulb, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const [activeTab, setActiveTab] = useState<"suggest" | "generate" | "improve">("suggest");

  const suggestions = [
    {
      icon: Lightbulb,
      title: "Course Structure Suggestion",
      description: "AI suggests a 6-week curriculum based on your target audience and learning goals.",
      action: "Apply suggestion",
    },
    {
      icon: FileText,
      title: "Generate Course Description",
      description: "Create an engaging course description optimized for learner engagement.",
      action: "Generate",
    },
    {
      icon: Target,
      title: "Learning Outcomes",
      description: "AI-powered learning outcomes based on industry standards and best practices.",
      action: "Add outcomes",
    },
  ];

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-96 bg-card border-l shadow-xl transition-transform duration-300 z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">AI Assistant</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b bg-muted/30">
          {["suggest", "generate", "improve"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className="flex-1"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-4 space-y-3 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <suggestion.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
              </div>
              <Button size="sm" className="w-full" variant="outline">
                {suggestion.action}
              </Button>
            </Card>
          ))}

          <div className="pt-4 border-t">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Pro Tip</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The AI assistant learns from your preferences. The more you use it, the better suggestions you'll get.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <Button className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Ask AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
