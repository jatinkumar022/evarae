'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import CustomDropdown from './customDropdown';

type CustomDatePickerProps = {
  label?: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  className?: string;
  error?: boolean;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  className = '',
  error = false,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value to get selected date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const selectedDay = selectedDate?.getDate();
  const selectedMonth = selectedDate?.getMonth();
  const selectedYear = selectedDate?.getFullYear();

  // Initialize month/year from selected date or current date
  useEffect(() => {
    if (value && selectedDate && !isNaN(selectedDate.getTime())) {
      // If date comes from backend, pre-select month, year, and day
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      setCurrentYear(year);
      setCurrentMonth(month);
    } else if (!value) {
      // If no date, initialize to current date
      const today = new Date();
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close dropdown when clicking outside (handled by overlay now)

  // Month names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Get current date for limiting future dates
  const today = new Date();
  const currentYearNum = today.getFullYear();
  const currentMonthNum = today.getMonth();
  const currentDayNum = today.getDate();

  // Generate years array (100 years range: 50 years back, 50 years forward)
  // But limit to current year
  // Reverse so latest years appear at bottom (for better UX when selecting DOB)
  const baseYears = Array.from(
    { length: currentYearNum - (currentYearNum - 100) + 1 },
    (_, i) => currentYearNum - 100 + i
  ).filter(year => year <= currentYearNum);

  // If selected year is outside the range, include it in the years array
  let years = [...baseYears];
  if (selectedYear && !years.includes(selectedYear)) {
    if (selectedYear > currentYearNum) {
      // Future year - shouldn't happen for DOB, but handle it
      years = [...years, selectedYear];
    } else if (selectedYear < baseYears[0]) {
      // Very old year - add to beginning
      years = [selectedYear, ...years];
    }
  }

  years = years.reverse(); // Reverse to show latest years at bottom

  // Month options for CustomDropdown - limit to current month if current year
  const monthOptions = monthNames.map((month, index) => ({
    value: String(index),
    label: month,
  }));

  // Year options for CustomDropdown (latest years at bottom)
  const yearOptions = years.map(year => ({
    value: String(year),
    label: String(year),
  }));


  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDateSelect = (e: React.MouseEvent<HTMLButtonElement>, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    const newDate = new Date(currentYear, currentMonth, day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      const newYear = currentYear - 1;
      setCurrentYear(newYear);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    // Don't allow navigating to future months
    if (currentYear === currentYearNum && currentMonth >= currentMonthNum) {
      return; // Already at or past current month
    }

    if (currentMonth === 11) {
      const newYear = currentYear + 1;
      // Don't allow navigating to future years
      if (newYear > currentYearNum) {
        return;
      }
      setCurrentYear(newYear);
      setCurrentMonth(0);
    } else {
      const nextMonth = currentMonth + 1;
      // Don't allow navigating to future months in current year
      if (currentYear === currentYearNum && nextMonth > currentMonthNum) {
        return;
      }
      setCurrentMonth(nextMonth);
    }
  };

  const handleMonthChange = (monthValue: string) => {
    const month = Number(monthValue);
    // If selecting current year, ensure month is not in the future
    if (currentYear === currentYearNum && month > currentMonthNum) {
      setCurrentMonth(currentMonthNum);
    } else {
      setCurrentMonth(month);
    }
  };

  const handleYearChange = (yearValue: string) => {
    const year = Number(yearValue);
    setCurrentYear(year);
    // If selecting current year, ensure month is not in the future
    if (year === currentYearNum && currentMonth > currentMonthNum) {
      setCurrentMonth(currentMonthNum);
    }
  };

  // Check if date is valid for selection
  const isDateValid = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toISOString().split('T')[0];

    // Prevent selecting dates after current date
    const todayString = today.toISOString().split('T')[0];
    if (dateString > todayString) return false;

    // Check if date is in the future compared to current date
    if (currentYear > currentYearNum) return false;
    if (currentYear === currentYearNum && currentMonth > currentMonthNum) return false;
    if (
      currentYear === currentYearNum &&
      currentMonth === currentMonthNum &&
      day > currentDayNum
    )
      return false;

    if (minDate && dateString < minDate) return false;
    if (maxDate && dateString > maxDate) return false;
    return true;
  };

  // Check if date is selected
  const isSelected = (day: number) => {
    return (
      selectedDay === day &&
      selectedMonth === currentMonth &&
      selectedYear === currentYear
    );
  };

  // Format display value
  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Select date';

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-xl border bg-white px-4 py-2 sm:py-3 text-sm text-left flex items-center justify-between hover:border-[oklch(0.66_0.14_358.91)]/50 focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:border-[oklch(0.66_0.14_358.91)] transition-all duration-200 ${
            error
              ? 'border-red-300'
              : 'border-[oklch(0.84_0.04_10.35)]/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span
              className={`${
                selectedDate ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {displayValue}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 right-auto sm:right-auto mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden w-[calc(100vw-50px)] sm:w-[320px] max-w-[320px] sm:max-w-none">
            {/* Header with Month/Year Selectors */}
            <div className="p-2.5 sm:p-4 border-b border-gray-100">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                </button>

                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center min-w-0">
                  {/* Month Dropdown */}
                  <CustomDropdown
                    value={String(currentMonth)}
                    onChange={handleMonthChange}
                    options={monthOptions.filter(option => {
                      // If current year, only show months up to current month
                      if (currentYear === currentYearNum) {
                        return Number(option.value) <= currentMonthNum;
                      }
                      return true;
                    })}
                    className="min-w-0 flex-1 text-xs sm:text-sm"
                    small={true}
                  />

                  {/* Year Dropdown */}
                  <CustomDropdown
                    value={
                      selectedYear && yearOptions.some(opt => opt.value === String(selectedYear))
                        ? String(selectedYear)
                        : String(currentYear)
                    }
                    onChange={handleYearChange}
                    options={yearOptions}
                    className="min-w-0 flex-1 text-xs sm:text-sm"
                    small={true}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-2 sm:p-4">
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="text-[9px] sm:text-xs font-medium text-gray-500 text-center py-1 sm:py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const isValid = isDateValid(day);
                  const isSelectedDay = isSelected(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={e => isValid && handleDateSelect(e, day)}
                      disabled={!isValid}
                      className={`aspect-square text-[11px] sm:text-sm rounded-full transition-all duration-150 flex items-center justify-center relative z-10 ${
                        isSelectedDay
                          ? 'border border-[oklch(0.66_0.14_358.91)] text-[oklch(0.66_0.14_358.91)] font-medium'
                          : isValid
                            ? 'text-[#616161]  hover:bg-gradient-to-r hover:from-[oklch(0.66_0.14_358.91)]/10 hover:to-[oklch(0.58_0.16_8)]/10 hover:text-[oklch(0.66_0.14_358.91)] active:scale-95'
                            : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker;

