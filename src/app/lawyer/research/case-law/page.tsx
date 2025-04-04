"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { CaseLawSearch } from '@/components/lawyer/research/CaseLawSearch';
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
          const specializations = [...new Set(data.map((item: CaseLaw) => 
            item.specialization.category
          ))];
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
          filters
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
      const caseToShare = results.find(r => r.id === caseId);
      if (!caseToShare) {
        throw new Error('Case not found');
      }

      const shareData = {
        title: caseToShare.title,
        text: `Check out this case: ${caseToShare.title}`,
        url: `${window.location.origin}/case-law/${caseId}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Case shared successfully');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Case link copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share case');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Case Law Research
        </h1>

        {/* Search Interface */}
        <CaseLawSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          loading={loading}
          userSpecializations={userSpecializations}
        />

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results List */}
          <div className="space-y-4">
            <AnimatePresence>
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 
                           hover:shadow-lg transition-shadow duration-200
                           cursor-pointer"
                  onClick={() => setSelectedCase(result)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {result.citation}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{result.court}</span>
                    <span>•</span>
                    <span>{new Date(result.date).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Selected Case Details */}
          <div className="sticky top-8">
            <AnimatePresence>
              {selectedCase ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CaseLawDetails
                    caseData={selectedCase}
                    onBookmark={handleBookmark}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 
                              text-center text-gray-500 dark:text-gray-400">
                  <p>Select a case to view details</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 