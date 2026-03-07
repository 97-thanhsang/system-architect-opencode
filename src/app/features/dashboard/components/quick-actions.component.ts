import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  shortcut?: string;
}

/**
 * Quick Actions Component
 * 
 * Displays a grid of quick action buttons with icons and descriptions.
 * Features hover animations and keyboard shortcuts.
 * 
 * @example
 * <app-quick-actions
 *   [actions]="quickActions"
 *   (actionClick)="handleQuickAction($event)" />
 */
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="quick-actions">
      <h3 class="quick-actions__title">Truy cập nhanh</h3>
      
      <div class="quick-actions__grid">
        @for (action of actions(); track action.id) {
          <button class="quick-action" [class]="'quick-action--' + action.color" (click)="actionClick.emit(action.id)">
            <div class="quick-action__icon">
              <span class="material-icons-outlined">{{ action.icon }}</span>
            </div>
            <div class="quick-action__content">
              <span class="quick-action__label">{{ action.label }}</span>
              <span class="quick-action__desc">{{ action.description }}</span>
            </div>
            @if (action.shortcut) {
              <kbd class="quick-action__shortcut">{{ action.shortcut }}</kbd>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .quick-actions {
      background: var(--g-surface, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--g-border, #e0e0e0);
      padding: 20px;
    }

    .quick-actions__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 16px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
      margin-bottom: 16px;
    }

    .quick-actions__grid {
      display: grid;
      gap: 12px;
    }

    .quick-action {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      padding: 16px;
      background: var(--g-bg, #f8f9fa);
      border: 1px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-surface, #ffffff);
        border-color: var(--g-border, #e0e0e0);
        transform: translateX(4px);
      }

      /* Color variants */
      &--blue { --action-color: var(--g-blue, #1a73e8); --action-bg: var(--g-blue-light, #e8f0fe); }
      &--green { --action-color: var(--g-green, #34a853); --action-bg: var(--g-green-light, #e6f4ea); }
      &--yellow { --action-color: #f9ab00; --action-bg: var(--g-yellow-light, #fef7e0); }
      &--red { --action-color: var(--g-red, #ea4335); --action-bg: var(--g-red-light, #fce8e6); }
      &--purple { --action-color: var(--g-purple, #9334e6); --action-bg: var(--g-purple-light, #f3e8fd); }
    }

    .quick-action__icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--action-bg);
      border-radius: 12px;
      flex-shrink: 0;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      .quick-action:hover & {
        transform: scale(1.05);
      }

      .material-icons-outlined {
        font-size: 22px;
        color: var(--action-color);
      }
    }

    .quick-action__content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .quick-action__label {
      font-size: 14px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
    }

    .quick-action__desc {
      font-size: 12px;
      color: var(--g-text-tertiary, #80868b);
    }

    .quick-action__shortcut {
      padding: 2px 8px;
      background: var(--g-bg-dark, #f1f3f4);
      border-radius: 4px;
      font-size: 11px;
      font-family: 'Roboto Mono', monospace;
      color: var(--g-text-tertiary, #80868b);
    }
  `]
})
export class QuickActionsComponent {
  actions = input<QuickAction[]>([]);
  actionClick = output<string>();
}
