import React from 'react';

interface CitationNetworkProps {
  caseId: string;
  citations: string[];
  citedBy: string[];
}

export const CitationNetwork: React.FC<CitationNetworkProps> = ({
  caseId,
  citations,
  citedBy
}) => {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Citations</h4>
        <div className="space-y-2">
          {citations.map(cite => (
            <div 
              key={cite}
              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <p className="text-green-700 dark:text-green-300">{cite}</p>
            </div>
          ))}
          {citations.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No citations found</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Cited By</h4>
        <div className="space-y-2">
          {citedBy.map(cite => (
            <div 
              key={cite}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <p className="text-blue-700 dark:text-blue-300">{cite}</p>
            </div>
          ))}
          {citedBy.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No citations found</p>
          )}
        </div>
      </div>
    </div>
  );
}; 