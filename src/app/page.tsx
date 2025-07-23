"use client";

import { useState } from "react";
import BookingForm from "@/components/BookingForm";
import BookingList from "@/components/BookingList";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBookingCreated = () => {
    // Trigger a refresh of the booking list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Resource Booking System
          </h1>
          <p className="mt-1 text-gray-600">
            Book shared resources with automatic conflict detection and buffer
            time management
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Booking Form */}
          <div>
            <BookingForm onBookingCreated={handleBookingCreated} />
          </div>

          {/* Booking List */}
          <div className="lg:col-span-1">
            <BookingList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Resource Booking System with 10-minute buffer time and conflict
              detection
            </p>
            <div className="mt-2 text-xs space-y-1">
              <p>
                <strong>Features:</strong>
              </p>
              <ul className="inline-flex flex-wrap gap-4 text-xs">
                <li>• Conflict Detection</li>
                <li>• 10-minute Buffer Time</li>
                <li>• Real-time Validation</li>
                <li>• Resource Filtering</li>
                <li>• Status Tracking</li>
                <li>• Booking Cancellation</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
