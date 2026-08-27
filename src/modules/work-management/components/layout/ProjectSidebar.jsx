import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useWorkManagement } from "../../context/WorkManagementContext";
import {
  LayoutDashboard, Columns3, ClipboardList, GitBranch, Calendar,
  Timer, Target, BarChart3, Users, Bug, ShoppingCart, Ticket,
  TrendingUp, Milestone, Zap, Columns2, Eye, Globe,
  ShieldCheck, MessageSquare, Repeat, FileText,
  Bell, Palette, PanelLeftClose, PanelLeft, ChevronDown,
  Layers, FlaskConical, ListTodo, Kanban, ArrowLeft, FolderKanban,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Plan",
    items: [
      { path: "", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { path: "board", icon: Columns3, label: "Board" },
      { path: "backlog", icon: ClipboardList, label: "Backlog" },
      { path: "sprints", icon: Timer, label: "Sprints" },
      { path: "timeline", icon: GitBranch, label: "Timeline" },
      { path: "calendar", icon: Calendar, label: "Calendar" },
      { path: "resources", icon: Users, label: "Resources" },
    ],
  },
  {
    label: "Tracking",
    items: [
      { path: "pipeline", icon: TrendingUp, label: "Pipeline" },
      { path: "tickets", icon: Ticket, label: "Tickets" },
      { path: "bug-triage", icon: Bug, label: "Bug Triage" },
      { path: "sales-dashboard", icon: ShoppingCart, label: "Sales" },
    ],
  },
  {
    label: "Insights",
    items: [
      { path: "roadmap", icon: Layers, label: "Roadmap" },
      { path: "milestones", icon: Milestone, label: "Milestones" },
      { path: "okrs", icon: Target, label: "OKRs" },
      { path: "analytics", icon: BarChart3, label: "Analytics" },
      { path: "portfolio", icon: FlaskConical, label: "Portfolio" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { path: "automation-rules", icon: Zap, label: "Workflow Rules" },
      { path: "custom-fields", icon: Columns2, label: "Custom Fields" },
      { path: "field-visibility", icon: Eye, label: "Field Visibility" },
      { path: "approval-workflows", icon: ShieldCheck, label: "Approvals" },
      { path: "canned-responses", icon: MessageSquare, label: "Canned Replies" },
      { path: "priority-rules", icon: Palette, label: "Priorities" },
      { path: "recurring-task-configs", icon: Repeat, label: "Recurring" },
      { path: "github-integration", icon: GitBranch, label: "GitHub" },
      { path: "item-templates", icon: FileText, label: "Templates" },
      { path: "notification-preferences", icon: Bell, label: "Notifications" },
      { path: "webhooks", icon: Globe, label: "Webhooks" },
      { path: "portal", icon: PanelLeftClose, label: "Portal" },
    ],
  },
];

const ProjectSidebar = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useWorkManagement();
  const [expandedGroups, setExpandedGroups] = useState({ Plan: true, Insights: true });
  const [showConfig, setShowConfig] = useState(false);

  const currentPath = location.pathname;
  const basePath = `/work/${workspaceId}/${projectId}`;

  const isActive = (path, exact) => {
    if (exact) return currentPath === basePath;
    return currentPath === `${basePath}/${path}` || currentPath.startsWith(`${basePath}/${path}/`);
  };

  if (!workspaceId || !projectId) return null;

  return (
    <>
      {/* Toggle button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="fixed left-3 top-3 z-50 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white/40 hover:text-white transition-colors"
        >
          <PanelLeft size={16} />
        </button>
      )}

      <aside className={cn(
        "h-full bg-zinc-950/80 border-r border-zinc-800/50 flex flex-col transition-all duration-200 shrink-0 overflow-hidden",
        sidebarCollapsed ? "w-0 border-0" : "w-56"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/30 shrink-0">
          <button
            onClick={() => navigate(`/work/${workspaceId}`)}
            className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            <FolderKanban size={12} />
            <span className="truncate max-w-[100px]">Workspace</span>
          </button>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2 space-y-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <button
                onClick={() => {
                  if (group.label === "Configuration") {
                    setShowConfig(!showConfig);
                  } else {
                    setExpandedGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }));
                  }
                }}
                className="flex items-center justify-between w-full px-2 py-1 rounded text-[9px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
              >
                {group.label}
                <ChevronDown size={10} className={cn(
                  "transition-transform",
                  (group.label === "Configuration" ? !showConfig : !expandedGroups[group.label]) && "-rotate-90"
                )} />
              </button>
              {(group.label === "Configuration" ? showConfig : expandedGroups[group.label]) && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(`${basePath}/${item.path}`)}
                          className={cn(
                            "flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs transition-all",
                            isActive(item.path, item.exact)
                              ? "bg-blue-500/10 text-blue-400 font-medium"
                              : "text-white/50 hover:text-white hover:bg-zinc-800/40"
                          )}
                        >
                          <Icon size={14} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom spacer */}
        <div className="px-3 py-2 border-t border-zinc-800/30 shrink-0">
          <div className="flex items-center gap-2 text-[9px] text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ByteHive ERP
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProjectSidebar;
