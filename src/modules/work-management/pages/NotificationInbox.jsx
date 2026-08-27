import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Bell, BellDot, CheckCheck, Loader2,
  Activity, UserPlus, ArrowRight, AlertTriangle,
  MessageSquare, Paperclip, Calendar, Target, Trash2, Layers,
} from "lucide-react";
import axios from "axios";

const NOTIFICATION_ICONS = {
  ITEM_ASSIGNED: { icon: UserPlus, color: "text-purple-400" },
  ITEM_UPDATED: { icon: Activity, color: "text-blue-400" },
  COMMENT_ADDED: { icon: MessageSquare, color: "text-cyan-400" },
  STATUS_CHANGED: { icon: ArrowRight, color: "text-amber-400" },
  SLA_BREACHED: { icon: AlertTriangle, color: "text-red-500" },
  SLA_WARNING: { icon: AlertTriangle, color: "text-amber-500" },
  MENTION: { icon: MessageSquare, color: "text-green-400" },
  DUE_SOON: { icon: Calendar, color: "text-yellow-400" },
  OVERDUE: { icon: AlertTriangle, color: "text-red-500" },
  SPRINT_STARTED: { icon: Target, color: "text-emerald-400" },
  SPRINT_ENDED: { icon: Target, color: "text-orange-400" },
  MILESTONE_ACHIEVED: { icon: Target, color: "text-green-500" },
  SYSTEM: { icon: Bell, color: "text-white/50" },
};

const PAGE_SIZE = 20;

const NotificationInbox = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // all | grouped
  const [smartData, setSmartData] = useState(null);
  const [loadingSmart, setLoadingSmart] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const { data } = await axios.get("/api/work/notifications/", {
        params: { page: pageNum, page_size: PAGE_SIZE },
      });
      const results = data.results || data || [];
      if (append) {
        setNotifications((prev) => [...prev, ...results]);
      } else {
        setNotifications(results);
      }
      setHasMore(results.length >= PAGE_SIZE);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (viewMode !== "grouped") return;
    setLoadingSmart(true);
    axios.get("/api/work/notifications/smart_list/")
      .then((res) => setSmartData(res.data))
      .catch(() => {})
      .finally(() => setLoadingSmart(false));
  }, [viewMode]);

  const handleMarkRead = async (id) => {
    try {
      await axios.post(`/api/work/notifications/${id}/mark_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post("/api/work/notifications/mark_all_read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewMode("all")}
              className={cn("px-2 py-1 rounded text-[9px] font-medium transition-colors", viewMode === "all" ? "bg-zinc-800 text-white" : "text-white/40 hover:text-white/70")}
            >
              All
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={cn("px-2 py-1 rounded text-[9px] font-medium transition-colors", viewMode === "grouped" ? "bg-zinc-800 text-white" : "text-white/40 hover:text-white/70")}
            >
              <Layers size={10} className="inline mr-0.5" /> Grouped
            </button>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-white/50 hover:text-white text-[10px] font-medium transition-colors disabled:opacity-30"
          >
            <CheckCheck size={12} /> Mark all read
          </button>
          <button
            onClick={() => fetchNotifications(1, false)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white/50 hover:text-white text-[10px] font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {loading || (viewMode === "grouped" && loadingSmart) ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : viewMode === "grouped" && smartData ? (
          <div>
            <div className="px-6 py-2 bg-zinc-900/30 border-b border-zinc-800/30">
              <div className="flex items-center gap-3 text-[10px] text-white/30">
                <span>{smartData.total_notifications} total</span>
                <span className="text-blue-400">{smartData.unread_count} unread</span>
                <span>{smartData.group_count} groups</span>
                {smartData.digest_enabled && <span>Digest: {smartData.digest_frequency}</span>}
              </div>
            </div>
            {smartData.groups?.map((group) => {
              const config = NOTIFICATION_ICONS[group.notification_type] || { icon: Bell, color: "text-white/30" };
              const Icon = config.icon;
              return (
                <div key={group.group_key} className="border-b border-zinc-800/30">
                  <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900/20">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Icon size={14} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{group.notification_type.replace(/_/g, " ")}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-white/40">{group.count} notifications</span>
                        {group.unread_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[9px] text-blue-400">{group.unread_count} unread</span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {group.project_name && <>{group.project_name} · </>}
                        {group.latest_title}
                      </p>
                    </div>
                    <span className="text-[9px] text-white/20 shrink-0">{new Date(group.latest_created_at).toLocaleDateString()}</span>
                  </div>
                  {group.notifications?.map((n) => (
                    <div
                      key={n.id}
                      className={cn("flex items-start gap-3 px-6 py-2.5 pl-16 hover:bg-zinc-900/30 transition-colors cursor-pointer border-t border-zinc-800/10", !n.is_read && "bg-blue-500/5")}
                      onClick={() => {
                        if (!n.is_read) axios.post(`/api/work/notifications/${n.id}/mark_read/`);
                        if (n.work_item_id) navigate(`/work/${n.metadata?.workspace_id || smartData?.workspace_id || ""}/${n.metadata?.project_id || ""}/item/${n.work_item_id}`);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs", n.is_read ? "text-white/50" : "text-white font-medium")}>{n.title}</p>
                        {n.message && <p className="text-[10px] text-white/30 mt-0.5">{n.message}</p>}
                        <p className="text-[9px] text-white/20 mt-0.5">{new Date(n.created_at).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {(!smartData.groups || smartData.groups.length === 0) && (
              <div className="text-center py-20">
                <Bell size={40} className="mx-auto text-white/10 mb-3" />
                <p className="text-sm text-white/30">No notifications in this period</p>
              </div>
            )}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => {
              const config = NOTIFICATION_ICONS[n.notification_type] || { icon: Bell, color: "text-white/30" };
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-6 py-3 border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors cursor-pointer",
                    !n.is_read && "bg-blue-500/5"
                  )}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5",
                    !n.is_read && "border-blue-500/30"
                  )}>
                    <Icon size={14} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm", n.is_read ? "text-white/60" : "text-white font-medium")}>{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
                    </div>
                    {n.message && (
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-white/30">{n.notification_type}</span>
                      <span className="text-[10px] text-white/20">{new Date(n.created_at).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchNotifications(page + 1, true)}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-zinc-800 text-white/50 hover:text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin inline" /> : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationInbox;
