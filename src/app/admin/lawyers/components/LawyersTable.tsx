'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  UserX, 
  Shield,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface LawyersTableProps {
  searchTerm: string;
  statusFilter: string;
  view: 'grid' | 'list';
}

const lawyers = [
  {
    id: '1',
    name: 'Dr. Cherinet Hailu',
    email: 'cherinet@dula.edu.et',
    phone: '+251911234567',
    avatar: '/avatars/01.png',
    specialization: 'Criminal Law',
    office: 'Main Campus',
    status: 'active',
    cases: 24,
    rating: 4.8,
    title: 'Associate Professor',
    experience: '8 years'
  },
  // Add more sample data...
];

export default function LawyersTable({ searchTerm, statusFilter, view }: LawyersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer, index) => (
          <motion.div
            key={lawyer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={lawyer.avatar} />
                    <AvatarFallback>{lawyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{lawyer.name}</h3>
                    <p className="text-sm text-muted-foreground">{lawyer.title}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <UserX className="w-4 h-4 mr-2" />
                      Suspend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                  {lawyer.specialization}
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {lawyer.office}
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {lawyer.rating} Rating
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <Badge className={getStatusColor(lawyer.status)}>
                  {lawyer.status.charAt(0).toUpperCase() + lawyer.status.slice(1)}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {lawyer.cases} Active Cases
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <thead>
          <tr>
            <th>Lawyer</th>
            <th>Specialization</th>
            <th>Office</th>
            <th>Cases</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lawyers.map((lawyer) => (
            <tr key={lawyer.id}>
              <td>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={lawyer.avatar} />
                    <AvatarFallback>{lawyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{lawyer.name}</div>
                    <div className="text-sm text-gray-500">{lawyer.email}</div>
                  </div>
                </div>
              </td>
              <td>{lawyer.specialization}</td>
              <td>{lawyer.office}</td>
              <td>
                <div>
                  <div className="font-medium">{lawyer.cases}</div>
                  <div className="text-sm text-gray-500">Active Cases</div>
                </div>
              </td>
              <td>
                <Badge className={getStatusColor(lawyer.status)}>
                  {lawyer.status.charAt(0).toUpperCase() + lawyer.status.slice(1)}
                </Badge>
              </td>
              <td>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <UserX className="w-4 h-4 mr-2" />
                      Suspend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
} 