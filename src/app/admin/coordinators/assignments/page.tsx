"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CoordinatorAssignment, 
  AssignmentStatus,
  AssignmentFilter 
} from '@/types/coordinator';
import { adminStyles } from '@/styles/admin';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<CoordinatorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AssignmentFilter>({
    status: [],
    dateRange: undefined,
  });

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status.length > 0) {
        filters.status.forEach(status => queryParams.append('status', status));
      }
      
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString());
        queryParams.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(`/api/admin/coordinators/assignments?${queryParams}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load assignments');
      }

      setAssignments(result.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (assignmentId: string, status: AssignmentStatus) => {
    try {
      const response = await fetch(`/api/admin/coordinators/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update assignment status');
      }

      toast.success('Assignment status updated successfully');
      loadAssignments();
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update assignment status');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/admin/coordinators/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete assignment');
      }

      toast.success('Assignment deleted successfully');
      loadAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete assignment');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  if (loading) {
    return (
      <div className={adminStyles.container}>
        <div className={adminStyles.loading.container}>
          <div className={adminStyles.loading.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={adminStyles.container}>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Coordinator Assignments</h1>
      </div>

      {/* Filters */}
      <div className={adminStyles.filters.container}>
        <div className={adminStyles.filters.group}>
          <select
            className={adminStyles.filters.input}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: e.target.value ? [e.target.value as AssignmentStatus] : []
            }))}
          >
            <option value="">All Status</option>
            {Object.values(AssignmentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className={adminStyles.filters.group}>
          <input
            type="date"
            className={adminStyles.filters.input}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                start: new Date(e.target.value),
                end: prev.dateRange?.end || new Date()
              }
            }))}
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="date"
            className={adminStyles.filters.input}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                start: prev.dateRange?.start || new Date(),
                end: new Date(e.target.value)
              }
            }))}
          />
        </div>
      </div>

      {/* Assignments Table */}
      <div className={adminStyles.table.container}>
        <table className={adminStyles.table.table}>
          <thead className={adminStyles.table.header}>
            <tr>
              <th className={adminStyles.table.headerCell}>Coordinator</th>
              <th className={adminStyles.table.headerCell}>Project</th>
              <th className={adminStyles.table.headerCell}>Status</th>
              <th className={adminStyles.table.headerCell}>Duration</th>
              <th className={adminStyles.table.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={adminStyles.table.body}>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className={adminStyles.table.row}>
                <td className={adminStyles.table.cell}>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {assignment.coordinator?.user?.fullName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {assignment.coordinator?.user?.email}
                  </div>
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {assignment.project?.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {assignment.project?.description}
                  </div>
                </td>
                <td className={adminStyles.table.cell}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${assignment.status === AssignmentStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    assignment.status === AssignmentStatus.COMPLETED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    assignment.status === AssignmentStatus.CANCELLED ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(assignment.startDate).toLocaleDateString()}
                  </div>
                  {assignment.endDate && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      to {new Date(assignment.endDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="flex space-x-2">
                    <select
                      className={`${adminStyles.form.select} text-sm`}
                      value={assignment.status}
                      onChange={(e) => handleStatusChange(assignment.id, e.target.value as AssignmentStatus)}
                    >
                      {Object.values(AssignmentStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className={`${adminStyles.button.base} ${adminStyles.button.danger}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentsPage; 