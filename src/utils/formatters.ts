export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const getStatusColor = (status: string): string => {
  const colors = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    SUSPENDED: 'red',
    PENDING: 'yellow'
  };
  return colors[status as keyof typeof colors] || 'gray';
}; 