"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { use } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowLeft,
  Download,
  Copy,
  Edit,
  FileText,
  Tag,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { mockTemplates } from "../mockData";
import { toast } from "sonner";

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    const data = mockTemplates.find(t => t.id === id);
    if (data) {
      setTemplate(data);
    }
  }, [id]);

  const handleUseTemplate = () => {
    toast.success("Template copied to editor");
    // Add logic to use template
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
            <p className="text-muted-foreground">
              {template.category} • Last modified {format(template.lastModified, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`/lawyer/documents/templates/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Template
          </Button>
          <Button onClick={handleUseTemplate}>
            <Copy className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="p-4 border rounded-lg bg-muted/50">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm">
                  Template preview will be displayed here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Format</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.format}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Usage Statistics</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Used {template.usageCount} times
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Default
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 