'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  experience: number;
  rating: number;
  currentWorkload: number;
  specializations: {
    name: string;
    category: string;
    yearsExperience: number;
  }[];
}

interface ServiceRequest {
  id: string;
  title: string;
  status: string;
  package: {
    name: string;
    serviceType: string;
  };
}

export default function AssignLawyerPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/services/requests/${params.id}/assign`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setServiceRequest(result.data.serviceRequest);
      setLawyers(result.data.availableLawyers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setAssignmentNotes('');
    setIsModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedLawyer) return;

    try {
      setAssigning(true);
      const response = await fetch(`/api/admin/services/requests/${params.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lawyerId: selectedLawyer.id,
          assignmentNotes 
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to assign lawyer');
      }

      toast.success('Lawyer assigned successfully');
      setIsModalOpen(false);
      router.push(`/admin/services/requests/${params.id}`);
    } catch (error) {
      console.error('Error assigning lawyer:', error);
      toast.error('Failed to assign lawyer. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!serviceRequest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Service request not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Assign Lawyer</CardTitle>
          <CardDescription>
            Assign a lawyer to handle the service request: {serviceRequest.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Service Request Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p className="font-medium">{serviceRequest.package.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-medium">{serviceRequest.package.serviceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant="outline">{serviceRequest.status}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Available Lawyers</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Current Workload</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lawyer.fullName}</p>
                        <p className="text-sm text-gray-500">{lawyer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.experience} years</TableCell>
                    <TableCell>{lawyer.rating.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={lawyer.currentWorkload > 5 ? 'destructive' : 'default'}
                      >
                        {lawyer.currentWorkload} cases
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary">
                            {spec.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAssignClick(lawyer)}
                        disabled={assigning}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lawyer</DialogTitle>
            <DialogDescription>
              Assign {selectedLawyer?.fullName} to handle this service request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Assignment Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific instructions or notes for the lawyer..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assigning}
            >
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 