'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  MoreHorizontal,
  ExternalLink,
  DollarSign,
  Clock,
  AlertCircle,
  Timer
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientListProps {
  clients: any[];
}

export default function ClientList({ clients }: ClientListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {clients.map((client) => (
        <Card key={client.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                <Link 
                  href={`/lawyer/clients/${client.id}`}
                  className="hover:text-blue-600 hover:underline flex items-center gap-2"
                >
                  {client.fullName}
                  {client.clientProfile?.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                  )}
                </Link>
              </h3>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </p>
                {client.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link 
                    href={`/lawyer/clients/${client.id}`}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link 
                    href={`/lawyer/clients/${client.id}/cases`}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Cases
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link 
                    href={`/lawyer/clients/${client.id}/appointments`}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Meeting
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link 
                    href={`/lawyer/clients/${client.id}/messages`}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {/* Cases Summary */}
            <div>
              <h4 className="text-sm font-medium mb-2">Active Cases</h4>
              <div className="space-y-2">
                {client.clientCases.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-center justify-between">
                    <Link 
                      href={`/lawyer/cases/${caseItem.id}`}
                      className="text-sm hover:text-blue-600 hover:underline"
                    >
                      {caseItem.title}
                    </Link>
                    <Badge className={
                      caseItem.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {caseItem.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            {client.clientCases[0]?.activities[0] && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                <p className="text-sm text-gray-500">
                  {client.clientCases[0].activities[0].description}
                  <span className="block text-xs text-gray-400">
                    {formatDistanceToNow(
                      new Date(client.clientCases[0].activities[0].createdAt),
                      { addSuffix: true }
                    )}
                  </span>
                </p>
              </div>
            )}

            {/* Time Entries */}
            {client.clientCases[0]?.timeEntries[0] && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Time Entry</h4>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {client.clientCases[0].timeEntries[0].description}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({client.clientCases[0].timeEntries[0].duration} minutes)
                  </span>
                </div>
              </div>
            )}

            {/* Service Payments */}
            {client.serviceRequests[0]?.ServicePayment && (
              <div>
                <h4 className="text-sm font-medium mb-2">Payment Status</h4>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    Last payment: ${client.serviceRequests[0].ServicePayment.amount}
                  </span>
                  <Badge className={
                    client.serviceRequests[0].ServicePayment.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {client.serviceRequests[0].ServicePayment.status}
                  </Badge>
                </div>
              </div>
            )}

            {/* Upcoming Appointment */}
            {client.serviceRequests[0]?.Appointment && (
              <div>
                <h4 className="text-sm font-medium mb-2">Next Appointment</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {formatDistanceToNow(
                      new Date(client.serviceRequests[0].Appointment.scheduledTime),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Recent Notes */}
            {client.clientCases[0]?.notes[0] && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Note</h4>
                <p className="text-sm text-gray-500">
                  {client.clientCases[0].notes[0].content}
                  <span className="block text-xs text-gray-400">
                    {formatDistanceToNow(
                      new Date(client.clientCases[0].notes[0].createdAt),
                      { addSuffix: true }
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 