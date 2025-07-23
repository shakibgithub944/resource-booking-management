export interface Booking {
  id: string;
  resource: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  requestedBy: string;
  createdAt: string; // ISO string
}

export interface BookingRequest {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}

export interface BookingConflict {
  hasConflict: boolean;
  conflictingBookings?: Booking[];
  message?: string;
}

export interface BookingFilter {
  resource?: string;
  date?: string; // YYYY-MM-DD format
}

export type BookingStatus = 'upcoming' | 'ongoing' | 'past';

export interface BookingWithStatus extends Booking {
  status: BookingStatus;
}

export const RESOURCES = [
  'Conference Room A',
  'Conference Room B',
  'Projector',
  'Laptop Cart',
  'Video Equipment'
] as const;

export type Resource = typeof RESOURCES[number];

