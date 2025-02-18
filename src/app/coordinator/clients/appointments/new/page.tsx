"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, Search, Loader2, Phone, Mail, MapPin, FileText } from 'lucide-react';

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profile: {
    age: number;
    sex: string;
    region: string;
    zone: string;
    wereda: string;
    kebele: string;
    caseType: string;
    caseCategory: string;
  };
}

const caseTypes = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'DOCUMENT_REVIEW', label: 'Document Review' },
  { value: 'CASE_DISCUSSION', label: 'Case Discussion' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'OTHER', label: 'Other' }
];

const priorities = [
  { value: 'LOW', label: 'Low Priority', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'HIGH', label: 'High Priority', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
];

export default function NewAppointment() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    scheduledTime: '',
    duration: 30,
    purpose: '',
    caseType: '',
    venue: '',
    priority: 'MEDIUM',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, [searchTerm, caseTypeFilter, page]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/coordinator/clients/appointments/clients?search=${searchTerm}&caseType=${caseTypeFilter}&page=${page}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();

      if (data.success) {
        setClients(data.clients);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.message || 'Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch clients',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({ ...prev, clientId: client.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.scheduledTime || !formData.caseType) {
      toast({
        title: "Error",
        description: 'Please fill in all required fields',
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add retry logic for transient errors
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const response = await fetch('/api/coordinator/clients/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (!response.ok) {
            // Check if it's a transient error
            if (response.status === 503 || 
                (data.message && data.message.toLowerCase().includes('connection')) ||
                response.status === 500) {
              retryCount++;
              if (retryCount < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                continue;
              }
            }
            throw new Error(data.message || 'Failed to create appointment');
          }

          toast({
            title: "Success",
            description: 'Appointment created successfully',
            variant: "default",
            className: "bg-green-500 text-white"
          });
          router.push('/coordinator/clients/appointments');
          return;
        } catch (retryError) {
          if (retryCount === maxRetries - 1) {
            throw retryError;
          }
          retryCount++;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : 'Failed to create appointment. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Button>
        </motion.div>

        <Card className="border-indigo-100 dark:border-indigo-800/50 shadow-lg shadow-indigo-100/20 dark:shadow-indigo-900/20 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Schedule New Appointment
            </CardTitle>
            <CardDescription>
              Fill in the details below to schedule a new appointment
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Client</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        type="search"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-[200px] border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
                      <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Filter by case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Cases</SelectItem>
                        {caseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ScrollArea className="h-[200px] border rounded-lg border-slate-200 dark:border-slate-700 p-4">
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                      </div>
                    ) : clients.length > 0 ? (
                      clients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className={cn(
                            "p-4 rounded-lg cursor-pointer transition-all duration-200",
                            selectedClient?.id === client.id
                              ? "bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent",
                            "border"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.fullName}`} />
                              <AvatarFallback>
                                {client.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {client.fullName}
                                </h4>
                                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                  {client.profile.caseType}
                                </Badge>
                              </div>
                              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{client.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{client.profile.region}, {client.profile.zone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                        <FileText className="w-8 h-8 mb-2" />
                        <p>No clients found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Appointment Details */}
              <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date and Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      required
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      className="border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      min="15"
                      step="15"
                      required
                      className="border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Case Type</Label>
                    <Select
                      value={formData.caseType}
                      onValueChange={(value) => setFormData({ ...formData, caseType: value })}
                    >
                      <SelectTrigger className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <span className="flex items-center gap-2">
                              <Badge variant="outline" className={priority.color}>
                                {priority.label}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter appointment venue"
                    className="border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Enter appointment purpose"
                    className="min-h-[100px] border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes"
                    className="min-h-[100px] border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.clientId}
                  className={cn(
                    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300",
                    (isSubmitting || !formData.clientId) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Appointment'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
