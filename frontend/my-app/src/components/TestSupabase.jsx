'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './TestSupabase.css';

function TestSupabase() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    users: [],
    packages: [],
    bookings: [],
    booking_addons: []
  });

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  async function testSupabaseConnection() {
    try {
      setLoading(true);
      setError(null);

      // Test 1: Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('user_id, name, email, role')
        .limit(5);

      if (usersError) throw usersError;

      // Test 2: Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('package_id, name, price')
        .limit(5);

      if (packagesError) throw packagesError;

      // Test 3: Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_id, booking_reference, customer_name, total_amount, status')
        .limit(5);

      if (bookingsError) throw bookingsError;

      // Test 4: Fetch booking_addons (the critical table!)
      const { data: addonsData, error: addonsError } = await supabase
        .from('booking_addons')
        .select('booking_addon_id, booking_id, addon_name, addon_price')
        .limit(5);

      if (addonsError) throw addonsError;

      setData({
        users: usersData,
        packages: packagesData,
        bookings: bookingsData,
        booking_addons: addonsData
      });

      setLoading(false);
    } catch (err) {
      console.error('Supabase connection error:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="test-supabase">
        <h1>🔄 Testing Supabase Connection...</h1>
        <p>Loading data from Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-supabase error">
        <h1>❌ Supabase Connection Failed</h1>
        <p className="error-message">{error}</p>
        <button onClick={testSupabaseConnection}>🔄 Retry</button>
      </div>
    );
  }

  return (
    <div className="test-supabase success">
      <h1>✅ Supabase Connection Successful!</h1>
      <p className="success-message">Your React app is connected to Supabase PostgreSQL database!</p>

      <div className="data-sections">
        {/* Users */}
        <section className="data-section">
          <h2>👥 Users ({data.users.length} records)</h2>
          <div className="data-table">
            {data.users.map((user) => (
              <div key={user.user_id} className="data-card">
                <span className="data-id">ID: {user.user_id}</span>
                <span className="data-name">{user.name}</span>
                <span className="data-email">{user.email}</span>
                <span className={`data-role role-${user.role}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section className="data-section">
          <h2>📦 Packages ({data.packages.length} records)</h2>
          <div className="data-table">
            {data.packages.map((pkg) => (
              <div key={pkg.package_id} className="data-card">
                <span className="data-id">ID: {pkg.package_id}</span>
                <span className="data-name">{pkg.name}</span>
                <span className="data-price">RM {pkg.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bookings */}
        <section className="data-section">
          <h2>📅 Bookings ({data.bookings.length} records)</h2>
          <div className="data-table">
            {data.bookings.map((booking) => (
              <div key={booking.booking_id} className="data-card">
                <span className="data-id">{booking.booking_reference}</span>
                <span className="data-name">{booking.customer_name}</span>
                <span className="data-price">RM {booking.total_amount.toFixed(2)}</span>
                <span className={`data-status status-${booking.status}`}>{booking.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Booking Add-ons (CRITICAL!) */}
        <section className="data-section critical">
          <h2>⭐ Booking Add-ons ({data.booking_addons.length} records)</h2>
          <p className="critical-note">This was the empty table - now it has data!</p>
          <div className="data-table">
            {data.booking_addons.map((addon) => (
              <div key={addon.booking_addon_id} className="data-card">
                <span className="data-id">ID: {addon.booking_addon_id}</span>
                <span className="data-name">{addon.addon_name}</span>
                <span className="data-price">RM {addon.addon_price.toFixed(2)}</span>
                <span className="data-booking">Booking #{addon.booking_id}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="next-steps">
        <h3>🎯 Next Steps:</h3>
        <ol>
          <li>✅ Supabase connection working!</li>
          <li>✅ All tables accessible from React</li>
          <li>✅ Critical booking_addons data present</li>
          <li>⏳ Start converting PHP endpoints to Supabase queries</li>
          <li>⏳ Deploy to Vercel for SUS testing</li>
        </ol>
      </div>

      <button onClick={testSupabaseConnection}>🔄 Refresh Data</button>
    </div>
  );
}

export default TestSupabase;
