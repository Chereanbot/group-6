export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

export const formatShortDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isDateInPast = (date: Date | string): boolean => {
  return new Date(date) < new Date();
};

export const isDateInFuture = (date: Date | string): boolean => {
  return new Date(date) > new Date();
};

export const addDays = (date: Date | string, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getRelativeTimeString = (date: Date | string): string => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInDays = Math.round(
    (new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.round(
      (new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60)
    );
    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.round(
        (new Date(date).getTime() - now.getTime()) / (1000 * 60)
      );
      return rtf.format(diffInMinutes, 'minute');
    }
    return rtf.format(diffInHours, 'hour');
  }

  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }

  const diffInMonths = Math.round(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }

  return rtf.format(Math.round(diffInMonths / 12), 'year');
}; 