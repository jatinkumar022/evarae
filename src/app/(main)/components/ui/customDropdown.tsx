import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type Option = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  error?: boolean;
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  className = '',
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-left flex items-center justify-between hover:border-[oklch(0.66_0.14_358.91)]/50 focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:border-[oklch(0.66_0.14_358.91)] transition-all duration-200 ${
            error ? 'border-red-300' : 'border-[oklch(0.84_0.04_10.35)]/40'
          }`}
        >
          <span className="text-gray-900">
            {selectedOption?.label || 'Select...'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
              {options.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-gradient-to-r hover:from-[oklch(0.66_0.14_358.91)]/10 hover:to-[oklch(0.58_0.16_8)]/10 focus:outline-none transition-colors duration-150 ${
                    option.value === value
                      ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)]'
                      : 'text-gray-900'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-[oklch(0.66_0.14_358.91)]" />
                  )}
                </button>
              ))}
            </div>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
