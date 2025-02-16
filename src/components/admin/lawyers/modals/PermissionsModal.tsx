'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: any;
  onUpdate: () => void;
}

export default function PermissionsModal({
  isOpen,
  onClose,
  lawyer,
  onUpdate
}: PermissionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const permissions = {
    'Case Management': [
      { id: 'case_view', name: 'View Cases', description: 'Can view case details' },
      { id: 'case_create', name: 'Create Cases', description: 'Can create new cases' },
      { id: 'case_edit', name: 'Edit Cases', description: 'Can edit case details' },
      { id: 'case_delete', name: 'Delete Cases', description: 'Can delete cases' }
    ],
    'Document Management': [
      { id: 'doc_view', name: 'View Documents', description: 'Can view documents' },
      { id: 'doc_upload', name: 'Upload Documents', description: 'Can upload documents' },
      { id: 'doc_delete', name: 'Delete Documents', description: 'Can delete documents' }
    ],
    'Client Management': [
      { id: 'client_view', name: 'View Clients', description: 'Can view client details' },
      { id: 'client_edit', name: 'Edit Clients', description: 'Can edit client details' }
    ]
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lawyers/${lawyer.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: selectedPermissions })
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      toast.success('Permissions updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {lawyer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(permissions).map(([category, perms]) => (
            <Card key={category} className="p-4">
              <h3 className="font-semibold mb-4">{category}</h3>
              <div className="space-y-4">
                {perms.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPermissions([...selectedPermissions, permission.id]);
                        } else {
                          setSelectedPermissions(
                            selectedPermissions.filter((id) => id !== permission.id)
                          );
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={permission.id}>{permission.name}</Label>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 