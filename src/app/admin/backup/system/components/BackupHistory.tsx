import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Archive,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { BackupStatus, BackupType } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Backup {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size: number;
  createdAt: Date;
  expiresAt?: Date | null;
  downloadUrl?: string | null;
  fileExists: boolean;
  checksum?: string;
  compression?: string;
  encrypted?: boolean;
}

interface BackupHistoryProps {
  backups: Backup[];
  onDownload: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
  onRestore?: (backup: Backup) => void;
  onVerify?: (backup: Backup) => void;
  onArchive?: (backup: Backup) => void;
  onSchedule?: (backup: Backup) => void;
  onViewDetails?: (backup: Backup) => void;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStatusColor = (status: BackupStatus) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500 hover:bg-green-600';
    case 'PENDING':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'IN_PROGRESS':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'FAILED':
      return 'bg-red-500 hover:bg-red-600';
    case 'CANCELLED':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'EXPIRED':
      return 'bg-gray-500 hover:bg-gray-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const getStatusIcon = (status: BackupStatus) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'FAILED':
      return <AlertCircle className="h-4 w-4" />;
    case 'IN_PROGRESS':
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    default:
      return null;
  }
};

export function BackupHistory({
  backups,
  onDownload,
  onDelete,
  onRestore,
  onVerify,
  onArchive,
  onSchedule,
  onViewDetails
}: BackupHistoryProps) {
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Security</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {backups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No backups found
              </TableCell>
            </TableRow>
          ) : (
            backups.map((backup) => (
              <TableRow 
                key={backup.id}
                className={selectedBackup === backup.id ? 'bg-muted/50' : ''}
                onClick={() => setSelectedBackup(backup.id)}
              >
                <TableCell className="font-medium">{backup.name}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline">
                          {backup.type}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getBackupTypeDescription(backup.type)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(backup.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(backup.status)}
                      {backup.status}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>{formatBytes(backup.size)}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true })}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{format(new Date(backup.createdAt), 'PPpp')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {backup.expiresAt && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatDistanceToNow(new Date(backup.expiresAt), { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(new Date(backup.expiresAt), 'PPpp')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {!backup.expiresAt && 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {backup.encrypted && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="bg-blue-100">
                              🔒
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Encrypted</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {backup.compression && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="bg-green-100">
                              📦
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Compressed ({backup.compression})</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={!backup.fileExists || backup.status !== 'COMPLETED'}
                            onClick={() => onDownload(backup)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download backup</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onViewDetails && (
                          <DropdownMenuItem onClick={() => onViewDetails(backup)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onRestore && (
                          <DropdownMenuItem
                            onClick={() => onRestore(backup)}
                            disabled={!backup.fileExists || backup.status !== 'COMPLETED'}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restore
                          </DropdownMenuItem>
                        )}
                        {onVerify && (
                          <DropdownMenuItem
                            onClick={() => onVerify(backup)}
                            disabled={!backup.fileExists}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Verify
                          </DropdownMenuItem>
                        )}
                        {onArchive && (
                          <DropdownMenuItem onClick={() => onArchive(backup)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        {onSchedule && (
                          <DropdownMenuItem onClick={() => onSchedule(backup)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Schedule
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(backup)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function getBackupTypeDescription(type: BackupType): string {
  switch (type) {
    case 'FULL':
      return 'Complete backup of all data';
    case 'INCREMENTAL':
      return 'Backup of changes since last backup';
    case 'DIFFERENTIAL':
      return 'Backup of changes since last full backup';
    case 'PARTIAL':
      return 'Backup of selected data only';
    default:
      return 'Unknown backup type';
  }
} 