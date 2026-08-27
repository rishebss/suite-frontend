import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2, Users, Plus, Search, Download,
  BarChart3, CircleDot, Loader, UserPlus, Trash2, X,
  Clock, TrendingUp, CheckCircle2, ListTodo, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "../hooks/useProjects";
import { useWorkItems } from "../hooks/useWorkItems";
import { useSprints } from "../hooks/useSprints";
import { useProjectVelocity } from "../hooks/useSprints";
import { useEpics } from "../hooks/useEpics";
import { useWorkManagement } from "../context/WorkManagementContext";
import WorkItemDialog from "../components/universal/WorkItemDialog";
import StatusBadge from "../components/universal/StatusBadge";
import SprintCard from "../components/dev-mode/SprintCard";
import VelocityChart from "../components/dev-mode/VelocityChart";
import EpicRoadmap from "../components/dev-mode/EpicRoadmap";
import EmployeeSelect from "../components/shared/EmployeeSelect";
import { addProjectMember, removeProjectMember } from "../services/projectService";

const KPI_CARDS = [
  {
    key: "total", label: "Total Items", color: "text-white",
    bg: "bg-white/5", border: "border-white/10", icon: BarChart3,
  },
  {
    key: "todo", label: "To Do", color: "text-amber-400",
    bg: "bg-amber-500/8", border: "border-amber-500/20", icon: ListTodo,
  },
  {
    key: "in_progress", label: "In Progress", color: "text-blue-400",
    bg: "bg-blue-500/8", border: "border-blue-500/20", icon: CircleDot,
  },
  {
    key: "done", label: "Done", color: "text-emerald-400",
    bg: "bg-emerald-500/8", border: "border-emerald-500/20", icon: CheckCircle2,
  },
  {
    key: "velocity", label: "Velocity", color: "text-purple-400",
    bg: "bg-purple-500/8", border: "border-purple-500/20", icon: TrendingUp,
  },
];

const SimpleBarChart = ({ data, max, height = 80 }) => (
  <div className="flex items-end justify-between gap-2" style={{ height }}>
    {data.map((d, i) => {
      const pct = max > 0 ? (d.value / max) * 100 : 0;
      return (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t bg-zinc-700/40 relative" style={{ height: `${pct}%`, minHeight: pct > 0 ? 4 : 0 }}>
            <div className="absolute inset-x-0 top-0 h-full rounded-t bg-gradient-to-t from-transparent to-white/5" />
          </div>
          <span className="text-[8px] text-white/20">{d.label}</span>
        </div>
      );
    })}
  </div>
);

const ProjectDashboard = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { project, loading, refetch } = useProject(projectId);
  const { items: recentItems, refetch: refetchItems } = useWorkItems({ project: projectId, limit: 10 });
  const { sprints } = useSprints({ project: projectId });
  const { velocity, loading: velocityLoading } = useProjectVelocity(projectId);
  const { epics, loading: epicsLoading } = useEpics(projectId);
  const { toggleGlobalSearch } = useWorkManagement();
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState(null);
  const [addingMember, setAddingMember] = useState(false);

  const activeSprint = sprints?.find((s) => s.status === "ACTIVE");
  const summary = project?.work_item_summary || {};
  const total = summary.total || 1;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader size={28} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-10 py-5 flex items-center justify-between border-b border-zinc-800/50 shrink-0 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <span className="text-[10px] font-bold text-blue-400">{project.key}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-[12px] text-white/40 truncate">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGlobalSearch}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-[10px] font-medium"
          >
            <Search size={12} />
            <kbd className="text-[8px] text-white/20 border border-white/10 px-1 rounded">⌘K</kbd>
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all text-[10px] font-semibold uppercase tracking-wider"
          >
            <Plus size={12} /> New Item
          </button>
          <button
            onClick={() => window.open(`/api/work/items/export_excel/?project_id=${projectId}`, "_blank")}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-[10px] font-medium"
          >
            <Download size={12} /> Export
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8 space-y-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            let value = summary[card.key];
            let suffix = "";
            if (card.key === "velocity") {
              value = velocity?.velocity || 0;
              suffix = "pts";
            }
            return (
              <div
                key={card.key}
                className={cn(
                  "relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden group",
                  card.bg, card.border,
                  "hover:scale-[1.02] hover:shadow-lg",
                )}
              >
                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br from-current/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-3">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-[0.15em]", card.color, "opacity-80")}>
                    {card.label}
                  </span>
                  <Icon size={16} className={cn(card.color, "opacity-40 group-hover:opacity-80 transition-opacity")} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-2xl font-bold tracking-tight", card.color)}>{value}</span>
                  {suffix && <span className={cn("text-xs font-medium", card.color, "opacity-50")}>{suffix}</span>}
                </div>
                {card.key === "in_progress" && total > 0 && (
                  <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500/60 transition-all" style={{ width: `${(summary.in_progress / total) * 100}%` }} />
                  </div>
                )}
                {card.key === "done" && total > 0 && (
                  <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${(summary.done / total) * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress + Velocity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Completion Progress */}
          <div className="col-span-1 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={15} className="text-white/30" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Completion</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <circle
                    cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - (summary.done / total))}`}
                    className="text-emerald-400 transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{Math.round((summary.done / total) * 100)}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {[
                  { label: "Done", value: summary.done, color: "bg-emerald-500", textColor: "text-emerald-400" },
                  { label: "In Progress", value: summary.in_progress, color: "bg-blue-500", textColor: "text-blue-400" },
                  { label: "To Do", value: summary.todo, color: "bg-amber-500", textColor: "text-amber-400" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", s.color + "/60")} style={{ width: `${(s.value / total) * 100}%` }} />
                    </div>
                    <span className={cn("text-[10px] font-medium w-12 text-right", s.textColor)}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Sprint */}
          <div className="col-span-1">
            {activeSprint ? (
              <div onClick={() => navigate(`/work/${workspaceId}/${projectId}/sprints`)} className="cursor-pointer h-full">
                <SprintCard sprint={activeSprint} />
              </div>
            ) : (
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-3">
                  <Clock size={20} className="text-white/20" />
                </div>
                <p className="text-sm text-white/30 font-medium">No Active Sprint</p>
                <p className="text-[10px] text-white/20 mt-1">Plan a sprint to track progress</p>
              </div>
            )}
          </div>

          {/* Velocity */}
          <div className="col-span-1 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <VelocityChart velocity={velocity} loading={velocityLoading} />
          </div>
        </div>

        {/* Epic Roadmap + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <EpicRoadmap
              epics={epics}
              loading={epicsLoading}
              onEpicClick={(epic) => navigate(`/work/${workspaceId}/${projectId}/item/${epic.id}`)}
            />
          </div>

          {/* Recent Activity Feed */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={14} className="text-white/30" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Recent Activity</span>
              <span className="ml-auto text-[10px] text-white/20">{recentItems.length} items</span>
            </div>
            {recentItems.length === 0 ? (
              <div className="py-10 text-center">
                <AlertCircle size={24} className="mx-auto mb-2 text-white/15" />
                <p className="text-sm text-white/25">No items yet</p>
                <p className="text-xs text-white/15 mt-1">Create your first work item</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentItems.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/work/${workspaceId}/${projectId}/item/${item.id}`)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/10 group-hover:bg-blue-400 transition-colors" />
                    <span className="text-[10px] font-mono text-white/25 w-16 shrink-0">{item.key}</span>
                    <span className="text-xs text-white/70 truncate flex-1 group-hover:text-white transition-colors">{item.title}</span>
                    <StatusBadge name={item.status_details?.name} color={item.status_details?.color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-white/30" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Team</span>
              <span className="text-[10px] text-white/20 ml-1">{project.members?.length || 0} members</span>
            </div>
            <button
              onClick={() => setShowMembers(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-[10px] font-medium"
            >
              <UserPlus size={12} /> Manage
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {project.members?.map((member) => {
              const initial = member.user_details?.first_name?.[0] || member.user_details?.email?.[0]?.toUpperCase() || "?";
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-lg">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-white font-medium truncate">
                      {member.user_details?.first_name
                        ? `${member.user_details.first_name}`
                        : member.user_details?.email}
                    </p>
                    <p className="text-[8px] text-white/30 uppercase tracking-wider truncate">{member.role}</p>
                  </div>
                </div>
              );
            })}
            {(!project.members || project.members.length === 0) && (
              <div className="col-span-full py-8 text-center">
                <Users size={20} className="mx-auto mb-2 text-white/15" />
                <p className="text-sm text-white/25">No team members</p>
                <button
                  onClick={() => setShowMembers(true)}
                  className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Add members
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <WorkItemDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onSaved={() => refetchItems()}
      />

      {/* Manage Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Manage Members</h2>
              <button onClick={() => setShowMembers(false)} className="p-1 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <EmployeeSelect
                  value={memberToAdd}
                  onChange={setMemberToAdd}
                  projectId={projectId}
                  placeholder="Search employee to add..."
                />
              </div>
              <button
                onClick={async () => {
                  if (!memberToAdd) return;
                  setAddingMember(true);
                  try {
                    await addProjectMember(projectId, memberToAdd);
                    setMemberToAdd(null);
                    refetch();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setAddingMember(false);
                  }
                }}
                disabled={!memberToAdd || addingMember}
                className="px-4 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {addingMember ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                Add
              </button>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {project.members?.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">No members yet</p>
              ) : (
                project.members?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {(m.user_details?.first_name?.[0] || m.user_details?.email?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white font-medium truncate">
                          {m.user_details?.first_name
                            ? `${m.user_details.first_name} ${m.user_details.last_name || ""}`
                            : m.user_details?.email}
                        </p>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">{m.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await removeProjectMember(projectId, m.user);
                          refetch();
                        } catch (e) { console.error(e); }
                      }}
                      className="p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
