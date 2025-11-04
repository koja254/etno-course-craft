import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Video, Image, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Library = () => {
  const contentItems = [
    { title: "Marketing Templates", type: "template", count: 12, icon: FileText },
    { title: "Video Lectures", type: "video", count: 8, icon: Video },
    { title: "Course Images", type: "image", count: 24, icon: Image },
    { title: "PDF Materials", type: "document", count: 15, icon: File },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Library</h1>
            <p className="text-muted-foreground">
              Reusable modules, blocks, and templates
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search library..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentItems.map((item, index) => (
            <Card key={index} className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{item.count} items</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Library;
