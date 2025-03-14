import { useState, useMemo } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { translate } from '@/utils/translations';
import { 
  Eye, 
  MoreHorizontal, 
  ArrowUpDown, 
  ChevronDown,
  FileText,
  Calendar,
  MessageSquare,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { CaseDetailsDialog } from './CaseDetailsDialog';
import { toast } from '@/components/ui/use-toast';
import type { Case } from '../types';

interface CaseTableProps {
  cases: Case[];
  isAmharic: boolean;
  onCaseDeleted?: () => void;
}

type SortField = 'title' | 'status' | 'priority' | 'category' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export function CaseTable({ cases, isAmharic, onCaseDeleted }: CaseTableProps) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          comparison = a.priority.localeCompare(b.priority);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [cases, sortField, sortOrder]);

  const paginatedCases = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedCases.slice(start, end);
  }, [sortedCases, page]);

  const totalPages = Math.ceil(cases.length / itemsPerPage);

  const getCaseMetrics = (case_: Case) => {
    return {
      documents: case_.documents?.length || 0,
      events: case_.caseEvents?.length || 0,
      updates: case_.activities?.length || 0
    };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDeleteCase = async (case_: Case) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/client/cases?id=${case_.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete case');
      }

      toast({
        title: translate('Success', isAmharic),
        description: translate('Case deleted successfully', isAmharic),
      });

      setCaseToDelete(null);
      onCaseDeleted?.();
    } catch (error) {
      console.error('Error deleting case:', error);
      toast({
        title: translate('Error', isAmharic),
        description: translate(error instanceof Error ? error.message : 'Failed to delete case', isAmharic),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead onClick={() => handleSort('title')} className="cursor-pointer hover:bg-muted/80">
                <div className="flex items-center">
                  {translate('Title', isAmharic)}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/80">
                <div className="flex items-center">
                  {translate('Status', isAmharic)}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('priority')} className="cursor-pointer hover:bg-muted/80">
                <div className="flex items-center">
                  {translate('Priority', isAmharic)}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:bg-muted/80">
                <div className="flex items-center">
                  {translate('Category', isAmharic)}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>{translate('Metrics', isAmharic)}</TableHead>
              <TableHead onClick={() => handleSort('updatedAt')} className="cursor-pointer hover:bg-muted/80">
                <div className="flex items-center">
                  {translate('Last Updated', isAmharic)}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">{translate('Actions', isAmharic)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCases.map((case_) => {
              const metrics = getCaseMetrics(case_);
              return (
                <TableRow 
                  key={case_.id}
                  className="hover:bg-muted/50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setSelectedCase(case_)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{case_.title}</span>
                      <div className="text-sm text-muted-foreground">
                        {case_.assignedCoordinator ? (
                          <div className="flex flex-col">
                            <span>{translate('Coordinator', isAmharic)}: {case_.assignedCoordinator.fullName}</span>
                            <span className="text-xs">{case_.assignedCoordinator.coordinator?.office.name}</span>
                          </div>
                        ) : (
                          translate('Pending Assignment', isAmharic)
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(case_.status)}>
                      {translate(case_.status, isAmharic)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                      {translate(case_.priority, isAmharic)}
                    </Badge>
                  </TableCell>
                  <TableCell>{translate(case_.category, isAmharic)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{metrics.documents}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{metrics.events}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{metrics.updates}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(case_.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{translate('Actions', isAmharic)}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedCase(case_)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {translate('View Details', isAmharic)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/client/cases/${case_.id}/documents`}>
                          <FileText className="mr-2 h-4 w-4" />
                          {translate('View Documents', isAmharic)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/client/cases/${case_.id}/events`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          {translate('View Events', isAmharic)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/client/cases/${case_.id}/messages`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {translate('Messages', isAmharic)}
                        </DropdownMenuItem>
                        {case_.status === 'PENDING' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setCaseToDelete(case_)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {translate('Delete Case', isAmharic)}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          {translate('Showing', isAmharic)} {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, cases.length)} {translate('of', isAmharic)} {cases.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            {translate('Previous', isAmharic)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            {translate('Next', isAmharic)}
          </Button>
        </div>
      </div>

      <CaseDetailsDialog
        case_={selectedCase}
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        isAmharic={isAmharic}
      />

      <AlertDialog open={!!caseToDelete} onOpenChange={() => !isDeleting && setCaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {translate('Delete Case', isAmharic)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <span className="block">{translate('Are you sure you want to delete this case?', isAmharic)}</span>
                <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {translate('This action cannot be undone. All case documents and history will be permanently deleted.', isAmharic)}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {translate('Cancel', isAmharic)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => caseToDelete && handleDeleteCase(caseToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white"
            >
              {isDeleting ? (
                translate('Deleting...', isAmharic)
              ) : (
                translate('Delete', isAmharic)
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 