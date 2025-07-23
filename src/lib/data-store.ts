import { Booking } from '@/types/booking';

// In-memory data store for bookings
// In a real application, this would be replaced with a database
class BookingStore {
  private bookings: Booking[] = [];

  // Initialize with some sample data
  constructor() {
    this.bookings = [
      {
        id: '1',
        resource: 'Conference Room A',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        requestedBy: 'John Doe',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        resource: 'Projector',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
        requestedBy: 'Jane Smith',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find(booking => booking.id === id);
  }

  addBooking(booking: Booking): void {
    this.bookings.push(booking);
  }

  updateBooking(id: string, updatedBooking: Partial<Booking>): boolean {
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index !== -1) {
      this.bookings[index] = { ...this.bookings[index], ...updatedBooking };
      return true;
    }
    return false;
  }

  deleteBooking(id: string): boolean {
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      return true;
    }
    return false;
  }

  getBookingsByResource(resource: string): Booking[] {
    return this.bookings.filter(booking => booking.resource === resource);
  }

  getBookingsByDate(date: string): Booking[] {
    const targetDate = new Date(date);
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      return (
        bookingDate.getFullYear() === targetDate.getFullYear() &&
        bookingDate.getMonth() === targetDate.getMonth() &&
        bookingDate.getDate() === targetDate.getDate()
      );
    });
  }
}

// Singleton instance
export const bookingStore = new BookingStore();

