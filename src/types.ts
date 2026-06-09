/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Resource {
  id: string;
  name: string;
  type: 'desk' | 'room' | 'studio' | 'booth';
  capacity: number;
  hourlyRate: number;
  amenities: string[];
  status: 'available' | 'maintenance';
  location: string;
}

export type MembershipType = 'regular' | 'pro' | 'enterprise';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  membership: MembershipType;
  joinedDate: string;
}

export type BookingStatus = 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

export interface Booking {
  id: string;
  resourceId: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  totalHours: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  notes: string;
  addOns: string[];
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  description: string;
}
