"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface Specialization {
  id: string;
  name: string;
  description: string;
  category: string;
  subFields: string[];
  lawyerCount: number;
  activeLawyerCount: number;
  caseCount?: number;
  successRate?: number;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  subFields: string[];
}

interface SpecializationStats {
  total: number;
  byCategory: { [key: string]: number };
  topUsed: { name: string; count: number }[];
  averageSubFields: number;
  totalLawyers: number;
}

const CATEGORIES = [
  'CIVIL',
  'CRIMINAL',
  'CORPORATE',
  'FAMILY',
  'INTELLECTUAL_PROPERTY',
  'REAL_ESTATE',
  'TAX',
  'LABOR',
  'ENVIRONMENTAL',
  'IMMIGRATION',
  'CONSTITUTIONAL',
  'ADMINISTRATIVE',
  'GENERAL'
];

export default function SpecializationsPage() {
  const router = useRouter();
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [stats, setStats] = useState<SpecializationStats>({
    total: 0,
    byCategory: {},
    topUsed: [],
    averageSubFields: 0,
    totalLawyers: 0
  });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    subFields: []
  });
  const [newSubField, setNewSubField] = useState('');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadSpecializations();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/specializations/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSpecializations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/specializations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in to access this page');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch specializations');
      }

      const data = await response.json();
      if (data.success) {
        setSpecializations(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading specializations:', error);
      toast.error('Failed to load specializations');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) {
      toast.error('Please select items to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} specializations?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/specializations/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedItems })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully deleted ${selectedItems.length} specializations`);
        setSelectedItems([]);
        loadSpecializations();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Failed to delete selected items');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/specializations/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'specializations.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export specializations');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/specializations/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Successfully imported specializations');
        loadSpecializations();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Failed to import specializations');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `/api/specializations/${editingId}`
        : '/api/specializations';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Specialization updated' : 'Specialization created');
        loadSpecializations();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving specialization:', error);
      toast.error('Failed to save specialization');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this specialization?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/specializations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Specialization deleted');
        loadSpecializations();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting specialization:', error);
      toast.error('Failed to delete specialization');
    }
  };

  const handleEdit = (specialization: Specialization) => {
    setFormData({
      name: specialization.name,
      category: specialization.category,
      description: specialization.description,
      subFields: specialization.subFields
    });
    setEditingId(specialization.id);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      subFields: []
    });
    setEditingId(null);
    setNewSubField('');
  };

  const addSubField = () => {
    if (newSubField.trim() && !formData.subFields.includes(newSubField.trim())) {
      setFormData({
        ...formData,
        subFields: [...formData.subFields, newSubField.trim()]
      });
      setNewSubField('');
    }
  };

  const removeSubField = (index: number) => {
    setFormData({
      ...formData,
      subFields: formData.subFields.filter((_, i) => i !== index)
    });
  };

  const sortedAndFilteredSpecializations = specializations
    .filter(spec => {
      const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || spec.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const key = sortConfig.key as keyof Specialization;
      let aValue = a[key];
      let bValue = b[key];

      // Special handling for lawyer count sorting
      if (key === 'lawyerCount') {
        aValue = a.activeLawyerCount; // Sort by active lawyers by default
        bValue = b.activeLawyerCount;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Legal Specializations</h1>
          <p className="text-gray-500">Manage and organize legal practice areas</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            id="import-file"
            className="hidden"
            accept=".csv"
            onChange={handleImport}
          />
          <Button variant="outline" onClick={handleExport}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="import-file">
            <Button variant="outline" asChild>
              <span>
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Specialization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Specialization</DialogTitle>
                <DialogDescription>
                  Fill in the details for the legal specialization.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter specialization name"
                    required
                  />
      </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sub Fields</label>
                  <div className="flex gap-2">
                    <Input
                      value={newSubField}
                      onChange={(e) => setNewSubField(e.target.value)}
                      placeholder="Add sub field"
                    />
                    <Button type="button" onClick={addSubField}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.subFields.map((field, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {field}
                        <button
                          type="button"
                          onClick={() => removeSubField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
              </div>
            </div>

      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Specializations</CardTitle>
              <DocumentDuplicateIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lawyers</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLawyers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sub-Fields</CardTitle>
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSubFields.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search specializations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedItems.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            Delete Selected ({selectedItems.length})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <Checkbox
                    checked={selectedItems.length === sortedAndFilteredSpecializations.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(sortedAndFilteredSpecializations.map(s => s.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sub Fields</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('lawyerCount')}
                >
                  <div className="flex items-center gap-1">
                    Lawyers {sortConfig.key === 'lawyerCount' && (
                      <span className="text-blue-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredSpecializations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No specializations found
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredSpecializations.map((spec) => (
                  <TableRow key={spec.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(spec.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, spec.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== spec.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{spec.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{spec.category}</Badge>
                    </TableCell>
                    <TableCell>{spec.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {spec.subFields.map((field, index) => (
                          <Badge key={index} variant="secondary">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                          {spec.activeLawyerCount} active
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {spec.lawyerCount} total
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(spec)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(spec.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 