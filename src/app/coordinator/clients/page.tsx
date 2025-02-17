"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { 
  UserPlus, Search, Phone, MapPin, Calendar, FileText, 
  MoreVertical, Edit, Trash, Eye, Mail, Filter, Download,
  UserCog, FileSpreadsheet, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  status: string;
  createdAt: Date;
  clientProfile: {
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

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: '',
    clientProfile: {
      age: 0,
      sex: '',
      region: '',
      zone: '',
      wereda: '',
      kebele: '',
      caseType: '',
      caseCategory: ''
    }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/coordinator/clients', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to fetch clients');
        return;
      }

      setClients(data.data);
    } catch (error) {
      setError('An error occurred while fetching clients');
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
    const csvData = [
      ['Full Name', 'Email', 'Phone', 'Status', 'Region', 'Zone', 'Case Type', 'Case Category', 'Joined Date'],
      ...filteredClients.map(client => [
        client.fullName,
        client.email,
        client.phone,
        client.status,
        client.clientProfile.region,
        client.clientProfile.zone,
        client.clientProfile.caseType,
        client.clientProfile.caseCategory,
        formatDate(client.createdAt)
      ])
    ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clients_${formatDate(new Date())}.csv`;
    link.click();

      toast({
        title: "Success",
        description: "Client data exported successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export client data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/coordinator/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setClients(prevClients => prevClients.filter(client => client.id !== clientId));
        toast({
          title: "Success",
          description: "Client deleted successfully",
          variant: "default",
        });
      } else {
        throw new Error(data.message || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (clientId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/coordinator/clients/${clientId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setClients(prevClients =>
          prevClients.map(client =>
          client.id === clientId ? { ...client, status: newStatus } : client
          )
        );
        
        toast({
          title: "Success",
          description: `Client status updated to ${newStatus.toLowerCase()}`,
          variant: "default",
        });
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: "Error",
        description: "Failed to update client status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setShowViewModal(true);
    }
  };

  const handleEditClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setEditForm({
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        status: client.status,
        clientProfile: { ...client.clientProfile }
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/coordinator/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        setClients(prevClients =>
          prevClients.map(client =>
            client.id === selectedClient.id ? { ...client, ...editForm } : client
          )
        );
        
        toast({
          title: "Success",
          description: "Client information updated successfully",
          variant: "default"
        });
        setShowEditModal(false);
      } else {
        throw new Error(data.message || 'Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddClient = () => {
    router.push('/coordinator/clients/register');
  };

  const filteredClients = clients
    .filter(client => {
      const matchesSearch = 
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'desc'
        ? b[sortBy].localeCompare(a[sortBy])
        : a[sortBy].localeCompare(b[sortBy]);
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'inactive':
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-32 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-6 transition-colors duration-300">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Client Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage and view all client information
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <Input
                type="search"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                  transition-colors duration-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 
                text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 gap-2"
            >
              <FileSpreadsheet size={20} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={handleAddClient}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 
                text-white transition-all duration-200 gap-2"
            >
              <UserPlus size={20} />
              <span className="hidden sm:inline">New Client</span>
            </Button>
          </div>
        </div>

        {/* View Toggle and Content */}
        <Tabs value={view} onValueChange={(v: 'cards' | 'table') => setView(v)} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="cards" className="gap-2">
                <FileText size={16} />
                Card View
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <FileSpreadsheet size={16} />
                Table View
              </TabsTrigger>
            </TabsList>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Join Date</SelectItem>
                <SelectItem value="fullName">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw size={20} className={`transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

          <TabsContent value="cards">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-6"
          >
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Card key={client.id} className="overflow-hidden border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-200 
                  dark:hover:border-indigo-700/50 transition-all duration-300 hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Avatar className="h-16 w-16 ring-4 ring-indigo-100 dark:ring-indigo-800/50 transition-transform duration-300 
                        group-hover:scale-105">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.fullName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xl">
                          {client.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {client.fullName}
                          </h2>
                          <Badge variant="outline" className={`w-fit ${getStatusColor(client.status)}`}>
                            {client.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Phone size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span>{client.clientProfile.region}, {client.clientProfile.zone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span>{client.clientProfile.caseType} - {client.clientProfile.caseCategory}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span>Joined {formatDate(client.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreVertical size={20} className="text-slate-600 dark:text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(client.id, client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                            {client.status === 'ACTIVE' ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No clients found</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

          <TabsContent value="table">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Case Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.fullName}`} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-sm">
                            {client.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          <span>{client.clientProfile.region}</span>
                        </div>
                        <span className="text-sm text-slate-500">{client.clientProfile.zone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span>{client.clientProfile.caseType}</span>
                        <span className="text-sm text-slate-500 block">{client.clientProfile.caseCategory}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(client.status)}`}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(client.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreVertical size={20} className="text-slate-600 dark:text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(client.id, client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                            {client.status === 'ACTIVE' ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        </Tabs>
      </div>

      {/* View Client Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Client Details
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">Full Name</Label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedClient.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Contact Information</Label>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Phone size={16} className="text-indigo-600 dark:text-indigo-400" />
                      {selectedClient.phone}
                    </p>
                    <p className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Mail size={16} className="text-indigo-600 dark:text-indigo-400" />
                      {selectedClient.email}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Status</Label>
                  <Badge variant="outline" className={`mt-1 ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">Location</Label>
                  <div className="space-y-2">
                    <p className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">Region:</span> {selectedClient.clientProfile.region}
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">Zone:</span> {selectedClient.clientProfile.zone}
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">Wereda:</span> {selectedClient.clientProfile.wereda}
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">Kebele:</span> {selectedClient.clientProfile.kebele}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Case Information</Label>
                  <div className="space-y-2">
                    <p className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">Type:</span> {selectedClient.clientProfile.caseType}
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">Category:</span> {selectedClient.clientProfile.caseCategory}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Edit Client
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={editForm.clientProfile.region}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    clientProfile: { ...editForm.clientProfile, region: e.target.value }
                  })}
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  value={editForm.clientProfile.zone}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    clientProfile: { ...editForm.clientProfile, zone: e.target.value }
                  })}
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseType">Case Type</Label>
                <Select
                  value={editForm.clientProfile.caseType}
                  onValueChange={(value) => setEditForm({
                    ...editForm,
                    clientProfile: { ...editForm.clientProfile, caseType: value }
                  })}
                >
                  <SelectTrigger id="caseType" className="border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                    <SelectItem value="CRIMINAL">Criminal</SelectItem>
                    <SelectItem value="FAMILY">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-indigo-600 to-violet-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 