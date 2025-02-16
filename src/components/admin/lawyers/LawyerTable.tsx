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
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([]);

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

  return (
    <div className="w-full">
      <div className="p-4 border-b dark:border-border-dark">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
            Lawyers List
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedLawyers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
              >
                Delete Selected
              </Button>
            )}
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
              <TableHead className="dark:text-foreground-dark">Name</TableHead>
              <TableHead className="dark:text-foreground-dark">Office</TableHead>
              <TableHead className="dark:text-foreground-dark">Specializations</TableHead>
              <TableHead className="dark:text-foreground-dark">Experience</TableHead>
              <TableHead className="dark:text-foreground-dark">Case Load</TableHead>
              <TableHead className="dark:text-foreground-dark">Rating</TableHead>
              <TableHead className="dark:text-foreground-dark">Status</TableHead>
              <TableHead className="dark:text-foreground-dark">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground dark:text-muted-foreground-dark"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : lawyers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground dark:text-muted-foreground-dark"
                >
                  No lawyers found
                </TableCell>
              </TableRow>
            ) : (
              lawyers.map((lawyer) => (
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
                    {lawyer.lawyerProfile?.office?.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.lawyerProfile?.specializations.map((spec, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                        >
                          {spec.specialization.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-foreground-dark">
                    {lawyer.lawyerProfile?.experience} years
                  </TableCell>
                  <TableCell className="dark:text-foreground-dark">
                    {lawyer.lawyerProfile?.caseLoad} cases
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center dark:text-foreground-dark">
                      <StarIcon className="w-4 h-4 text-yellow-400 dark:text-yellow-500 mr-1" />
                      {lawyer.lawyerProfile?.rating?.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lawyer.status)}>
                      {lawyer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/admin/lawyers/${lawyer.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-foreground-dark dark:hover:bg-muted-dark/50"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/lawyers/${lawyer.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-foreground-dark dark:hover:bg-muted-dark/50"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="dark:text-red-400 dark:hover:bg-muted-dark/50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
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