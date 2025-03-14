'use client';

import { Card } from '@/components/ui/card';
import { Users, Clock, DollarSign, Calendar } from 'lucide-react';

interface ClientStatsProps {
  stats: {
    totalClients: number;
    activeClients: number;
    pendingPayments: number;
    upcomingAppointments: number;
  };
}

export default function ClientStats({ stats }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Clients</p>
            <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Clients</p>
            <h3 className="text-2xl font-bold">{stats.activeClients}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Payments</p>
            <h3 className="text-2xl font-bold">{stats.pendingPayments}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Upcoming Appointments</p>
            <h3 className="text-2xl font-bold">{stats.upcomingAppointments}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
} 