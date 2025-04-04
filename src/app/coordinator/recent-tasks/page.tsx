"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineDotsVertical,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineStar,
  HiOutlineChat,
} from 'react-icons/hi';
import { format, formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  category: string;
  progress: number;
  comments: number;
  attachments: number;
}

export default function RecentTasksPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [userId, setUserId] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');

    if (!storedUserId || !storedUserType || !token) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your tasks.",
      });
      window.location.href = '/auth/login?redirect=/coordinator/recent-tasks';
      return;
    }

    setUserId(storedUserId);
    setUserType(storedUserType);
    
    fetchTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, sortField, sortDirection]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/coordinator/tasks/recent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
          });
          window.location.href = '/auth/login?redirect=/coordinator/recent-tasks';
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }

      const data = await response.json();
      
      if (!Array.isArray(data.tasks)) {
        throw new Error('Invalid response format');
      }

      setTasks(data.tasks);
      
      setSearchTerm('');
      setStatusFilter('all');
      setPriorityFilter('all');
      setCategoryFilter('all');

    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load recent tasks.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof Task];
      const bValue = b[sortField as keyof Task];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setFilteredTasks(filtered);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/coordinator/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
      ));

      toast({
        title: "Success",
        description: "Task status updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recent Tasks
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            View and manage your recent coordination tasks
          </p>
        </div>
        <Button onClick={fetchTasks} size="icon" variant="outline">
          <HiOutlineRefresh className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <HiOutlineRefresh className="h-8 w-8" />
                        </motion.div>
                        <p>Loading tasks...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <HiOutlineExclamation className="h-8 w-8" />
                        <p>No tasks found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[400px]">
                            {task.description}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <HiOutlineChat className="h-4 w-4" />
                              {task.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiOutlineClipboardCheck className="h-4 w-4" />
                              {task.attachments}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusColor(task.status)}
                          className={`
                            ${task.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                            ${task.status.toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                            ${task.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                          `}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getPriorityColor(task.priority)}
                          className={`
                            ${task.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                            ${task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' : ''}
                            ${task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                            ${task.priority === 'LOW' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' : ''}
                          `}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {task.progress}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <HiOutlineDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskDetails(true);
                              }}
                            >
                              <HiOutlineClipboardCheck className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                              disabled={task.status === 'COMPLETED'}
                            >
                              <HiOutlineCheck className="mr-2 h-4 w-4" />
                              Mark as Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateTaskStatus(task.id, 'CANCELLED')}
                              disabled={task.status === 'CANCELLED'}
                            >
                              <HiOutlineX className="mr-2 h-4 w-4" />
                              Cancel Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Task Details Modal */}
      <AnimatePresence>
        {showTaskDetails && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTaskDetails(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{selectedTask.title}</h2>
                    <p className="text-gray-500 mt-1">{selectedTask.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowTaskDetails(false)}
                  >
                    <HiOutlineX className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <Badge 
                      variant={getStatusColor(selectedTask.status)}
                      className={`
                        ${selectedTask.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                        ${selectedTask.status.toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                        ${selectedTask.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                      `}
                    >
                      {selectedTask.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Priority</h3>
                    <Badge 
                      variant={getPriorityColor(selectedTask.priority)}
                      className={`
                        ${selectedTask.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                        ${selectedTask.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' : ''}
                        ${selectedTask.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                        ${selectedTask.priority === 'LOW' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' : ''}
                      `}
                    >
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Due Date</h3>
                    <p className="text-gray-600">
                      {format(new Date(selectedTask.dueDate), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${selectedTask.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      {selectedTask.progress}% Complete
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Created: {format(new Date(selectedTask.createdAt), 'PPp')}</p>
                    <p>Last Updated: {format(new Date(selectedTask.updatedAt), 'PPp')}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTaskDetails(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleUpdateTaskStatus(selectedTask.id, 'COMPLETED');
                      setShowTaskDetails(false);
                    }}
                    disabled={selectedTask.status === 'COMPLETED'}
                  >
                    Mark as Complete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 