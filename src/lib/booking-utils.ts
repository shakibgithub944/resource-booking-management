import { Booking, BookingConflict, BookingStatus } from '@/types/booking';

// Buffer time in minutes
export const BUFFER_TIME_MINUTES = 10;

/**
 * Add buffer time to a booking's start and end times
 */
export function addBufferTime(startTime: string, endTime: string): { bufferedStart: Date; bufferedEnd: Date } {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const bufferedStart = new Date(start.getTime() - BUFFER_TIME_MINUTES * 60 * 1000);
  const bufferedEnd = new Date(end.getTime() + BUFFER_TIME_MINUTES * 60 * 1000);
  
  return { bufferedStart, bufferedEnd };
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Check for booking conflicts with buffer time
 */
export function checkBookingConflict(
  newBooking: { resource: string; startTime: string; endTime: string },
  existingBookings: Booking[],
  excludeBookingId?: string
): BookingConflict {
  const newStart = new Date(newBooking.startTime);
  const newEnd = new Date(newBooking.endTime);
  
  // Filter bookings for the same resource
  const resourceBookings = existingBookings.filter(
    booking => booking.resource === newBooking.resource && booking.id !== excludeBookingId
  );
  
  const conflictingBookings: Booking[] = [];
  
  for (const booking of resourceBookings) {
    const { bufferedStart, bufferedEnd } = addBufferTime(booking.startTime, booking.endTime);
    
    if (timeRangesOverlap(newStart, newEnd, bufferedStart, bufferedEnd)) {
      conflictingBookings.push(booking);
    }
  }
  
  if (conflictingBookings.length > 0) {
    return {
      hasConflict: true,
      conflictingBookings,
      message: `Booking conflicts with existing reservations (including 10-minute buffer time). Conflicting bookings: ${conflictingBookings.map(b => `${new Date(b.startTime).toLocaleString()} - ${new Date(b.endTime).toLocaleString()}`).join(', ')}`
    };
  }
  
  return { hasConflict: false };
}

/**
 * Validate booking request
 */
export function validateBookingRequest(booking: {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!booking.resource.trim()) {
    errors.push('Resource is required');
  }
  
  if (!booking.requestedBy.trim()) {
    errors.push('Requested by is required');
  }
  
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  
  if (isNaN(startTime.getTime())) {
    errors.push('Invalid start time');
  }
  
  if (isNaN(endTime.getTime())) {
    errors.push('Invalid end time');
  }
  
  if (startTime >= endTime) {
    errors.push('End time must be after start time');
  }
  
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  if (durationMinutes < 15) {
    errors.push('Booking duration must be at least 15 minutes');
  }
  
  // Maximum duration limit (2 hours = 120 minutes)
  if (durationMinutes > 120) {
    errors.push('Booking duration cannot exceed 2 hours');
  }
  
  // Check if booking is in the past
  if (startTime < new Date()) {
    errors.push('Cannot book time slots in the past');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get booking status based on current time
 */
export function getBookingStatus(booking: Booking): BookingStatus {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  
  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now <= endTime) {
    return 'ongoing';
  } else {
    return 'past';
  }
}

/**
 * Sort bookings by start time (upcoming first)
 */
export function sortBookingsByTime(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeA - timeB;
  });
}

/**
 * Filter bookings by resource and date
 */
export function filterBookings(
  bookings: Booking[],
  filters: { resource?: string; date?: string }
): Booking[] {
  let filtered = [...bookings];
  
  if (filters.resource) {
    filtered = filtered.filter(booking => booking.resource === filters.resource);
  }
  
  if (filters.date) {
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      const bookingDateStr = bookingDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
      return bookingDateStr === filters.date;
    });
  }
  
  return filtered;
}

/**
 * Generate a unique ID for bookings
 */
export function generateBookingId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

