import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

// Simple card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-medium text-gray-900">
    {children}
  </h3>
);

const CardDescription = ({ children }) => (
  <p className="text-sm text-gray-600">
    {children}
  </p>
);

const CardContent = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

const CardFooter = ({ children, className = "" }) => (
  <div className={`flex flex-col items-start gap-2 text-sm ${className}`}>
    {children}
  </div>
);

// Simple chart container
const ChartContainer = ({ children }) => (
  <div className="w-full h-80">
    {children}
  </div>
);

// Sample data - this would be replaced by real data in production
const chartData = [
  { month: "January", bookings: 6 },
  { month: "February", bookings: 8 },
  { month: "March", bookings: 11 },
  { month: "April", bookings: 7 },
  { month: "May", bookings: 10 },
  { month: "June", bookings: 14 },
];

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "var(--primary-color, #4f46e5)",
  },
};

export function BookingsBarChart({ data = [] }) {
  const hasData = data && data.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings Overview</CardTitle>
        <CardDescription>
          {hasData ? 
            `${data[0]?.month || ''} - ${data[data.length-1]?.month || ''} ${data[0]?.year || new Date().getFullYear()}` : 
            'No booking data available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Tooltip 
                  cursor={false}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p>No booking data to display</p>
              <p className="text-sm mt-1">Data will appear when you receive bookings</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {hasData ? (
          <>
            <div className="flex gap-2 leading-none font-medium">
              {data.length > 1 && 'Trending data will appear here'} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-gray-500 leading-none">
              Showing total bookings for the last {data.length} months
            </div>
          </>
        ) : (
          <div className="text-gray-500 leading-none">
            The chart will show your bookings data when available
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Revenue chart with similar structure
const revenueData = [
  { month: "January", revenue: 1860 },
  { month: "February", revenue: 2450 },
  { month: "March", revenue: 3070 },
  { month: "April", revenue: 2380 },
  { month: "May", revenue: 2890 },
  { month: "June", revenue: 3420 },
];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--success-color, #10b981)",
  },
};

export function RevenueBarChart({ data = [] }) {
  const hasData = data && data.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analysis</CardTitle>
        <CardDescription>
          {hasData ? 
            `${data[0]?.month || ''} - ${data[data.length-1]?.month || ''} ${data[0]?.year || new Date().getFullYear()}` : 
            'No revenue data available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Tooltip 
                  cursor={false}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p>No revenue data to display</p>
              <p className="text-sm mt-1">Data will appear when you receive payments</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {hasData ? (
          <>
            <div className="flex gap-2 leading-none font-medium">
              {data.length > 1 && 'Trending data will appear here'} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-gray-500 leading-none">
              Showing total revenue in RM for the last {data.length} months
            </div>
          </>
        ) : (
          <div className="text-gray-500 leading-none">
            The chart will show your revenue data when available
          </div>
        )}
      </CardFooter>
    </Card>
  );
}