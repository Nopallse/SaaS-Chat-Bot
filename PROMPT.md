# Prompt: Create SaaS Chat Bot Web Application

## Overview
Create a SaaS web application called **Blastify** - a multi-channel messaging automation platform that allows users to send bulk messages via WhatsApp and Gmail. The platform should have role-based access control (user and admin), authentication system, and comprehensive dashboards.

## Tech Stack

### Frontend
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Development Server
- **Ant Design 5** - UI Component Library
- **Zustand** - State Management
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **React Hook Form + Zod** - Form Validation
- **React Hot Toast** - Notifications
- **Date-fns** - Date Utilities

### Project Structure
Use feature-based architecture with the following structure:

```
src/
├── app/                    # Core app setup
│   ├── providers.tsx       # App providers (ConfigProvider, Toaster)
│   ├── routes.tsx          # Route configuration with lazy loading
│   └── theme.ts            # Ant Design theme config
├── features/               # Feature-based modules
│   ├── auth/              # Authentication feature
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── AuthCallbackPage.tsx
│   │   ├── services/
│   │   │   └── authApi.ts
│   │   └── types/
│   │       └── auth.ts
│   ├── home/              # Homepage feature
│   │   └── pages/
│   │       ├── HomePage.tsx
│   │       └── HomePage.css
│   ├── user/              # User features
│   │   ├── pages/
│   │   │   ├── UserDashboardPage.tsx
│   │   │   └── UserProfilePage.tsx
│   │   ├── services/
│   │   │   └── userApi.ts
│   │   └── types/
│   │       └── user.ts
│   ├── admin/             # Admin features
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   └── ManageUsersPage.tsx
│   │   ├── services/
│   │   │   └── adminApi.ts
│   │   └── types/
│   │       └── admin.ts
│   ├── wa/                # WhatsApp features
│   │   ├── pages/
│   │   │   ├── WaSessionPage.tsx      # Manage WhatsApp sessions with QR code
│   │   │   ├── WaBroadcastPage.tsx    # Send WhatsApp broadcasts
│   │   │   └── WaGroupPage.tsx        # Manage WhatsApp groups
│   │   └── services/
│   │       └── waApi.ts
│   └── email/             # Email features
│       ├── pages/
│       │   ├── EmailConnectPage.tsx   # Connect Gmail account
│       │   └── EmailBroadcastPage.tsx # Send email broadcasts
│       └── services/
│           └── emailApi.ts
├── components/            # Shared components
│   └── layout/
│       ├── main/          # Main layout (Navbar, Footer)
│       │   ├── MainLayout.tsx
│       │   ├── Navbar.tsx
│       │   └── Footer.tsx
│       ├── dashboard/     # Dashboard layout with sidebar
│       │   └── DashboardLayout.tsx
│       └── admin/         # Admin layout (Sidebar, Header)
│           ├── AdminLayout.tsx
│           ├── AdminSidebar.tsx
│           └── AdminHeader.tsx
├── store/                 # Zustand stores
│   ├── authStore.ts       # Authentication state (persisted)
│   └── uiStore.ts         # UI state (loading, notifications)
├── hooks/                 # Custom hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useFetch.ts        # Data fetching hook
│   ├── useLocalStorage.ts # LocalStorage hook
│   └── useNotification.ts # Notification hook
├── services/              # API services
│   ├── axiosInstance.ts   # Axios instance with base URL
│   └── interceptors.ts    # Request/Response interceptors
├── types/                 # TypeScript types
│   ├── api.ts             # API response types
│   └── global.ts          # Global types (User, etc.)
├── utils/                 # Utilities
│   ├── constants.ts       # App constants (routes, etc.)
│   ├── formatDate.ts      # Date formatting
│   ├── routeGuard.tsx     # Protected route component
│   └── validators.ts      # Form validators
└── assets/               # Static assets
```

## Features & Requirements

### 1. Authentication System

#### Pages:
- **Login Page** (`/login`)
  - Email and password login form
  - "Remember me" checkbox
  - Link to register page
  - OAuth login option (Google)
  - Form validation with React Hook Form + Zod
  - Error handling with toast notifications

- **Register Page** (`/register`)
  - Name, email, password, confirm password fields
  - Password strength indicator
  - Terms & conditions checkbox
  - Link to login page
  - Form validation
  - Success redirect to login

- **Auth Callback Page** (`/auth/callback`)
  - Handle OAuth callback from Google
  - Extract token from URL params
  - Store token and redirect to dashboard

#### Authentication Flow:
1. User submits login/register → API call to backend
2. Backend returns `{ user, token }`
3. Token stored in Zustand store (persisted to localStorage)
4. User role determined: `guest | user | admin`
5. Every API request includes token in `Authorization: Bearer <token>` header
6. If token expired (401), auto logout and redirect to login

### 2. Role-Based Access Control

#### Roles:
- **Guest**: Access to public pages (/, /login, /register)
- **User**: Access to user dashboard and profile (/user/*, /wa/*, /email/*)
- **Admin**: Full access including admin panel (/admin/*)

#### Route Guards:
- Implement `ProtectedRoute` component that:
  - Checks if user is authenticated
  - Checks if user role matches `allowedRoles`
  - Auto redirects to login if not authenticated
  - Auto redirects to appropriate dashboard if unauthorized

### 3. Homepage (`/`)

#### Sections:
1. **Hero Section**
   - Headline: "Automate WhatsApp & Gmail Broadcasts Effortlessly"
   - Subheadline with value proposition
   - CTA buttons: "Start Free Trial" (if not logged in) or "Go to Dashboard" (if logged in)
   - "Watch Demo" button
   - Social proof: Star rating (4.9/5) and "10M+ Messages sent" stat

2. **Features Section**
   - 4 feature cards:
     - WhatsApp Automation (with MessageOutlined icon)
     - Gmail Broadcast (with MailOutlined icon)
     - Contact Management (with UploadOutlined icon)
     - Cloud-Based Platform (with CloudOutlined icon)

3. **How It Works Section**
   - 3 steps with icons:
     - Connect WhatsApp or Gmail
     - Upload Your Contact List
     - Send and Track Broadcasts

4. **Pricing Section**
   - 3 pricing tiers:
     - Free Trial: $0/14 days
     - Pro: $49/month (popular)
     - Enterprise: Custom pricing

5. **Testimonials Section**
   - 3 customer testimonials with avatars

6. **CTA Section**
   - Final call-to-action with gradient background

### 4. User Dashboard (`/user/dashboard`)

#### Layout:
- Use `DashboardLayout` with sidebar navigation
- Sidebar menu items:
  - Dashboard
  - WhatsApp (Sessions, Broadcast, Groups)
  - Email (Connect, Broadcast)
  - Profile
  - Logout

#### Dashboard Content:
- Welcome message
- 4 feature cards with icons:
  - WhatsApp card (links to /wa/session, /wa/broadcast, /wa/group)
  - Email card (links to /email/connect, /email/broadcast)
  - Profile card (links to /user/profile)
  - Settings card (coming soon)

### 5. WhatsApp Features

#### Session Management (`/wa/session`)
- Table showing all WhatsApp sessions with columns:
  - Session ID
  - Label (optional)
  - Status (Connected/Disconnected)
  - Phone Number (meJid)
  - Actions (Get QR, Connect, Logout)
- "Create Session" button with modal:
  - Form fields: Session ID (optional), Label (optional)
  - Auto-generate session ID if not provided
- QR Code Modal:
  - Display QR code image
  - Auto-refresh QR every 3 seconds if not connected
  - Poll connection status
  - Show success message when connected
- Refresh button to reload sessions list

#### Broadcast Page (`/wa/broadcast`)
- Form to send WhatsApp broadcasts:
  - Message text input (textarea)
  - Upload CSV file with phone numbers
  - Delay between messages (seconds)
  - Preview message
  - Send button
- Broadcast history table:
  - Date, recipients count, status, actions

#### Group Page (`/wa/group`)
- List of WhatsApp groups
- Extract group members
- Send to group members

### 6. Email Features

#### Connect Gmail (`/email/connect`)
- Steps indicator:
  1. Connect (click to authorize)
  2. Authorize (grant permissions in Google)
  3. Connected (success)
- "Connect Gmail Account" button
- OAuth redirect to Google
- Connected accounts list
- Alert explaining the connection process

#### Broadcast Page (`/email/broadcast`)
- Form to send email broadcasts:
  - Subject input
  - Body textarea (with template variables)
  - Upload CSV file with email addresses
  - Attachment upload (optional)
  - Preview
  - Send button
- Broadcast history table

### 7. User Profile (`/user/profile`)
- Display user information:
  - Name
  - Email
  - Avatar
  - Registration date
- Edit profile form:
  - Update name
  - Change password
  - Upload avatar
- Account settings

### 8. Admin Dashboard (`/admin/dashboard`)

#### Layout:
- Use `AdminLayout` with admin sidebar and header
- Admin sidebar menu:
  - Dashboard
  - Manage Users
  - Settings
  - Logout

#### Dashboard Content:
- Statistics cards (4 cards):
  - Total Users
  - Active Users
  - New Users Today
  - Revenue
- Recent Activity card
- Quick Stats card (server status, database, API response time, uptime)

### 9. Admin - Manage Users (`/admin/users`)
- Users table with columns:
  - ID
  - Name
  - Email
  - Role
  - Status (Active/Inactive)
  - Created Date
  - Actions (Edit, Delete, Change Role)
- Search and filter functionality
- Pagination
- Create new user modal
- Edit user modal
- Delete confirmation modal

## Technical Implementation Details

### State Management (Zustand)

#### Auth Store (`store/authStore.ts`):
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: 'guest' | 'user' | 'admin';
  login: (user: User, token: string) => void;
  logout: () => void;
  setRole: (role: 'user' | 'admin') => void;
  updateUser: (user: Partial<User>) => void;
}
```
- Persist to localStorage
- Auto set role based on user data

#### UI Store (`store/uiStore.ts`):
```typescript
interface UIStore {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}
```

### API Integration

#### Axios Instance (`services/axiosInstance.ts`):
- Base URL from environment variable: `VITE_API_URL`
- Default headers
- Request/Response interceptors:
  - Add Authorization header from authStore
  - Handle 401 errors (auto logout)
  - Global error handling

#### API Endpoints:
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- User: `/api/user/profile`, `/api/user/update`
- Admin: `/api/admin/users`, `/api/admin/stats`
- WhatsApp: `/api/wa/sessions`, `/api/wa/qr`, `/api/wa/connect`, `/api/wa/broadcast`
- Email: `/api/email/connect`, `/api/email/broadcast`

### Theme Configuration

#### Ant Design Theme (`app/theme.ts`):
- Primary color: `#3B82F6` (blue)
- Border radius: `8px`
- Font family: `'Inter', 'sans-serif'`
- Customize other tokens as needed

### Routing

#### Route Configuration (`app/routes.tsx`):
- Use lazy loading for all pages
- Suspense fallback with loading spinner
- Protected routes with `ProtectedRoute` component
- Three layout groups:
  1. MainLayout (public pages)
  2. DashboardLayout (user pages)
  3. AdminLayout (admin pages)

### Form Validation

- Use React Hook Form for form management
- Use Zod for schema validation
- Show validation errors inline
- Disable submit button during submission

### Error Handling

- Global error handler in axios interceptors
- Toast notifications for errors
- User-friendly error messages
- Loading states for async operations

### Responsive Design

- Mobile-first approach
- Use Ant Design's Grid system (Col, Row)
- Responsive breakpoints:
  - xs: 0-600px (mobile)
  - sm: 600-960px (tablet)
  - md: 960-1280px (laptop)
  - lg: 1280-1920px (desktop)
  - xl: 1920px+ (large screens)

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Blastify
```

## Styling Guidelines

- Use Ant Design components as primary UI library
- Custom CSS only for specific styling needs
- Consistent spacing using Ant Design's spacing tokens
- Use Ant Design icons from `@ant-design/icons`
- Follow Ant Design design principles

## Code Quality

- TypeScript strict mode enabled
- ESLint configuration
- Consistent code formatting
- Meaningful variable and function names
- Component-based architecture
- Reusable components and hooks
- Proper error boundaries
- Loading states for all async operations

## Testing Considerations

- Components should be testable
- Separate business logic from UI
- Use custom hooks for reusable logic
- Mock API calls for testing

## Deployment

- Build output: `dist/` folder
- Static files ready for deployment
- Configure Vercel/Netlify for deployment
- Environment variables setup on hosting platform

## Additional Notes

- All text should support Indonesian language where applicable
- Use date-fns for date formatting
- Implement proper loading states
- Add skeleton loaders for better UX
- Implement proper error boundaries
- Add proper TypeScript types for all API responses
- Use React.memo for performance optimization where needed
- Implement proper SEO meta tags for public pages

---

**Start building this application step by step, ensuring all features are implemented correctly with proper error handling, loading states, and user experience best practices.**


