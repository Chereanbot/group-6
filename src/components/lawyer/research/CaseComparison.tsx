import React from 'react';

interface CaseComparisonProps {
  cases: CaseLaw[];
}

export const CaseComparison: React.FC<CaseComparisonProps> = ({ cases }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left">
              Feature
            </th>
            {cases.map(case_ => (
              <th key={case_.id} className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                {case_.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {['Court', 'Date', 'Holdings', 'Reasoning'].map(feature => (
            <tr key={feature}>
              <td className="px-6 py-4 font-medium">{feature}</td>
              {cases.map(case_ => (
                <td key={case_.id} className="px-6 py-4">
                  {case_[feature.toLowerCase()]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 