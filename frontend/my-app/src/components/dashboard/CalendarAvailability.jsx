import React, { useState, useEffect } from 'react';

// Calendar component for managing provider availability with Tailwind CSS
const CalendarAvailability = ({ providerId, onAvailabilityChange = () => {} }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState('single'); // 'single', 'range', or 'multiple'
  const [selectionStart, setSelectionStart] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [reason, setReason] = useState('');
  const [localProviderId, setLocalProviderId] = useState(providerId);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [stats, setStats] = useState({
    totalUnavailable: 0,
    thisMonth: 0,
    nextMonth: 0
  });

  // Handle case where providerId may be undefined on re-render
  useEffect(() => {
    // Get provider_id from localStorage if needed
    if (!providerId && !localProviderId) {
      const userStr = localStorage.getItem('user');
      const providerStr = localStorage.getItem('provider');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Retrieved user from localStorage:', user);
          
          if (providerStr) {
            try {
              const provider = JSON.parse(providerStr);
              console.log('Retrieved provider from localStorage:', provider);
              
              if (provider?.provider_id) {
                console.log('Using provider_id from localStorage:', provider.provider_id);
                setLocalProviderId(provider.provider_id);
              }
            } catch (e) {
              console.error('Error parsing provider from localStorage:', e);
            }
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    } else if (providerId && providerId !== localProviderId) {
      setLocalProviderId(providerId);
    }
  }, [providerId, localProviderId]);

  // Show message function
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  
  // Fetch unavailable dates from the server
  useEffect(() => {
    if (!localProviderId) {
      console.log('No provider ID available, skipping fetch');
      
      // Try to recover provider ID from localStorage if needed
      const providerStr = localStorage.getItem('provider');
      if (providerStr) {
        try {
          const provider = JSON.parse(providerStr);
          if (provider?.provider_id) {
            console.log('Recovered provider_id from localStorage:', provider.provider_id);
            setLocalProviderId(provider.provider_id);
            return;
          }
        } catch (e) {
          console.error('Error parsing provider from localStorage:', e);
        }
      }
      
      return;
    }
    
    const fetchUnavailableDates = async () => {
      setIsLoading(true);
      
      try {
        // Calculate the date range for this month and next 2 months
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0);
        
        const startDateStr = formatDateString(startDate);
        const endDateStr = formatDateString(endDate);
        
        console.log(`Fetching availability for provider ID: ${localProviderId}`);
        console.log(`Date range: ${startDateStr} to ${endDateStr}`);
        
        const apiUrl = `/api/backend/manageProviderAvailability?provider_id=${localProviderId}&start_date=${startDateStr}&end_date=${endDateStr}`;
        console.log('API URL for fetching:', apiUrl);
        
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
          console.error('HTTP Error Response:', response.status, response.statusText);
          const responseText = await response.text();
          console.error('Response body:', responseText);
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Handle standardized API response format: data is nested under data.data
          const responseData = data.data || data;
          const unavailableDatesArray = Array.isArray(responseData?.unavailable_dates) 
            ? responseData.unavailable_dates 
            : [];
          
          // Process dates consistently - FIX: Create dates with exact time to avoid timezone issues
          const unavailableDatesMap = unavailableDatesArray.map(item => {
            const dateParts = item.date.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-based in JS Date
            const day = parseInt(dateParts[2]);
            
            // Always create date with exact time to avoid inconsistencies
            const date = new Date(year, month, day, 12, 0, 0, 0);
            
            return {
              date: date,
              dateStr: formatDateString(date),
              reason: item.reason
            };
          });
          
          setUnavailableDates(unavailableDatesMap);
          
          // Update statistics
          updateStats(unavailableDatesMap);
        } else {
          console.error('Error fetching unavailable dates:', data.message);
        }
      } catch (error) {
        console.error('Error fetching provider availability:', error);
        showMessage('Error loading availability data. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUnavailableDates();
  }, [localProviderId, currentMonth]);
  
  // Update statistics
  const updateStats = (dates) => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    const thisMonth = dates.filter(d => d.date >= currentMonthStart && d.date <= currentMonthEnd).length;
    const nextMonth = dates.filter(d => d.date >= nextMonthStart && d.date <= nextMonthEnd).length;
    
    setStats({
      totalUnavailable: dates.length,
      thisMonth,
      nextMonth
    });
  };
  
  // Quick action: Select all weekends in current month
  const selectWeekends = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weekends = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) { // Sunday or Saturday
        const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
        weekends.push({
          date,
          dateStr: formatDateString(date)
        });
      }
    }
    
    setSelectedDates(weekends);
    setSelectionMode('multiple');
    showMessage(`Selected ${weekends.length} weekend dates`, 'info');
    setShowQuickActions(false);
  };
  
  // Quick action: Select next 7 days
  const selectNext7Days = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date,
        dateStr: formatDateString(date)
      });
    }
    
    setSelectedDates(dates);
    setSelectionMode('multiple');
    showMessage('Selected next 7 days', 'info');
    setShowQuickActions(false);
  };
  
  // Quick action: Select entire month
  const selectEntireMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
      dates.push({
        date,
        dateStr: formatDateString(date)
      });
    }
    
    setSelectedDates(dates);
    setSelectionMode('multiple');
    showMessage(`Selected ${dates.length} dates for entire month`, 'info');
    setShowQuickActions(false);
  };
  
  // Export unavailable dates as CSV
  const exportToCSV = () => {
    if (unavailableDates.length === 0) {
      showMessage('No unavailable dates to export', 'warning');
      return;
    }
    
    const csvContent = [
      ['Date', 'Reason'],
      ...unavailableDates.map(d => [d.dateStr, d.reason || 'Not available'])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unavailable-dates-${formatDateString(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage('Exported unavailable dates successfully', 'success');
  };
  
  // Save unavailable dates to the server
  const saveUnavailableDates = async () => {
    console.log('Starting saveUnavailableDates with providerId:', localProviderId);
    console.log('Selected dates:', selectedDates);
    
    if (!localProviderId || selectedDates.length === 0) {
      console.log('No providerId or no dates selected, returning');
      
      if (!localProviderId) {
        const userStr = localStorage.getItem('user');
        const providerStr = localStorage.getItem('provider');
        console.log('User in localStorage:', userStr);
        console.log('Provider in localStorage:', providerStr);
        
        // Try to recover provider ID one more time
        if (providerStr) {
          try {
            const provider = JSON.parse(providerStr);
            if (provider?.provider_id) {
              console.log('Last attempt to recover provider_id:', provider.provider_id);
              setLocalProviderId(provider.provider_id);
              showMessage('Provider ID was missing. It has been recovered from storage. Please try again.', 'warning');
              return;
            }
          } catch (e) {
            console.error('Error parsing provider from localStorage:', e);
          }
        }
        
        showMessage('Error: Provider ID is missing. Please log in again as a service provider.', 'error');
      } else {
        showMessage('Please select at least one date to mark as unavailable.', 'warning');
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create payload with dates and reason
      const payload = {
        provider_id: localProviderId,
        dates: selectedDates.map(dateObj => dateObj.dateStr),
        reason: reason || 'Not available'
      };
      
      console.log('Saving unavailable dates with payload:', payload);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/backend/manageProviderAvailability', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error('HTTP Error Response:', response.status, response.statusText);
        const responseText = await response.text();
        console.error('Response body:', responseText);
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Handle standardized API response format: data is nested under data.data
        const responseData = data.data || data;
        const addedCount = responseData.added_count || 0;
        
        console.log('Successfully added unavailable dates:', data);
        // Update unavailable dates by adding the new ones
        const newUnavailableDates = [
          ...unavailableDates,
          ...selectedDates.map(dateObj => ({
            date: new Date(dateObj.dateStr),
            dateStr: dateObj.dateStr,
            reason: reason
          }))
        ];
        
        setUnavailableDates(newUnavailableDates);
        setSelectedDates([]);
        setReason('');
        
        // Notify parent component if needed
        onAvailabilityChange(newUnavailableDates);
        
        showMessage(`${addedCount} date(s) marked as unavailable`, 'success');
      } else {
        console.error('Error adding unavailable dates:', data.message);
        showMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error saving dates:', error);
      showMessage('Error saving dates. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove unavailable dates
  const removeUnavailableDates = async () => {
    if (!localProviderId || selectedDates.length === 0) {
      showMessage('Please select at least one date to mark as available.', 'warning');
      return;
    }
    
    // Filter out only dates that are currently unavailable
    const datesToRemove = selectedDates.filter(dateObj => 
      unavailableDates.some(unavailableDate => unavailableDate.dateStr === dateObj.dateStr)
    );
    
    if (datesToRemove.length === 0) {
      showMessage('None of the selected dates are currently marked as unavailable.', 'warning');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create payload with dates to remove
      const payload = {
        provider_id: localProviderId,
        dates: datesToRemove.map(dateObj => dateObj.dateStr)
      };
      
      console.log('Removing unavailable dates with payload:', payload);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/backend/manageProviderAvailability', {
        method: 'DELETE',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error('HTTP Error Response:', response.status, response.statusText);
        const responseText = await response.text();
        console.error('Response body:', responseText);
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Handle standardized API response format: data is nested under data.data
        const responseData = data.data || data;
        const removedCount = responseData.removed_count || 0;
        
        console.log('Successfully removed unavailable dates:', data);
        
        // Update unavailable dates by removing the specified dates
        const newUnavailableDates = unavailableDates.filter(unavailableDate => 
          !datesToRemove.some(dateObj => dateObj.dateStr === unavailableDate.dateStr)
        );
        
        setUnavailableDates(newUnavailableDates);
        setSelectedDates([]);
        
        // Notify parent component if needed
        onAvailabilityChange(newUnavailableDates);
        
        showMessage(`${removedCount} date(s) marked as available`, 'success');
      } else {
        console.error('Error removing unavailable dates:', data.message);
        showMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error removing dates:', error);
      showMessage('Error updating availability. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Helper function to format date as YYYY-MM-DD for comparison - FIX: Ensure consistency
  const formatDateString = (date) => {
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

  // Check if a date is already marked unavailable - FIX: Consistent string comparison
  const isDateUnavailable = (date) => {
    const dateStr = formatDateString(date);
    return unavailableDates.some(unavailableDate => 
      unavailableDate.dateStr === dateStr
    );
  };
  
  // Get the reason for an unavailable date - FIX: Consistent string comparison
  const getDateReason = (date) => {
    const dateStr = formatDateString(date);
    const match = unavailableDates.find(unavailableDate => 
      unavailableDate.dateStr === dateStr
    );
    return match ? match.reason : '';
  };
  
  // Check if a date is selected - FIX: Consistent string comparison
  const isDateSelected = (date) => {
    const dateStr = formatDateString(date);
    return selectedDates.some(selectedDate => 
      selectedDate.dateStr === dateStr
    );
  };
  
  // Handle date click - FIX: Create consistent date objects
  const handleDateClick = (day) => {
    // Ignore clicks on past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) return;
    
    // FIX: Create a new Date object at noon with exact time parameters to ensure consistency
    const clickedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0);
    const dateStr = formatDateString(clickedDate);
    
    console.log('Date clicked:', clickedDate.getDate(), 'Month:', clickedDate.getMonth() + 1, 
                'Year:', clickedDate.getFullYear(), 'DateStr:', dateStr);
    
    if (selectionMode === 'single') {
      // Toggle selection for single date
      const isAlreadySelected = selectedDates.some(d => d.dateStr === dateStr);
      
      if (isAlreadySelected) {
        setSelectedDates(selectedDates.filter(d => d.dateStr !== dateStr));
      } else {
        setSelectedDates([{ date: clickedDate, dateStr }]);
      }
    } 
    else if (selectionMode === 'range') {
      if (!selectionStart) {
        // Start of range selection
        setSelectionStart(clickedDate);
        setSelectedDates([{ date: clickedDate, dateStr }]);
      } else {
        // End of range selection - create a range of dates
        const start = new Date(selectionStart.getFullYear(), selectionStart.getMonth(), selectionStart.getDate(), 12, 0, 0, 0);
        const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0);
        
        // Make sure start is before end
        let rangeStart, rangeEnd;
        if (start <= end) {
          rangeStart = start;
          rangeEnd = end;
        } else {
          rangeStart = end;
          rangeEnd = start;
        }
        
        // Create array of dates in the range
        const dateArray = [];
        const currentDate = new Date(rangeStart);
        
        while (currentDate <= rangeEnd) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const day = currentDate.getDate();
          
          // FIX: Create a new date with exact time parameters to avoid reference issues
          const newDate = new Date(year, month, day, 12, 0, 0, 0);
          const currentDateStr = formatDateString(newDate);
          
          dateArray.push({
            date: newDate,
            dateStr: currentDateStr
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setSelectedDates(dateArray);
        setSelectionStart(null);
      }
    }
    else if (selectionMode === 'multiple') {
      // Toggle selection for multiple individual dates
      const isAlreadySelected = selectedDates.some(d => d.dateStr === dateStr);
      
      if (isAlreadySelected) {
        setSelectedDates(selectedDates.filter(d => d.dateStr !== dateStr));
      } else {
        setSelectedDates([...selectedDates, { date: clickedDate, dateStr }]);
      }
    }
  };

  // Handle mouse enter on a date cell (for range selection preview)
  const handleMouseEnter = (day) => {
    if (selectionMode === 'range' && selectionStart) {
      const hoverDateObj = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0);
      setHoverDate(hoverDateObj);
    }
  };

  // Check if a date is in the hover range
  const isInHoverRange = (day) => {
    if (selectionMode !== 'range' || !selectionStart || !hoverDate) return false;
    
    const dayToCheck = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0);
    const selectionStartDate = new Date(selectionStart.getFullYear(), selectionStart.getMonth(), selectionStart.getDate(), 12, 0, 0, 0);
    const hoverDateNormalized = new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate(), 12, 0, 0, 0);
    
    const start = selectionStartDate < hoverDateNormalized ? selectionStartDate : hoverDateNormalized;
    const end = selectionStartDate < hoverDateNormalized ? hoverDateNormalized : selectionStartDate;
    
    return dayToCheck >= start && dayToCheck <= end;
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
      // FIX: Create date with noon time with exact time parameters to avoid any timezone issues
      const date = new Date(year, month, day, 12, 0, 0, 0);
      const dateStr = formatDateString(date);
      
      const isToday = date.getDate() === today.getDate() &&
                     date.getMonth() === today.getMonth() &&
                     date.getFullYear() === today.getFullYear();
                     
      const isPastDate = date < today;
      const unavailable = isDateUnavailable(date);
      const selected = isDateSelected(date);
      const inHoverRange = isInHoverRange(date);
      const reason = getDateReason(date);
      
      calendarDays.push(
        <div
          key={dateStr}
          className={`
            h-12 border border-gray-200 flex items-center justify-center cursor-pointer relative transition-colors
            ${isToday ? 'bg-blue-50 border-blue-200' : ''}
            ${unavailable ? 'bg-red-50 text-red-600 border-red-200' : ''}
            ${selected ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
            ${inHoverRange ? 'bg-cyan-50 border-cyan-200' : ''}
            ${isPastDate ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}
          `}
          onClick={() => !isPastDate && handleDateClick(date)}
          onMouseEnter={() => !isPastDate && handleMouseEnter(date)}
          title={
            isPastDate ? 'Past date - Cannot be modified' :
            unavailable ? `Unavailable: ${reason || 'Not available'}` :
            selected ? 'Selected' :
            'Available'
          }
        >
          <span className={`text-sm ${isToday ? 'font-semibold' : ''}`}>{day}</span>
          {unavailable && <span className="absolute top-1 right-1 text-xs text-red-500">✕</span>}
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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Availability</h2>
            <p className="text-sm text-gray-600 mt-1">Set your unavailable dates to manage bookings</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-2 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">Total Unavailable</div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalUnavailable}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 px-4 py-2 rounded-lg border border-amber-200">
              <div className="text-xs text-amber-600 font-medium">This Month</div>
              <div className="text-2xl font-bold text-amber-900">{stats.thisMonth}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-2 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-medium">Next Month</div>
              <div className="text-2xl font-bold text-purple-900">{stats.nextMonth}</div>
            </div>
          </div>
        </div>
        
        {/* Provider ID Display */}
        {localProviderId && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-gray-700">
              Provider ID: <span className="text-gray-900 font-semibold">{localProviderId}</span>
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-lg border-l-4 shadow-sm animate-fadeIn ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-500' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border-red-500' :
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-500' :
          'bg-blue-50 text-blue-800 border-blue-500'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === 'success' && '✓'}
              {message.type === 'error' && '✕'}
              {message.type === 'warning' && '⚠'}
              {message.type === 'info' && 'ℹ'}
            </span>
            {message.text}
          </div>
        </div>
      )}
      
      {/* Quick Actions Panel */}
      <div className="mb-6">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
          <svg className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showQuickActions && (
          <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
            <button
              onClick={selectWeekends}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">All Weekends</span>
            </button>
            
            <button
              onClick={selectNext7Days}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-green-50 hover:border-green-300 border-2 border-transparent transition-all"
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Next 7 Days</span>
            </button>
            
            <button
              onClick={selectEntireMonth}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Entire Month</span>
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={unavailableDates.length === 0}
              className={`flex flex-col items-center gap-2 p-3 bg-white rounded-lg border-2 transition-all ${
                unavailableDates.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-amber-50 hover:border-amber-300 border-transparent'
              }`}
            >
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Export CSV</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Selection Mode Buttons */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Selection Mode:</h3>
        <div className="flex gap-2">
          {[
            { mode: 'single', label: 'Single Date' },
            { mode: 'range', label: 'Date Range' },
            { mode: 'multiple', label: 'Multiple Dates' }
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setSelectionMode(mode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectionMode === mode
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {getMonthName(currentMonth)} {currentMonth.getFullYear()}
        </h2>
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
      
      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            Selected dates: {selectedDates.length}
          </p>
          {selectionMode === 'range' && selectedDates.length > 1 && (
            <p className="text-sm text-blue-600 mt-1">
              From {selectedDates[0]?.date.toLocaleDateString()} to {selectedDates[selectedDates.length - 1]?.date.toLocaleDateString()}
            </p>
          )}
        </div>
      )}
      
      {/* Controls */}
      <div className="space-y-4">
        {/* Reason Input */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for unavailability (optional):
          </label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., 'Vacation', 'Personal', 'Holiday'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={saveUnavailableDates}
            disabled={selectedDates.length === 0 || isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedDates.length === 0 || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Mark as Unavailable'}
          </button>
          
          <button
            onClick={removeUnavailableDates}
            disabled={selectedDates.length === 0 || isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedDates.length === 0 || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Updating...' : 'Mark as Available'}
          </button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-white border border-gray-200 mr-2"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-50 border border-red-200 mr-2"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 mr-2"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-50 border border-blue-200 mr-2"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarAvailability;