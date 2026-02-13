/**
 * Enrollment & Class Types
 */

export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
export type PaymentMethod = 'xendit';

export interface ClassModel {
  id: string;
  name: string;
  slug: string;
  code: string;
  level: string;
  description: string;
  curriculum?: string[];
  prerequisites?: string[];
  min_score?: number;
  min_age?: number;
  max_age?: number;
  duration_hours: number;
  total_sessions: number;
  price: number;
  price_formatted: string;
  capacity: number;
  enrolled_count: number;
  image?: string;
  is_active: boolean;
  is_featured: boolean;
  program_name: string;
}

export interface ClassSchedule {
  id: string;
  batch_name: string;
  start_date: string;
  end_date: string;
  day_of_week: string;
  time: string;
  start_time: string;
  end_time: string;
  location: string;
  remaining_slots: number;
}

export interface Enrollment {
  id: string;
  enrollment_number: string;
  status: EnrollmentStatus;
  status_label: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_age: number;
  student_grade?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  special_requirements?: string;
  notes?: string;
  enrolled_at: string;
  enrolled_at_formatted: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  class: ClassModel;
  schedule?: ClassSchedule;
  payment?: Payment;
}

export interface Payment {
  id: string;
  invoice_number: string;
  status: PaymentStatus;
  status_label: string;
  status_color: string;
  amount: number;
  amount_formatted: string;
  admin_fee: number;
  admin_fee_formatted: string;
  total_amount: number;
  total_amount_formatted: string;
  payment_method: PaymentMethod;
  xendit_invoice_url?: string;
  expired_at?: string;
  expired_at_formatted?: string;
  paid_at?: string;
  paid_at_formatted?: string;
  created_at_formatted: string;
}

export interface EnrollmentFormData {
  class_id: string;
  schedule_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_age: number;
  student_grade?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  special_requirements?: string;
}
