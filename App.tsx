import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  Check,
  Trash2,
  Edit3,
  Plus,
  LogOut,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Eye,
  RefreshCw,
  AlertTriangle,
  X,
  Menu,
  ExternalLink,
} from 'lucide-react';

// Types
interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  tasks: Task[];
}

interface Admin {
  email: string;
  password: string;
}

// Mock Admin Credentials
const ADMIN_CREDENTIALS: Admin = {
  email: 'root.hyper@cloud.com',
  password: 'aarav123',
};

// Categories
const CATEGORIES = ['Study', 'Workout', 'Work', 'Personal', 'Other', 'Contact'];

// Generate mock weekly data
const generateWeeklyData = (tasks: Task[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => {
    const dayTasks = tasks.filter(
      (t) => new Date(t.createdAt).getDay() === index + 1
    );
    const completed = dayTasks.filter((t) => t.completed).length;
    const total = dayTasks.length || 1;
    return {
      day,
      completion: Math.round((completed / total) * 100),
      tasks: dayTasks.length,
      completed,
    };
  });
};

// Generate daily data for the chart
const generateDailyData = () => {
  const hours = [];
  for (let i = 0; i < 24; i += 3) {
    hours.push({
      hour: `${i}:00`,
      productivity: Math.floor(Math.random() * 40) + 30,
    });
  }
  return hours;
};

// Simple hash function for password (in production use bcrypt)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// JWT-like token generator
const generateToken = (user: User): string => {
  const payload = { id: user.id, email: user.email, username: user.username };
  return btoa(JSON.stringify(payload));
};

const verifyToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    return payload as User;
  } catch {
    return null;
  }
};

// LocalStorage helpers
const STORAGE_KEYS = {
  USERS: 'titen_users',
  CURRENT_USER: 'titen_current_user',
  ADMIN_SESSION: 'titen_admin_session',
};

const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  const token = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const users = getUsers();
  return users.find((u) => u.id === payload.id) || null;
};

const saveCurrentUser = (user: User) => {
  const token = generateToken(user);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, token);
};

const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

const getAdminSession = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

const saveAdminSession = (value: boolean) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, value.toString());
};

const clearAdminSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
};

// Components
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-xl ${className}`}
  >
    {children}
  </div>
);

const NeonButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'secondary';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
  const variants = {
    primary: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20',
    danger: 'bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20',
    success: 'bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/20',
    secondary: 'bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl border font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const InputField: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}> = ({ type, placeholder, value, onChange, icon }) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300`}
    />
  </div>
);

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <GlassCard className="relative w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {children}
      </GlassCard>
    </div>
  );
};

const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-yellow-400">
        <AlertTriangle className="w-8 h-8" />
        <p className="text-gray-300">{message}</p>
      </div>
      <div className="flex gap-3">
        <NeonButton
          onClick={onClose}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </NeonButton>
        <NeonButton onClick={onConfirm} variant="danger" className="flex-1">
          Confirm
        </NeonButton>
      </div>
    </div>
  </Modal>
);

// Home Page Component
const HomePage: React.FC<{
  onLogin: () => void;
  onRegister: () => void;
  onAdminLogin: () => void;
}> = ({ onLogin, onRegister, onAdminLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="text-center mb-12 animate-fade-in">
      <div className="relative inline-block">
        <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
          TITEN
        </h1>
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-3xl -z-10" />
      </div>
      <p className="text-gray-400 mt-4 text-lg md:text-xl">
        Daily Routine & Task Tracker
      </p>
      <p className="text-gray-500 mt-2 text-sm">
        Track your progress, achieve your goals
      </p>
    </div>

    <GlassCard className="w-full max-w-md p-8 animate-fade-in-delay">
      <div className="space-y-4">
        <NeonButton onClick={onLogin} className="w-full" variant="primary">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            Login
          </div>
        </NeonButton>
        <NeonButton onClick={onRegister} className="w-full" variant="secondary">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            Register
          </div>
        </NeonButton>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-transparent text-gray-500 text-sm">or</span>
          </div>
        </div>
        <button
          onClick={onAdminLogin}
          className="w-full py-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Admin Login
        </button>
      </div>
    </GlassCard>

    <div className="mt-8 text-center">
      <a
        href="https://www.instagram.com/root.hyper?igsh=Y29yNmc3NTNkdXFm"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-pink-400 transition-colors flex items-center gap-2"
      >
        <ExternalLink className="w-5 h-5" />
        <span>Contact Us</span>
      </a>
    </div>

    <footer className="absolute bottom-4 text-center text-gray-600 text-sm">
      Made by Aarav Mehroliya – All Rights Reserved
    </footer>
  </div>
);

// Login Page Component
const LoginPage: React.FC<{
  onBack: () => void;
  onSuccess: () => void;
  onRegister: () => void;
}> = ({ onBack, onSuccess, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(
        (u) => u.email === email && u.password === hashPassword(password)
      );

      if (user) {
        saveCurrentUser(user);
        setLoading(false);
        onSuccess();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        ← Back
      </button>

      <GlassCard className="w-full max-w-md p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Welcome Back
        </h2>

        <div className="space-y-4">
          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
          />
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
          />

          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <NeonButton
            onClick={handleSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Login'
            )}
          </NeonButton>

          <p className="text-center text-gray-500 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onRegister}
              className="text-cyan-400 hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </GlassCard>

      <footer className="absolute bottom-4 text-center text-gray-600 text-sm">
        Made by Aarav Mehroliya – All Rights Reserved
      </footer>
    </div>
  );
};

// Register Page Component
const RegisterPage: React.FC<{
  onBack: () => void;
  onSuccess: () => void;
  onLogin: () => void;
}> = ({ onBack, onSuccess, onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      if (users.some((u) => u.email === email)) {
        setError('Email already registered');
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        tasks: [],
      };

      users.push(newUser);
      saveUsers(users);
      saveCurrentUser(newUser);
      setLoading(false);
      onSuccess();
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        ← Back
      </button>

      <GlassCard className="w-full max-w-md p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create Account
        </h2>

        <div className="space-y-4">
          <InputField
            type="text"
            placeholder="Username"
            value={username}
            onChange={setUsername}
          />
          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
          />
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
          />
          <InputField
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <NeonButton
            onClick={handleSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Register'
            )}
          </NeonButton>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <button onClick={onLogin} className="text-cyan-400 hover:underline">
              Login
            </button>
          </p>
        </div>
      </GlassCard>

      <footer className="absolute bottom-4 text-center text-gray-600 text-sm">
        Made by Aarav Mehroliya – All Rights Reserved
      </footer>
    </div>
  );
};

// Admin Login Page
const AdminLoginPage: React.FC<{
  onBack: () => void;
  onSuccess: () => void;
}> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (
        email === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        saveAdminSession(true);
        setLoading(false);
        onSuccess();
      } else {
        setError('Invalid admin credentials');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        ← Back
      </button>

      <GlassCard className="w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Login</h2>
          <p className="text-gray-500 text-sm mt-2">
            Restricted access - authorized personnel only
          </p>
        </div>

        <div className="space-y-4">
          <InputField
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={setEmail}
          />
          <InputField
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={setPassword}
          />

          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <NeonButton
            onClick={handleSubmit}
            variant="danger"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Access Dashboard'
            )}
          </NeonButton>
        </div>
      </GlassCard>

      <footer className="absolute bottom-4 text-center text-gray-600 text-sm">
        Made by Aarav Mehroliya – All Rights Reserved
      </footer>
    </div>
  );
};

// Task Item Component
const TaskItem: React.FC<{
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ task, onToggle, onDelete, onEdit }) => (
  <GlassCard
    className={`p-4 transition-all duration-300 ${
      task.completed ? 'opacity-60' : 'hover:bg-white/10'
    }`}
  >
    <div className="flex items-center gap-4">
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? 'bg-green-500 border-green-400'
            : 'border-gray-600 hover:border-cyan-400'
        }`}
      >
        {task.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            task.completed ? 'text-gray-500 line-through' : 'text-white'
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              task.completed
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {task.completed ? 'Completed' : 'Pending'}
          </span>
          <span className="text-xs text-gray-500">{task.category}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-cyan-400"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </GlassCard>
);

// User Dashboard Component
const UserDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Other');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setTasks(currentUser.tasks);
    }
  }, []);

  const updateUserTasks = useCallback((updatedTasks: Task[]) => {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === user?.id);
    if (userIndex !== -1) {
      users[userIndex].tasks = updatedTasks;
      saveUsers(users);
    }
  }, [user]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    if (newTaskCategory === 'Contact') {
      window.open('https://www.instagram.com/root.hyper?igsh=Y29yNmc3NTNkdXFm', '_blank');
      setNewTaskTitle('');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: newTaskCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    updateUserTasks(updatedTasks);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : undefined,
          }
        : t
    );
    setTasks(updatedTasks);
    updateUserTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    updateUserTasks(updatedTasks);
  };

  const updateTask = (taskId: string, newTitle: string, newCategory: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, title: newTitle, category: newCategory } : t
    );
    setTasks(updatedTasks);
    updateUserTasks(updatedTasks);
    setEditingTask(null);
  };

  const resetProgress = () => {
    const updatedTasks = tasks.map((t) => ({ ...t, completed: false }));
    setTasks(updatedTasks);
    updateUserTasks(updatedTasks);
    setShowResetConfirm(false);
  };

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const weeklyData = generateWeeklyData(tasks);
  const dailyData = generateDailyData();

  // Calculate streak
  const calculateStreak = () => {
    const completedDates = completedTasks
      .map((t) => t.completedAt)
      .filter(Boolean)
      .map((d) => new Date(d!).toDateString());
    
    const uniqueDates = [...new Set(completedDates)];
    return uniqueDates.length;
  };

  const streak = calculateStreak();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                TITEN
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-400">
                Welcome, <span className="text-cyan-400">{user?.username}</span>
              </span>
              <NeonButton
                onClick={() => setShowResetConfirm(true)}
                variant="secondary"
                className="px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </div>
              </NeonButton>
              <NeonButton
                onClick={onLogout}
                variant="danger"
                className="px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </div>
              </NeonButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-col gap-3">
                <span className="text-gray-400 text-sm">
                  Welcome, <span className="text-cyan-400">{user?.username}</span>
                </span>
                <NeonButton
                  onClick={() => {
                    setShowResetConfirm(true);
                    setMobileMenuOpen(false);
                  }}
                  variant="secondary"
                  className="px-4 py-2 text-sm w-full"
                >
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reset Progress
                  </div>
                </NeonButton>
                <NeonButton
                  onClick={onLogout}
                  variant="danger"
                  className="px-4 py-2 text-sm w-full"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </div>
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {completedTasks.length}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{streak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Progress Bar */}
        <GlassCard className="p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Daily Progress</span>
            <span className="text-sm text-cyan-400 font-semibold">
              {completionRate}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </GlassCard>

        {/* Add Task Form */}
        <GlassCard className="p-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Task</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
            />
            <div className="flex gap-4">
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900">
                    {cat}
                  </option>
                ))}
              </select>
              <NeonButton onClick={addTask} className="px-6">
                <Plus className="w-5 h-5" />
              </NeonButton>
            </div>
          </div>
        </GlassCard>

        {/* Tasks Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pending Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
              Pending Tasks ({pendingTasks.length})
            </h3>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-gray-500">No pending tasks. Great job!</p>
                </GlassCard>
              ) : (
                pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onEdit={() => setEditingTask(task)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400" />
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-3">
              {completedTasks.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-gray-500">No completed tasks yet.</p>
                </GlassCard>
              ) : (
                completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onEdit={() => setEditingTask(task)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Analytics Dashboard
        </h3>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Progress Chart */}
          <GlassCard className="p-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-4">
              Weekly Progress Trend
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completion"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#colorCompletion)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Daily Productivity Chart */}
          <GlassCard className="p-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-4">
              Daily Productivity Flow
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>

    {/* Tasks Completion Bar Chart */}
    <GlassCard className="p-4 mb-8">
          <h4 className="text-sm font-semibold text-gray-400 mb-4">
            Tasks Completion by Day
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar
                  dataKey="tasks"
                  name="Total Tasks"
                  fill="#475569"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Contact Section */}
        <GlassCard className="p-6 mb-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Contact us on Instagram for support and updates
          </p>
          <a
            href="https://www.instagram.com/root.hyper?igsh=Y29yNmc3NTNkdXFm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-5 h-5" />
            Follow @root.hyper
          </a>
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm border-t border-white/10">
        Made by Aarav Mehroliya – All Rights Reserved
      </footer>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <div className="space-y-4">
            <InputField
              type="text"
              placeholder="Task title"
              value={editingTask.title}
              onChange={(value) =>
                setEditingTask({ ...editingTask, title: value })
              }
            />
            <select
              value={editingTask.category}
              onChange={(e) =>
                setEditingTask({ ...editingTask, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <NeonButton
                onClick={() => setEditingTask(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </NeonButton>
              <NeonButton
                onClick={() =>
                  updateTask(editingTask.id, editingTask.title, editingTask.category)
                }
                className="flex-1"
              >
                Save
              </NeonButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Confirm Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetProgress}
        title="Reset Progress"
        message="Are you sure you want to reset all task progress? This will mark all tasks as pending. This action cannot be undone."
      />
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const totalTasks = users.reduce(
    (acc, u) => acc + u.tasks.length,
    0
  );
  const totalCompleted = users.reduce(
    (acc, u) => acc + u.tasks.filter((t) => t.completed).length,
    0
  );
  const completionRate = totalTasks
    ? Math.round((totalCompleted / totalTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-red-400">
                ADMIN DASHBOARD
              </h1>
            </div>

            <NeonButton
              onClick={onLogout}
              variant="danger"
              className="px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </div>
            </NeonButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{users.length}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalTasks}</p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCompleted}</p>
                <p className="text-xs text-gray-500">Completed Tasks</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
                <p className="text-xs text-gray-500">Overall Rate</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Users Table */}
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Registered Users</h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white font-medium">
                        {user.username}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-cyan-400 font-semibold">
                        {user.tasks.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-green-400 font-semibold">
                        {user.tasks.filter((t) => t.completed).length}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-cyan-400"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {users.map((user) => (
              <GlassCard key={user.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{user.username}</span>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-cyan-400"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-cyan-400">
                        {user.tasks.length} tasks
                      </span>
                      <span className="text-green-400">
                        {user.tasks.filter((t) => t.completed).length} done
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {users.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No registered users yet.</p>
            </div>
          )}
        </GlassCard>

        {/* Contact Section */}
        <GlassCard className="p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Admin Support</h3>
          <p className="text-gray-500 text-sm mb-4">
            For any administrative issues, contact the developer on Instagram
          </p>
          <a
            href="https://www.instagram.com/root.hyper?igsh=Y29yNmc3NTNkdXFm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-5 h-5" />
            Contact Developer
          </a>
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm border-t border-white/10">
        Made by Aarav Mehroliya – All Rights Reserved
      </footer>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-white font-medium">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-white font-medium">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Tasks</p>
                <p className="text-cyan-400 font-medium">
                  {selectedUser.tasks.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-green-400 font-medium">
                  {selectedUser.tasks.filter((t) => t.completed).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-yellow-400 font-medium">
                  {selectedUser.tasks.filter((t) => !t.completed).length}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-400 mb-2">Recent Tasks</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedUser.tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                  >
                    <span
                      className={`text-sm truncate ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        task.completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
                {selectedUser.tasks.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-2">
                    No tasks yet
                  </p>
                )}
              </div>
            </div>

            <NeonButton
              onClick={() => setSelectedUser(null)}
              className="w-full"
            >
              Close
            </NeonButton>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<
    'home' | 'login' | 'register' | 'adminLogin' | 'dashboard' | 'adminDashboard'
  >('home');

  useEffect(() => {
    // Check for existing sessions
    const user = getCurrentUser();
    const adminSession = getAdminSession();

    if (user) {
      setCurrentPage('dashboard');
    } else if (adminSession) {
      setCurrentPage('adminDashboard');
    }
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    clearAdminSession();
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onLogin={() => setCurrentPage('login')}
            onRegister={() => setCurrentPage('register')}
            onAdminLogin={() => setCurrentPage('adminLogin')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onBack={() => setCurrentPage('home')}
            onSuccess={() => {
              setCurrentPage('dashboard');
            }}
            onRegister={() => setCurrentPage('register')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onBack={() => setCurrentPage('home')}
            onSuccess={() => {
              setCurrentPage('dashboard');
            }}
            onLogin={() => setCurrentPage('login')}
          />
        );
      case 'adminLogin':
        return (
          <AdminLoginPage
            onBack={() => setCurrentPage('home')}
            onSuccess={() => {
              setCurrentPage('adminDashboard');
            }}
          />
        );
      case 'dashboard':
        return <UserDashboard onLogout={handleLogout} />;
      case 'adminDashboard':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10">{renderPage()}</div>

      {/* Global Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 0.6s ease-out 0.2s both;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Prevent text overflow */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-property: background-color, border-color, color, box-shadow;
          transition-duration: 200ms;
        }
      `}</style>
    </div>
  );
};

export default App;