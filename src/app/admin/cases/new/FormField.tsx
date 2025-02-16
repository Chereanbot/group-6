import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface FormFieldProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: IconType;
  type?: string;
  error?: string;
  className?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  type = 'text',
  error,
  className = '',
  helpText,
  size = 'md',
}: FormFieldProps) {
  const inputSizes = {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-1 ${className}`}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors" />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full rounded-lg 
            ${Icon ? 'pl-10' : 'pl-4'} pr-4
            ${inputSizes[size]}
            border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
            focus:border-primary-500 dark:focus:border-primary-400
            disabled:bg-gray-50 dark:disabled:bg-gray-800
            disabled:text-gray-500 dark:disabled:text-gray-400
            disabled:border-gray-200 dark:disabled:border-gray-700
            transition-colors duration-200
            ${error ? 'border-red-500 dark:border-red-400' : ''}
          `}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {(error || helpText) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm ${
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {error || helpText}
        </motion.p>
      )}
    </motion.div>
  );
} 