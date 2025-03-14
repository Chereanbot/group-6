export const adminStyles = {
  // Layout
  container: "p-6 bg-gray-50 dark:bg-gray-900",
  card: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6",
  section: "mb-6",

  // Headers
  pageHeader: "flex justify-between items-center mb-6",
  pageTitle: "text-2xl font-bold text-gray-900 dark:text-white",
  sectionHeader: "text-lg font-semibold text-gray-900 dark:text-white mb-4",

  // Buttons
  button: {
    base: "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800",
    icon: "p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
  },

  // Forms
  form: {
    group: "mb-4",
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
    input: "w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white",
    select: "w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white",
    error: "text-sm text-red-600 dark:text-red-400 mt-1",
    helper: "text-sm text-gray-500 dark:text-gray-400 mt-1"
  },

  // Tables
  table: {
    container: "overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700",
    table: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
    header: "bg-gray-50 dark:bg-gray-800",
    headerCell: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
    body: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300",
    row: "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
  },

  // Stats
  stats: {
    card: "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
    title: "text-sm font-medium text-gray-500 dark:text-gray-400",
    value: "text-2xl font-semibold text-gray-900 dark:text-white mt-1",
    description: "text-sm text-gray-500 dark:text-gray-400 mt-1"
  },

  // Loading
  loading: {
    container: "flex justify-center items-center h-64",
    spinner: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"
  },

  // Filters
  filters: {
    container: "flex flex-wrap gap-4 mb-6",
    group: "flex items-center gap-2",
    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
    input: "rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white"
  },

  // Pagination
  pagination: {
    container: "flex items-center justify-between mt-6",
    button: "px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    active: "bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-600 dark:text-primary-400",
    disabled: "opacity-50 cursor-not-allowed"
  }
}; 