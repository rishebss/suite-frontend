import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { getLucideIcon } from "@/utils/iconMapper";
import logo from "../assets/logowhite.svg";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sections, loading, error } = useMenu();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (href) => {
    if (location.pathname === href) return true;
    if (href !== '/' && href !== '/dashboard') {
      if (location.pathname.startsWith(href + '/')) return true;
    }
    return false;
  };

  return (
    <>
    <div
      className={cn(
        "h-screen bg-black border-r border-white/5 flex flex-col font-inter z-30 relative",
        collapsed ? "w-20" : "w-64",
        "transition-[width] duration-300 ease-in-out",
      )}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-radial-[circle_at_0%_0%] from-white/5 to-transparent pointer-events-none" />


      <Link
        to="/dashboard"
        className={cn(
          "p-6 flex items-center gap-3 relative z-10 group",
          !collapsed && "pr-12",
        )}
      >
        {!collapsed && (
          <span className="text-2xl font-bold tracking-tight text-white whitespace-nowrap">
            NURTURELY
          </span>
        )}
        <div className="w-10 h-10 ml-[-6px] rounded-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 overflow-hidden bg-transparent shrink-0">
          <img
            src={logo}
            alt="Nurturely"
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 px-3 py-6 space-y-6 relative z-10 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader size={20} className="text-white/40 animate-spin" />
          </div>
        )}

        {error && (
          <div className="px-3 py-2 text-[10px] text-red-400 bg-red-500/10 rounded border border-red-500/20">
            Failed to load navigation menus.
          </div>
        )}

        {!loading && !error && Object.keys(sections).length === 0 && (
          <div className="px-3 py-4 space-y-2">
            <p className="text-[10px] text-white/30 leading-relaxed">
              No menus are currently visible for your account.
            </p>
            <p className="text-[10px] text-white/20 leading-relaxed">
              Ask a Superadmin or Admin to assign menus to you from User
              Management.
            </p>
          </div>
        )}

        {!loading &&
          sections &&
          Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="space-y-0.5">
              {!collapsed && (
                <h3 className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/15">
                  {sectionName}
                </h3>
              )}
              {items && items.length > 0 ? (
                items
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item) => {
                    const Icon = getLucideIcon(item.icon);
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.id || item.code}
                        to={item.href}
                        className={cn(
                          "relative flex items-center text-sm font-medium transition-all duration-200 overflow-hidden",
                          collapsed ? "justify-center px-3 py-2.5" : "gap-3 px-3 py-2",
                          active
                            ? "text-blue-400 bg-blue-500/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)]"
                            : "text-white/40 hover:text-white hover:bg-white/[0.04]",
                        )}
                        title={item.name}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                        {Icon && (
                          <Icon
                            size={17}
                            className={cn(
                              "shrink-0 transition-colors",
                              active ? "text-blue-400" : "text-white/30",
                            )}
                          />
                        )}
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })
              ) : (
                <p className="px-3 py-2 text-[10px] text-white/20">
                  No menus available
                </p>
              )}
            </div>
          ))}
      </div>

      <div className="p-3 border-t border-white/5 relative z-10 bg-black">
        <div className={cn("flex items-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.12]", collapsed ? "justify-center" : "gap-2.5")}>
          <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[11px] shrink-0">
            {user?.first_name?.charAt(0).toUpperCase() ||
              user?.username?.charAt(0).toUpperCase() ||
              "A"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || "Admin"}
                </p>
                <p className="text-[9px] font-medium text-white/20 truncate">
                  {user?.email || "admin@bytehive.com"}
                </p>
              </div>
            </>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-1.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>

      {showLogoutModal && (
        <ConfirmLogoutModal
          onConfirm={() => { setShowLogoutModal(false); logout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
