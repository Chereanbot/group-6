import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  StarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { MoreHorizontal, Edit, Phone, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  status: string;
  lawyerProfile: {
    experience: number;
    rating: number;
    caseLoad: number;
    office: {
      name: string;
    };
    specializations: Array<{
      specialization: {
        name: string;
      };
    }>;
  };
  assignedCases: Array<{
    id: string;
    status: string;
  }>;
}

interface LawyerTableProps {
  lawyers: Lawyer[];
  loading: boolean;
  onRefresh: () => void;
}

export function LawyerTable({ lawyers, loading, onRefresh }: LawyerTableProps) {
  const router = useRouter();
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'fullName', direction: 'asc' });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
      case 'suspended':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
    }
  };

  // Sorting function
  const sortData = (data: any[], key: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let aValue = key.includes('.') ? key.split('.').reduce((obj, k) => obj?.[k], a) : a[key];
      let bValue = key.includes('.') ? key.split('.').reduce((obj, k) => obj?.[k], b) : b[key];

      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedLawyers = sortData(lawyers, sortConfig.key, sortConfig.direction);

  const handleView = (id: string) => {
    router.push(`/admin/lawyers/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/lawyers/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lawyer?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/lawyers/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete lawyer');
        }

        toast.success('Lawyer deleted successfully');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete lawyer');
        console.error('Error deleting lawyer:', error);
      }
    }
  };

  const handleContact = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else {
      window.location.href = `tel:${value}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: 'bg-green-500',
      INACTIVE: 'bg-red-500',
      PENDING: 'bg-yellow-500',
      SUSPENDED: 'bg-orange-500'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'}`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4 border-b dark:border-border-dark">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
            Lawyers List ({sortedLawyers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="dark:border-border-dark dark:text-foreground-dark"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-border-dark">
              <TableHead 
                className="cursor-pointer dark:text-foreground-dark"
                onClick={() => handleSort('fullName')}
              >
                Name {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer dark:text-foreground-dark"
                onClick={() => handleSort('lawyerProfile.office.name')}
              >
                Office {sortConfig.key === 'lawyerProfile.office.name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="dark:text-foreground-dark">Specializations</TableHead>
              <TableHead 
                className="cursor-pointer dark:text-foreground-dark"
                onClick={() => handleSort('lawyerProfile.experience')}
              >
                Experience {sortConfig.key === 'lawyerProfile.experience' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer dark:text-foreground-dark"
                onClick={() => handleSort('lawyerProfile.caseLoad')}
              >
                Case Load {sortConfig.key === 'lawyerProfile.caseLoad' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer dark:text-foreground-dark"
                onClick={() => handleSort('lawyerProfile.rating')}
              >
                Rating {sortConfig.key === 'lawyerProfile.rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer dark:text-foreground-dark"
                onClick={() => handleSort('status')}
              >
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="dark:text-foreground-dark">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedLawyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No lawyers found
                </TableCell>
              </TableRow>
            ) : (
              sortedLawyers.map((lawyer) => (
                <TableRow
                  key={lawyer.id}
                  className="dark:border-border-dark hover:bg-muted/50 dark:hover:bg-muted-dark/50"
                >
                  <TableCell className="dark:text-foreground-dark">
                    <div>
                      <div className="font-medium">{lawyer.fullName}</div>
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                        {lawyer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-foreground-dark">
                    {lawyer.lawyerProfile?.office?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.lawyerProfile?.specializations?.map((spec, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                        >
                          {spec.specialization.name}
                        </Badge>
                      )) || 'None'}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-foreground-dark">
                    {lawyer.lawyerProfile?.experience || 0} years
                  </TableCell>
                  <TableCell className="dark:text-foreground-dark">
                    {lawyer.lawyerProfile?.caseLoad || 0} cases
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center dark:text-foreground-dark">
                      <StarIcon className="w-4 h-4 text-yellow-400 dark:text-yellow-500 mr-1" />
                      {(lawyer.lawyerProfile?.rating || 0).toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lawyer.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleView(lawyer.id)}>
                          <EyeIcon className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(lawyer.id)}>
                          <PencilIcon className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(lawyer.id)}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 