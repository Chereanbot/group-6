"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { HiSearch, HiFilter, HiDownload } from 'react-icons/hi';

interface Case {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  description: string;
  client?: {
    fullName: string;
    email: string;
  };
  lawyer?: {
    fullName: string;
    email: string;
  };
  timeline?: Array<{
    id: string;
    status: string;
    description: string;
    createdAt: string;
  }>;
  documents?: Array<{
    id: string;
    title: string;
    fileUrl: string;
    createdAt: string;
  }>;
}

export default function RawCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/client/cases/raw');
      const data = await response.json();
      
      console.log('API Response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch cases');
      }
      
      setCases(data.cases || []);
      setFilteredCases(data.cases || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: "Error",
        description: "Failed to load cases. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchTerm, selectedStatus, selectedPriority, cases]);

  const filterCases = () => {
    let filtered = [...cases];

    if (searchTerm) {
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(caseItem => caseItem.status === selectedStatus);
    }

    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter(caseItem => caseItem.priority === selectedPriority);
    }

    setFilteredCases(filtered);
  };

  const handleExport = () => {
    const csvContent = [
      ['Case ID', 'Title', 'Category', 'Priority', 'Status', 'Created At'],
      ...filteredCases.map(caseItem => [
        caseItem.id,
        caseItem.title,
        caseItem.category,
        caseItem.priority,
        caseItem.status,
        new Date(caseItem.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cases-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Raw Cases Data
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            View all your cases in a detailed format
          </p>
        </div>

        {/* Search and Filter Controls - Only show if there are cases */}
        {!isLoading && cases.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleExport}
              className="inline-flex items-center justify-center"
            >
              <HiDownload className="mr-2" />
              Export CSV
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : cases.length === 0 ? (
          <Card className="p-6 text-center bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-4xl text-gray-400 dark:text-gray-600">
                📋
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                No Cases Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are currently no cases in the system. New cases will appear here once they are created.
              </p>
              <Button
                onClick={() => window.location.href = '/client/cases/register'}
                className="mt-4"
              >
                Register New Case
              </Button>
            </div>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card className="p-6 text-center bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-4xl text-gray-400 dark:text-gray-600">
                🔍
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                No Matching Cases
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No cases match your current search and filter criteria. Try adjusting your filters or search term.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('ALL');
                  setSelectedPriority('ALL');
                }}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Case ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {caseItem.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {caseItem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {caseItem.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${caseItem.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          caseItem.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${caseItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          caseItem.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          caseItem.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 