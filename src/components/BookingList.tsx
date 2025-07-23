"use client";

import { useState, useEffect } from "react";
import { Booking, BookingWithStatus, RESOURCES } from "@/types/booking";
import { getBookingStatus } from "@/lib/booking-utils";

interface BookingListProps {
  refreshTrigger?: number;
}

export default function BookingList({ refreshTrigger }: BookingListProps) {
  const [bookings, setBookings] = useState<BookingWithStatus[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithStatus[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const result = await response.json();

      if (result.success) {
        const bookingsWithStatus: BookingWithStatus[] = result.data.map(
          (booking: Booking) => ({
            ...booking,
            status: getBookingStatus(booking),
          })
        );
        setBookings(bookingsWithStatus);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (err) {
      setError("Network error while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = [...bookings];

    // Filter by resource
    if (selectedResource) {
      filtered = filtered.filter(
        (booking) => booking.resource === selectedResource
      );
    }

    // Filter by date
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.startTime);
        return (
          bookingDate.getFullYear() === filterDate.getFullYear() &&
          bookingDate.getMonth() === filterDate.getMonth() &&
          bookingDate.getDate() === filterDate.getDate()
        );
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, selectedResource, selectedDate]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the bookings list
        fetchBookings();
      } else {
        alert(result.error || "Failed to cancel booking");
      }
    } catch (err) {
      alert("Network error while canceling booking");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "upcoming":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "ongoing":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "past":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const groupBookingsByResource = (bookings: BookingWithStatus[]) => {
    const grouped: { [key: string]: BookingWithStatus[] } = {};

    bookings.forEach((booking) => {
      if (!grouped[booking.resource]) {
        grouped[booking.resource] = [];
      }
      grouped[booking.resource].push(booking);
    });

    // Sort bookings within each group by start time
    Object.keys(grouped).forEach((resource) => {
      grouped[resource].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const groupedBookings = groupBookingsByResource(filteredBookings);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Booking Dashboard
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="resourceFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Resource
            </label>
            <select
              id="resourceFilter"
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              {RESOURCES.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dateFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Date
            </label>
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-fulltext-gray-700  px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedResource || selectedDate) && (
          <button
            onClick={() => {
              setSelectedResource("");
              setSelectedDate("");
            }}
            className="mb-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear Filters
          </button>
        )}

        {/* Bookings Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Grouped Bookings */}
      {Object.keys(groupedBookings).length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          No bookings found.
        </div>
      ) : (
        Object.entries(groupedBookings).map(([resource, resourceBookings]) => (
          <div key={resource} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {resource}
            </h3>
            <div className="space-y-3">
              {resourceBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Time:</strong>{" "}
                          {formatDateTime(booking.startTime)} -{" "}
                          {formatDateTime(booking.endTime)}
                        </p>
                        <p>
                          <strong>Requested by:</strong> {booking.requestedBy}
                        </p>
                        <p>
                          <strong>Created:</strong>{" "}
                          {formatDateTime(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    {booking.status === "upcoming" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
