'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ServiceType, ServiceCategory, UserRoleEnum } from '@prisma/client';
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  category: ServiceCategory;
  price: number;
  features: string[];
  eligibilityCriteria: string[];
  estimatedDuration: string;
  active: boolean;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  requests: {
    id: string;
    status: string;
    createdAt: string;
  }[];
}

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: '',
    category: '',
    price: '',
    features: '',
    eligibilityCriteria: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/services/packages');
      const data = await response.json();
      if (data.success) {
        setPackages(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch packages',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim()),
        eligibilityCriteria: formData.eligibilityCriteria.split('\n').filter(c => c.trim()),
        price: parseFloat(formData.price),
      };

      if (editingPackage) {
        payload.id = editingPackage.id;
      }

      const response = await fetch('/api/admin/services/packages', {
        method: editingPackage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: editingPackage
            ? 'Package updated successfully'
            : 'Package created successfully',
        });
        setShowAddDialog(false);
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save package',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/admin/services/packages?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Package deleted successfully',
        });
        fetchPackages();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete package',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      serviceType: pkg.serviceType,
      category: pkg.category,
      price: pkg.price.toString(),
      features: pkg.features.join('\n'),
      eligibilityCriteria: pkg.eligibilityCriteria.join('\n'),
      estimatedDuration: pkg.estimatedDuration,
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      serviceType: '',
      category: '',
      price: '',
      features: '',
      eligibilityCriteria: '',
      estimatedDuration: '',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Packages</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="capitalize">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.serviceType}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-gray-500">{pkg.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm text-gray-500">{pkg.price} ETB</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center">
                    {pkg.active ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm text-gray-500">
                      {pkg.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Features</p>
                  <ul className="text-sm text-gray-500 list-disc list-inside">
                    {pkg.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the service package.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETB)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ServiceType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ServiceCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">
                Features (one per line)
              </Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eligibilityCriteria">
                Eligibility Criteria (one per line)
              </Label>
              <Textarea
                id="eligibilityCriteria"
                value={formData.eligibilityCriteria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibilityCriteria: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration</Label>
              <Input
                id="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingPackage(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 