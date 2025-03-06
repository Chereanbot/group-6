import { useState, useEffect } from 'react';

export function useLanguage() {
  const [isAmharic, setIsAmharic] = useState(false);

  useEffect(() => {
    // Get language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    setIsAmharic(savedLanguage === 'am');
  }, []);

  const toggleLanguage = () => {
    const newValue = !isAmharic;
    setIsAmharic(newValue);
    localStorage.setItem('language', newValue ? 'am' : 'en');
  };

  return {
    isAmharic,
    toggleLanguage,
  };
} 