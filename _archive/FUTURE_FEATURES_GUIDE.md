# 🎯 Future Feature Implementation Guide

## Quick Reference for Adding More Professional Features

---

## 1. 🔔 Notification System

### Implementation:
```jsx
// Create new component: NotificationBadge.jsx
const NotificationBadge = ({ count }) => {
  return (
    <div className="relative">
      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

// In ServiceProviderDashboard.jsx
const [notifications, setNotifications] = useState({
  newBookings: 0,
  pendingApprovals: 0,
  messages: 0
});

// Poll for new notifications every 30 seconds
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 2. 🎨 Trend Indicators

### Implementation:
```jsx
const TrendIndicator = ({ current, previous, format = 'number' }) => {
  const change = current - previous;
  const percentage = previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <div className="flex items-center gap-1 text-sm">
      {isPositive && (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="text-green-600 font-medium">+{percentage}%</span>
        </>
      )}
      {isNegative && (
        <>
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-red-600 font-medium">{percentage}%</span>
        </>
      )}
      {!isPositive && !isNegative && (
        <span className="text-gray-500">No change</span>
      )}
      <span className="text-gray-500 text-xs">vs last month</span>
    </div>
  );
};

// Usage in dashboard
<div className="bg-white rounded-lg shadow p-6">
  <p className="text-2xl font-bold">{dashboardData.stats.totalBookings}</p>
  <TrendIndicator 
    current={dashboardData.stats.totalBookings} 
    previous={dashboardData.stats.lastMonthBookings} 
  />
</div>
```

---

## 3. 🔍 Advanced Filters

### Implementation:
```jsx
const BookingFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    status: 'all',
    minAmount: '',
    maxAmount: '',
    searchTerm: ''
  });
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={filters.dateRange.start || ''}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={filters.dateRange.end || ''}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Search */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => {
            setFilters({
              dateRange: { start: null, end: null },
              status: 'all',
              minAmount: '',
              maxAmount: '',
              searchTerm: ''
            });
            onFilterChange(null); // Reset filters
          }}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
```

---

## 4. 🔁 Recurring Patterns

### Implementation:
```jsx
const RecurringPatternModal = ({ onSave, onClose }) => {
  const [pattern, setPattern] = useState({
    type: 'weekly', // weekly, monthly, custom
    days: [], // [0,6] for Sunday & Saturday
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const applyPattern = () => {
    const dates = [];
    const start = new Date(pattern.startDate);
    const end = new Date(pattern.endDate);
    
    // Generate dates based on pattern
    if (pattern.type === 'weekly') {
      let current = new Date(start);
      while (current <= end) {
        if (pattern.days.includes(current.getDay())) {
          dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    }
    
    onSave(dates, pattern.reason);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Set Recurring Pattern</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pattern Type</label>
            <select
              value={pattern.type}
              onChange={(e) => setPattern({ ...pattern, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          {pattern.type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Days</label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const days = pattern.days.includes(index)
                        ? pattern.days.filter(d => d !== index)
                        : [...pattern.days, index];
                      setPattern({ ...pattern, days });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      pattern.days.includes(index)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={pattern.startDate}
                onChange={(e) => setPattern({ ...pattern, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={pattern.endDate}
                onChange={(e) => setPattern({ ...pattern, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <input
              type="text"
              value={pattern.reason}
              onChange={(e) => setPattern({ ...pattern, reason: e.target.value })}
              placeholder="e.g., Weekly day off"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={applyPattern}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Apply Pattern
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. 📊 Enhanced Charts

### Implementation:
```jsx
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#4f46e5" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Highest</p>
          <p className="text-lg font-bold text-green-600">
            RM {Math.max(...data.map(d => d.revenue))}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-lg font-bold text-blue-600">
            RM {(data.reduce((sum, d) => sum + d.revenue, 0) / data.length).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Lowest</p>
          <p className="text-lg font-bold text-red-600">
            RM {Math.min(...data.map(d => d.revenue))}
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. 🎁 Today's Schedule Widget

### Implementation:
```jsx
const TodaySchedule = ({ bookings }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.service_date === today);
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow p-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
          {todayBookings.length} booking{todayBookings.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {todayBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No bookings scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayBookings.map((booking, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                  <p className="text-sm text-gray-600">{booking.package_name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 7. 🎯 Quick Stats Enhancement

### Implementation:
```jsx
const EnhancedStatCard = ({ title, value, icon, trend, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
      <div className={`h-2 bg-gradient-to-r ${colors[color]}`}></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${colors[color]} rounded-lg`}>
            {icon}
          </div>
          {trend && <TrendIndicator {...trend} />}
        </div>
        
        <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

// Usage
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <EnhancedStatCard
    title="Total Bookings"
    value={dashboardData.stats.totalBookings}
    icon={<BookingIcon className="w-6 h-6 text-white" />}
    trend={{ current: 45, previous: 38 }}
    color="blue"
  />
  {/* More stat cards... */}
</div>
```

---

## 8. 📥 CSV Import

### Implementation:
```jsx
const CSVImport = ({ onImport }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const dates = [];
      
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const [date, reason] = rows[i].split(',');
        if (date) {
          dates.push({ date: date.trim(), reason: reason?.trim() || '' });
        }
      }
      
      onImport(dates);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="csv-upload"
      />
      <label htmlFor="csv-upload" className="cursor-pointer">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium text-gray-700">Import from CSV</p>
        <p className="text-sm text-gray-500 mt-2">Click to upload or drag and drop</p>
      </label>
    </div>
  );
};
```

---

## 🎨 Animation Library

Add these to your `index.css`:

```css
/* Bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply classes */
.animate-bounce { animation: bounce 1s ease-in-out infinite; }
.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-slideUp { animation: slideUp 0.5s ease-out; }
```

---

## 🔥 Pro Tips

### 1. Debounce Search Inputs
```javascript
import { useDebouncedCallback } from 'use-debounce';

const debounced = useDebouncedCallback((value) => {
  performSearch(value);
}, 300);
```

### 2. Lazy Load Heavy Components
```javascript
const HeavyChart = React.lazy(() => import('./HeavyChart'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart data={data} />
</Suspense>
```

### 3. Optimize Re-renders
```javascript
const memoizedValue = useMemo(() => 
  expensiveCalculation(data), 
  [data]
);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 4. Error Boundaries
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

**Remember**: Always test new features thoroughly before deploying to production! 🚀
