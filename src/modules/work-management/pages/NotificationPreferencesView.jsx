import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Bell, BellOff, Mail, MessageSquare,
  Globe, Loader2, Save
} from "lucide-react";
import {
  fetchNotificationPreferences, updateNotificationPreference,
  createNotificationPreference
} from "../services/notificationService";

const CHANNEL_ICONS = {
  email: Mail,
  in_app: MessageSquare,
  webhook: Globe,
};

const NotificationPreferencesView = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const [digestEnabled, setDigestEnabled] = useState(false);
  const [digestFreq, setDigestFreq] = useState("DAILY");
  const [savingDigest, setSavingDigest] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetchNotificationPreferences()
      .then(({ data }) => {
        const prefsList = data.results || data || [];
        setPrefs(prefsList);
        const dig = prefsList.find((p) => p.digest_enabled);
        if (dig) {
          setDigestEnabled(true);
          setDigestFreq(dig.digest_frequency || "DAILY");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (pref) => {
    setSaving(pref.id);
    try {
      const updated = await updateNotificationPreference(pref.id, { enabled: !pref.enabled });
      setPrefs((prev) => prev.map((p) => p.id === pref.id ? updated.data : p));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleCreateDefault = async () => {
    try {
      await createNotificationPreference({ user: "me" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const ChannelIcon = ({ channel }) => {
    const Icon = CHANNEL_ICONS[channel] || Bell;
    return <Icon size={14} />;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-bold text-white">Notification Preferences</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : prefs.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No preferences configured.</p>
            <button onClick={handleCreateDefault} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Create defaults</button>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {/* Digest Mode Toggle */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">Digest Mode</p>
                  <p className="text-xs text-white/40">Receive a daily/weekly summary instead of real-time notifications</p>
                </div>
                <button
                  onClick={async () => {
                    setSavingDigest(true);
                    try {
                      const payload = { digest_enabled: !digestEnabled, digest_frequency: digestFreq };
                      if (prefs.length > 0) {
                        await updateNotificationPreference(prefs[0].id, payload);
                      }
                      setDigestEnabled(!digestEnabled);
                    } catch (err) { console.error(err); }
                    setSavingDigest(false);
                  }}
                  disabled={savingDigest}
                  className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0", digestEnabled ? "bg-purple-600" : "bg-zinc-700", savingDigest && "opacity-50")}
                >
                  <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform", digestEnabled ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
              {digestEnabled && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">Frequency:</span>
                  <select
                    value={digestFreq}
                    onChange={async (e) => {
                      setDigestFreq(e.target.value);
                      if (prefs.length > 0) {
                        try { await updateNotificationPreference(prefs[0].id, { digest_frequency: e.target.value }); } catch (err) { console.error(err); }
                      }
                    }}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>
              )}
            </div>
            {prefs.map((pref) => (
              <div key={pref.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white/40">
                  <ChannelIcon channel={pref.channel} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white capitalize">{pref.channel?.replace(/_/g, " ") || "Unknown"}</p>
                  <p className="text-xs text-white/40">{pref.notification_type || "All notifications"}</p>
                </div>
                <button
                  onClick={() => handleToggle(pref)}
                  disabled={saving === pref.id}
                  className={cn("relative w-10 h-5 rounded-full transition-colors", pref.enabled ? "bg-blue-600" : "bg-zinc-700", saving === pref.id && "opacity-50")}
                >
                  <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform", pref.enabled ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationPreferencesView;
