"use client";

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Eye, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Appointment } from './types';

interface AppointmentActionsProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onScheduleNew: (client: Appointment['client']) => void;
  onRefresh: () => void;
}

export function AppointmentActions({
  appointment,
  onEdit,
  onDelete,
  onScheduleNew,
  onRefresh,
}: AppointmentActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/coordinator/clients/appointments/${appointment.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Appointment deleted successfully",
        });
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(appointment)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Appointment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onScheduleNew(appointment.client)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule New
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Client Information</h3>
              <p>Name: {appointment.client.fullName}</p>
              <p>Email: {appointment.client.email}</p>
              <p>Phone: {appointment.client.phone}</p>
              {appointment.client.clientProfile && (
                <>
                  <p>Region: {appointment.client.clientProfile.region}</p>
                  <p>Zone: {appointment.client.clientProfile.zone}</p>
                  <p>Wereda: {appointment.client.clientProfile.wereda}</p>
                  <p>Kebele: {appointment.client.clientProfile.kebele}</p>
                </>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Appointment Details</h3>
              <p>Purpose: {appointment.purpose}</p>
              <p>Case Type: {appointment.caseType}</p>
              <p>Status: {appointment.status}</p>
              <p>Priority: {appointment.priority}</p>
              <p>Venue: {appointment.venue || 'N/A'}</p>
              <p>Duration: {appointment.duration} minutes</p>
              <p>Notes: {appointment.notes || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <h3 className="font-semibold">Required Documents</h3>
              <ul className="list-disc list-inside">
                {appointment.requiredDocuments.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 