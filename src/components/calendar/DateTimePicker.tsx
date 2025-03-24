import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, ChevronRight, Clock, Calendar, Check } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, setHours, setMinutes, getHours, getMinutes } from 'date-fns';

interface DateTimePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  label?: string;
  showTimeSelect?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  centered?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  onChange,
  placeholder = 'Select Date',
  minDate,
  label,
  showTimeSelect = true,
  iconLeft,
  iconRight,
  centered = true,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [view, setView] = useState<'date' | 'time'>('date');
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Generate days for the current month view
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };
  
  const daysInMonth = getDaysInMonth(currentMonth);
  const startDay = getDay(startOfMonth(currentMonth));
  
  // Hours and minutes for time selection
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  
  // Handle outside click to close the picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Navigation functions
  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Date selection handler
  const handleDateSelect = (day: Date, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newDate = new Date(selectedDate);
    newDate.setFullYear(day.getFullYear());
    newDate.setMonth(day.getMonth());
    newDate.setDate(day.getDate());
    
    onChange(newDate);
    
    if (showTimeSelect) {
      setView('time');
    } else {
      setIsOpen(false);
    }
  };
  
  // Time selection handlers
  const handleHourSelect = (hour: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newDate = setHours(selectedDate, hour);
    onChange(newDate);
  };
  
  const handleMinuteSelect = (minute: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newDate = setMinutes(selectedDate, minute);
    onChange(newDate);
    setIsOpen(false);
  };
  
  const handleViewChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setView('date');
  };
  
  const handleNextOrDone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (view === 'date' && showTimeSelect) {
      setView('time');
    } else {
      setIsOpen(false);
    }
  };
  
  // Helper function to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    return date < minDate;
  };
  
  // Color and style classes
  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverClass = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  return (
    <div 
      className="relative" 
      ref={pickerRef} 
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Input Display */}
        <button
          type="button"
          onClick={handleButtonClick}
          className={`
            w-full py-2 px-3 pr-9 rounded-lg
            ${inputBgClass} ${textClass}
            focus:outline-none focus:ring-2 focus:ring-blue-500
            border ${borderClass}
            text-left truncate
          `}
        >
          {selectedDate
            ? format(selectedDate, showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy')
            : placeholder}
        </button>
        
        {/* Left Icon */}
        {iconLeft && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {iconLeft}
          </div>
        )}
        
        {/* Right Icon */}
        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${mutedTextClass}`}>
          {iconRight || <Calendar size={16} />}
        </div>
      </div>
      
      {/* Date Picker Dropdown - Centered or attached to input */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            z-40 ${bgClass} rounded-lg shadow-xl border ${borderClass}
            animate-fadeIn overflow-hidden w-64
            ${centered 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : 'absolute mt-1'
            }
          `}
        >
          {/* Header with navigation */}
          <div className={`px-3 py-2 flex justify-between items-center border-b ${borderClass}`}>
            {view === 'date' ? (
              <>
                <button
                  type="button"
                  onClick={prevMonth}
                  className={`p-1 rounded-full ${hoverClass} ${mutedTextClass}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className={`text-sm font-medium ${textClass}`}>
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                  type="button"
                  onClick={nextMonth}
                  className={`p-1 rounded-full ${hoverClass} ${mutedTextClass}`}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleViewChange}
                  className={`p-1 rounded-full ${hoverClass} ${mutedTextClass} flex items-center`}
                >
                  <ChevronLeft size={16} />
                  <span className="ml-1">Back</span>
                </button>
                <h3 className={`text-sm font-medium ${textClass}`}>
                  {label || 'Select Time'}
                </h3>
                <div className="w-6"></div> {/* Empty space for alignment */}
              </>
            )}
          </div>
          
          {/* Calendar View */}
          {view === 'date' && (
            <div className="p-2">
              {/* Day names row */}
              <div className="grid grid-cols-7 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className={`text-center text-xs ${mutedTextClass} py-1`}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for start of month */}
                {Array.from({ length: startDay }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-8"></div>
                ))}
                
                {/* Day cells */}
                {daysInMonth.map(day => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isDisabled = isDateDisabled(day);
                  const isCurrent = isToday(day);
                  
                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      onClick={(e) => !isDisabled && handleDateSelect(day, e)}
                      disabled={isDisabled}
                      className={`
                        flex items-center justify-center h-8 w-8 rounded-full mx-auto
                        ${isSelected
                          ? 'bg-blue-500 text-white'
                          : isCurrent
                            ? isDarkMode ? 'border border-blue-500 text-blue-400' : 'border border-blue-500 text-blue-600'
                            : `${textClass} ${hoverClass}`
                        }
                        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Time View */}
          {view === 'time' && (
            <div className="p-3">
              <div className="flex flex-col items-center">
                {/* Current time display */}
                <div className="mb-3 text-center">
                  <h3 className={`text-xl font-medium ${textClass}`}>
                    {format(selectedDate, 'h:mm aa')}
                  </h3>
                  <p className={`text-xs ${mutedTextClass}`}>Click on the clock to select time</p>
                </div>
                
                {/* Interactive Clock */}
                <div className="relative mb-4">
                  {/* Clock face */}
                  <div className={`
                    w-52 h-52 rounded-full
                    ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    relative flex items-center justify-center
                    border ${borderClass}
                  `}>
                    {/* Clock center and hands container */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Hour hand */}
                      <div 
                        className="absolute h-24 flex justify-center z-10"
                        style={{
                          transform: `rotate(${(getHours(selectedDate) % 12) * 30}deg)`
                        }}
                      >
                        <div className="w-1.5 h-[40%] bg-blue-500 rounded-full shadow-sm"></div>
                      </div>
                      
                      {/* Minute hand */}
                      <div 
                        className="absolute h-24 flex justify-center z-10"
                        style={{
                          transform: `rotate(${getMinutes(selectedDate) * 6}deg)`
                        }}
                      >
                        <div className="w-1 h-[60%] bg-blue-400 rounded-full shadow-sm"></div>
                      </div>
                      
                      {/* Clock center dot */}
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md z-20"></div>
                    </div>
                    
                    {/* Hours markers */}
                    {[...Array(12)].map((_, index) => {
                      const hour = index === 0 ? 12 : index;
                      const angle = index * 30;
                      const radians = angle * (Math.PI / 180);
                      const x = Math.sin(radians) * 80;
                      const y = -Math.cos(radians) * 80;
                      const isCurrentHour = (getHours(selectedDate) % 12 || 12) === hour;
                      
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newHour = hour === 12 ? 
                              (getHours(selectedDate) >= 12 ? 12 : 0) : 
                              (getHours(selectedDate) >= 12 ? hour + 12 : hour);
                            const newDate = setHours(selectedDate, newHour);
                            onChange(newDate);
                          }}
                          className={`
                            absolute w-8 h-8 rounded-full flex items-center justify-center
                            text-sm font-medium transition-colors duration-150
                            ${isCurrentHour 
                              ? 'bg-blue-500 text-white' 
                              : `${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} ${textClass}`
                            }
                          `}
                          style={{
                            transform: `translate(${x}px, ${y}px)`
                          }}
                        >
                          {hour}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* AM/PM Toggle */}
                <div className="mb-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentHour = getHours(selectedDate);
                      const newHour = currentHour >= 12 ? currentHour - 12 : currentHour;
                      onChange(setHours(selectedDate, newHour));
                    }}
                    className={`
                      py-1 px-3 rounded-md text-sm
                      ${getHours(selectedDate) < 12 
                        ? 'bg-blue-500 text-white' 
                        : `${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${textClass}`
                      }
                    `}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentHour = getHours(selectedDate);
                      const newHour = currentHour < 12 ? currentHour + 12 : currentHour;
                      onChange(setHours(selectedDate, newHour));
                    }}
                    className={`
                      py-1 px-3 rounded-md text-sm
                      ${getHours(selectedDate) >= 12 
                        ? 'bg-blue-500 text-white' 
                        : `${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${textClass}`
                      }
                    `}
                  >
                    PM
                  </button>
                </div>
                
                {/* Minute slider with interactive labels */}
                <div className="w-full mb-4">
                  <div className="flex justify-between text-xs mb-1 px-6">
                    {[0, 15, 30, 45, 59].map(minute => (
                      <button
                        key={minute}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange(setMinutes(selectedDate, minute));
                        }}
                        className={`
                          py-1 px-1.5 rounded-md relative
                          ${getMinutes(selectedDate) === minute 
                            ? 'text-blue-500 font-medium' 
                            : mutedTextClass
                          }
                          transition-all duration-150
                          hover:text-blue-500 hover:scale-110
                          hover:font-medium hover:-translate-y-0.5
                          focus:outline-none
                          group
                        `}
                      >
                        <span>{minute}</span>
                        <span className={`
                          absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
                          ${getMinutes(selectedDate) === minute 
                            ? 'bg-blue-500' 
                            : 'bg-transparent group-hover:bg-blue-500/50'
                          }
                          transition-all duration-150
                        `}></span>
                      </button>
                    ))}
                  </div>

                  <div className="relative pt-2 flex justify-center">
                    <div className="w-[calc(100%-53px)] relative ml-[-6px]">
                      <input
                        type="range"
                        min="0"
                        max="59"
                        value={getMinutes(selectedDate)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const minute = parseInt(e.target.value);
                          onChange(setMinutes(selectedDate, minute));
                        }}
                        className="slider-time w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer with actions */}
          <div className={`px-3 py-2 border-t ${borderClass} flex justify-end`}>
            <button
              type="button"
              onClick={handleNextOrDone}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
            >
              {view === 'date' ? (showTimeSelect ? 'Next' : 'Done') : 'Done'}
            </button>
          </div>
          
          {/* Add a backdrop for the centered mode */}
          {centered && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 -z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker; 