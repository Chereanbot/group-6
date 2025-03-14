import { HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi';

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
}

interface CaseTimelineProps {
  cases: Case[];
}

export function CaseTimeline({ cases }: CaseTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <HiOutlineExclamation className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <HiOutlineExclamation className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <HiOutlineExclamation className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {cases.map((caseItem, caseIdx) => (
          <li key={caseItem.id}>
            <div className="relative pb-8">
              {caseIdx !== cases.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                    {getPriorityIcon(caseItem.priority)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {caseItem.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={caseItem.updatedAt}>
                      <HiOutlineClock className="inline w-4 h-4 mr-1" />
                      {new Date(caseItem.updatedAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 