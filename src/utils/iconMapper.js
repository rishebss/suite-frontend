/**
 * Icon Mapper Utility
 * Maps Lucide icon names (strings) to actual React icon components
 * Used for dynamic menu rendering where icon names come from the API
 */

import {
  LayoutDashboard,
  Users,
  FileText,
  Box,
  Briefcase,
  CreditCard,
  Image as ImageIcon,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  Briefcase as BriefcaseIcon,
  BarChart3,
  PieChart,
  Calendar,
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
  Contact,
  Kanban,
} from "lucide-react";

/**
 * Comprehensive icon map
 * Maps icon name strings to Lucide components
 */
const ICON_MAP = {
  // Dashboard & Navigation
  LayoutDashboard,
  Dashboard: LayoutDashboard,
  Home,
  Menu,
  Settings,
  LogOut,

  Kanban,

  // Business Icons
  Users,
  People: Users,
  Briefcase,
  BriefcaseIcon,
  BarChart3,
  TrendingUp,
  PieChart,

  // Content & Documents
  FileText,
  Box,
  Image: ImageIcon,
  ImageIcon,

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
  Calendar,
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
  Contact,

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
