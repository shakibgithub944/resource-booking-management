"use client";

import { useState } from "react";
import { RESOURCES } from "@/types/booking";

interface BookingFormProps {
  onBookingCreated?: () => void;
}

interface FormData {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}

interface FormErrors {
  resource?: string;
  startTime?: string;
  endTime?: string;
  requestedBy?: string;
  general?: string;
}

export default function BookingForm({ onBookingCreated }: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    resource: "",
    startTime: "",
    endTime: "",
    requestedBy: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Resource validation
    if (!formData.resource.trim()) {
      newErrors.resource = "Please select a resource";
    }

    // Requested by validation
    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = "Please enter your name";
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.startTime = "Please select a start time";
    }

    if (!formData.endTime) {
      newErrors.endTime = "Please select an end time";
    }

    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      const now = new Date();

      // Check if start time is in the past
      if (startTime < now) {
        newErrors.startTime = "Start time cannot be in the past";
      }

      // Check if end time is after start time
      if (endTime <= startTime) {
        newErrors.endTime = "End time must be after start time";
      }

      // Check minimum duration (15 minutes)
      const durationMinutes =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      if (durationMinutes < 15) {
        newErrors.endTime = "Booking duration must be at least 15 minutes";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Booking created successfully!");
        setFormData({
          resource: "",
          startTime: "",
          endTime: "",
          requestedBy: "",
        });
        onBookingCreated?.();
      } else {
        setErrors({
          general: result.message || result.error || "Failed to create booking",
        });
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Generate datetime-local input value (current time + 1 hour as default)
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book a Resource</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 ">
        {/* Resource Selection */}
        <div>
          <label
            htmlFor="resource"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Resource *
          </label>
          <select
            id="resource"
            value={formData.resource}
            onChange={(e) => handleInputChange("resource", e.target.value)}
            className={`w-full text-gray-700 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.resource ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a resource</option>
            {RESOURCES.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>
          {errors.resource && (
            <p className="mt-1 text-sm text-red-600">{errors.resource}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Time *
          </label>
          <input
            type="datetime-local"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => handleInputChange("startTime", e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className={`w-full text-gray-700 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startTime ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Time *
          </label>
          <input
            type="datetime-local"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => handleInputChange("endTime", e.target.value)}
            min={formData.startTime || new Date().toISOString().slice(0, 16)}
            className={`w-full text-gray-700 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endTime ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
          )}
        </div>

        {/* Requested By */}
        <div>
          <label
            htmlFor="requestedBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Requested By *
          </label>
          <input
            type="text"
            id="requestedBy"
            value={formData.requestedBy}
            onChange={(e) => handleInputChange("requestedBy", e.target.value)}
            placeholder="Enter your name"
            className={`w-full text-gray-700 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.requestedBy ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.requestedBy && (
            <p className="mt-1 text-sm text-red-600">{errors.requestedBy}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {isSubmitting ? "Creating Booking..." : "Create Booking"}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>* Required fields</p>
        <p className="mt-1">
          Note: A 10-minute buffer is automatically added before and after each
          booking.
        </p>
      </div>
    </div>
  );
}
