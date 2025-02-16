"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlineBookmark,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { legalSpecializations } from '@/data/specializations';
import { CaseLawDetails } from '@/components/lawyer/research/CaseLawDetails';
import { CitationNetwork } from '@/components/lawyer/research/CitationNetwork';

interface CaseLaw {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: Date;
  judges: string[];
  parties: string[];
  summary: string;
  content: string;
  headnotes: string[];
  holdings: string[];
  reasoning: string;
  tags: string[];
  jurisdiction: string;
  citations: string[];
  citedBy: string[];
  relevance: number;
  bookmarked: boolean;
  specialization: {
    id: string;
    name: string;
    category: string;
  };
}

interface Filters {
  courts: string[];
  dateRange: any;
  tags: string[];
  specialization: string;
  jurisdiction: string;
  yearRange: {
    start: number;
    end: number;
  };
  sortBy: 'relevance' | 'date' | 'citations';
  sortOrder: 'asc' | 'desc';
}

export default function CaseLawResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    courts: [],
    dateRange: null,
    tags: [],
    specialization: '',
    jurisdiction: '',
    yearRange: {
      start: 1900,
      end: new Date().getFullYear()
    },
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState<CaseLaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseLaw | null>(null);

  const [userSpecializations, setUserSpecializations] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch lawyer profile and cases in one go
        const response = await fetch('/api/lawyer/research/case-law/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: '',
            filters: {
              courts: [],
              dateRange: null,
              tags: [],
              specialization: '',
              jurisdiction: '',
              yearRange: {
                start: 1900,
                end: new Date().getFullYear()
              },
              sortBy: 'relevance',
              sortOrder: 'desc'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
          
          // Extract unique specializations from the results
          const specializations = [...new Set(data.map((item: CaseLaw) => ({
            id: item.specialization.id,
            name: item.specialization.name,
            category: item.specialization.category
          })))];
          setUserSpecializations(specializations);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lawyer/research/case-law/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTerm,
          filters,
          userSpecializations
        })
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search case law');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (caseId: string) => {
    try {
      const response = await fetch(`/api/lawyer/research/case-law/${caseId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark case');
      }

      // Update local state to reflect bookmark change
      setResults(prevResults => 
        prevResults.map(result => 
          result.id === caseId 
            ? { ...result, bookmarked: !result.bookmarked }
            : result
        )
      );

      if (selectedCase?.id === caseId) {
        setSelectedCase(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : null);
      }

      toast.success(
        `Case ${results.find(r => r.id === caseId)?.bookmarked ? 'removed from' : 'added to'} bookmarks`
      );
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleDownload = async (caseId: string) => {
    try {
      const response = await fetch(`/api/lawyer/research/case-law/${caseId}/download`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to download case');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-${caseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Case downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download case');
    }
  };

  const handleShare = async (caseId: string) => {
    try {
      // Get case details
      const caseToShare = results.find(r => r.id === caseId);
      if (!caseToShare) {
        throw new Error('Case not found');
      }

      // Create share data
      const shareData = {
        title: caseToShare.title,
        text: `Check out this case: ${caseToShare.title}`,
        url: `${window.location.origin}/case-law/${caseId}`
      };

      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Case shared successfully');
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Case link copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share case');
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    try {
      const response = await fetch(`/api/lawyer/research/case-law/${selectedCase?.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-${selectedCase?.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Case exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export case');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Case Law Research</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and analyze legal precedents
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search case law..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2"
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
          >
            <option value="">All My Specializations</option>
            {userSpecializations.map(spec => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>

          <select
            multiple
            className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2"
            onChange={(e) => setFilters({ 
              ...filters, 
              courts: Array.from(e.target.selectedOptions, option => option.value) 
            })}
          >
            <option value="SUPREME">Supreme Court</option>
            <option value="APPELLATE">Appellate Court</option>
            <option value="DISTRICT">District Court</option>
          </select>

          <input
            type="date"
            className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2"
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2"
              value={filters.sortBy}
              onChange={(e) => setFilters({ 
                ...filters, 
                sortBy: e.target.value as Filters['sortBy'] 
              })}
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="date">Sort by Date</option>
              <option value="citations">Sort by Citations</option>
            </select>
            
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2"
              value={filters.sortOrder}
              onChange={(e) => setFilters({ 
                ...filters, 
                sortOrder: e.target.value as Filters['sortOrder'] 
              })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Search Results</h2>
            <div className="space-y-4">
              {results.map(result => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setSelectedCase(result)}
                >
                  <h3 className="font-medium">{result.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{result.citation}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <span>{result.court}</span>
                    <span>•</span>
                    <span>{new Date(result.date).getFullYear()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <CaseLawDetails
              caseData={selectedCase}
              onBookmark={handleBookmark}
              onDownload={handleDownload}
              onShare={handleShare}
              onExport={handleExport}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
              <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-4" />
              <p>Select a case to view details</p>
            </div>
          )}

          {selectedCase && (
            <div className="mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Citation Network</h3>
                <CitationNetwork
                  caseId={selectedCase.id}
                  citations={selectedCase.citations}
                  citedBy={selectedCase.citedBy}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Export as DOCX
                  </button>
                  <button
                    onClick={() => handleExport('txt')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                  >
                    Export as TXT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 