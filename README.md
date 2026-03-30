# 🚀 Titen - Daily Routine & Task Tracker

A modern, futuristic full-stack task management application with authentication, analytics, and admin panel.

![Titen Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

## ✨ Features

### 🎯 Core Functionality
- ✅ Add, edit, delete daily tasks with categories
- ✅ Checkbox-based task completion
- ✅ Organized views: Completed / Pending / Remaining
- ✅ Progress percentage indicator
- ✅ Streak tracking system
- ✅ Reset progress with confirmation

### 📊 Analytics & Charts
- 📈 Live-updating trading-style charts
- 📊 Daily completion percentage
- 📉 Weekly progress trend
- 📊 Productivity flow visualization
- 📊 Tasks completion by day

### 🔐 Authentication System
- 📝 User registration (with validation)
- 🔑 Secure login/logout
- 🛡️ Password hashing
- 🍪 Session persistence
- 📧 Email format validation

### 👨‍💻 Admin Panel
- 🔒 Admin login with credentials:
  - Email: `root.hyper@cloud.com`
  - Password: `aarav123`
- 📊 View all registered users
- 📈 User activity monitoring
- 📋 Task completion statistics
- 🎯 Clean dashboard UI

### 🎨 Design Highlights
- 🌙 Dark mode by default
- 💎 Glassmorphism effects
- ✨ Neon glow animations
- 📱 Fully responsive (mobile-first)
- ⚡ Optimized for low-end devices
- 🎯 Smooth transitions & micro-interactions

## 🛠️ Tech Stack

| Library | Purpose |
|---------|---------|
| `React 18` | Frontend framework |
| `TypeScript` | Type safety |
| `Vite` | Build tool & dev server |
| `Tailwind CSS 4.0` | Modern utility-first CSS |
| `Recharts` | Analytics charts |
| `Lucide React` | Beautiful icons |
| `localStorage` | Client-side persistence |
| `JWT-like tokens` | Authentication |

## 📦 Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn package manager

### Quick Start

```bash
# 1. Clone or download the project
git clone <repository-url>
cd titen-task-tracker

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open your browser and visit:
http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage Guide

### For Users
1. **Register** - Create an account with username, email, and password
2. **Login** - Access your dashboard
3. **Add Tasks** - Enter task title, select category, click +
4. **Complete Tasks** - Click checkbox to mark as completed
5. **View Analytics** - Scroll down to see productivity charts
6. **Reset Progress** - Click reset button (with confirmation)
7. **Contact** - Select "Contact" category to open Instagram

### For Admins
1. Click **Admin Login** on homepage
2. Enter admin credentials
3. View all users and their activity
4. Monitor task completion statistics
5. Click eye icon to view user details

## 📁 Project Structure

```
titen/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles & Tailwind
│   └── utils/
│       └── cn.ts            # Class name utility
├── public/
│   └── assets/              # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔧 Key Features Explained

### Authentication
- Passwords are hashed using a secure algorithm
- Sessions are stored in localStorage
- Tokens are base64 encoded JSON payloads
- Automatic session restoration on page reload

### Data Persistence
- All user data stored locally in browser
- No external database required
- Data persists across browser sessions
- Works offline

### Performance Optimizations
- Lightweight dependencies
- Efficient re-renders with React hooks
- Lazy loading where applicable
- Optimized for 2GB RAM phones
- Fast initial load time

## 🎯 Category System

Tasks can be organized into:
- 📚 Study
- 💪 Workout
- 💼 Work
- 👤 Personal
- ➕ Other
- 📞 Contact (opens Instagram)

## 📊 Analytics Metrics

1. **Total Tasks** - Count of all tasks
2. **Completed Tasks** - Count of finished tasks
3. **Completion Rate** - Percentage of tasks completed
4. **Day Streak** - Consecutive days with completed tasks
5. **Weekly Trend** - 7-day completion history
6. **Productivity Flow** - Hourly productivity pattern

## 🔒 Security Features

- Client-side password hashing
- No plaintext password storage
- Session tokens with user data
- Input validation on all forms
- Email format verification
- Password strength requirements

## 📱 Responsive Design

Fully optimized for:
- 📱 Mobile phones (360px+)
- 📟 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🚀 Deployment

### GitHub Pages
1. Build the project: `npm run build`
2. Push `dist` folder to GitHub
3. Enable GitHub Pages in repository settings

### Vercel / Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🐛 Troubleshooting

### Common Issues

**Q: Login not working?**
- A: Make sure you've registered first. Check console for errors.

**Q: Admin login fails?**
- A: Verify credentials:
  - Email: `root.hyper@cloud.com`
  - Password: `aarav123`

**Q: Data lost after browser close?**
- A: Data is stored in localStorage. Clearing browser data will delete all tasks.

**Q: Charts not loading?**
- A: Charts render with mock data when no tasks exist. Add some tasks to see analytics.

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+
- ✅ Chrome Mobile 90+

## 📄 License

Made by Aarav Mehroliya – All Rights Reserved

---

## 📞 Support

For support or queries:
📸 Instagram: [@root.hyper](https://www.instagram.com/root.hyper?igsh=Y29yNmc3NTNkdXFm)

---

### ⭐ Star this project if you find it useful!

---

**Note**: This is a frontend-only implementation with localStorage. For production use with real backend, please integrate with Node.js + MongoDB as described in the architecture.