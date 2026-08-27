import React from "react";
import { Routes, Route } from "react-router-dom";
import { WorkManagementProvider } from "./context/WorkManagementContext";
import ProjectLayout from "./components/layout/ProjectLayout";

import WorkspaceList from "./pages/WorkspaceList";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import ProjectDashboard from "./pages/ProjectDashboard";
import BoardView from "./pages/BoardView";
import SprintPlanning from "./pages/SprintPlanning";
import BacklogView from "./pages/BacklogView";
import PipelineView from "./pages/PipelineView";
import SalesDashboard from "./pages/SalesDashboard";
import TicketQueue from "./pages/TicketQueue";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import WorkItemDetail from "./pages/WorkItemDetail";
import OKRView from "./pages/OKRView";
import CustomerPortal from "./pages/CustomerPortal";
import ReleasesView from "./pages/ReleasesView";
import NotificationInbox from "./pages/NotificationInbox";
import MilestonesView from "./pages/MilestonesView";
import AutomationRulesView from "./pages/AutomationRulesView";
import CustomFieldsView from "./pages/CustomFieldsView";
import NotificationPreferencesView from "./pages/NotificationPreferencesView";
import WebhookConfigView from "./pages/WebhookConfigView";
import FieldVisibilityView from "./pages/FieldVisibilityView";
import ApprovalWorkflowsView from "./pages/ApprovalWorkflowsView";
import CannedResponsesView from "./pages/CannedResponsesView";
import ProjectTemplatesView from "./pages/ProjectTemplatesView";
import GitHubIntegrationView from "./pages/GitHubIntegrationView";
import PriorityRulesView from "./pages/PriorityRulesView";
import RecurringTaskConfigsView from "./pages/RecurringTaskConfigsView";
import BugTriageView from "./pages/BugTriageView";
import CalendarView from "./pages/CalendarView";
import TimelineView from "./pages/TimelineView";
import RoadmapView from "./pages/RoadmapView";
import DashboardMyWork from "./pages/DashboardMyWork";
import ResourceManagementView from "./pages/ResourceManagementView";
import PortfolioView from "./pages/PortfolioView";
import WorkItemTemplatesView from "./pages/WorkItemTemplatesView";
import AnalyticsView from "./pages/AnalyticsView";

const WorkManagementRoutes = () => {
  return (
    <WorkManagementProvider>
      <Routes>
        <Route path="/" element={<WorkspaceList />} />
        <Route path="/:workspaceId" element={<WorkspaceDetail />} />

        {/* Project-level routes — use Outlet-based layout */}
        <Route path="/:workspaceId/:projectId" element={<ProjectLayout />}>
          <Route index element={<ProjectDashboard />} />
          <Route path="board" element={<BoardView />} />
          <Route path="item/:itemId" element={<WorkItemDetail />} />
          <Route path="sprints" element={<SprintPlanning />} />
          <Route path="backlog" element={<BacklogView />} />
          <Route path="releases" element={<ReleasesView />} />
          <Route path="okrs" element={<OKRView />} />
          <Route path="pipeline" element={<PipelineView />} />
          <Route path="sales-dashboard" element={<SalesDashboard />} />
          <Route path="tickets" element={<TicketQueue />} />
          <Route path="portal" element={<CustomerPortal />} />
          <Route path="notifications" element={<NotificationInbox />} />
          <Route path="executive" element={<ExecutiveDashboard />} />
          <Route path="milestones" element={<MilestonesView />} />
          <Route path="automation-rules" element={<AutomationRulesView />} />
          <Route path="custom-fields" element={<CustomFieldsView />} />
          <Route path="notification-preferences" element={<NotificationPreferencesView />} />
          <Route path="webhooks" element={<WebhookConfigView />} />
          <Route path="field-visibility" element={<FieldVisibilityView />} />
          <Route path="approval-workflows" element={<ApprovalWorkflowsView />} />
          <Route path="canned-responses" element={<CannedResponsesView />} />
          <Route path="github-integration" element={<GitHubIntegrationView />} />
          <Route path="priority-rules" element={<PriorityRulesView />} />
          <Route path="recurring-task-configs" element={<RecurringTaskConfigsView />} />
          <Route path="bug-triage" element={<BugTriageView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="timeline" element={<TimelineView />} />
          <Route path="roadmap" element={<RoadmapView />} />
          <Route path="my-work" element={<DashboardMyWork />} />
          <Route path="resources" element={<ResourceManagementView />} />
          <Route path="item-templates" element={<WorkItemTemplatesView />} />
          <Route path="analytics" element={<AnalyticsView />} />
        </Route>

        {/* Cross-project routes (no project context) */}
        <Route path="/:workspaceId/roadmap" element={<RoadmapView />} />
        <Route path="/:workspaceId/portfolio" element={<PortfolioView />} />
        <Route path="/:workspaceId/resources" element={<ResourceManagementView />} />
        <Route path="/:workspaceId/sales-dashboard" element={<SalesDashboard />} />
        <Route path="/:workspaceId/executive" element={<ExecutiveDashboard />} />
        <Route path="/:workspaceId/project-templates" element={<ProjectTemplatesView />} />
        <Route path="/:workspaceId/my-work" element={<DashboardMyWork />} />
        <Route path="/:workspaceId/notifications" element={<NotificationInbox />} />
        <Route path="/notifications" element={<NotificationInbox />} />
        <Route path="/my-work" element={<DashboardMyWork />} />
      </Routes>
    </WorkManagementProvider>
  );
};

export default WorkManagementRoutes;
