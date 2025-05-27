"use client";

/**
 * Utility functions for managing user session information
 * including first time login status
 */

// Check if this is the user's first login
export const isFirstTimeLogin = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
  return !hasVisitedBefore;
};

// Mark that the user has logged in before
export const markUserVisited = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('hasVisitedBefore', 'true');
};

// Get the user's selected service type
export const getServiceType = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get from cookie first
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('serviceType='))
    ?.split('=')[1];
    
  if (cookieValue) return cookieValue;
  
  // Fallback to localStorage
  return localStorage.getItem('serviceType');
};

// Set the user's selected service type
export const setServiceType = (type: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('serviceType', type);
  // Also set as cookie for cross-page persistence
  document.cookie = `serviceType=${type};path=/;max-age=${7 * 24 * 60 * 60}`; // 7 days
};
