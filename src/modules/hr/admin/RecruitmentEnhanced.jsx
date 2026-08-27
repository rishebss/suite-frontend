import React, { useState, useEffect, useCallback } from "react";
import { recruitmentAPI, recruitmentEnhancedAPI } from "../services/hrAPI";

// ============================================================================
// Badge Component
// ============================================================================
const Badge = ({ status, colors, className = "" }) => {
  const defaultColors = { bg: "bg-gray-100", text: "text-gray-700" };
  const c = colors?.[status] || defaultColors;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} ${className}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

// ============================================================================
// Color Maps
// ============================================================================
const interviewColors = {
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
  RESCHEDULED: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

const offerColors = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600" },
  SENT: { bg: "bg-blue-100", text: "text-blue-700" },
  ACCEPTED: { bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700" },
  EXPIRED: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

const bgvColors = {
  NOT_INITIATED: { bg: "bg-gray-100", text: "text-gray-600" },
  INITIATED: { bg: "bg-blue-100", text: "text-blue-700" },
  IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700" },
  CLEAR: { bg: "bg-green-100", text: "text-green-700" },
  DISCREPANT: { bg: "bg-red-100", text: "text-red-700" },
};

const ijpColors = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600" },
  OPEN: { bg: "bg-green-100", text: "text-green-700" },
  CLOSED: { bg: "bg-red-100", text: "text-red-700" },
  CANCELLED: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

const referralColors = {
  REFERRED: { bg: "bg-blue-100", text: "text-blue-700" },
  CONTACTED: { bg: "bg-yellow-100", text: "text-yellow-700" },
  INTERVIEWED: { bg: "bg-purple-100", text: "text-purple-700" },
  HIRED: { bg: "bg-green-100", text: "text-green-700" },
  BONUS_PAID: { bg: "bg-emerald-100", text: "text-emerald-700" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700" },
  JOINED: { bg: "bg-teal-100", text: "text-teal-700" },
};

const buddyColors = {
  ACTIVE: { bg: "bg-blue-100", text: "text-blue-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

const preJoiningColors = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700" },
  UPLOADED: { bg: "bg-blue-100", text: "text-blue-700" },
  VERIFIED: { bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700" },
};

// ============================================================================
// Stat Card
// ============================================================================
const StatCard = ({ label, value, color = "text-blue-700", subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
    {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

// ============================================================================
// Modal
// ============================================================================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================
export default function RecruitmentEnhanced() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [bgvs, setBgvs] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [ijps, setIjps] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [preJoiningDocs, setPreJoiningDocs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(""); // 'create', 'edit'
  const [editItem, setEditItem] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        intRes, offRes, bgvRes, onbRes,
        ijpRes, refRes, budRes, preRes, fbRes
      ] = await Promise.all([
        recruitmentAPI.getInterviewSchedules().catch(() => ({ data: [] })),
        recruitmentAPI.getOfferLetters().catch(() => ({ data: [] })),
        recruitmentAPI.getBGVChecks().catch(() => ({ data: [] })),
        recruitmentAPI.getOnboardingTasks().catch(() => ({ data: [] })),
        recruitmentEnhancedAPI.getInternalJobPostings().catch(() => ({ data: [] })),
        recruitmentEnhancedAPI.getReferrals().catch(() => ({ data: [] })),
        recruitmentEnhancedAPI.getBuddies().catch(() => ({ data: [] })),
        recruitmentEnhancedAPI.getPreJoiningDocs().catch(() => ({ data: [] })),
        recruitmentEnhancedAPI.getFeedbacks().catch(() => ({ data: [] })),
      ]);
      setInterviews(intRes.data.results || intRes.data || []);
      setOffers(offRes.data.results || offRes.data || []);
      setBgvs(bgvRes.data.results || bgvRes.data || []);
      setOnboarding(onbRes.data.results || onbRes.data || []);
      setIjps(ijpRes.data.results || ijpRes.data || []);
      setReferrals(refRes.data.results || refRes.data || []);
      setBuddies(budRes.data.results || budRes.data || []);
      setPreJoiningDocs(preRes.data.results || preRes.data || []);
      setFeedbacks(fbRes.data.results || fbRes.data || []);
    } catch (err) {
      console.error("Failed to load recruitment data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setEditItem(item);
    setModalOpen(true);
  };

  // ==========================================================================
  // Tabs Configuration
  // ==========================================================================
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "ijp", label: `IJP (${ijps.length})`, icon: "🏢" },
    { id: "interviews", label: `Interviews (${interviews.length})`, icon: "🎯" },
    { id: "offers", label: `Offers (${offers.length})`, icon: "📄" },
    { id: "bgv", label: `BGV (${bgvs.length})`, icon: "🔍" },
    { id: "referrals", label: `Referrals (${referrals.length})`, icon: "🤝" },
    { id: "buddies", label: `Buddies (${buddies.length})`, icon: "👤" },
    { id: "prejoining", label: `Pre-Joining (${preJoiningDocs.length})`, icon: "📋" },
    { id: "feedback", label: `Feedback (${feedbacks.length})`, icon: "⭐" },
    { id: "onboarding", label: `Onboarding (${onboarding.length})`, icon: "🚀" },
  ];

  // ==========================================================================
  // Overview Tab
  // ==========================================================================
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Open IJP Positions" value={ijps.filter(i => i.status === "OPEN").length} color="text-blue-700" subtitle="Internal Job Postings" />
        <StatCard label="Upcoming Interviews" value={interviews.filter(i => i.status === "SCHEDULED").length} color="text-purple-700" />
        <StatCard label="Active Offers" value={offers.filter(o => o.status === "SENT" || o.status === "DRAFT").length} color="text-green-700" />
        <StatCard label="BGV In Progress" value={bgvs.filter(b => b.status !== "CLEAR" && b.status !== "NOT_INITIATED").length} color="text-yellow-700" />
        <StatCard label="Active Referrals" value={referrals.filter(r => ["REFERRED", "CONTACTED", "INTERVIEWED", "HIRED"].includes(r.status)).length} color="text-emerald-700" subtitle="Employee Referrals" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Buddies" value={buddies.filter(b => b.status === "ACTIVE").length} color="text-indigo-700" subtitle="Onboarding Buddies" />
        <StatCard label="Pending Pre-Joining" value={preJoiningDocs.filter(p => p.status === "PENDING").length} color="text-orange-700" />
        <StatCard label="Avg Onboarding Rating" value={feedbacks.length > 0 ? `${(feedbacks.reduce((a, b) => a + (b.overall_satisfaction || 0), 0) / feedbacks.length).toFixed(1)}/5` : "N/A"} color="text-rose-700" subtitle="Onboarding Feedback" />
        <StatCard label="Pending Tasks" value={onboarding.filter(o => !o.is_completed).length} color="text-cyan-700" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveTab("ijp"); openModal("create"); }}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            + New IJP Posting
          </button>
          <button onClick={() => { setActiveTab("referrals"); openModal("create"); }}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
            + Log Referral
          </button>
          <button onClick={() => { setActiveTab("buddies"); openModal("create"); }}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
            + Assign Buddy
          </button>
          <button onClick={() => { setActiveTab("prejoining"); openModal("create"); }}
            className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
            + Create Pre-Joining Portal
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================================================
  // Internal Job Postings (IJP) Tab
  // ==========================================================================
  const IJPTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{ijps.length} internal job posting{ijps.length !== 1 ? "s" : ""}</p>
        <button onClick={() => openModal("create")}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New IJP
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {ijps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No internal job postings yet. Create your first IJP!</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ijps.map((ijp) => (
              <div key={ijp.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{ijp.title}</p>
                      <Badge status={ijp.status} colors={ijpColors} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {ijp.employment_type || "Full-time"} | {ijp.min_experience || 0}-{ijp.max_experience || 0} yrs | {ijp.department_name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 {ijp.location_name || "N/A"} | Applications: {ijp.total_applications || 0} | Posted: {ijp.posting_date ? new Date(ijp.posting_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {ijp.status === "DRAFT" && (
                      <button onClick={() => recruitmentEnhancedAPI.publishInternalJobPosting(ijp.id).then(loadAll)}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100">
                        Publish
                      </button>
                    )}
                    {ijp.status === "OPEN" && (
                      <button onClick={() => recruitmentEnhancedAPI.closeInternalJobPosting(ijp.id).then(loadAll)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100">
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================================================
  // Employee Referrals Tab
  // ==========================================================================
  const ReferralsTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{referrals.length} referral{referrals.length !== 1 ? "s" : ""}</p>
        <button onClick={() => openModal("create")}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          + New Referral
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {referrals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No referrals yet. Encourage employees to refer talent!</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {referrals.map((ref) => (
              <div key={ref.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{ref.referred_name}</p>
                      <Badge status={ref.status} colors={referralColors} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      📧 {ref.referred_email} | Referred by: {ref.referring_employee?.employee_id || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Relationship: {ref.relationship || "N/A"} | Bonus: ₹{(ref.bonus_amount || 0).toLocaleString()} {ref.bonus_paid ? "✅" : "⏳"}
                    </p>
                  </div>
                  <button onClick={() => recruitmentEnhancedAPI.updateReferralStatus(ref.id, { status: prompt("New status (REFERRED/CONTACTED/INTERVIEWED/HIRED/REJECTED/BONUS_PAID):") || ref.status }).then(loadAll)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================================================
  // Onboarding Buddies Tab
  // ==========================================================================
  const BuddiesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{buddies.length} assignment{buddies.length !== 1 ? "s" : ""}</p>
        <button onClick={() => openModal("create")}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + Assign Buddy
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {buddies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No buddy assignments yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {buddies.map((b) => (
              <div key={b.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {b.buddy?.employee_id || "N/A"} → {b.new_employee?.employee_id || "N/A"}
                      </p>
                      <Badge status={b.status} colors={buddyColors} />
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">{b.role}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Assigned: {b.assigned_date ? new Date(b.assigned_date).toLocaleDateString() : "N/A"}</p>
                    {b.buddy_rating && <p className="text-xs text-gray-400 mt-0.5">Rating: {"★".repeat(b.buddy_rating)}{"☆".repeat(5 - b.buddy_rating)}</p>}
                  </div>
                  {b.status === "ACTIVE" && (
                    <button onClick={() => recruitmentEnhancedAPI.completeBuddy(b.id, { buddy_rating: 4, new_employee_feedback: "" }).then(loadAll)}
                      className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================================================
  // Pre-Joining Portal Tab
  // ==========================================================================
  const PreJoiningTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{preJoiningDocs.length} portal{preJoiningDocs.length !== 1 ? "s" : ""}</p>
        <button onClick={() => openModal("create")}
          className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
          + New Portal
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {preJoiningDocs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pre-joining portals created yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {preJoiningDocs.map((p) => (
              <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{p.candidate?.email || "N/A"}</p>
                      <Badge status={p.status} colors={preJoiningColors} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Docs: {p.documents_uploaded || 0}/{p.total_documents_required || 0} uploaded
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.welcome_email_sent ? "✅ Welcome email sent" : "⏳ Welcome email not sent"}
                      {p.last_activity && ` | Last activity: ${new Date(p.last_activity).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!p.welcome_email_sent && (
                      <button onClick={() => recruitmentEnhancedAPI.sendWelcomeEmail(p.id).then(loadAll)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100">
                        Send Welcome
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================================================
  // Onboarding Feedback Tab
  // ==========================================================================
  const FeedbackTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Feedback Summary */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard label="Avg Overall" value={`${(feedbacks.reduce((a, b) => a + (b.overall_satisfaction || 0), 0) / feedbacks.length).toFixed(1)}/5`} color="text-blue-700" />
          <StatCard label="Avg Onboarding" value={`${(feedbacks.reduce((a, b) => a + (b.onboarding_process || 0), 0) / feedbacks.length).toFixed(1)}/5`} color="text-green-700" />
          <StatCard label="Avg Role Clarity" value={`${(feedbacks.reduce((a, b) => a + (b.role_clarity || 0), 0) / feedbacks.length).toFixed(1)}/5`} color="text-purple-700" />
          <StatCard label="Would Recommend" value={`${feedbacks.filter(f => f.would_recommend).length}/${feedbacks.length}`} color="text-emerald-700" />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {feedbacks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No onboarding feedback submitted yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {feedbacks.map((f) => (
              <div key={f.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{f.employee?.employee_id || "N/A"}</p>
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">{f.feedback_type?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span>Overall: {"★".repeat(f.overall_satisfaction || 0)}{"☆".repeat(5 - (f.overall_satisfaction || 0))}</span>
                      <span>Process: {"★".repeat(f.onboarding_process || 0)}{"☆".repeat(5 - (f.onboarding_process || 0))}</span>
                      <span>Clarity: {"★".repeat(f.role_clarity || 0)}{"☆".repeat(5 - (f.role_clarity || 0))}</span>
                    </div>
                    {f.challenges_faced && <p className="text-xs text-gray-400 mt-1">⚠️ {f.challenges_faced}</p>}
                    {f.suggestions && <p className="text-xs text-blue-400 mt-0.5">💡 {f.suggestions}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================================================
  // Existing Tab Renderers (Interviews, Offers, BGV, Onboarding)
  // ==========================================================================
  const ListRenderer = ({ items, renderItem, emptyMessage = "No data" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==========================================================================
  // Create/Edit Modal Content
  // ==========================================================================
  const ModalContent = () => {
    if (!modalOpen) return null;
    const isCreate = modalMode === "create";

    switch (activeTab) {
      case "ijp":
        return <IJPCreateForm onDone={() => { setModalOpen(false); loadAll(); }} editItem={editItem} />;
      case "referrals":
        return <ReferralCreateForm onDone={() => { setModalOpen(false); loadAll(); }} editItem={editItem} />;
      case "buddies":
        return <BuddyCreateForm onDone={() => { setModalOpen(false); loadAll(); }} editItem={editItem} />;
      case "prejoining":
        return <PreJoiningCreateForm onDone={() => { setModalOpen(false); loadAll(); }} editItem={editItem} />;
      default:
        return <p className="text-gray-500 text-sm">Select a tab to create new items.</p>;
    }
  };

  // ==========================================================================
  // Render Tab Content
  // ==========================================================================
  const renderTabContent = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={loadAll} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "ijp": return <IJPTab />;
      case "interviews":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{interviews.length} interview{interviews.length !== 1 ? "s" : ""}</p>
            </div>
            <ListRenderer items={interviews} emptyMessage="No interviews scheduled"
              renderItem={(i) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{i.interview_type} - {i.application?.candidate?.email || "N/A"}</p>
                    <p className="text-sm text-gray-500">{new Date(i.scheduled_date).toLocaleString()} | {i.duration_minutes}min | {i.interview_mode}</p>
                    {i.feedback && <p className="text-xs text-gray-400 mt-1">{i.feedback}</p>}
                  </div>
                  <Badge status={i.status} colors={interviewColors} />
                </div>
              )}
            />
          </div>
        );
      case "offers":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{offers.length} offer{offers.length !== 1 ? "s" : ""}</p>
            </div>
            <ListRenderer items={offers} emptyMessage="No offer letters"
              renderItem={(o) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{o.candidate?.email || "N/A"} - {o.designation}</p>
                    <p className="text-sm text-gray-500">CTC: ₹{(o.ctc || 0).toLocaleString()} | Joining: {o.joining_date}</p>
                  </div>
                  <Badge status={o.status} colors={offerColors} />
                </div>
              )}
            />
          </div>
        );
      case "bgv":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{bgvs.length} BGV check{bgvs.length !== 1 ? "s" : ""}</p>
            </div>
            <ListRenderer items={bgvs} emptyMessage="No BGV checks"
              renderItem={(b) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{b.candidate?.email || "N/A"}</p>
                    <p className="text-sm text-gray-500">Vendor: {b.vendor_name || "Not assigned"} | Ref: {b.vendor_reference || "N/A"}</p>
                    <p className="text-xs text-gray-400">ID:{b.identity_verified?"✅":"❌"} Addr:{b.address_verified?"✅":"❌"} Edu:{b.education_verified?"✅":"❌"} Emp:{b.employment_verified?"✅":"❌"}</p>
                  </div>
                  <Badge status={b.status} colors={bgvColors} />
                </div>
              )}
            />
          </div>
        );
      case "referrals": return <ReferralsTab />;
      case "buddies": return <BuddiesTab />;
      case "prejoining": return <PreJoiningTab />;
      case "feedback": return <FeedbackTab />;
      case "onboarding":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{onboarding.length} task{onboarding.length !== 1 ? "s" : ""}</p>
            </div>
            <ListRenderer items={onboarding} emptyMessage="No onboarding tasks"
              renderItem={(o) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{o.task_name}</p>
                    <p className="text-sm text-gray-500">{o.task_type} | Employee: {o.employee_name || o.employee?.employee_id}</p>
                    {o.due_date && <p className="text-xs text-gray-400">Due: {o.due_date}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.is_completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {o.is_completed ? "Done" : "Pending"}
                  </span>
                </div>
              )}
            />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Management</h1>
          <p className="text-sm text-gray-500">IJP, interviews, offers, BGV, referrals, onboarding, and more</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 mt-4">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === t.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={modalMode === "create" ? `New ${activeTab === "ijp" ? "IJP Posting" : activeTab === "referrals" ? "Referral" : activeTab === "buddies" ? "Buddy Assignment" : activeTab === "prejoining" ? "Pre-Joining Portal" : "Item"}` : "Edit Item"}>
        <ModalContent />
      </Modal>
    </div>
  );
}

// ============================================================================
// IJP Create Form
// ============================================================================
const IJPCreateForm = ({ onDone, editItem }) => {
  const [form, setForm] = useState({
    title: "", department: "", designation: "", work_location: "",
    employment_type: "FULL_TIME", min_experience: 0, max_experience: 10,
    vacancies: 1, description: "", requirements: "", status: "DRAFT",
    application_deadline: "", expected_joining_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) setForm({ ...editItem });
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruitmentEnhancedAPI.createInternalJobPosting(form);
      onDone();
    } catch (err) {
      alert("Failed to create IJP: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Job Title *</label>
        <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
          <select value={form.employment_type} onChange={e => setForm({...form, employment_type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vacancies *</label>
          <input type="number" min="1" required value={form.vacancies} onChange={e => setForm({...form, vacancies: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Min Experience (yrs)</label>
          <input type="number" min="0" value={form.min_experience} onChange={e => setForm({...form, min_experience: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max Experience (yrs)</label>
          <input type="number" min="0" value={form.max_experience} onChange={e => setForm({...form, max_experience: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Requirements</label>
        <textarea rows="3" value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? "Creating..." : "Create IJP Posting"}
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// Referral Create Form
// ============================================================================
const ReferralCreateForm = ({ onDone, editItem }) => {
  const [form, setForm] = useState({
    referred_name: "", referred_email: "", referred_phone: "",
    relationship: "", notes: "", bonus_amount: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) setForm({ ...editItem });
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruitmentEnhancedAPI.createReferral(form);
      onDone();
    } catch (err) {
      alert("Failed to create referral: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Referred Person Name *</label>
        <input type="text" required value={form.referred_name} onChange={e => setForm({...form, referred_name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
        <input type="email" required value={form.referred_email} onChange={e => setForm({...form, referred_email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <input type="tel" value={form.referred_phone} onChange={e => setForm({...form, referred_phone: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
        <input type="text" value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})}
          placeholder="e.g. Ex-colleague, Friend, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bonus Amount (₹)</label>
        <input type="number" min="0" value={form.bonus_amount} onChange={e => setForm({...form, bonus_amount: parseInt(e.target.value)})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <button type="submit" disabled={saving}
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
        {saving ? "Saving..." : "Log Referral"}
      </button>
    </form>
  );
};

// ============================================================================
// Buddy Create Form
// ============================================================================
const BuddyCreateForm = ({ onDone, editItem }) => {
  const [form, setForm] = useState({
    new_employee: "", buddy: "", role: "BUDDY", end_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) setForm({ ...editItem });
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruitmentEnhancedAPI.createBuddy(form);
      onDone();
    } catch (err) {
      alert("Failed to assign buddy: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">New Employee ID *</label>
        <input type="text" required value={form.new_employee} onChange={e => setForm({...form, new_employee: e.target.value})}
          placeholder="Employee ID or UUID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Buddy/Mentor Employee ID *</label>
        <input type="text" required value={form.buddy} onChange={e => setForm({...form, buddy: e.target.value})}
          placeholder="Employee ID or UUID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
        <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="BUDDY">Buddy</option>
          <option value="MENTOR">Mentor</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">End Date (typically +90 days)</label>
        <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <button type="submit" disabled={saving}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {saving ? "Assigning..." : "Assign Buddy"}
      </button>
    </form>
  );
};

// ============================================================================
// Pre-Joining Portal Create Form
// ============================================================================
const PreJoiningCreateForm = ({ onDone, editItem }) => {
  const [form, setForm] = useState({
    offer: "", candidate: "", portal_expiry_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) setForm({ ...editItem });
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruitmentEnhancedAPI.createPreJoiningDoc(form);
      onDone();
    } catch (err) {
      alert("Failed to create portal: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Offer Letter ID *</label>
        <input type="text" required value={form.offer} onChange={e => setForm({...form, offer: e.target.value})}
          placeholder="Offer letter UUID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Candidate ID *</label>
        <input type="text" required value={form.candidate} onChange={e => setForm({...form, candidate: e.target.value})}
          placeholder="Candidate UUID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Portal Expiry Date</label>
        <input type="date" value={form.portal_expiry_date} onChange={e => setForm({...form, portal_expiry_date: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <p className="text-xs text-gray-400">A unique portal link will be auto-generated for document collection.</p>
      <button type="submit" disabled={saving}
        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors">
        {saving ? "Creating..." : "Create Portal"}
      </button>
    </form>
  );
};
