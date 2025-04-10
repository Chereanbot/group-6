"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { 
  HiOutlineArchive,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineCog,
  HiOutlineExclamation,
} from "react-icons/hi";
import { BackupHistory } from './components/BackupHistory';
import { Plus, RefreshCw, Settings2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BackupType, BackupStatus } from '@prisma/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface BackupSettings {
  compression: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  encryption: boolean;
  excludedPaths: string[];
  maxConcurrent: number;
  retentionDays: number;
  scheduleEnabled: boolean;
  scheduleInterval: string;
}

export default function SystemBackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBackupDialog, setShowNewBackupDialog] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [settings, setSettings] = useState<BackupSettings>({
    compression: 'MEDIUM',
    encryption: true,
    excludedPaths: [],
    maxConcurrent: 3,
    retentionDays: 30,
    scheduleEnabled: false,
    scheduleInterval: '0 0 * * *' // Daily at midnight
  });

  useEffect(() => {
    fetchBackups();
    const interval = setInterval(fetchBackups, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/backups');
      const result = await response.json();
      
      if (result.success) {
        setBackups(result.data.map((backup: any) => ({
          ...backup,
          createdAt: new Date(backup.createdAt),
          expiresAt: backup.expiresAt ? new Date(backup.expiresAt) : null,
        })));
      } else {
        throw new Error(result.error || 'Failed to fetch backups');
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load backups. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsBackupInProgress(true);
      setBackupProgress(0);
      
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: BackupType.FULL,
          settings: settings
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Backup process started successfully',
        });
        setShowNewBackupDialog(false);
        fetchBackups();
        
        // Simulate progress updates
        const interval = setInterval(() => {
          setBackupProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsBackupInProgress(false);
              return 100;
            }
            return prev + 10;
          });
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to create backup. Please try again.',
        variant: 'destructive',
      });
      setIsBackupInProgress(false);
    }
  };

  const handleDownload = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/admin/backups/${backup.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Backup download started',
      });
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to download backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (backup: Backup) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backups/${backup.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Backup deleted successfully',
        });
        fetchBackups();
      } else {
        throw new Error(result.error || 'Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/admin/backups/${backup.id}/restore`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Backup restoration started',
        });
        fetchBackups();
      } else {
        throw new Error(result.error || 'Failed to restore backup');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerify = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/admin/backups/${backup.id}/verify`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Backup verification completed successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to verify backup');
      }
    } catch (error) {
      console.error('Error verifying backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/admin/backups/${backup.id}/archive`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Backup archived successfully',
        });
        fetchBackups();
      } else {
        throw new Error(result.error || 'Failed to archive backup');
      }
    } catch (error) {
      console.error('Error archiving backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (backup: Backup) => {
    setSelectedBackup(backup);
    setShowDetailsDialog(true);
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/admin/backups/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Backup settings saved successfully',
        });
        setShowSettingsSheet(false);
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Backup</h1>
          <p className="text-muted-foreground">Manage and monitor system backups</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewBackupDialog} onOpenChange={setShowNewBackupDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogDescription>
                  Configure your backup settings below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Backup Type</Label>
                  <Select
                    onValueChange={(value) => {
                      // Handle backup type change
                    }}
                    defaultValue="FULL"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Backup</SelectItem>
                      <SelectItem value="INCREMENTAL">Incremental Backup</SelectItem>
                      <SelectItem value="DIFFERENTIAL">Differential Backup</SelectItem>
                      <SelectItem value="PARTIAL">Partial Backup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Compression Level</Label>
                  <Select
                    value={settings.compression}
                    onValueChange={(value: any) => 
                      setSettings(prev => ({ ...prev, compression: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select compression level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="encryption"
                    checked={settings.encryption}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, encryption: checked as boolean }))
                    }
                  />
                  <Label htmlFor="encryption">Enable Encryption</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewBackupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBackup} disabled={isBackupInProgress}>
                  {isBackupInProgress ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Backup'
                  )}
                </Button>
              </DialogFooter>
              {isBackupInProgress && (
                <div className="mt-4">
                  <Progress value={backupProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Creating backup... {backupProgress}%
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Sheet open={showSettingsSheet} onOpenChange={setShowSettingsSheet}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Backup Settings</SheetTitle>
                <SheetDescription>
                  Configure global backup settings and schedules.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Default Compression</Label>
                        <Select
                          value={settings.compression}
                          onValueChange={(value: any) =>
                            setSettings(prev => ({ ...prev, compression: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select compression level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Default Encryption</Label>
                        <Switch
                          checked={settings.encryption}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, encryption: checked }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Retention Period (days)</Label>
                        <Input
                          type="number"
                          value={settings.retentionDays}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              retentionDays: parseInt(e.target.value)
                            }))
                          }
                          min="1"
                          max="365"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Max Concurrent Backups</Label>
                        <Input
                          type="number"
                          value={settings.maxConcurrent}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              maxConcurrent: parseInt(e.target.value)
                            }))
                          }
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="schedule">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Enable Scheduled Backups</Label>
                        <Switch
                          checked={settings.scheduleEnabled}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, scheduleEnabled: checked }))
                          }
                        />
                      </div>
                      {settings.scheduleEnabled && (
                        <div className="grid gap-2">
                          <Label>Schedule Interval (cron)</Label>
                          <Input
                            value={settings.scheduleInterval}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                scheduleInterval: e.target.value
                              }))
                            }
                            placeholder="0 0 * * *"
                          />
                          <p className="text-sm text-muted-foreground">
                            Use cron syntax (e.g., "0 0 * * *" for daily at midnight)
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="mt-4">
                <Button onClick={handleSaveSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>View and manage your system backups</CardDescription>
          </CardHeader>
          <CardContent>
            <BackupHistory
              backups={backups}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onVerify={handleVerify}
              onArchive={handleArchive}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Backup Details</DialogTitle>
          </DialogHeader>
          {selectedBackup && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedBackup.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedBackup.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{selectedBackup.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <p className="font-medium">{formatBytes(selectedBackup.size)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBackup.createdAt), 'PPpp')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expires</Label>
                  <p className="font-medium">
                    {selectedBackup.expiresAt
                      ? format(new Date(selectedBackup.expiresAt), 'PPpp')
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Checksum</Label>
                  <p className="font-medium">{selectedBackup.checksum || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Security</Label>
                  <p className="font-medium">
                    {selectedBackup.encrypted ? 'Encrypted' : 'Not encrypted'} |{' '}
                    {selectedBackup.compression
                      ? `Compressed (${selectedBackup.compression})`
                      : 'Not compressed'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 