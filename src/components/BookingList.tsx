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
  const [sortBy, setSortBy] = useState<"startTime" | "resource" | "status">(
    "startTime"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filters
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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

    if (selectedResource) {
      filtered = filtered.filter(
        (booking) => booking.resource === selectedResource
      );
    }

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

    if (selectedStatus) {
      filtered = filtered.filter(
        (booking) => booking.status === selectedStatus
      );
    }

    // Sort bookings
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "startTime":
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case "resource":
          aValue = a.resource.toLowerCase();
          bValue = b.resource.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  }, [
    bookings,
    selectedResource,
    selectedDate,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

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
        fetchBookings();
      } else {
        alert(result.error || "Failed to cancel booking");
      }
    } catch (err) {
      alert("Network error while canceling booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "text-blue-600 bg-blue-50";
      case "ongoing":
        return "text-green-600 bg-green-50";
      case "past":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleSort = (column: "startTime" | "resource" | "status") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: "startTime" | "resource" | "status") => {
    if (sortBy !== column) {
      return <span className="text-gray-300">↕</span>;
    }
    return sortOrder === "asc" ? (
      <span className="text-blue-500">↑</span>
    ) : (
      <span className="text-blue-500">↓</span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  const uniqueStatuses = [...new Set(bookings.map((b) => b.status))];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bookings</h1>
        <p className="text-gray-600">Manage and view all resource bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="w-full border border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(selectedResource || selectedDate || selectedStatus) && (
              <button
                onClick={() => {
                  setSelectedResource("");
                  setSelectedDate("");
                  setSelectedStatus("");
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("resource")}
              >
                <div className="flex items-center space-x-1">
                  <span>Resource</span>
                  {getSortIcon("resource")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("startTime")}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon("startTime")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon("status")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.resource}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDuration(booking.startTime, booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.requestedBy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.status === "upcoming" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
