'use client';

import { formatDistanceToNow } from 'date-fns';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface Document {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  uploadedAt: Date;
  size: number;
  mimeType: string;
}

interface ClientCaseDocumentsProps {
  documents: Document[];
}

export function ClientCaseDocuments({ documents }: ClientCaseDocumentsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'IDENTIFICATION': 'text-blue-500',
      'RESIDENCE_PROOF': 'text-green-500',
      'BIRTH_CERTIFICATE': 'text-purple-500',
      'MARRIAGE_CERTIFICATE': 'text-pink-500',
      'DEATH_CERTIFICATE': 'text-gray-500',
      'PROPERTY_DEED': 'text-orange-500',
      'TAX_DOCUMENT': 'text-red-500',
      'BUSINESS_LICENSE': 'text-yellow-500',
      'PERMIT': 'text-indigo-500',
      'CONTRACT': 'text-cyan-500',
      'LEGAL_NOTICE': 'text-amber-500',
      'COMPLAINT': 'text-rose-500',
      'APPLICATION': 'text-emerald-500',
      'OTHER': 'text-gray-500'
    };
    return colors[type] || 'text-gray-500';
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No documents available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <HoverCard key={doc.id}>
          <HoverCardTrigger asChild>
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className={`h-5 w-5 ${getDocumentTypeColor(doc.type)}`} />
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">{doc.title}</h4>
              {doc.description && (
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{doc.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{formatFileSize(doc.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{doc.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Format</p>
                  <p className="font-medium">{doc.mimeType.split('/')[1].toUpperCase()}</p>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
} 