import React from 'react';
import { HiOutlineX, HiOutlinePlus, HiOutlineInformationCircle } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

type FormFieldValue = string | string[] | File[];
type FormFieldChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file' | 'tags' | 'date' | 'time' | 'datetime-local';
  value?: FormFieldValue;
  onChange?: (value: FormFieldValue | FormFieldChangeEvent) => void;
  required?: boolean;
  multiple?: boolean;
  options?: Option[];
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  accept?: string;
  min?: string;
  max?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  required,
  multiple,
  options,
  error,
  helpText,
  placeholder,
  disabled,
  className = '',
  accept,
  min,
  max
}) => {
  const [tagInput, setTagInput] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim() && Array.isArray(value) && onChange) {
        const newValue = [...(value as string[]), tagInput.trim()];
        onChange(newValue);
        setTagInput('');
      }
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    if (Array.isArray(value) && onChange) {
      const newValue = (value as string[]).filter(tag => tag !== tagToDelete);
      onChange(newValue);
    }
  };

  const handleFileDelete = (index: number) => {
    if (Array.isArray(value) && onChange) {
      const newValue = (value as File[]).filter((_, i) => i !== index);
      onChange(newValue);
    }
  };

  const labelClasses = `
    text-sm font-medium
    ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}
  `;

  const helpTextClasses = `
    text-xs
    ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}
  `;

  const inputClasses = `
    w-full rounded-lg border transition-all duration-200
    ${isFocused ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-300 dark:border-gray-600'}
    ${error ? 'border-red-500 dark:border-red-500' : ''}
    ${disabled ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
    ${className}
    focus:outline-none
    dark:text-white
    px-4 py-3
  `;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={onChange as (e: FormFieldChangeEvent) => void}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${inputClasses} min-h-[120px] resize-y`}
            required={required}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={onChange as (e: FormFieldChangeEvent) => void}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${inputClasses} appearance-none bg-no-repeat bg-right pr-10`}
            required={required}
            disabled={disabled}
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
              backgroundSize: '1.5rem'
            }}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="file"
                onChange={onChange as (e: FormFieldChangeEvent) => void}
                className={`
                  ${inputClasses}
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-primary-500 file:text-white 
                  hover:file:bg-primary-600
                  file:transition-colors
                  cursor-pointer
                `}
                multiple={multiple}
                accept={accept}
                required={required}
                disabled={disabled}
              />
            </div>
            <AnimatePresence>
              {Array.isArray(value) && value.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap gap-2"
                >
                  {(value as File[]).map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-200">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileDelete(index)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        disabled={disabled}
                      >
                        <HiOutlineX className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={inputClasses}
                placeholder="Type and press Enter to add tags"
                disabled={disabled}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (tagInput.trim() && Array.isArray(value) && onChange) {
                    const newValue = [...(value as string[]), tagInput.trim()];
                    onChange(newValue);
                    setTagInput('');
                  }
                }}
                className={`
                  px-4 rounded-lg bg-primary-500 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-primary-600 transition-colors
                `}
                disabled={!tagInput.trim() || disabled}
              >
                <HiOutlinePlus className="h-5 w-5" />
              </motion.button>
            </div>
            <AnimatePresence>
              {Array.isArray(value) && value.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap gap-2"
                >
                  {(value as string[]).map((tag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 bg-primary-500 text-white rounded-full px-4 py-2"
                    >
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagDelete(tag)}
                        className="text-white/70 hover:text-white transition-colors"
                        disabled={disabled}
                      >
                        <HiOutlineX className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return (
          <input
            type={type}
            value={value as string}
            onChange={onChange as (e: FormFieldChangeEvent) => void}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClasses}
            required={required}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            disabled={disabled}
            min={min}
            max={max}
          />
        );
    }
  };

  return (
    <div className="form-control w-full">
      <label className="flex items-center justify-between mb-2">
        <span className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {helpText && (
          <div className="group relative">
            <HiOutlineInformationCircle 
              className={`h-5 w-5 ${
                disabled 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
              }`} 
            />
            <div className="absolute right-0 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {helpText}
            </div>
          </div>
        )}
      </label>
      {renderField()}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}; 