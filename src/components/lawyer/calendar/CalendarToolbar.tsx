import { NavigateAction } from 'react-big-calendar';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface Props {
  onNavigate: (action: NavigateAction) => void;
  onView: (view: string) => void;
  date: Date;
  view: string;
}

export function CalendarToolbar({ onNavigate, onView, date, view }: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold ml-4">
          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      <div className="flex gap-2">
        {['month', 'week', 'day', 'agenda'].map((viewType) => (
          <button
            key={viewType}
            onClick={() => onView(viewType)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              view === viewType
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
} 