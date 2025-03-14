import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { HiOutlineCog, HiOutlineViewGrid, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface DashboardPreferences {
  sections: DashboardSection[];
  layout: 'compact' | 'comfortable';
  theme: 'light' | 'dark' | 'system';
}

const defaultSections: DashboardSection[] = [
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'Shortcuts to frequently used actions',
    enabled: true,
  },
  {
    id: 'stats-cards',
    title: 'Statistics Overview',
    description: 'Key metrics and numbers',
    enabled: true,
  },
  {
    id: 'case-distribution',
    title: 'Case Distribution',
    description: 'Visual representation of case categories',
    enabled: true,
  },
  {
    id: 'performance-metrics',
    title: 'Performance Metrics',
    description: 'Performance and efficiency indicators',
    enabled: true,
  },
  {
    id: 'resource-utilization',
    title: 'Resource Utilization',
    description: 'Resource usage and allocation',
    enabled: true,
  },
  {
    id: 'recent-activities',
    title: 'Recent Activities',
    description: 'Latest system activities and updates',
    enabled: true,
  },
];

export default function DashboardCustomizer() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-preferences');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      sections: defaultSections,
      layout: 'comfortable',
      theme: 'system',
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleSection = (sectionId: string) => {
    setPreferences(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, enabled: !section.enabled } : section
      ),
    }));
  };

  const updateLayout = (layout: 'compact' | 'comfortable') => {
    setPreferences(prev => ({ ...prev, layout }));
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <HiOutlineCog className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="ml-2 text-xl font-semibold">Dashboard Customization</h2>
        </div>

        {/* Layout Preferences */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Layout Density</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => updateLayout('comfortable')}
              className={`px-4 py-2 rounded-lg ${
                preferences.layout === 'comfortable'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() => updateLayout('compact')}
              className={`px-4 py-2 rounded-lg ${
                preferences.layout === 'compact'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          <div className="flex space-x-4">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateTheme(theme)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  preferences.theme === theme
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Section Visibility */}
        <div>
          <h3 className="text-lg font-medium mb-4">Visible Sections</h3>
          <div className="grid gap-4">
            {preferences.sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>
                <Switch
                  checked={section.enabled}
                  onChange={() => toggleSection(section.id)}
                  className={`${
                    section.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      section.enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 