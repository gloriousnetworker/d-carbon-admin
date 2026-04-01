# DCARBON ADMIN DASHBOARD — CODEBASE CONTEXT

> This file is the single source of truth for understanding the DCarbon Admin Dashboard codebase.
> Use it as a reference before making any changes to the project.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Configuration Files](#4-configuration-files)
5. [Routing & Pages](#5-routing--pages)
6. [Component Architecture](#6-component-architecture)
7. [API Layer](#7-api-layer)
8. [State Management](#8-state-management)
9. [Authentication & Security](#9-authentication--security)
10. [Data Models](#10-data-models)
11. [Utilities & Helpers](#11-utilities--helpers)
12. [Styling & Design System](#12-styling--design-system)
13. [Environment Variables](#13-environment-variables)
14. [Key Business Features](#14-key-business-features)
15. [Export & Document Management](#15-export--document-management)
16. [Build & Deployment](#16-build--deployment)
17. [Key File Paths Reference](#17-key-file-paths-reference)

---

## 1. PROJECT OVERVIEW

| Property | Value |
|---|---|
| **Project Name** | dcarbon-admin |
| **Type** | Admin Dashboard Web App |
| **Framework** | Next.js 15.3.6 with App Router |
| **Language** | JavaScript/JSX (with TypeScript config) |
| **Deployment** | Vercel |
| **API** | `https://api.dev.dcarbon.solutions` (dev) |

**Purpose:** An admin dashboard for the DCarbon platform — a renewable energy management system. Admins use this dashboard to manage REC (Renewable Energy Credit) sales, residential/commercial facility users, commission structures, payouts, system jobs, and more.

---

## 2. TECH STACK & DEPENDENCIES

### Core
- **Next.js** `^15.3.6` — React framework with App Router and Turbopack
- **React** `^18.3.1` / **React-DOM** `^18.3.1`

### UI & Styling
| Package | Version | Purpose |
|---|---|---|
| `@nextui-org/react` | `^2.6.11` | Primary UI component library (Tailwind-based) |
| `tailwindcss` | `^3.4.17` | Utility-first CSS framework |
| `lucide-react` | `^0.507.0` | Icon library |
| `react-icons` | `^5.5.0` | Additional icons (FontAwesome etc.) |
| `@heroicons/react` | `^2.2.0` | Heroicons |
| `@fortawesome/fontawesome-free` | `^6.7.2` | FontAwesome icons |
| `@fortawesome/react-fontawesome` | `^0.2.2` | React FontAwesome wrapper |
| `@radix-ui/react-avatar` | — | Accessible avatar |
| `@radix-ui/react-select` | — | Accessible select |
| `@radix-ui/react-tabs` | — | Accessible tabs |
| `@radix-ui/react-tooltip` | — | Accessible tooltip |
| `next-themes` | `^0.4.6` | Theme management |
| `class-variance-authority` | `^0.7.1` | Component variant classes |
| `embla-carousel-react` | `^8.6.0` | Carousel component |
| `gsap` | `^3.12.7` | Animations |
| `react-resizable-panels` | `^3.0.1` | Resizable panels |

### Data & Forms
| Package | Version | Purpose |
|---|---|---|
| `axios` | `^1.8.4` | HTTP client with interceptors |
| `react-hook-form` | `^7.56.2` | Form state management |
| `date-fns` | `^4.1.0` | Date utilities |
| `react-day-picker` | `^9.7.0` | Date picker component |

### Charts & Visualization
| Package | Version | Purpose |
|---|---|---|
| `recharts` | `^2.15.3` | React charting library |
| `canvas` | `^3.1.2` | Node.js canvas for rendering |

### Export & Documents
| Package | Version | Purpose |
|---|---|---|
| `@react-pdf/renderer` | `^4.3.0` | PDF rendering in React |
| `jspdf` | `^3.0.1` | PDF generation |
| `jspdf-autotable` | `^5.0.2` | PDF table formatting |
| `xlsx` | `^0.18.5` | Excel read/write |
| `papaparse` | `^5.5.2` | CSV parsing |
| `jszip` | `^3.10.1` | ZIP file creation |
| `file-saver` | `^2.0.5` | File download utility |
| `react-pdf` | `^5.7.2` | PDF viewer component |
| `react-signature-canvas` | `^1.1.0-alpha.2` | Signature capture |

### Notifications
| Package | Version | Purpose |
|---|---|---|
| `react-hot-toast` | `^2.5.2` | Toast notifications |
| `react-toastify` | `^11.0.5` | Alternative toast |
| `sonner` | `^2.0.3` | Sonner toast (Shadcn default) |

### Dev Dependencies
- `typescript` `^5`
- `@types/node` `^20`, `@types/react` `^19.1.2`, `@types/react-dom` `^19`
- `eslint` `^9`, `eslint-config-next` `15.3.1`
- `@tailwindcss/postcss` `^4.0.3`

---

## 3. PROJECT STRUCTURE

```
dcarbon-admin/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                    # Auth route group (no shared layout)
│   │   │   ├── login/page.jsx
│   │   │   ├── forgot-password/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   └── reset-password/
│   │   │       ├── page.jsx
│   │   │       ├── otp-verification/page.jsx
│   │   │       ├── change-password/page.jsx
│   │   │       └── login/two-factor-authentication/page.jsx
│   │   ├── admin-dashboard/page.jsx   # Main protected dashboard page
│   │   ├── signin/page.jsx            # Legacy signin path
│   │   ├── layout.jsx                 # Root layout (ProfileProvider + Toaster)
│   │   └── page.jsx                   # Root redirect (auth check → dashboard or login)
│   │
│   ├── components/
│   │   ├── (auth)/                    # Auth form components
│   │   │   ├── login/LoginCard.jsx
│   │   │   ├── register/RegisterCard.jsx
│   │   │   ├── reset-password/ResetPasswordCard.jsx
│   │   │   ├── otp-verification/OtpVerificationCard.jsx
│   │   │   ├── PasswordResetSuccess.jsx
│   │   │   ├── ForgotPasswordVerificationCard.jsx
│   │   │   └── TwoFactorAuthentication.jsx
│   │   │
│   │   ├── dashboard/                 # All dashboard feature modules
│   │   │   ├── DashboardSidebar.jsx   # Navigation sidebar
│   │   │   ├── DashboardNavbar.jsx    # Top navigation bar
│   │   │   ├── styles.js              # Shared Tailwind class constants
│   │   │   ├── overview/              # Dashboard home
│   │   │   ├── user-management/       # Customer/Partner/Utility management
│   │   │   ├── rec-sales/             # REC Sales management
│   │   │   ├── commission/            # Commission structure management
│   │   │   ├── resi-group/            # Residential group management
│   │   │   ├── payout/                # Payout processing
│   │   │   ├── reporting/             # Reports & analytics
│   │   │   ├── registration-pipeline/ # User registration tracking
│   │   │   ├── system/                # System jobs & background tasks
│   │   │   ├── my-account/            # Admin account management
│   │   │   ├── agreement-management/  # Contract/agreement management
│   │   │   ├── user-support/          # Support ticket management
│   │   │   ├── feedback/              # Feature requests & feedback
│   │   │   ├── notifications/         # Notification center
│   │   │   ├── help-centre/           # FAQ and help docs
│   │   │   ├── contact-support/       # Support contact form
│   │   │   ├── faq/                   # FAQ section
│   │   │   └── logout/                # Logout confirmation
│   │   │
│   │   ├── ui/                        # 54 Shadcn/UI components
│   │   │   └── [button, card, dialog, form, table, tabs, input, select,
│   │   │       modal, alert, badge, carousel, collapsible, context-menu,
│   │   │       date-picker, pagination, progress, radio-group, scroll-area,
│   │   │       separator, slider, toast, toggle, tooltip, avatar, breadcrumb,
│   │   │       navigation-menu, popover, sheet, input-otp, ...]
│   │   │
│   │   ├── modals/                    # Modal dialog components
│   │   │   ├── CustomerManagement/    # Invite, bulk invite, reminder modals
│   │   │   ├── PartnerModals/         # Add/edit partner modals
│   │   │   ├── CommercialModals/      # Owner/operator invitation modals
│   │   │   ├── UtilityModals/         # Utility provider & instapull modals
│   │   │   ├── PayoutModals/          # Filter modals for payouts
│   │   │   └── OverviewModals/        # Resolve/statement/reminder modals
│   │   │
│   │   ├── loader/                    # Loading spinner
│   │   ├── contexts/                  # React Context providers
│   │   │   └── ProfileContext.js      # Admin profile context
│   │   └── signin/                    # Legacy signin component
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx             # Responsive: checks viewport < 640px
│   │   └── use-toast.js              # Toast hook
│   │
│   ├── lib/
│   │   ├── axiosInstance.js           # Axios instance with interceptors
│   │   ├── config.js                  # API base URL configuration
│   │   ├── exportUtils.js             # Excel/CSV export utilities
│   │   ├── documentExport.js          # ZIP document package export
│   │   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
│   │
│   └── styles/
│       └── globals.css                # Global CSS (Tailwind directives, font-face, custom utilities)
│
├── public/                            # Static assets (images, SVGs, icons)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.ts
├── postcss.config.js
└── .gitignore
```

---

## 4. CONFIGURATION FILES

### `src/lib/config.js`
```javascript
// API base URL — override with NEXT_PUBLIC_API_URL env var
API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.dev.dcarbon.solutions'
```

### `src/lib/axiosInstance.js`
- Creates Axios instance with `baseURL` from config
- **Request interceptor**: Attaches `Authorization: Bearer <token>` from `localStorage.authToken`
- **Response interceptor**: On 401, clears all auth localStorage keys and redirects to `/login?reason=session_expired`

### `tailwind.config.js`
- **Custom colors**: `background: #f9fafb`, `foreground: #111827`
- **Font**: SF Pro Text with system fallbacks
- **Custom animations**: `rotate`, `beep`, `blink`, `dotBlink`
- **Plugins**: `@nextui-org/react` plugin
- **Content paths**: `app/`, `features/`, `components/`, `contexts/`, `pages/`

### `tsconfig.json`
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` → `./src/*`
- Includes JSX, Next.js setup

### `next.config.ts`
- Minimal — uses Next.js defaults

---

## 5. ROUTING & PAGES

### Auth Routes (`src/app/(auth)/`)
| Route | Component | Purpose |
|---|---|---|
| `/login` | `LoginCard.jsx` | Admin login |
| `/forgot-password` | `ForgotPasswordVerificationCard.jsx` | Password recovery entry |
| `/register` | `RegisterCard.jsx` | Admin registration |
| `/reset-password` | `ResetPasswordCard.jsx` | Reset password |
| `/reset-password/otp-verification` | `OtpVerificationCard.jsx` | OTP verification |
| `/reset-password/change-password` | — | New password entry |
| `/login/two-factor-authentication` | `TwoFactorAuthentication.jsx` | 2FA setup |

### Protected Routes
| Route | Purpose |
|---|---|
| `/` | Redirects to `/admin-dashboard` if authed, else `/login` |
| `/admin-dashboard` | Main dashboard (all features rendered here as tabs/sections) |
| `/signin` | Legacy signin path |

### Auth Guard Logic (`src/app/page.jsx`)
```javascript
// Checks localStorage:
const token = localStorage.getItem('authToken');
const role = localStorage.getItem('userRole');
if (token && role === 'ADMIN') → redirect to /admin-dashboard
else → redirect to /login
```

---

## 6. COMPONENT ARCHITECTURE

### Dashboard Navigation
- **`DashboardSidebar.jsx`** — Left sidebar with all navigation links. Controls which section/module is currently displayed.
- **`DashboardNavbar.jsx`** — Top bar with search, notifications, profile avatar.

### Main Feature Modules (`src/components/dashboard/`)

#### Overview (`overview/DashboardOverview.jsx`)
- `QuickActions` — Quick action shortcut buttons
- `Graph` — Dashboard analytics chart (Recharts)
- `RecentRecSales` / `CustomerCards` — Recent activity feed

#### User Management (`user-management/UserManagement.jsx`)
Manages three entity types with separate sub-views:
- **Customers**: Residential & Commercial facility owners
  - `CommercialDetails.jsx` — Commercial facility detail view
  - `ResidentialDetails.jsx` — Residential facility detail view
  - Modals: Invite, bulk invite, send reminder, filter
- **Partners**: Installers, sales agents, finance companies
  - `PartnerManagement.jsx`
  - Modals: Add partner, edit partner
- **Utility Providers**:
  - `UtilityProviderManagement.jsx`
  - Modals: Add utility provider, Instapull authorization

#### REC Sales Management (`rec-sales/RECManagement.jsx`)
- `OverviewCards` — KPI summary cards
- `Graphs` — REC sales analytics charts
- `ListOfBuyersCard` — REC buyer information
- `ManagementContent` — REC generation & WREGIS reporting
- `RecEntries` — REC entry management
- `BuyerManagement` — REC buyer CRUD

#### Commission Structure (`commission/CommissionStructure.jsx`)
Commission types supported:
- Residential: Direct Customer, Sales Agent Referral
- Commercial: Direct Customer, Sales Agent Referral
- EPC-Assisted: Finance/Installer
- Account-Level Based Referral (sales agents)
- Bonus Commissions

Sub-components:
- `CommissionTable` — Display current commission tiers
- `CommissionSetupModal` — Create/edit commission
- `ManageTiersModal` — Tier CRUD
- `BonusCommissionStructure` — Bonus commission config

#### Residential Group Management (`resi-group/ResiGroupManagement.jsx`)
- `ResiGroupManagementDetails` — Detailed group view
- `ResidentGroupDetailsFilterByModal` — Group filtering
- Create groups, add/remove facilities, track KW capacity

#### Payout Processing (`payout/PayoutProcessing.jsx`)
- `ResidentialRedemptionPayout` — Pay residential customers
- `CommercialStatementReport` — Commercial facility payouts
- `PartnerCommissionPayout` — Distribute partner commissions
- `InvoiceReview` — View and download payout invoices

#### Reporting (`reporting/Reporting.jsx`)
- Residential/Commercial REC generation reports
- Partner performance reports
- WREGIS generation reports
- Invoice management (upload, download, preview PDF/images)

#### Registration Pipeline (`registration-pipeline/RegistrationPipeline.jsx`)
Tracks user registration stages:
1. Invited
2. Registered
3. Documents Under Review
4. Documents Approved
5. Facility Verified
6. Active (generating RECs)
7. Terminated

#### System Jobs (`system/SystemJobs.jsx`)
Manual triggers for backend jobs:
- Commission calculation
- Sales agent bonus calculation (auto 15-min delay)
- REC generation triggers
- Job log viewer (`GET /api/job-log`)

#### My Account (`my-account/`)
- `ProfileImage` — Avatar upload
- `ContactInformation` — Account details display/edit
- `TwoFactorAuth` — 2FA configuration
- `ChangePasswordModal` — Password change

#### Supporting Modules
| Module | Path | Purpose |
|---|---|---|
| Agreement Management | `agreement-management/` | Contract/agreement docs |
| User Support | `user-support/` | Support ticket management |
| Feedback | `feedback/FeedbackPage.jsx` | Feature requests & bug reports |
| Notifications | `notifications/` | Notification center |
| Help Centre | `help-centre/HelpCentre.jsx` | FAQ and help docs |
| Contact Support | `contact-support/` | Support contact form |
| FAQ | `faq/Faq.jsx` | FAQ section |
| Logout | `logout/` | Logout confirmation modal |

### UI Component Library (`src/components/ui/`)
54 Shadcn/Radix-based components including:
`button`, `card`, `dialog`, `form`, `table`, `tabs`, `input`, `select`, `badge`, `alert`,
`avatar`, `breadcrumb`, `calendar`, `carousel`, `checkbox`, `collapsible`, `command`,
`context-menu`, `dropdown-menu`, `hover-card`, `input-otp`, `label`, `menubar`,
`navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `scroll-area`,
`separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`,
`textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`

---

## 7. API LAYER

### Base URL
```
https://api.dev.dcarbon.solutions  (default dev)
```
Controlled by `NEXT_PUBLIC_API_URL` env variable.

### Axios Instance (`src/lib/axiosInstance.js`)
```javascript
// Auto-attaches Bearer token from localStorage
headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }

// On 401: clears auth data, redirects to /login?reason=session_expired
```

### All Known API Endpoints

#### Authentication
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/admin/login` | Admin login |

#### User Management
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/user/get-one-user/{userId}` | Get user profile |
| GET | `/api/admin/get-all-users?page={page}&limit={limit}` | Paginated user list |
| POST | `/api/admin/proxy-document?url={url}` | Proxy GCS docs (CORS workaround) |

#### Commission Structure
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/commission-tier` | Get all tiers |
| GET | `/api/commission-structure/modes` | Get commission modes |
| GET | `/api/commission-structure/{id}` | Get specific commission |
| POST | `/api/commission-structure` | Create commission |
| PUT | `/api/commission-structure/{id}` | Update commission |
| GET | `/api/commission-structure/residential` | Residential commissions |
| GET | `/api/commission-structure/commercial` | Commercial commissions |
| GET | `/api/commission-structure/sales-agent-referral` | Partner commissions |
| GET | `/api/commission-structure/epc-assisted` | EPC-assisted commissions |
| GET | `/api/commission-structure/sales-agent-account-level` | Account-level commissions |
| PUT | `/api/commission-tier/{id}` | Update tier |
| POST | `/api/commission-tier` | Create tier |
| GET | `/api/commission-contract-terms` | Get contract terms |
| POST | `/api/commission-contract-terms` | Create contract term |
| PUT | `/api/commission-contract-terms/{id}` | Update contract term |
| GET | `/api/bonus-structure` | Get bonus structures |
| POST | `/api/bonus-structure` | Create bonus structure |
| PUT | `/api/bonus-structure/{id}` | Update bonus structure |

#### Commission Jobs / Triggers
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/commission-cron/trigger` | Trigger commission calculation |
| POST | `/api/commission-cron/sales-agent` | Trigger sales agent commission |
| POST | `/api/bonus/trigger-bonus` | Trigger bonus calculation |

#### Residential Facilities
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/residential-facility/groups` | Get residential groups |
| POST | `/api/residential-facility/groups` | Create residential group |

#### System
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/job-log` | Get system job logs |
| GET | `/api/feature-suggestion` | Get feedback/feature suggestions |

---

## 8. STATE MANAGEMENT

### Approach
- **No Redux or Zustand** — lightweight, component-local state
- **React Context API** for global profile data
- **localStorage** for authentication persistence
- **React hooks** (`useState`, `useEffect`) for local component state
- **React Hook Form** for form management

### ProfileContext (`src/components/contexts/ProfileContext.js`)
```javascript
// Wraps entire app in layout.jsx
const { profile, updateProfile, loading, error } = useProfile();

// profile = { picture, firstName }
// updateProfile() fetches from API using userId from localStorage
// Initially reads from localStorage values
```

### localStorage Keys
| Key | Value | Purpose |
|---|---|---|
| `authToken` | JWT string | API authentication |
| `userId` | string | Current admin user ID |
| `userFirstName` | string | Display name (first) |
| `userLastName` | string | Display name (last) |
| `userEmail` | string | Admin email |
| `userRole` | `'ADMIN'` | Role-based access check |
| `userProfilePicture` | URL string or null | Avatar URL |

### Data Fetching Pattern
```javascript
// Pattern used across components:
useEffect(() => {
  const token = localStorage.getItem('authToken');
  fetch(`${API_BASE_URL}/api/...`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setData(data))
  .catch(err => toast.error(err.message));
}, []);
```

---

## 9. AUTHENTICATION & SECURITY

### Login Flow
1. User submits email + password in `LoginCard.jsx`
2. Email is normalized (lowercase, trimmed)
3. `POST /api/auth/admin/login` with `{ email, password }`
4. Response: `{ admin: { id, firstName, lastName, email, role, profilePicture }, token }`
5. Validates `admin.role === 'ADMIN'` — rejects non-admin users
6. Stores all fields to localStorage
7. Redirects to `/admin-dashboard`

### Session Expiration
- Axios interceptor catches all 401 responses globally
- Clears all 7 localStorage auth keys
- Redirects to `/login?reason=session_expired`

### Route Protection
- `/admin-dashboard` checks `localStorage.authToken` + `userRole === 'ADMIN'`
- Unauthorized users → redirect to `/login`

### Additional Security Features
- 2FA support via `TwoFactorAuthentication.jsx`
- Password reset with OTP flow
- Profile picture upload handling
- CORS workaround for GCS documents via API proxy (`/api/admin/proxy-document`)

---

## 10. DATA MODELS

### Admin User
```typescript
{
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN'
  profilePicture: string | null
  token: string  // JWT
}
```

### Customer/Facility User
```typescript
{
  id: string
  name: string
  email: string
  phoneNumber: string
  userType: string          // RESIDENTIAL | COMMERCIAL
  status: string
  utilityProvider: string
  financeCompany: string
  address: string
  facilityStatus: string
  dateRegistered: string
}
```

### Partner
```typescript
{
  id: string
  name: string
  email: string
  phoneNumber: string
  partnerType: string       // INSTALLER | SALES_AGENT | FINANCE_COMPANY
  status: string
  address: string
  dateRegistered: string
}
```

### Commission Structure
```typescript
{
  id: string
  mode: string              // DIRECT_CUSTOMER | SALES_AGENT_REFERRAL | EPC_ASSISTED | ACCOUNT_LEVEL
  propertyType: string      // RESIDENTIAL | COMMERCIAL
  tiers: CommissionTier[]
  createdAt: string
  updatedAt: string
}
```

### Commission Tier
```typescript
{
  id: string
  name: string
  order: number
  minValue: number
  maxValue: number
  rate: number              // percentage
}
```

### Residential Group
```typescript
{
  id: string
  name: string
  dcarbonGroupId: string
  wregisGroupId: string
  facilities: ResidentialFacility[]
  totalKWCapacity: number
}
```

### REC (Renewable Energy Credit)
```typescript
{
  id: string
  facilityId: string
  generationAmount: number
  saleStatus: string
  buyerInfo: object
  generationDate: string
}
```

### Registration Pipeline Stages
```
invited → registered → docs_pending → docs_approved → verified → active → terminated
```

---

## 11. UTILITIES & HELPERS

### `src/lib/exportUtils.js`
```javascript
exportToExcel(data, columns, filename, sheetName)
// Exports array of objects to .xlsx using XLSX library

exportToCSV(data, columns, filename)
// Exports to .csv using PapaParse + file-saver

// Pre-defined column schemas:
CUSTOMER_COLUMNS    // Customer data export columns
PARTNER_COLUMNS     // Partner data export columns
WREGIS_REGULATOR_COLUMNS  // Regulatory reporting columns
```

### `src/lib/documentExport.js`
```javascript
exportDocumentPackage(documents, facilityInfo, onProgress)
// Creates a ZIP of all facility documents
// Proxies GCS documents to handle CORS
// Generates WREGIS_Document_Checklist.txt
// Uses JSZip + file-saver
```

### `src/lib/utils.ts`
```typescript
cn(...classes)  // Merges class names using clsx + tailwind-merge
```

### `src/hooks/use-mobile.tsx`
```typescript
const isMobile = useIsMobile()
// Returns true if viewport width < 640px
```

### `src/components/dashboard/styles.js`
100+ exported Tailwind class constants for consistent styling:
```javascript
// Examples:
export const inputClass = "border rounded-lg px-3 py-2 text-sm ..."
export const tableHeaderClass = "text-xs font-medium text-gray-500 ..."
export const primaryButtonClass = "bg-[#039994] text-white rounded-lg ..."
// etc.
```

---

## 12. STYLING & DESIGN SYSTEM

### Primary Design Tokens
| Token | Value | Usage |
|---|---|---|
| Primary Color | `#039994` | Buttons, accents, highlights |
| Background | `#f9fafb` | Page background |
| Foreground | `#111827` | Body text |
| Font | SF Pro Text → system-ui fallback | All text |

### CSS Approach
- Tailwind CSS v3.4.17 utility classes (primary)
- NextUI component library with Tailwind integration
- PostCSS with Tailwind + AutoPrefixer

### Global Styles (`src/styles/globals.css`)
- Tailwind base/components/utilities directives
- Custom `@font-face` for SF Pro Text
- Custom utilities:
  - `.text-balance` — CSS `text-wrap: balance`
  - `.hide-scrollbar` — Hides scrollbars cross-browser

### Custom Animations (`tailwind.config.js`)
```javascript
rotate:    '2s linear infinite rotation'
beep:      '1.5s pulse effect'
blink:     '1.2s opacity fade'
dotBlink:  'Staggered 3-dot blinking (0s, 0.2s, 0.4s delays)'
```

### Visual Patterns Used
- Glassmorphism (backdrop blur + semi-transparent backgrounds)
- Card-based layout with shadows
- Sidebar navigation (fixed left)
- Top navbar (fixed top)
- Modal/drawer overlays for forms
- Tab-based content switching within pages

---

## 13. ENVIRONMENT VARIABLES

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.dev.dcarbon.solutions` |

> `.env*` files are gitignored. Create a `.env.local` file locally for overrides.

---

## 14. KEY BUSINESS FEATURES

### 1. Admin Authentication
- Role-restricted login (ADMIN only)
- 2FA support
- Password reset with OTP
- Session expiration handling

### 2. Customer Management
- View/search residential & commercial facility owners
- Invite new customers (single & bulk CSV import)
- Send reminders to pending customers
- Export customer data (Excel/CSV)
- View detailed commercial & residential facility information

### 3. Partner Management
- Manage installers, sales agents, and finance companies
- Add/edit partner profiles
- Filter partners by type and status
- Partner performance tracking

### 4. Utility Provider Management
- Add and manage utility companies
- Instapull authorization (utility API integration)
- Handle utility authentication requests

### 5. Commission Structure Management
- Configure commission tiers for multiple modes:
  - Direct Customer (Residential & Commercial)
  - Sales Agent Referral (Residential & Commercial)
  - EPC-Assisted (Finance/Installer)
  - Account-Level Based (Sales Agents)
- Manage bonus commission structures
- Set commission contract terms by property type
- Manual commission calculation triggers

### 6. REC Sales Management
- Track REC generation (residential & commercial)
- Manage REC buyers
- View sales KPIs and analytics (Recharts)
- WREGIS regulatory reporting
- REC entry CRUD

### 7. Residential Group Management
- Create solar/REC groups
- Add residential facilities to groups
- Track total KW capacity per group
- Remove facilities and delete groups
- WREGIS group ID assignment

### 8. Payout Processing
- Residential redemption payouts
- Commercial statement report generation
- Partner commission distribution
- Invoice review and download

### 9. Reporting & Analytics
- REC generation reports (residential & commercial)
- Partner performance reports
- WREGIS generation reports
- Invoice upload/download/preview

### 10. Registration Pipeline
- Visual funnel of user registration stages
- Stage-by-stage counts and analytics
- Action-required notifications

### 11. System Jobs
- Manual triggers for backend cron jobs
- Job execution log viewer
- Commission and bonus calculation triggers

### 12. Account Management
- Profile picture upload/update
- Contact information edit
- 2FA setup
- Password change

### 13. Support & Feedback
- Support ticket management
- Feature request submission
- FAQ and help documentation
- Contact support form

---

## 15. EXPORT & DOCUMENT MANAGEMENT

### Export Types
| Type | Library | Utility |
|---|---|---|
| Excel (.xlsx) | XLSX | `exportUtils.js → exportToExcel()` |
| CSV (.csv) | PapaParse | `exportUtils.js → exportToCSV()` |
| ZIP (documents) | JSZip + file-saver | `documentExport.js → exportDocumentPackage()` |
| PDF (reports) | jsPDF + autotable | inline in components |
| PDF (viewing) | react-pdf | `InvoiceReview.jsx` |

### Document Proxy Pattern
GCS (Google Cloud Storage) documents cannot be fetched client-side due to CORS.
Solution: API proxy endpoint proxies the GCS fetch server-side:
```
POST /api/admin/proxy-document?url={encodedGCSUrl}
→ Returns: document blob or base64
```

---

## 16. BUILD & DEPLOYMENT

### npm Scripts
```bash
npm run dev    # Development server with Turbopack
npm run build  # Production build
npm start      # Start production server
npm run lint   # ESLint check
```

### Deployment Platform: Vercel
- Automatic deployments on push to main
- Environment variables set in Vercel project settings
- `NEXT_PUBLIC_API_URL` must be set per environment (dev/staging/prod)

### Performance Notes
- Next.js App Router (React Server Components by default)
- Dynamic imports for code splitting
- Next.js Image optimization
- Font optimization for SF Pro Text
- Turbopack for fast dev builds

---

## 17. KEY FILE PATHS REFERENCE

| Purpose | Path |
|---|---|
| **API Config** | `src/lib/config.js` |
| **Axios Instance** | `src/lib/axiosInstance.js` |
| **Root Layout** | `src/app/layout.jsx` |
| **Auth Guard / Root Redirect** | `src/app/page.jsx` |
| **Admin Dashboard Page** | `src/app/admin-dashboard/page.jsx` |
| **Login Form** | `src/components/(auth)/login/LoginCard.jsx` |
| **Sidebar Navigation** | `src/components/dashboard/DashboardSidebar.jsx` |
| **Top Navbar** | `src/components/dashboard/DashboardNavbar.jsx` |
| **Dashboard Overview** | `src/components/dashboard/overview/DashboardOverview.jsx` |
| **User Management** | `src/components/dashboard/user-management/UserManagement.jsx` |
| **Commission Structure** | `src/components/dashboard/commission/CommissionStructure.jsx` |
| **REC Sales** | `src/components/dashboard/rec-sales/RECManagement.jsx` |
| **Payout Processing** | `src/components/dashboard/payout/PayoutProcessing.jsx` |
| **Reporting** | `src/components/dashboard/reporting/Reporting.jsx` |
| **Resi Group Mgmt** | `src/components/dashboard/resi-group/ResiGroupManagement.jsx` |
| **Registration Pipeline** | `src/components/dashboard/registration-pipeline/RegistrationPipeline.jsx` |
| **System Jobs** | `src/components/dashboard/system/SystemJobs.jsx` |
| **My Account** | `src/components/dashboard/my-account/` |
| **Profile Context** | `src/components/contexts/ProfileContext.js` |
| **Export Utilities** | `src/lib/exportUtils.js` |
| **Document Export** | `src/lib/documentExport.js` |
| **Shared Style Classes** | `src/components/dashboard/styles.js` |
| **cn() Utility** | `src/lib/utils.ts` |
| **Global CSS** | `src/styles/globals.css` |
| **Tailwind Config** | `tailwind.config.js` |

---

## APPENDIX: PLANNING & DOCUMENTATION FILES

These markdown files exist in the project root and contain planning/tracking information:

| File | Purpose |
|---|---|
| `BACKEND_ENDPOINTS_NEEDED.md` | Backend integration requirements list |
| `CLIENT_FEEDBACK_PLAN.md` | User feedback feature implementation plan |
| `CROSS_REPO_IMPACT.md` | Multi-repo integration impact analysis |
| `EXPORT_IMPLEMENTATION_PLAN.md` | Export feature planning |
| `QA-Implementation-Plan.md` | QA testing procedures |
| `QA-Reports.md` | Quality assurance reports |
| `UI_UX_GAP_FIX_PLAN.md` | UI/UX improvement tracking |

---

*Last updated: 2026-03-17*
*Generated from full codebase analysis of dcarbon-admin*
