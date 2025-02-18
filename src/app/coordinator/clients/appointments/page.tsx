"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Grid3X3, Table } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import BigCalendar from "./components/BigCalendar";
import TableView from "./components/TableView";
import GridView from "./components/GridView";
import { Loader2 } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client: {
    id: string;
    name: string;
    fullName: string;
    email: string;
    phone: string;
    clientProfile?: {
      region: string;
      zone: string;
      wereda: string;
      kebele: string;
      caseType: string;
      caseCategory: string;
    };
  };
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: string;
  notes?: string;
  caseType: string;
  venue: string;
  priority: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("calendar");
  const router = useRouter();
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coordinator/clients/appointments", {
        credentials: 'include'
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch appointments");
      }

      if (!Array.isArray(data.data)) {
        throw new Error("Invalid data format received from server");
      }

      // Transform the dates to Date objects
      const transformedAppointments = data.data.map((apt: any) => ({
        ...apt,
        start: new Date(apt.start),
        end: new Date(apt.end),
        client: {
          ...apt.client,
          name: apt.client.fullName // Ensure name is set for compatibility
        }
      }));

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/coordinator/clients/appointments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update appointment status");
      }

      await fetchAppointments();
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/coordinator/clients/appointments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete appointment");
      }

      await fetchAppointments();
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button
          onClick={() => router.push("/coordinator/clients/appointments/new")}
          className="bg-primary hover:bg-primary/90"
        >
                      New Appointment
                    </Button>
          </div>

      <Tabs defaultValue="calendar" className="w-full" onValueChange={setActiveView}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Grid
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="calendar" className="mt-0">
              <BigCalendar
                appointments={appointments}
                onUpdateStatus={handleUpdateStatus}
                onDeleteAppointment={handleDeleteAppointment}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <TableView
                appointments={appointments}
                onUpdateStatus={handleUpdateStatus}
                onDeleteAppointment={handleDeleteAppointment}
              />
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              <GridView
                appointments={appointments}
                onUpdateStatus={handleUpdateStatus}
                onDeleteAppointment={handleDeleteAppointment}
              />
            </TabsContent>
          </motion.div>
                          </AnimatePresence>
      </Tabs>
      </div>
  );
} 