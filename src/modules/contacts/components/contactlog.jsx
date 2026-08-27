import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Clock, History, MessageSquare, CalendarPlus, Plus, Check, ChevronDown, Calendar } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const FOLLOWUP_STATUS_STYLES = {
    follow_up: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    failed: 'text-red-400 bg-red-500/10 border-red-500/20',
    complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cancelled: 'text-white/40 bg-white/5 border-white/10',
};

const ContactLogs = ({ isOpen, onClose, contact }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [filter, setFilter] = useState('all');
    const [newRemarkText, setNewRemarkText] = useState('');
    const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
    const [isAddingActivityRemark, setIsAddingActivityRemark] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());

    const PAGE_SIZE = 20;

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!newRemarkText.trim() || !contact?.id) return;
        setIsSubmittingRemark(true);
        try {
            await axios.post('/api/contacts/remarks/', {
                contact: contact.id,
                text: newRemarkText.trim()
            });
            setNewRemarkText('');
            setIsAddingActivityRemark(false);
            await fetchAll();
        } catch (err) {
            console.error("Failed to add remark:", err);
        } finally {
            setIsSubmittingRemark(false);
        }
    };

    const fetchAll = async () => {
        if (!contact?.id) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page_size', PAGE_SIZE);
            if (filter !== 'all') params.set('kind', filter);
            if (selectedDate) params.set('date', selectedDate);
            const res = await axios.get(`/api/contacts/${contact.id}/activity/?${params}`);
            setItems(res.data.results || []);
            setPage(1);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error("Failed to fetch contact logs:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = async () => {
        setIsLoadingMore(true);
        try {
            const params = new URLSearchParams();
            params.set('page_size', PAGE_SIZE);
            params.set('page', page + 1);
            if (filter !== 'all') params.set('kind', filter);
            if (selectedDate) params.set('date', selectedDate);
            const res = await axios.get(`/api/contacts/${contact.id}/activity/?${params}`);
            setItems(prev => [...prev, ...(res.data.results || [])]);
            setPage(prev => prev + 1);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error("Failed to load more:", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFilter('all');
            setIsAddingActivityRemark(false);
            setNewRemarkText('');
            setIsCalendarOpen(false);
            setSelectedDate(null);
            setCalMonth(new Date().getMonth());
            setCalYear(new Date().getFullYear());
        }
    }, [isOpen, contact]);

    useEffect(() => {
        if (isOpen) {
            fetchAll();
        }
    }, [isOpen, contact, filter, selectedDate]);

    if (!isOpen) return null;

    const mergedItems = items.filter(i => filter === 'all' || i.kind === filter);

    const formatActor = (data) => {
        if (data.user_details) {
            const d = data.user_details;
            return `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.email;
        }
        if (data.user_name) return data.user_name;
        return 'System';
    };

    const CAL_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

    const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const isToday = (y, m, d) => {
        const now = new Date();
        return now.getFullYear() === y && now.getMonth() === m && now.getDate() === d;
    };

    const calDaysInMonth = getDaysInMonth(calMonth, calYear);
    const calFirstDay = getFirstDayOfMonth(calMonth, calYear);

    const calCells = [];
    for (let i = 0; i < calFirstDay; i++) calCells.push(null);
    for (let d = 1; d <= calDaysInMonth; d++) calCells.push(d);

    const hasLogsOnDate = (dateKey) => {
        return items.some(item => {
            const itemDate = new Date(item.created_at);
            const k = toKey(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
            return k === dateKey;
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[1200]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-900 bg-white/[0.01] shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <History size={14} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Contact Activity</p>
                                <h2 className="text-[12px] text-white uppercase tracking-wider truncate">{contact?.name || 'Contact'}</h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all shrink-0 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="px-6 py-3 border-b border-zinc-900 shrink-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
                        {[
                            { id: 'all', label: 'All', icon: History },
                            { id: 'followup', label: 'Follow Ups', icon: CalendarPlus },
                            { id: 'log', label: 'Updates', icon: MessageSquare },
                        ].map(t => {
                            const Icon = t.icon;
                            const isActive = filter === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setFilter(t.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-[8px] font-semibold uppercase tracking-[0.1em] transition-all cursor-pointer",
                                        isActive
                                            ? "bg-white/10 text-white border border-white/5"
                                            : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"
                                    )}
                                >
                                    <Icon size={10} className={isActive ? "text-blue-400" : "text-white/30"} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsAddingActivityRemark(!isAddingActivityRemark)}
                            className="w-7 h-7 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/40 transition-all flex items-center justify-center cursor-pointer shrink-0"
                            title="Add Update"
                        >
                            <Plus size={13} className={cn("transition-transform duration-300", isAddingActivityRemark && "rotate-45")} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={cn(
                                "w-7 h-7 rounded transition-all flex items-center justify-center cursor-pointer shrink-0",
                                selectedDate
                                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40"
                            )}
                            title="Filter by Date"
                        >
                            <Calendar size={13} />
                        </button>
                    </div>
                </div>

                {isCalendarOpen && (
                    <div className="px-6 py-3 border-b border-zinc-900 shrink-0">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                                        else setCalMonth(m => m - 1);
                                    }}
                                    className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <ChevronDown size={12} className="rotate-90" />
                                </button>
                                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">{CAL_MONTHS[calMonth]} {calYear}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                                        else setCalMonth(m => m + 1);
                                    }}
                                    className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <ChevronDown size={12} className="-rotate-90" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 mb-1">
                                {CAL_DAYS.map(d => (
                                    <div key={d} className="text-center text-[7px] text-white/20 font-semibold uppercase tracking-wider py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5">
                                {calCells.map((day, i) => {
                                    if (day === null) return <div key={`empty-${i}`} />;
                                    const key = toKey(calYear, calMonth, day);
                                    const isSelected = selectedDate === key;
                                    const today = isToday(calYear, calMonth, day);
                                    const hasDots = hasLogsOnDate(key);
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedDate(isSelected ? null : key)}
                                            className={cn(
                                                "relative w-full aspect-square rounded flex items-center justify-center text-[9px] transition-all cursor-pointer",
                                                isSelected
                                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                                    : today
                                                        ? "bg-white/5 text-white border border-white/10"
                                                        : "text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent"
                                            )}
                                        >
                                            {day}
                                            {hasDots && !isSelected && (
                                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400/60" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {selectedDate && (
                    <div className="px-6 py-2.5 border-b border-zinc-900 shrink-0 flex items-center justify-between">
                        <span className="text-[8px] text-white/30 uppercase tracking-wider">
                            Showing logs for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedDate(null)}
                            className="text-[8px] text-amber-400 hover:text-amber-300 uppercase tracking-wider font-semibold cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {isAddingActivityRemark && (
                    <form onSubmit={handleAddRemark} className="px-6 py-3 border-b border-zinc-900 shrink-0 flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={newRemarkText}
                            onChange={(e) => setNewRemarkText(e.target.value)}
                            placeholder="Add an update..."
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newRemarkText.trim() || isSubmittingRemark}
                            className="px-3 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                        >
                            {isSubmittingRemark ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                        </button>
                    </form>
                )}

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                            <Loader2 size={20} className="animate-spin text-white/20" />
                        </div>
                    ) : mergedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[250px] m-4 rounded-lg border border-dashed border-zinc-900 bg-white/[0.005]">
                            <Clock size={20} className="text-white/5" />
                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No activity recorded yet</p>
                        </div>
                    ) : (
                        <>
                        <div className="relative pl-6 border-l border-zinc-900 space-y-5 py-5 ml-5 pr-3">
                            {mergedItems.map((item) => {
                                const kind = item.kind;
                                const data = item;
                                const date = new Date(data.created_at);
                                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                                if (kind === 'followup') {
                                    const statusStyle = FOLLOWUP_STATUS_STYLES[data.status] || FOLLOWUP_STATUS_STYLES.follow_up;
                                    return (
                                        <div key={`fu-${data.id}`} className="relative group">
                                            <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full border transition-colors bg-fuchsia-500/40 border-fuchsia-500/60" />
                                            <div className="flex flex-col space-y-1.5 rounded p-3.5 transition-all duration-300 bg-fuchsia-500/[0.06] border border-fuchsia-500/20 hover:bg-fuchsia-500/[0.1] hover:border-fuchsia-500/30">
                                                <div className="flex items-start justify-between gap-3">
                                                    <span className="text-[9.5px] font-semibold text-white/90 uppercase tracking-wide leading-relaxed break-words min-w-0">{data.title}</span>
                                                    <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full border text-[7.5px] font-bold uppercase tracking-wider", statusStyle)}>
                                                        {(data.status || 'follow_up').replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] font-mono text-white/30 uppercase">{formattedDate} • {formattedTime}</span>
                                                {data.description && (
                                                    <p className="text-[9.5px] text-white/50 leading-relaxed break-words">{data.description}</p>
                                                )}
                                                <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-3">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {data.pipeline_name && (
                                                            <span className="text-[8px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none uppercase truncate">{data.pipeline_name}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">By</span>
                                                        <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none">{formatActor(data)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                const isPipelineChange = data.activity_type === 'Pipeline Changed' || data.activity_type === 'Pipeline Added';
                                const isDealDeleted = data.activity_type === 'Deal Deleted';
                                return (
                                    <div key={data.id} className="relative group">
                                        <div className={cn("absolute -left-[25px] top-1 w-2 h-2 rounded-full border transition-colors",
                                            isPipelineChange ? "bg-amber-500/40 border-amber-500/60"
                                                : isDealDeleted ? "bg-red-500/40 border-red-500/60"
                                                : "bg-zinc-950 border-zinc-800 group-hover:border-emerald-500/50")} />
                                        <div className={cn("flex flex-col space-y-1.5 rounded p-3.5 transition-all duration-300",
                                            isPipelineChange
                                                ? "bg-amber-500/[0.06] border border-amber-500/20 hover:bg-amber-500/[0.1] hover:border-amber-500/30"
                                                : isDealDeleted
                                                ? "bg-red-500/[0.06] border border-red-500/20 hover:bg-red-500/[0.1] hover:border-red-500/30"
                                                : "bg-white/[0.04] border border-zinc-800 hover:bg-white/[0.06] hover:border-zinc-700")}>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9.5px] font-semibold text-white/90 uppercase tracking-wide leading-relaxed break-words">{data.description}</span>
                                                <span className="text-[8px] font-mono text-white/30 uppercase">{formattedDate} • {formattedTime}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-3">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    {data.pipeline_name && (
                                                        <span className="text-[8px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none uppercase truncate">{data.pipeline_name}</span>
                                                    )}
                                                    {data.activity_type && (
                                                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{data.activity_type}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">Actor</span>
                                                    <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none">{formatActor(data)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {hasMore && (
                            <div className="flex justify-center pb-5 pt-1">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                    className="px-5 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-[9px] font-semibold uppercase tracking-[0.15em] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {isLoadingMore && <Loader2 size={11} className="animate-spin" />}
                                    Load More
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-2 border-t border-zinc-900 bg-white/[0.01] shrink-0">
                </div>
            </aside>
        </div>,
        document.body
    );
};

export default ContactLogs;
