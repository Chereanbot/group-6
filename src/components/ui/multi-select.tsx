"use client";

import { useState, useRef, useEffect } from 'react';
import { HiCheck, HiSelector } from 'react-icons/hi';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function MultiSelect({ options, value, onChange, className = "" }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {value.length === 0 ? (
              <span className="text-gray-500 dark:text-gray-400">Select options...</span>
            ) : (
              value.map(v => {
                const option = options.find(o => o.value === v);
                return option ? (
                  <span
                    key={v}
                    className="bg-primary-100 text-primary-800 text-sm rounded-full px-2 py-0.5"
                  >
                    {option.label}
                  </span>
                ) : null;
              })
            )}
          </div>
          <HiSelector className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
          {options.map(option => (
            <div
              key={option.value}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => toggleOption(option.value)}
            >
              <div className="flex-shrink-0 w-5">
                {value.includes(option.value) && (
                  <HiCheck className="h-5 w-5 text-primary-600" />
                )}
              </div>
              <span className="ml-2">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 