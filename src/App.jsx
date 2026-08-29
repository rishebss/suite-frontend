import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MenuProvider } from "./context/MenuContext";
import Login from "./modules/auth/pages/Login";
import Dashboard from "./modules/dashboard/pages/Dashboard";
import CRM from "./modules/crm/pages/CRM";
import Contacts from "./modules/contacts/pages/Contacts";
import PaymentsPage from "./modules/payments/pages/PaymentsPage";
import DocTools from "./modules/docs/pages/DocTools";
import Accounts from "./modules/accounts/pages/Accounts";
import Media from "./modules/media/pages/Media";
import LMS from "./modules/lms/pages/LMS";
import CalendarPage from "./modules/calendar/pages/CalendarPage";
import AdminUsers from "./modules/admin/pages/AdminUsers";
import AdminOrganizations from "./modules/admin/pages/AdminOrganizations";
import AdminProducts from "./modules/admin/pages/AdminProducts";
import Layout from "./components/Layout";
import GlobalLoader from "./components/ui/GlobalLoader";
import "./components/ui/GlobalLoader.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <GlobalLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <GlobalLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin =
    ["Superadmin", "Admin"].includes(user.role) || user.is_superuser;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AuthProvider>
      <MenuProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crm"
              element={
                <ProtectedRoute>
                  <CRM />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute>
                  <DocTools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <Media />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms"
              element={
                <ProtectedRoute>
                  <LMS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/organizations"
              element={
                <AdminRoute>
                  <AdminOrganizations />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;
