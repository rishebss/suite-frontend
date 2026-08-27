import React from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Columns3, ClipboardList, GitBranch, Calendar,
  Timer, Target, BarChart3, Users, Bug, ShoppingCart, Ticket,
  TrendingUp, Milestone, Zap, Columns2, Eye, Globe,
  ShieldCheck, MessageSquare, Repeat, FileText,
  Bell, Palette, Layers, FlaskConical, ArrowLeft, FolderKanban,
} from "lucide-react";
import { useWorkManagement } from "../../context/WorkManagementContext";
import { useProject } from "../../hooks/useProjects";

const NAV_GROUPS = [
  {
    group: "Plan",
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
    group: "Track",
    items: [
      { path: "pipeline", icon: TrendingUp, label: "Pipeline" },
      { path: "tickets", icon: Ticket, label: "Tickets" },
      { path: "bug-triage", icon: Bug, label: "Bug Triage" },
      { path: "sales-dashboard", icon: ShoppingCart, label: "Sales" },
    ],
  },
  {
    group: "Insights",
    items: [
      { path: "roadmap", icon: Layers, label: "Roadmap" },
      { path: "milestones", icon: Milestone, label: "Milestones" },
      { path: "okrs", icon: Target, label: "OKRs" },
      { path: "analytics", icon: BarChart3, label: "Analytics" },
      { path: "portfolio", icon: FlaskConical, label: "Portfolio" },
    ],
  },
  {
    group: "Configure",
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
    ],
  },
];

const ProjectLayout = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useWorkManagement();
  const { project } = useProject(projectId);

  const currentPath = location.pathname;
  const basePath = `/work/${workspaceId}/${projectId}`;

  const currentGroup = NAV_GROUPS.find((g) =>
    g.items.some((item) => {
      if (item.exact) return currentPath === basePath;
      return currentPath === `${basePath}/${item.path}` || currentPath.startsWith(`${basePath}/${item.path}/`);
    })
  );

  const activeGroup = currentGroup?.group || "Plan";

  const isActive = (path, exact) => {
    if (exact) return currentPath === basePath;
    return currentPath === `${basePath}/${path}` || currentPath.startsWith(`${basePath}/${path}/`);
  };

  if (!workspaceId || !projectId) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      <header className="px-10 py-5 flex items-center justify-between border-b border-zinc-800/50 shrink-0 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate(`/work/${workspaceId}`)}
            className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={12} />
            <FolderKanban size={12} />
            <span className="hidden sm:inline">Workspace</span>
          </button>
          <div className="w-px h-6 bg-zinc-800/50" />
          <div className="min-w-0">
            {project ? (
              <>
                <h1 className="text-base font-bold text-white truncate flex items-center gap-2">
                  {project.name}
                  {project.key && (
                    <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                      {project.key}
                    </span>
                  )}
                </h1>
                {project.description && (
                  <p className="text-[11px] text-white/40 truncate">{project.description}</p>
                )}
              </>
            ) : (
              <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
            )}
          </div>
        </div>
      </header>

      <div className="px-10 pt-5 pb-0 shrink-0">
        <div className="flex flex-col gap-3">
          {/* Group tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/10 rounded-md w-fit">
            {NAV_GROUPS.map((group) => {
              const isActiveGroup = activeGroup === group.group;
              return (
                <button
                  key={group.group}
                  onClick={() => {
                    const firstItem = group.items[0];
                    navigate(firstItem.path ? `${basePath}/${firstItem.path}` : basePath);
                  }}
                  className={cn(
                    "relative px-5 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                    isActiveGroup
                      ? "text-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  )}
                >
                  {group.group}
                </button>
              );
            })}
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {NAV_GROUPS.find(g => g.group === activeGroup)?.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path ? `${basePath}/${item.path}` : basePath)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
                    active
                      ? "bg-blue-500/15 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  )}
                >
                  <Icon size={13} className="shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-10 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ProjectLayout;
