import { NextRequest, NextResponse } from 'next/server';
import { bookingStore } from '@/lib/data-store';
import { addBufferTime } from '@/lib/booking-utils';

// GET /api/available-slots - Check availability for a resource on a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const duration = parseInt(searchParams.get('duration') || '60'); // Duration in minutes, default 60

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource parameter is required' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    // Get all bookings for the specified resource on the specified date
    const allBookings = bookingStore.getAllBookings();
    const resourceBookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      const bookingDateStr = bookingDate.toISOString().split('T')[0];
      return booking.resource === resource && bookingDateStr === date;
    });

    // Generate time slots for the day (9 AM to 6 PM, 30-minute intervals)
    const startHour = 9;
    const endHour = 18;
    const slotInterval = 30; // minutes
    const availableSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00.000Z`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        // Check if this slot conflicts with any existing booking (including buffer time)
        let hasConflict = false;
        
        for (const booking of resourceBookings) {
          const { bufferedStart, bufferedEnd } = addBufferTime(booking.startTime, booking.endTime);
          
          // Check if the proposed slot overlaps with the buffered booking time
          if (slotStart < bufferedEnd && slotEnd > bufferedStart) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict && slotEnd.getHours() <= endHour) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            duration: duration
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        resource,
        date,
        duration,
        availableSlots,
        totalSlots: availableSlots.length,
        existingBookings: resourceBookings.length
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

