import React, { useState, useEffect, useCallback } from "react";
import { Bell, BellDot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ onOpenInbox }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCount = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/work/notifications/unread_count/");
      setUnreadCount(data.count || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const handleClick = () => {
    if (onOpenInbox) {
      onOpenInbox();
    } else {
      navigate("/work/notifications");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
      title="Notifications"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : unreadCount > 0 ? (
        <>
          <BellDot size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </>
      ) : (
        <Bell size={16} />
      )}
    </button>
  );
};

export default NotificationBell;
