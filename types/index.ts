export type Role = "admin" | "cashier";
export type OrderStatus = "placed" | "preparing" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderType = "dine_in" | "parcel" | "both"; // ekhane khabe | parcel nibe | 2 tai

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
  available: boolean; // ajke dokane ase kina
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
  totalAmount: number; // final payable (subtotal - discount)
  discount: number; // koto taka char deya hoise
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
  hours?: DayHours[]; // index = JS getDay() (0 = রবিবার) — ৭ দিনের সময়সূচি
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "22:00"
  closed?: boolean; // true = সেদিন বন্ধ
}

export interface Review {
  _id: string;
  name: string;
  rating: number; // 1–5
  text: string;
  createdAt: string;
}

// ---- Option Lists (settings-managed dropdown/filter values) ----

export type OptionListKey =
  | "food_category"
  | "staff_job"
  | "expense_head"
  | "payment_method"
  | "drink_size";

export interface OptionItem {
  _id: string;
  key: OptionListKey;
  value: string; // code-e save hoy (jemon "bazar", "bkash", "500ml")
  label_bn: string;
  label_en: string;
  sort: number;
  active: boolean;
  createdAt: string;
}

// ---- Khata (staff + attendance + expense + salary) ----

export interface StaffMember {
  _id: string;
  name: string;
  job: string; // baburchi / helper / cashier
  phone: string;
  monthlySalary: number;
  active: boolean;
  createdAt: string;
}

export type AttendanceStatus = "present" | "absent" | "half" | "leave";

export interface Attendance {
  _id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  inTime?: string; // HH:MM — koitai dhuklo
  outTime?: string; // HH:MM — kokhon ber holo
  note?: string;
  createdAt: string;
}

export type ExpenseCategory = string; // settings → Option Lists theke ase (bazar/salary/rent/utility/other default)

export interface Expense {
  _id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  note: string;
  amount: number;
  by: string;
  createdAt: string;
}

export interface SalaryPayment {
  _id: string;
  staffId: string;
  month: string; // YYYY-MM
  amount: number;
  note: string;
  date: string; // YYYY-MM-DD paid date
  createdAt: string;
}

// ---- Package (bundle) + Offer ----

export interface PackageItem {
  foodId: string;
  qty: number;
}

export interface Package {
  _id: string;
  name: string;
  items: PackageItem[];
  price: number; // package dam
  offerPrice?: number; // offer thakle kom dam (0/undefined = no offer)
  offerNote?: string; // jemon "Eid Offer"
  image?: string; // package cover photo (URL) — na thakle placeholder
  active: boolean;
  createdAt: string;
}
