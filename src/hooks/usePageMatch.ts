"use client";

import { usePathname } from 'next/navigation';

/**
 * Custom hook to check if the current page matches any of the provided paths
 */
export function usePageMatch(paths: string[]): boolean {
  const pathname = usePathname();
  
  if (!pathname) return false;
  
  return paths.some(path => {
    // Exact match
    if (path === pathname) return true;
    
    // Match with wildcard
    if (path.endsWith('*')) {
      const basePath = path.slice(0, -1);
      return pathname.startsWith(basePath);
    }
    
    return false;
  });
}
