export type Role = "admin" | "cashier";
export type OrderStatus = "placed" | "preparing" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderType = "dine_in" | "parcel" | "both";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  createdAt?: string;
}

export interface OrderItem {
  foodItem: Food;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customer: Pick<User, "_id" | "name" | "email">;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  createdAt: string;
}

export interface CustomerDetails {
  customer: Pick<User, "name" | "email" | "createdAt">;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

export interface RestaurantConfig {
  slug: string;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  hours?: DayHours[];
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface Review {
  _id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}


export type OptionListKey =
  | "food_category"
  | "staff_job"
  | "expense_head"
  | "payment_method"
  | "drink_size";

export interface OptionItem {
  _id: string;
  key: OptionListKey;
  value: string;
  label_bn: string;
  label_en: string;
  sort: number;
  active: boolean;
  createdAt: string;
}


export interface StaffMember {
  _id: string;
  name: string;
  job: string;
  phone: string;
  monthlySalary: number;
  active: boolean;
  createdAt: string;
}

export type AttendanceStatus = "present" | "absent" | "half" | "leave";

export interface Attendance {
  _id: string;
  staffId: string;
  date: string;
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
  note?: string;
  createdAt: string;
}

export type ExpenseCategory = string;

export interface Expense {
  _id: string;
  date: string;
  category: ExpenseCategory;
  note: string;
  amount: number;
  by: string;
  createdAt: string;
}

export interface SalaryPayment {
  _id: string;
  staffId: string;
  month: string;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}


export interface PackageItem {
  foodId: string;
  qty: number;
}

export interface Package {
  _id: string;
  name: string;
  items: PackageItem[];
  price: number;
  offerPrice?: number;
  offerNote?: string;
  image?: string;
  active: boolean;
  createdAt: string;
}
