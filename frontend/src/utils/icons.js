/**
 * HMS Icon System
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all icons used across the Hospital Management
 * System. Only the icons you import here are bundled (tree-shaking safe).
 *
 * Usage:
 *   import { Icon } from '../components/Icon';
 *   <Icon name="pharmacy" size="lg" color="primary" />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  // Medical
  Pill,
  Stethoscope,
  Syringe,
  Microscope,
  Beaker,
  Bed,
  Heart,
  Building2,
  // People
  User,
  Users,
  UserCircle,
  // Navigation
  Home,
  LayoutDashboard,
  Mail,
  Calendar,
  List,
  CheckSquare,
  // Analytics
  BarChart3,
  TrendingUp,
  // Billing & Finance
  Receipt,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Wallet,
  // Inventory
  Package,
  Layers,
  // Actions
  Plus,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Eye,
  Search,
  Printer,
  Download,
  Filter,
  Settings,
  Lock,
  // Status
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  // Misc
  Wind,
  FileText,
  Menu,
  LogOut,
  ChevronLeft,
  Send,
} from 'lucide-react';

// ─── Size scale ─────────────────────────────────────────────────────────────
/** Use these constants everywhere — never hardcode px values */
export const ICON_SIZES = {
  xs:  14,
  sm:  16,
  md:  20,
  lg:  24,
  xl:  28,
  '2xl': 32,
};

// ─── Semantic color palette ──────────────────────────────────────────────────
/**
 * Maps semantic names to hex values.
 * Always prefer semantic names in <Icon color="…" /> over raw hex.
 */
export const ICON_COLORS = {
  primary:   '#6366f1',  // indigo  — brand, navigation active
  success:   '#10b981',  // green   — confirmed, done, dispensed
  warning:   '#f59e0b',  // amber   — pending, near-expiry, caution
  error:     '#ef4444',  // red     — delete, expired, low-stock
  critical:  '#dc2626',  // dark red — emergency, critical patients
  info:      '#0891b2',  // cyan    — hospital, lab, informational
  secondary: '#64748b',  // slate   — neutral/secondary actions
  muted:     '#94a3b8',  // gray    — placeholders, disabled
  white:     '#ffffff',
};

// ─── Icon catalog ────────────────────────────────────────────────────────────
/**
 * Maps human-readable keys to Lucide React components.
 * Add new entries here when introducing new icons; never import
 * Lucide icons directly in page/component files.
 */
export const ICON_CATALOG = {
  // ── Status ────────────────────────────────────────────────────────────────
  success:      CheckCircle,
  pending:      Clock,
  error:        AlertCircle,
  warning:      AlertTriangle,
  critical:     AlertCircle,
  completed:    CheckCircle,
  waiting:      Clock,
  info:         Info,
  notification: Bell,

  // ── Medical / Healthcare ──────────────────────────────────────────────────
  pharmacy:     Pill,
  medicine:     Pill,
  pill:         Pill,
  vitals:       Syringe,
  syringe:      Syringe,
  doctor:       Stethoscope,
  nurse:        Stethoscope,
  stethoscope:  Stethoscope,
  hospital:     Building2,
  building:     Building2,
  patient:      User,
  patients:     Users,
  lab:          Microscope,
  labTest:      Beaker,
  beaker:       Beaker,
  bed:          Bed,
  care:         Heart,
  heart:        Heart,

  // ── People ────────────────────────────────────────────────────────────────
  user:         User,
  users:        Users,
  userCircle:   UserCircle,

  // ── Billing & Finance ─────────────────────────────────────────────────────
  billing:      Receipt,
  invoice:      Receipt,
  receipt:      Receipt,
  payment:      CreditCard,
  revenue:      DollarSign,
  money:        DollarSign,
  dollar:       DollarSign,
  cart:         ShoppingCart,
  transaction:  ShoppingCart,
  wallet:       Wallet,

  // ── Inventory & Stock ─────────────────────────────────────────────────────
  inventory:    Package,
  package:      Package,
  lowStock:     Package,
  stock:        Layers,
  layers:       Layers,
  expired:      AlertCircle,
  nearExpiry:   AlertTriangle,

  // ── Actions ───────────────────────────────────────────────────────────────
  add:          Plus,
  plus:         Plus,
  create:       PlusCircle,
  edit:         Edit2,
  delete:       Trash2,
  trash:        Trash2,
  remove:       X,
  close:        X,
  cancel:       X,
  view:         Eye,
  eye:          Eye,
  search:       Search,
  print:        Printer,
  download:     Download,
  filter:       Filter,
  settings:     Settings,
  lock:         Lock,
  send:         Send,
  logout:       LogOut,
  back:         ChevronLeft,

  // ── Navigation ────────────────────────────────────────────────────────────
  home:         Home,
  dashboard:    LayoutDashboard,
  overview:     LayoutDashboard,
  messages:     Mail,
  mail:         Mail,
  appointments: Calendar,
  calendar:     Calendar,
  reports:      BarChart3,
  analytics:    BarChart3,
  chart:        BarChart3,
  trending:     TrendingUp,
  prescriptions: FileText,
  prescription: FileText,
  checklist:    CheckSquare,
  list:         List,
  menu:         Menu,
  ward:         Building2,
  cleaning:     Wind,
  broom:        Wind,
};
