import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { BackupType, BackupSettings } from '@/types/backup';

export function useBackup() {
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchBackups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/backup');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch backups');
      }
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch backups'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async (type: BackupType, settings: Partial<BackupSettings>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, settings }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create backup');
      }

      const data = await response.json();
      setBackups(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Backup created successfully'
      });
      return data;
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create backup'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBackup = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/backup?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete backup');
      }

      setBackups(prev => prev.filter(backup => backup.id !== id));
      toast({
        title: 'Success',
        description: 'Backup deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete backup'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    backups,
    fetchBackups,
    createBackup,
    deleteBackup,
  };
} 