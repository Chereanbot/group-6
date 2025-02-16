"use client";

import { Case } from '@/types/case.types';
import { formatDate } from '@/utils/date';

interface CaseAssignmentTableProps {
  cases: Case[];
  onAssign: (caseData: Case) => void;
  onEdit: (caseData: Case) => void;
  selectedCases: string[];
  onSelectCase: (caseId: string) => void;
}

export function CaseAssignmentTable({ 
  cases, 
  onAssign, 
  onEdit,
  selectedCases,
  onSelectCase 
}: CaseAssignmentTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // Select all cases
                    const allCaseIds = cases.map(c => c.id);
                    onSelectCase(allCaseIds);
                  } else {
                    // Deselect all
                    onSelectCase([]);
                  }
                }}
                checked={selectedCases.length === cases.length && cases.length > 0}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Case Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {cases.map((caseData) => (
            <tr key={caseData.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={selectedCases.includes(caseData.id)}
                  onChange={() => onSelectCase(caseData.id)}
                  defaultChecked={false}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {caseData.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {caseData.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  caseData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  caseData.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {caseData.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  caseData.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  caseData.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {caseData.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatDate(caseData.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {caseData.assignedLawyer ? caseData.assignedLawyer.fullName : 'Unassigned'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button
                  onClick={() => onEdit(caseData)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => onAssign(caseData)}
                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {caseData.lawyerId ? 'Reassign' : 'Assign'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 