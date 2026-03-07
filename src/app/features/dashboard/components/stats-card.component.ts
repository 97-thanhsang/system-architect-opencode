import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatData {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
}

/**
 * Stats Card Component
 * 
 * Displays statistics with optional trend indicators.
 * Features hover effects and color-coded variants.
 * 
 * @example
 * <app-stats-card [data]="{
 *   label: 'Tasks Completed',
 *   value: 42,
 *   icon: 'check_circle',
 *   color: 'green',
 *   trend: { value: '+12%', direction: 'up', label: 'vs last week' }
 * }" />
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat-card" [class]="'stat-card--' + data().color">
      <!-- Icon -->
      <div class="stat-card__icon">
        <span class="material-icons-outlined">{{ data().icon }}</span>
      </div>

      <!-- Content -->
      <div class="stat-card__content">
        <div class="stat-card__label">{{ data().label }}</div>
        <div class="stat-card__value">{{ data().value }}</div>
        
        <!-- Trend -->
        @if (data().trend) {
          <div class="stat-card__trend" [class]="'stat-card__trend--' + data().trend!.direction">
            <span class="material-icons-outlined">
              {{ data().trend!.direction === 'up' ? 'trending_up' : 
                 data().trend!.direction === 'down' ? 'trending_down' : 'trending_flat' }}
            </span>
            <span class="stat-card__trend-value">{{ data().trend!.value }}</span>
            @if (data().trend!.label) {
              <span class="stat-card__trend-label">{{ data().trend!.label }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      background: var(--g-surface, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--g-border, #e0e0e0);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--g-shadow-card-hover, 0 1px 3px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15));
        border-color: transparent;
      }

      /* Color variants */
      &--blue { --stat-color: var(--g-blue, #1a73e8); --stat-bg: var(--g-blue-light, #e8f0fe); }
      &--green { --stat-color: var(--g-green, #34a853); --stat-bg: var(--g-green-light, #e6f4ea); }
      &--red { --stat-color: var(--g-red, #ea4335); --stat-bg: var(--g-red-light, #fce8e6); }
      &--yellow { --stat-color: #f9ab00; --stat-bg: var(--g-yellow-light, #fef7e0); }
      &--purple { --stat-color: var(--g-purple, #9334e6); --stat-bg: var(--g-purple-light, #f3e8fd); }
    }

    .stat-card__icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--stat-bg);
      border-radius: 12px;
      flex-shrink: 0;

      .material-icons-outlined {
        font-size: 24px;
        color: var(--stat-color);
      }
    }

    .stat-card__content {
      flex: 1;
      min-width: 0;
    }

    .stat-card__label {
      font-size: 13px;
      font-weight: 500;
      color: var(--g-text-secondary, #5f6368);
      text-transform: uppercase;
      letter-spacing: 0.025em;
      margin-bottom: 8px;
    }

    .stat-card__value {
      font-family: 'Google Sans', sans-serif;
      font-size: 32px;
      font-weight: 400;
      color: var(--g-text-primary, #202124);
      line-height: 1.2;
      margin-bottom: 12px;
    }

    .stat-card__trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;

      .material-icons-outlined {
        font-size: 16px;
      }

      &--up {
        color: var(--g-green, #34a853);
      }

      &--down {
        color: var(--g-red, #ea4335);
      }

      &--neutral {
        color: var(--g-text-tertiary, #80868b);
      }
    }

    .stat-card__trend-value {
      font-weight: 600;
    }

    .stat-card__trend-label {
      color: var(--g-text-tertiary, #80868b);
      margin-left: 4px;
    }
  `]
})
export class StatsCardComponent {
  data = input.required<StatData>();
}
