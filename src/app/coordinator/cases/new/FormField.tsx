import React from 'react';
import { HiOutlineX, HiOutlinePlus } from 'react-icons/hi';

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file' | 'tags' | 'date' | 'time' | 'datetime-local';
  value?: string | string[] | File[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string[]) => void;
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

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim() && Array.isArray(value) && typeof onChange === 'function') {
        onChange([...(value as string[]), tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    if (Array.isArray(value) && typeof onChange === 'function') {
      onChange(value.filter((tag: string) => tag !== tagToDelete));
    }
  };

  const renderField = () => {
    const baseInputClasses = `w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
      error ? 'border-red-500' : ''
    } ${disabled ? 'bg-gray-100' : ''} ${className}`;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
            className={`${baseInputClasses} min-h-[100px]`}
            required={required}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
            className={baseInputClasses}
            required={required}
            disabled={disabled}
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
          <div className="space-y-2">
            <input
              type="file"
              onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
              className={`${baseInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark`}
              multiple={multiple}
              accept={accept}
              required={required}
              disabled={disabled}
            />
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(value as File[]).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1"
                  >
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (Array.isArray(value) && typeof onChange === 'function') {
                          onChange(value.filter((_, i) => i !== index));
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <HiOutlineX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className={baseInputClasses}
                placeholder="Type and press Enter to add tags"
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => {
                  if (tagInput.trim() && Array.isArray(value) && typeof onChange === 'function') {
                    onChange([...(value as string[]), tagInput.trim()]);
                    setTagInput('');
                  }
                }}
                className="btn btn-primary btn-square"
                disabled={!tagInput.trim() || disabled}
              >
                <HiOutlinePlus className="h-5 w-5" />
              </button>
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-primary text-white rounded px-3 py-1"
                  >
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleTagDelete(tag)}
                      className="text-white hover:text-red-200"
                      disabled={disabled}
                    >
                      <HiOutlineX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type={type}
            value={value as string}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            className={baseInputClasses}
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
      <label className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      {renderField()}
      {(error || helpText) && (
        <div className="mt-1">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {helpText && <p className="text-gray-500 text-sm">{helpText}</p>}
        </div>
      )}
    </div>
  );
}; 