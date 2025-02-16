interface FormFieldProps {
  label: string;
  icon?: React.ElementType;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function FormField({
  label,
  icon: Icon,
  required,
  type = 'text',
  value,
  onChange,
  placeholder
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`block w-full ${
            Icon ? 'pl-10' : 'pl-3'
          } pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400
            disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200
            dark:disabled:bg-gray-900 dark:disabled:text-gray-400`}
        />
      </div>
    </div>
  );
} 