import { useState, useMemo, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editOnceFlag, setEditOnceFlag] = useState<string | null>(null);

  useEffect(() => {
    setEditOnceFlag(localStorage.getItem('case-edit-warning-shown'));
  }, []);

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

  const handleEditClick = (case_) => {
    if (!editOnceFlag) {
      setShowWarning(true);
      setEditCase(case_);
    } else {
      openEditModal(case_);
    }
  };

  const openEditModal = (case_) => {
    setEditForm({
      title: case_.title,
      description: case_.description,
      category: case_.category || '',
    });
    setEditCase(case_);
    setShowEditModal(true);
  };

  const handleWarningConfirm = () => {
    localStorage.setItem('case-edit-warning-shown', 'true');
    setEditOnceFlag('true');
    setShowWarning(false);
    if (editCase) openEditModal(editCase);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCase) return;
    setEditLoading(true);
    try {
      const response = await fetch(`/api/client/cases/${editCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update case');
      toast({ title: translate('Success', isAmharic), description: translate('Case updated successfully', isAmharic) });
      setShowEditModal(false);
      setEditCase(null);
      onCaseDeleted?.(); // Refresh list
    } catch (error) {
      toast({ title: translate('Error', isAmharic), description: translate(error instanceof Error ? error.message : 'Failed to update case', isAmharic), variant: 'destructive' });
    } finally {
      setEditLoading(false);
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
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(case_)}>
                          {translate('Edit', isAmharic)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCaseToDelete(case_)}>
                          {translate('Delete', isAmharic)}
                        </DropdownMenuItem>
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

      {/* Warning Modal */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translate('Warning', isAmharic)}</AlertDialogTitle>
            <AlertDialogDescription>
              {translate('You can only edit your case details once. Are you sure you want to proceed?', isAmharic)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWarning(false)}>{translate('Cancel', isAmharic)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarningConfirm}>{translate('Proceed', isAmharic)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate('Edit Case', isAmharic)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">{translate('Title', isAmharic)}</Label>
              <Input id="title" name="title" value={editForm.title || ''} onChange={handleEditFormChange} required />
            </div>
            <div>
              <Label htmlFor="description">{translate('Description', isAmharic)}</Label>
              <Textarea id="description" name="description" value={editForm.description || ''} onChange={handleEditFormChange} required />
            </div>
            <div>
              <Label htmlFor="category">{translate('Category', isAmharic)}</Label>
              <select
                id="category"
                name="category"
                value={editForm.category || ''}
                onChange={handleEditFormChange}
                required
                className="w-full border rounded px-2 py-1 dark:bg-gray-900 dark:text-white"
              >
                <option value="">{translate('Select Category', isAmharic)}</option>
                <option value="CIVIL">{translate('Civil', isAmharic)}</option>
                <option value="CRIMINAL">{translate('Criminal', isAmharic)}</option>
                <option value="FAMILY">{translate('Family', isAmharic)}</option>
                <option value="CORPORATE">{translate('Corporate', isAmharic)}</option>
                <option value="OTHER">{translate('Other', isAmharic)}</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editLoading}>{editLoading ? translate('Saving...', isAmharic) : translate('Save Changes', isAmharic)}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 