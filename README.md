# 🍕 Bhoj Bilash — Restaurant OS (Next.js Frontend)

Next.js 15 (App Router) + TypeScript staff-only restaurant system — POS billing, menu/packages, khata (staff/attendance/expense/salary), settings, public home/menu. **Backend-connected:** all data comes from the Django DRF API via `lib/api/*` (thin fetch adapter; `NEXT_PUBLIC_API_URL` required) — contract in repo-root `LEARNING_MODULES.md` + `database.md`.

**Live Demo:** https://bhoj-bilash.vercel.app/ — **Repo:** https://github.com/siam-khan-alt/bhoj-bilash-frontend

---

## 📋 Overview

Single-restaurant operating system for dokan staff (not a customer delivery app):

- **Public:** home (hero, offers, bestsellers, hours, reviews), full menu — no login needed
- **Staff (login required):** POS walk-in billing + phone-based customer history, orders + status flow
- **Admin:** foods/packages CRUD, khata (staff, attendance, expenses, salary/hisab), settings (config, hours, options, reviews)
- **Roles:** `admin` (full) / `cashier` (POS + orders + khata entry; no foods/packages/settings writes). No public register — staff-only system.

---

## ✨ Features

### Public
- Home: HeroSlider, OfferBanner (package `offerPrice`), CategoryShowcase, BestSellers, PopularDrinks, OpeningHours badge, Reviews, Gallery, VisitUs
- `/menu` — search, category filter (`?category=`), price sort, available-only
- Bengali/English toggle, dark/light theme, toasts, custom UI

### Staff (`/admin/pos`, `/admin/orders`)
- Walk-in POS bill: foods + package lines, phone number, `dine_in/parcel/both`, discount, cash/card → bill receipt
- Orders list, `placed → preparing → delivered / cancelled` status flow (admin), customer history modal by phone (totals: paid-only)

### Admin
- Dashboard stats: totalOrders, totalRevenue (paid only), totalFoods
- Foods/packages CRUD + image preview + `available`/`active` toggle
- Khata: staff CRUD, attendance mark (same-day re-mark = update) + monthly view, expenses CRUD, salary pay, hisab summary (sales − expenses − salaryPaid, per-staff due)
- Settings: restaurant config (saved to DB via `/api/config`), 7-day hours, option lists (locked values guarded)

---

## 🛠️ Tech Stack

- Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS v4 (`app/globals.css` @theme)
- `lucide-react`, `react-hot-toast`, `qrcode.react`
- API layer: `lib/api/*` — `apiFetch` (Bearer + `{message}` errors) + `apiFetchAll` (follows pagination); `lib/restaurant.ts` (defaults), `lib/salary.ts` (earned math)
- Backend: Django DRF + PostgreSQL (repo `/backend`) — contract kept in `types/index.ts`

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 // Home
│   ├── menu/page.tsx            // Public menu
│   ├── login/page.tsx           // Staff login (no register page)
│   └── admin/
│       ├── layout.tsx           // staff guard + sidebar
│       ├── page.tsx             // Dashboard
│       ├── pos/page.tsx         // Walk-in POS + BillReceipt
│       ├── orders/page.tsx
│       ├── foods/page.tsx
│       ├── packages/page.tsx
│       ├── staff/page.tsx + staff/[id]/page.tsx
│       ├── attendance/page.tsx
│       ├── expenses/page.tsx
│       ├── hisab/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── layout/ (AppChrome, Navbar, Footer)
│   ├── common/ (Button, Input, CustomSelect, Modal, SectionHeader, Toast, LangToggle)
│   ├── home/ (HeroSlider, OfferBanner, CategoryShowcase, BestSellers, PopularDrinks, OpeningHours, Reviews, Gallery, VisitUs)
│   ├── admin/ (CategorySelector, CustomerDetailsModal, OptionListEditor)
│   ├── dashboard/ (DashboardShell)
│   └── pos/ (BillReceipt)
├── context/ (AuthContext, ThemeContext, LanguageContext, RestaurantContext)
├── lib/
│   ├── api/ (client + auth, food, packages, orders, staff, attendance, expenses, salary, options, reviews, hisab, config)
│   ├── restaurant.ts  (first-paint defaults; live config via /api/config)
│   └── salary.ts      (earned = present×1 + half×0.5, per-day = salary÷30)
├── types/index.ts     // contract: _id, createdAt, camelCase — backend must match these names
├── .env.local         // NEXT_PUBLIC_API_URL — backend connection (required)
└── public/ (logo, hero-*, stat-*, placeholder-food.png)
```

---

## ⚙️ Installation & Setup

Prerequisites: Node.js v18+

```bash
git clone https://github.com/siam-khan-alt/bhoj-bilash-frontend.git
cd bhoj-bilash-frontend
npm install
npm run dev
```

App at `http://localhost:3000`. Build: `npm run build`.

**Backend required** — start Django first (`backend/`, `runserver` on `:8000`), then `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Prod (Vercel): `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api`. Missing URL → app shows a clear error instead of data.

---

## 🔑 Demo Credentials (login-only, no register)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Cashier | cashier@test.com | cashier123 |

Quick-login buttons on `/login`. Cashier is blocked from foods/packages/settings writes.

---

## 🔌 API Layer (Django DRF — live)

All functions call the real backend via `apiFetch` / `apiFetchAll` (Bearer token, `{message}` errors) — see `LEARNING_MODULES.md` cheat sheet:

| Function | Endpoint | Access | Shape |
|---|---|---|---|
| `login({email,password})` | `POST /api/auth/login` | public | `{ user, token }` |
| `getFoods()` | `GET /api/foods` | public | bare array `[Food]` |
| `add/update/deleteFood` | `POST/PATCH/DELETE /api/foods…` | admin | `Food` / `204` |
| `getPackages(activeOnly)` | `GET /api/packages?active=1` | public | bare array `[Package]` |
| `add/update/deletePackage` | `POST/PATCH/DELETE /api/packages…` | admin | `Package` / `204` |
| `createOrder()` | `POST /api/orders` | staff | `{ order }` |
| `getAllOrders()` | `GET /api/orders` | staff | bare array (`apiFetchAll` follows every page) |
| `getOrderById()` | `GET /api/orders/:id` | staff | bare order object |
| `getCustomerOrders(phone)` | `GET /api/orders/by-phone?phone=` | staff | `{ customer, totalOrders, totalSpent, orders }` |
| `updateOrderStatus()` | `PATCH /api/orders/:id/status` | admin | `Order` |
| staff/attendance/expenses/salary | `/api/staff`, `/api/attendance`, `/api/expenses`, `/api/salary…` | staff | bare arrays / objects |
| hisab summary | `GET /api/hisab/summary?month=` | staff | `{ sales, expenses, salaryPaid, cash, dueByStaff[] }` |
| config/hours/options/reviews | `/api/config`, `/api/options?key=`, `/api/reviews` | public GET / admin write | objects / arrays |

Field rules: `_id` string, money = JSON number, `createdAt` ISO, `category`/`job` plain strings, errors `{ message }`. Enums lowercase (`admin|cashier`, `placed|preparing|delivered|cancelled`, `pending|paid|failed`, `dine_in|parcel|both`).

`localStorage` holds only auth cache + UI prefs (`token`, `user`, `cart`, `theme`) — all server state lives in PostgreSQL. Order prices are recomputed server-side (client numbers never trusted).

---

## 🔐 Notes

- Auth = real JWT (SimpleJWT) from `POST /api/auth/login`; `token`+`user` cached in `localStorage` (stale `mock-jwt-…` tokens auto-cleared).
- No register page by design (staff-only); users are seeded.
- Package order lines are single pseudo-lines (`category: "Package"`), not split into items.

---

## 👤 Author

**Md Siam Khan** — nssiam99@gmail.com — [Portfolio](https://siamkhan-portfolio.vercel.app/) | [LinkedIn](https://www.linkedin.com/in/siam-khan-sp99/) | [GitHub](https://github.com/siam-khan-alt)
