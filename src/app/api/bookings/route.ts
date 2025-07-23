import { NextRequest, NextResponse } from 'next/server';
import { bookingStore } from '@/lib/data-store';
import { 
  validateBookingRequest, 
  checkBookingConflict, 
  generateBookingId,
  filterBookings,
  sortBookingsByTime
} from '@/lib/booking-utils';
import { Booking, BookingRequest } from '@/types/booking';

// GET /api/bookings - Get all bookings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const date = searchParams.get('date');

    let bookings = bookingStore.getAllBookings();

    // Apply filters if provided
    if (resource || date) {
      bookings = filterBookings(bookings, { resource: resource || undefined, date: date || undefined });
    }

    // Sort by start time
    bookings = sortBookingsByTime(bookings);

    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    // Validate the booking request
    const validation = validateBookingRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Check for conflicts
    const existingBookings = bookingStore.getAllBookings();
    const conflictCheck = checkBookingConflict(body, existingBookings);
    
    if (conflictCheck.hasConflict) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking conflict detected', 
          message: conflictCheck.message,
          conflictingBookings: conflictCheck.conflictingBookings
        },
        { status: 409 }
      );
    }

    // Create the new booking
    const newBooking: Booking = {
      id: generateBookingId(),
      resource: body.resource,
      startTime: body.startTime,
      endTime: body.endTime,
      requestedBy: body.requestedBy,
      createdAt: new Date().toISOString()
    };

    // Add to store
    bookingStore.addBooking(newBooking);

    return NextResponse.json(
      { 
        success: true, 
        data: newBooking,
        message: 'Booking created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

