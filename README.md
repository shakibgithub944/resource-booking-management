# Resource Booking System

A full-stack web application for booking shared resources with automatic conflict detection and buffer time management.

## Features

### Core Features

- **Resource Booking Form**: Book time slots for shared resources with comprehensive validation
- **Conflict Detection**: Automatic detection of overlapping bookings with 10-minute buffer time
- **Booking Dashboard**: View all bookings grouped by resource with filtering capabilities
- **Real-time Validation**: Client-side and server-side validation for booking requests
- **Status Tracking**: Automatic status updates (Upcoming, Ongoing, Past) based on current time

### Advanced Features

- **Buffer Time Logic**: 10-minute buffer before and after each booking to prevent back-to-back conflicts
- **Resource Filtering**: Filter bookings by specific resources
- **Date Filtering**: Filter bookings by specific dates
- **Booking Cancellation**: Cancel upcoming bookings with confirmation
- **Duration Limits**: Maximum 2-hour booking duration with minimum 15-minute requirement
- **Availability Check API**: Check available time slots for resources
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

### Frontend

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

### Backend

- **Next.js API Routes** for serverless functions
- **TypeScript** for type safety
- **In-memory data store** (easily replaceable with database)

### Development Tools

- **ESLint** for code linting
- **npm** for package management

## Available Resources

The system comes pre-configured with the following resources:

- Conference Room A
- Conference Room B
- Projector
- Laptop Cart
- Video Equipment

## API Endpoints

### Bookings API

#### GET /api/bookings

Get all bookings with optional filtering.

**Query Parameters:**

- `resource` (optional): Filter by resource name
- `date` (optional): Filter by date (YYYY-MM-DD format)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "unique-id",
      "resource": "Conference Room A",
      "startTime": "2025-07-22T14:00:00.000Z",
      "endTime": "2025-07-22T15:00:00.000Z",
      "requestedBy": "John Doe",
      "createdAt": "2025-07-22T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST /api/bookings

Create a new booking.

**Request Body:**

```json
{
  "resource": "Conference Room A",
  "startTime": "2025-07-22T14:00:00.000Z",
  "endTime": "2025-07-22T15:00:00.000Z",
  "requestedBy": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "generated-id",
    "resource": "Conference Room A",
    "startTime": "2025-07-22T14:00:00.000Z",
    "endTime": "2025-07-22T15:00:00.000Z",
    "requestedBy": "John Doe",
    "createdAt": "2025-07-22T10:00:00.000Z"
  },
  "message": "Booking created successfully"
}
```

#### DELETE /api/bookings/[id]

Cancel a specific booking.

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### Availability API

#### GET /api/available-slots

Check available time slots for a resource.

**Query Parameters:**

- `resource` (required): Resource name
- `date` (required): Date in YYYY-MM-DD format
- `duration` (optional): Duration in minutes (default: 60)

**Response:**

```json
{
  "success": true,
  "data": {
    "resource": "Conference Room A",
    "date": "2025-07-22",
    "duration": 60,
    "availableSlots": [
      {
        "startTime": "2025-07-22T09:00:00.000Z",
        "endTime": "2025-07-22T10:00:00.000Z",
        "duration": 60
      }
    ],
    "totalSlots": 14,
    "existingBookings": 1
  }
}
```

## Conflict Detection Rules

The system implements sophisticated conflict detection with buffer time:

### Buffer Time Logic

- **10-minute buffer** is automatically added before and after each booking
- If a resource is booked from 2:00 PM to 3:00 PM, the system blocks 1:50 PM to 3:10 PM

### Conflict Examples

For a booking from 2:00 PM - 3:00 PM:

- ❌ **12:55 PM - 1:55 PM**: Rejected (overlaps buffer before)
- ❌ **1:50 PM - 2:00 PM**: Rejected (ends exactly when buffer starts)
- ❌ **2:00 PM - 3:00 PM**: Rejected (exact overlap)
- ❌ **3:00 PM - 4:00 PM**: Rejected (starts exactly when buffer ends)
- ✅ **11:00 AM - 12:45 PM**: Allowed (ends before buffer starts)
- ✅ **3:15 PM - 4:15 PM**: Allowed (starts after buffer ends)

## Validation Rules

### Booking Form Validation

- **Resource**: Must be selected from available options
- **Start Time**: Cannot be in the past
- **End Time**: Must be after start time
- **Duration**: Minimum 15 minutes, maximum 2 hours
- **Requested By**: Required field

### Server-side Validation

- All client-side validations are enforced on the server
- Conflict detection with existing bookings
- Buffer time validation
- Data type and format validation

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd resource-booking-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── route.ts          # Main bookings API
│   │   │   └── [id]/route.ts     # Individual booking operations
│   │   └── available-slots/
│   │       └── route.ts          # Availability check API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── BookingForm.tsx           # Booking form component
│   └── BookingList.tsx           # Booking dashboard component
├── lib/
│   ├── booking-utils.ts          # Utility functions
│   └── data-store.ts             # In-memory data store
└── types/
    └── booking.ts                # TypeScript interfaces
```

## Usage Examples

### Creating a Booking

1. Select a resource from the dropdown
2. Choose start and end times
3. Enter your name in "Requested By"
4. Click "Create Booking"

### Viewing Bookings

- All bookings are displayed grouped by resource
- Use filters to view specific resources or dates
- Status badges show if bookings are upcoming, ongoing, or past

### Canceling a Booking

- Click the "Cancel" button on upcoming bookings
- Confirm the cancellation in the dialog
- Past and ongoing bookings cannot be canceled

### Checking Availability

Use the API endpoint to check available slots:

```bash
curl "http://localhost:3000/api/available-slots?resource=Conference%20Room%20A&date=2025-07-22&duration=60"
```

## Future Enhancements

### Potential Improvements

- **Database Integration**: Replace in-memory store with PostgreSQL/MongoDB
- **User Authentication**: Add user login and role-based access
- **Email Notifications**: Send booking confirmations and reminders
- **Recurring Bookings**: Support for weekly/monthly recurring bookings
- **Calendar Integration**: Export to Google Calendar/Outlook
- **Mobile App**: React Native mobile application
- **Analytics Dashboard**: Usage statistics and reporting
- **Booking Templates**: Save and reuse common booking patterns

### Technical Improvements

- **Real-time Updates**: WebSocket integration for live updates
- **Caching**: Redis caching for improved performance
- **API Rate Limiting**: Prevent abuse with rate limiting
- **Logging**: Comprehensive logging and monitoring
- **Testing**: Unit and integration test coverage
- **Docker**: Containerization for easy deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
