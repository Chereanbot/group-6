"use client";

import { useState, useEffect } from 'react';
import { AssignmentService } from '@/services/coordinator/AssignmentService';
import { 
  CoordinatorAssignment, 
  AssignmentStatus,
  AssignmentFilter 
} from '@/types/coordinator';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<CoordinatorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AssignmentFilter>({
    status: [],
    dateRange: undefined,
  });

  const service = new AssignmentService();

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  const loadAssignments = async () => {
    try {
      const data = await service.getAssignments(filters);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Coordinator Assignments</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          className="border rounded-lg px-4 py-2"
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

        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border rounded-lg px-4 py-2"
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                start: new Date(e.target.value),
                end: prev.dateRange?.end || new Date()
              }
            }))}
          />
          <span>to</span>
          <input
            type="date"
            className="border rounded-lg px-4 py-2"
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Add coordinator details */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {assignment.project?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {assignment.project?.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${assignment.status === AssignmentStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                      assignment.status === AssignmentStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                      assignment.status === AssignmentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(assignment.startDate).toLocaleDateString()}
                  </div>
                  {assignment.endDate && (
                    <div className="text-sm text-gray-500">
                      to {new Date(assignment.endDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Cancel
                  </button>
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