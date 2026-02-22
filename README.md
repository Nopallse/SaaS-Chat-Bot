# Starter App Frontend

Template aplikasi React + TypeScript dengan role-based access control (auth, user, admin).

## 🚀 Tech Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Ant Design** - UI Component Library
- **Zustand** - State Management
- **React Router** - Routing
- **Axios** - HTTP Client
- **React Hook Form + Zod** - Form Validation
- **React Hot Toast** - Notifications
- **Date-fns** - Date Utilities

## 📁 Struktur Project

```
src/
├── app/                    # Core app setup
│   ├── providers.tsx       # App providers (ConfigProvider, Toaster)
│   ├── routes.tsx          # Route configuration
│   └── theme.ts            # Ant Design theme config
├── features/               # Feature-based modules
│   ├── auth/              # Authentication
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── home/              # Homepage
│   ├── user/              # User features
│   └── admin/             # Admin features
├── components/            # Shared components
│   └── layout/
│       ├── main/          # Main layout (Navbar, Footer)
│       └── admin/         # Admin layout (Sidebar, Header)
├── store/                 # Zustand stores
│   ├── authStore.ts       # Authentication state
│   └── uiStore.ts         # UI state (loading, notifications)
├── hooks/                 # Custom hooks
├── services/              # API services
│   ├── axiosInstance.ts
│   └── interceptors.ts
├── types/                 # TypeScript types
├── utils/                 # Utilities
└── assets/               # Static assets
```

## 🎯 Fitur Utama

### Role-Based Access Control
- **Guest**: Akses ke halaman publik (/, /login, /register)
- **User**: Akses ke dashboard user dan profil (/user/*)
- **Admin**: Akses penuh ke admin panel (/admin/*)

### Halaman yang Tersedia

#### Public Pages
- `/` - Homepage dengan hero section dan feature highlights
- `/login` - Halaman login
- `/register` - Halaman registrasi

#### User Pages (Protected)
- `/user/dashboard` - Dashboard user dengan statistik
- `/user/profile` - Profil dan pengaturan akun

#### Admin Pages (Protected)
- `/admin/dashboard` - Dashboard admin dengan statistik aplikasi
- `/admin/users` - Manajemen data user

## 🛠️ Setup & Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Environment Variables**
Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:
```env
VITE_API_URL=https://www.api-mitbiz.ybbal.dev
VITE_APP_NAME=Starter App
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
```

5. **Preview Production Build**
```bash
npm run preview
```

## 🔐 Authentication Flow

1. User login/register → API call ke backend
2. Backend return `{ user, token }`
3. Token disimpan di Zustand store (persisted ke localStorage)
4. Setiap request API, token ditambahkan di header Authorization
5. Jika token expired (401), auto logout dan redirect ke login

## 🎨 Theme Customization

Edit file `src/app/theme.ts` untuk customize theme Ant Design:

```typescript
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#3B82F6',
    borderRadius: 8,
    fontFamily: "'Inter', 'sans-serif'",
    // ... custom tokens lainnya
  },
};
```

## 📝 State Management

### Auth Store (`authStore.ts`)
- `user`: Data user yang sedang login
- `token`: JWT token
- `isAuthenticated`: Status login
- `role`: Role user (guest | user | admin)
- Actions: `login()`, `logout()`, `setRole()`, `updateUser()`

### UI Store (`uiStore.ts`)
- `loading`: Global loading state
- `notification`: Notification state
- Actions: `setLoading()`, `showNotification()`, `hideNotification()`

## 🔌 API Integration

Backend API base URL dikonfigurasi di `.env`:
```
VITE_API_URL=https://www.api-mitbiz.ybbal.dev
```

API endpoints:
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User endpoints
- `/api/admin/*` - Admin endpoints

## 📱 Responsive Breakpoints

- **xs**: 0-600px (mobile)
- **sm**: 600-960px (tablet)
- **md**: 960-1280px (laptop kecil)
- **lg**: 1280-1920px (desktop)
- **xl**: 1920px+ (layar besar)

## 🚦 Route Guards

Route guards menggunakan `ProtectedRoute` component:
- Cek apakah user sudah login
- Cek apakah role user sesuai dengan `allowedRoles`
- Auto redirect jika tidak authorized

## 📦 Build & Deploy

Build production:
```bash
npm run build
```

Output ada di folder `dist/`. Deploy ke hosting pilihan Anda (Vercel, Netlify, dll).

## 🤝 Contributing

Silakan fork dan submit pull request untuk improvement!

## 📄 License

MIT License
