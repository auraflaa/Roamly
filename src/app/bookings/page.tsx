import React from 'react';

export default function BookingsPage() {
  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-h1 lg:text-display mb-6" style={{ color: 'var(--primary-text)' }}>
        My Bookings
      </h1>
      
      <div className="text-center py-20 rounded-[22px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-h2 mb-2" style={{ color: 'var(--primary-text)' }}>No upcoming bookings</p>
        <p className="text-body" style={{ color: 'var(--secondary-text)' }}>Time to plan your next adventure!</p>
      </div>
    </div>
  );
}
