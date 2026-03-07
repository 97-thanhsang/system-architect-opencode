/**
 * Dashboard Feature Module
 * 
 * Fully refactored to use Google Design System with:
 * - CSS custom properties (--g-*)
 * - Utility classes (.g-page, .g-card, .g-btn, .g-grid)
 * - Material Icons Outlined (instead of mat-icon)
 * - OnPush change detection
 * - Standalone component pattern
 * 
 * @module Dashboard
 */

// Professional Dashboard (New)
export { ProfessionalDashboardComponent } from './professional-dashboard.component';

// Components
export { ProfessionalSidebarComponent } from './components/professional-sidebar.component';
export { ProfessionalHeaderComponent } from './components/professional-header.component';
export { StatsCardComponent } from './components/stats-card.component';
export { ActivityFeedComponent } from './components/activity-feed.component';
export { QuickActionsComponent } from './components/quick-actions.component';

// Legacy Dashboard (v2.0 - refactored)
export { DashboardComponent } from './dashboard.component';
