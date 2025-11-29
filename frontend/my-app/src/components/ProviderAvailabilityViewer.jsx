import React, { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

// Helper function to format date as YYYY-MM-DD for comparison
// Moved outside component to avoid redefinition on every render
const formatDateString = (date) => {
    // Create a new Date object to avoid modifying the original
    const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // Set to noon to avoid any timezone issues
        0,
        0,
        0
    );

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// Component to display provider availability for family members with Tailwind CSS
const ProviderAvailabilityViewer = ({ providerId, selectedDate: initialSelectedDate, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(initialSelectedDate || null);
    
    // Use ref to track the last processed initialSelectedDate to prevent infinite loops
    const lastProcessedInitialDate = useRef(null);

    // Store onDateSelect in a ref to avoid dependency issues
    const onDateSelectRef = useRef(onDateSelect);
    useEffect(() => {
        onDateSelectRef.current = onDateSelect;
    }, [onDateSelect]);

    // Update selectedDate if initialSelectedDate changes (when navigating back)
    // But only if the date is available
    useEffect(() => {
        // Skip if no initialSelectedDate or if we've already processed this date
        if (!initialSelectedDate) {
            lastProcessedInitialDate.current = null;
            return;
        }
        
        // Check if we've already processed this exact date
        const dateStr = formatDateString(new Date(initialSelectedDate));
        if (lastProcessedInitialDate.current === dateStr) {
            return; // Already processed, skip to prevent infinite loop
        }
        
        const date = new Date(initialSelectedDate);
        // Check if the date is unavailable before setting it
        const isUnavailable = unavailableDates.some(unavailableDate =>
            unavailableDate.dateStr === dateStr
        );
        
        // Only update if the selected date actually changed
        setSelectedDate(prevDate => {
            const prevDateStr = prevDate ? formatDateString(prevDate) : null;
            if (prevDateStr === dateStr) {
                lastProcessedInitialDate.current = dateStr;
                return prevDate; // Already set to this date, no need to update
            }
            
            if (!isUnavailable) {
                // Also set the calendar month to show the selected date
                setCurrentMonth(new Date(date));
                // Notify parent that date is available
                if (onDateSelectRef.current) {
                    onDateSelectRef.current(date, true);
                }
                lastProcessedInitialDate.current = dateStr;
                return date;
            } else {
                // Clear selection if the date is unavailable
                logger.warn('Initial selected date is unavailable, clearing selection', {
                    date: dateStr,
                    reason: unavailableDates.find(ud => ud.dateStr === dateStr)?.reason
                });
                // Notify parent that date is unavailable
                if (onDateSelectRef.current) {
                    onDateSelectRef.current(null, false);
                }
                lastProcessedInitialDate.current = dateStr;
                return null;
            }
        });
    }, [initialSelectedDate, unavailableDates]);

    // Fetch unavailable dates from the server
    useEffect(() => {
        if (!providerId) return;

        const fetchUnavailableDates = async () => {
            setIsLoading(true);
            try {
                // Calculate the date range for this month and next 2 months
                const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0);

                const startDateStr = formatDateString(startDate);
                const endDateStr = formatDateString(endDate);

                const apiUrl = `/api/backend/manageProviderAvailability?provider_id=${providerId}&start_date=${startDateStr}&end_date=${endDateStr}`;

                logger.debug('Fetching provider availability', {
                    providerId,
                    dateRange: `${startDateStr} to ${endDateStr}`,
                    apiUrl
                });

                const response = await fetch(apiUrl);

                // Check if response is ok before attempting to parse JSON
                if (!response.ok) {
                    logger.error('HTTP error fetching availability', {
                        status: response.status,
                        statusText: response.statusText,
                        providerId
                    });
                    const responseText = await response.text();
                    logger.error('Response body', { responseText });
                    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Handle standardized API response format: { success: true, data: { unavailable_dates: [...] } }
                    const unavailableDates = data.data?.unavailable_dates || data.unavailable_dates || [];

                    // Process dates consistently
                    const unavailableDatesMap = unavailableDates.map(item => {
                        // Extract date string (should be YYYY-MM-DD format)
                        let dateStr = item.date;
                        if (typeof dateStr !== 'string') {
                            dateStr = String(dateStr);
                        }
                        // Remove any time portion if present
                        dateStr = dateStr.split('T')[0].split(' ')[0];
                        
                        // Parse the date and create a new local date to avoid timezone issues
                        const dateParts = dateStr.split('-');
                        if (dateParts.length !== 3) {
                            logger.error('Invalid date format from API', { date: item.date, dateStr });
                            return null;
                        }
                        
                        const year = parseInt(dateParts[0], 10);
                        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-based in JS Date
                        const day = parseInt(dateParts[2], 10);
                        
                        // Validate parsed values
                        if (isNaN(year) || isNaN(month) || isNaN(day)) {
                            logger.error('Failed to parse date parts', { date: item.date, dateStr, dateParts });
                            return null;
                        }
                        
                        const date = new Date(year, month, day, 12, 0, 0, 0); // Create with noon time
                        const formattedDateStr = formatDateString(date);

                        logger.debug('Processing unavailable date', {
                            original: item.date,
                            dateStr: dateStr,
                            parsed: { year, month: month + 1, day },
                            formatted: formattedDateStr,
                            reason: item.reason
                        });

                        return {
                            date: date,
                            dateStr: formattedDateStr, // Use our consistent formatter
                            reason: item.reason
                        };
                    }).filter(item => item !== null); // Remove any null entries from parsing errors

                    setUnavailableDates(unavailableDatesMap);
                } else {
                    logger.error('Error fetching unavailable dates', {
                        message: data.error?.message || data.message,
                        error: data.error
                    });
                    setUnavailableDates([]);
                }
            } catch (error) {
                logger.error('Error fetching provider availability', {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    providerId
                });
                setUnavailableDates([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUnavailableDates();
    }, [providerId, currentMonth]);

    // Re-validate selected date when unavailable dates are loaded or change
    useEffect(() => {
        if (selectedDate && unavailableDates.length > 0) {
            const dateStr = formatDateString(selectedDate);
            const isUnavailable = unavailableDates.some(unavailableDate =>
                unavailableDate.dateStr === dateStr
            );
            
            if (isUnavailable) {
                logger.warn('Selected date became unavailable after loading availability data', {
                    date: dateStr,
                    reason: unavailableDates.find(ud => ud.dateStr === dateStr)?.reason
                });
                // Clear the selection and notify parent
                setSelectedDate(null);
                if (onDateSelect) {
                    onDateSelect(null, false);
                }
            } else {
                // Ensure parent knows date is available
                if (onDateSelect) {
                    onDateSelect(selectedDate, true);
                }
            }
        }
    }, [unavailableDates, selectedDate]);

    // Navigate to previous month
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Navigate to next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Check if a date is unavailable
    const isDateUnavailable = (date) => {
        const dateStr = formatDateString(date);
        return unavailableDates.some(unavailableDate =>
            unavailableDate.dateStr === dateStr
        );
    };

    // Get the reason for an unavailable date
    const getDateReason = (date) => {
        const dateStr = formatDateString(date);
        const match = unavailableDates.find(unavailableDate =>
            unavailableDate.dateStr === dateStr
        );
        return match ? match.reason : '';
    };

    // Handle date click
    const handleDateClick = (day, event) => {
        // Prevent default behavior and stop propagation for unavailable dates
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Ignore past dates and unavailable dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create a new Date object at noon to avoid timezone issues
        const clickedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0);

        // Check if date is unavailable
        if (isDateUnavailable(clickedDate)) {
            const reason = getDateReason(clickedDate);
            logger.warn('Attempted to select unavailable date', {
                date: formatDateString(clickedDate),
                reason: reason || 'No reason provided'
            });
            // Show alert to user
            alert(`This date is not available. ${reason ? `Reason: ${reason}` : 'Please select another date.'}`);
            return;
        }

        // Early return for past dates
        if (clickedDate < today) {
            alert('Cannot select past dates. Please select a future date.');
            return;
        }

        setSelectedDate(clickedDate);

        // Pass the selected date to the parent component if callback exists
        // Also pass availability status (true for available dates)
        if (onDateSelect) {
            onDateSelect(clickedDate, true);
        }
    };

    // Generate calendar grid
    const generateCalendarDays = () => {
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();

        // Get the first day of the month
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Calculate the number of blank spaces needed at the start of the calendar
        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...

        // Create array for all days
        const calendarDays = [];

        // Add blank spaces for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-12"></div>);
        }

        // Add days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            // Create date with noon time to avoid any timezone issues
            const date = new Date(year, month, day, 12, 0, 0, 0);
            const dateStr = formatDateString(date);
            const isToday = date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
            const isPastDate = date < today;

            const unavailable = isDateUnavailable(date);
            const isSelected = selectedDate &&
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear();
            const reason = getDateReason(date);

            // Determine if date is clickable
            const isClickable = !isPastDate && !unavailable;

            calendarDays.push(
                <div
                    key={dateStr}
                    className={`
            h-12 border border-gray-200 flex items-center justify-center relative transition-colors
            ${isClickable ? 'cursor-pointer hover:bg-green-50 hover:border-green-200' : 'cursor-not-allowed opacity-75'}
            ${isToday ? 'bg-blue-50 border-blue-200 font-semibold' : ''}
            ${unavailable ? 'bg-red-50 text-red-600 border-red-200' : ''}
            ${isSelected ? 'bg-green-100 text-green-800 border-green-300' : ''}
            ${isPastDate ? 'bg-gray-50 text-gray-400' : ''}
          `}
                    onClick={(e) => {
                        if (isClickable) {
                            handleDateClick(date, e);
                        } else {
                            e.preventDefault();
                            e.stopPropagation();
                            // Show alert for unavailable dates
                            if (unavailable) {
                                const unavailableReason = getDateReason(date);
                                alert(`This date is not available. ${unavailableReason ? `Reason: ${unavailableReason}` : 'Please select another date.'}`);
                            } else if (isPastDate) {
                                alert('Cannot select past dates. Please select a future date.');
                            }
                        }
                    }}
                    onMouseDown={(e) => {
                        if (!isClickable) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    title={unavailable && reason ? `Not Available: ${reason}` : isPastDate ? 'Past date - Cannot select' : isClickable ? 'Available for booking - Click to select' : 'Not available'}
                >
                    <span className="text-sm">{day}</span>
                    {unavailable && <span className="absolute top-1 right-1 text-xs text-red-500 font-bold">✕</span>}
                </div>
            );
        }

        return calendarDays;
    };

    // Get month name
    const getMonthName = (date) => {
        return date.toLocaleString('default', { month: 'long' });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Availability</h2>
                <p className="text-gray-600">Select an available date to book with this provider.</p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={prevMonth}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    ← Previous
                </button>
                <h3 className="text-xl font-semibold text-gray-900">
                    {getMonthName(currentMonth)} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Next →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="h-8 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-100">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden relative">
                    {isLoading ? (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                                <p className="text-sm text-gray-600">Loading calendar...</p>
                            </div>
                        </div>
                    ) : generateCalendarDays()}
                </div>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (() => {
                const isUnavailable = isDateUnavailable(selectedDate);
                const unavailableReason = isUnavailable ? getDateReason(selectedDate) : null;
                
                return (
                    <div className={`mb-6 p-4 rounded-lg border-2 ${
                        isUnavailable 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-green-50 border-green-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                    isUnavailable ? 'text-red-800' : 'text-green-800'
                                }`}>
                                    Selected Date:
                                </p>
                                <p className={`text-lg font-semibold ${
                                    isUnavailable ? 'text-red-900' : 'text-green-900'
                                }`}>
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {isUnavailable ? (
                                    <div className="mt-2">
                                        <p className="text-xs text-red-700 font-semibold">
                                            ⚠️ This date is NOT available!
                                        </p>
                                        {unavailableReason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Reason: {unavailableReason}
                                            </p>
                                        )}
                                        <p className="text-xs text-red-600 mt-1">
                                            Please select a different date to continue.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-green-700 mt-1">
                                        ✓ Date confirmed. Scroll down to continue.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-white border border-gray-200 mr-2 rounded"></div>
                    <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 mr-2 rounded"></div>
                    <span className="text-gray-600">Unavailable</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 mr-2 rounded"></div>
                    <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 mr-2 rounded"></div>
                    <span className="text-gray-600">Today</span>
                </div>
            </div>
        </div>
    );
};

// Default props
ProviderAvailabilityViewer.defaultProps = {
    onDateSelect: null
};

export default ProviderAvailabilityViewer;
