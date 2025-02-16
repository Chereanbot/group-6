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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Edit,
  Upload,
  FileText,
  Download,
  Users,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockCases } from "../mockData";
import type { Case } from "@/types/case";
import { formatFileSize } from "@/lib/utils";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const { id } = use(params);

  useEffect(() => {
    // Replace with API call later
    const data = mockCases.find(c => c.id === id);
    if (data) {
      setCaseData(data);
    }
  }, [id]);

  if (!caseData) {
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
            <h1 className="text-3xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground">
              Case #{caseData.caseNumber} • {caseData.practiceArea}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
          <Button onClick={() => router.push(`/lawyer/documents/cases/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Case
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <Badge 
                  variant={caseData.status === "ACTIVE" ? "default" : "secondary"}
                  className="mb-2"
                >
                  {caseData.status}
                </Badge>
                {caseData.priority === "HIGH" && (
                  <Badge variant="destructive" className="ml-2">
                    High Priority
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next Hearing</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(caseData.nextHearing), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(caseData.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Client Name</p>
                <p className="text-sm font-medium">{caseData.clientName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned Team</p>
                <div className="flex flex-wrap gap-2">
                  {caseData.assignedTeam.map((member, index) => (
                    <Badge key={index} variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{caseData.description}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {caseData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {formatFileSize(doc.size)} • 
                        Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 