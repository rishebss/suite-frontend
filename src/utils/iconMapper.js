/**
 * Icon Mapper Utility
 * Maps icon name strings (from the menu API) to actual React icon components
 * Used for dynamic sidebar menu rendering.
 * Main navigation icons come from react-icons; everything else falls back to Lucide.
 */

import {
  Users,
  FileText,
  Box,
  CreditCard,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  BarChart3,
  PieChart,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  Mail,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Menu,
  X,
  Loader,
  AlertTriangle,
  Target,
  Crosshair,
  Kanban,
} from "lucide-react";

// Sidebar menu icons (react-icons) — required set for main navigation
import { BiSolidDashboard } from "react-icons/bi";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { PiChartDonutFill } from "react-icons/pi";
import { IoCalendarSharp } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { MdPermMedia } from "react-icons/md";

/**
 * Comprehensive icon map
 * Maps icon name strings to React icon components
 */
const ICON_MAP = {
  // Dashboard & Navigation
  LayoutDashboard: BiSolidDashboard,
  Dashboard: BiSolidDashboard,
  Home,
  Menu,
  Settings,
  LogOut,

  Kanban,

  // Business Icons
  Users,
  People: Users,
  Briefcase: PiChartDonutFill,
  BriefcaseIcon: PiChartDonutFill,
  BarChart3,
  TrendingUp,
  PieChart,

  // Content & Documents
  FileText,
  Box,
  Image: MdPermMedia,
  ImageIcon: MdPermMedia,

  // Organization
  GraduationCap,
  ShieldCheck,
  Lock,
  Unlock,
  Globe,
  MapPin,

  // Financial
  CreditCard,
  DollarSign: CreditCard,

  // Date & Time
  Calendar: IoCalendarSharp,
  Clock,

  // Status & Alerts
  AlertCircle,
  AlertTriangle,
  CheckCircle,

  // Actions
  Edit,
  Trash2,
  Delete: Trash2,
  Copy,
  Download,
  Upload,
  Plus,
  Search,
  Filter,

  // Visibility
  Eye,
  EyeOff,

  // Sales Task Manager
  Target,
  Crosshair,

  // Contact
  Mail,
  Phone,
  Contact: BsFillPersonVcardFill,

  // Payments
  Wallet: FaMoneyBillTransfer,

  // Navigation
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ExternalLink,

  // Interaction
  Bell,

  // Utility
  X,
  Close: X,
  Loader,
  Loading: Loader,
};

/**
 * Get a Lucide icon component by name
 * @param {string} iconName - The name of the icon (e.g., 'Users', 'LayoutDashboard')
 * @returns {React.ComponentType|null} The icon component or null if not found
 */
export const getLucideIcon = (iconName) => {
  if (!iconName) return null;

  const IconComponent = ICON_MAP[iconName];

  if (!IconComponent) {
    console.warn(
      `Icon "${iconName}" not found in icon map. Using LayoutDashboard as fallback.`,
    );
    return ICON_MAP.LayoutDashboard; // Fallback icon
  }

  return IconComponent;
};

/**
 * Get multiple icon components at once
 * @param {string[]} iconNames - Array of icon names
 * @returns {Object} Object with icon name as key and component as value
 */
export const getLucideIcons = (iconNames) => {
  return iconNames.reduce((acc, name) => {
    acc[name] = getLucideIcon(name);
    return acc;
  }, {});
};

/**
 * List all available icon names
 * @returns {string[]} Array of all available icon names
 */
export const getAvailableIcons = () => {
  return Object.keys(ICON_MAP);
};

export default ICON_MAP;
