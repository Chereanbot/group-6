"use client";

import { format } from 'date-fns';
import { 
  FileText, 
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatFileSize } from "@/lib/utils";
import { Case } from "@/types/case";

interface CaseCardProps {
  caseData: Case;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string) => void;
  onDownload: (docId: string) => void;
}

export function CaseCard({
  caseData,
  onView,
  onEdit,
  onDelete,
  onUpload,
  onDownload
}: CaseCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle>{caseData.title}</CardTitle>
              <Badge variant={caseData.status === "ACTIVE" ? "default" : "secondary"}>
                {caseData.status}
              </Badge>
              {caseData.priority === "HIGH" && (
                <Badge variant="destructive">High Priority</Badge>
              )}
            </div>
            <CardDescription>
              Case #{caseData.caseNumber} • {caseData.clientName} • {caseData.practiceArea}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">{caseData.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(caseData.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(caseData.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Case
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpload(caseData.id)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(caseData.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Case
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Next Hearing</p>
            <p className="text-sm font-medium">
              {format(caseData.nextHearing, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="text-sm font-medium">
              {format(caseData.dueDate, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Team</p>
            <p className="text-sm font-medium">
              {caseData.assignedTeam.join(', ')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Documents</p>
            <p className="text-sm font-medium">{caseData.documents.length} files</p>
          </div>
        </div>

        <div className="space-y-2">
          {caseData.documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} • {formatFileSize(doc.size)} • 
                    Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDownload(doc.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 