"use client";

import React from 'react';
import { 
  HiOutlineBookmark,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineTag
} from 'react-icons/hi';

interface CaseLawDetailsProps {
  caseData: {
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
    bookmarked: boolean;
  };
  onBookmark: (id: string) => void;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
}

export const CaseLawDetails: React.FC<CaseLawDetailsProps> = ({
  caseData,
  onBookmark,
  onDownload,
  onShare
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {caseData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {caseData.citation}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" />
              {new Date(caseData.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineScale className="w-4 h-4" />
              {caseData.court}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onBookmark(caseData.id)}
            className={`p-2 rounded-lg transition-colors ${
              caseData.bookmarked 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <HiOutlineBookmark className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDownload(caseData.id)}
            className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
          >
            <HiOutlineDownload className="w-5 h-5" />
          </button>
          <button
            onClick={() => onShare(caseData.id)}
            className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
          >
            <HiOutlineShare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Case Details */}
      <div className="space-y-6">
        {/* Parties */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Parties</h3>
          <div className="flex gap-2">
            {caseData.parties.map((party, index) => (
              <React.Fragment key={party}>
                <span className="text-gray-700 dark:text-gray-300">{party}</span>
                {index < caseData.parties.length - 1 && (
                  <span className="text-gray-400">v.</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Judges */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Judges</h3>
          <div className="flex flex-wrap gap-2">
            {caseData.judges.map(judge => (
              <span 
                key={judge}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
              >
                {judge}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {caseData.summary}
          </p>
        </div>

        {/* Holdings */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Holdings</h3>
          <ul className="list-disc pl-5 space-y-2">
            {caseData.holdings.map(holding => (
              <li key={holding} className="text-gray-700 dark:text-gray-300">
                {holding}
              </li>
            ))}
          </ul>
        </div>

        {/* Reasoning */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Reasoning</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {caseData.reasoning}
          </p>
        </div>

        {/* Full Content */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Full Text</h3>
          <div className="prose dark:prose-invert max-w-none">
            {caseData.content}
          </div>
        </div>

        {/* Citations */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Citations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {caseData.citations.map(citation => (
              <li key={citation} className="text-gray-700 dark:text-gray-300">
                {citation}
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {caseData.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
              >
                <HiOutlineTag className="w-4 h-4" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 