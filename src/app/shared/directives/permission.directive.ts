import { Directive, Input, TemplateRef, ViewContainerRef, inject, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Structural Directive to check user permissions
 * Usage: *appHasPermission="'admin'" 
 * Or: *appHasPermission="['admin', 'moderator']"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private hasView = false;

  @Input() set appHasPermission(permissions: string | string[]) {
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const userRole = this.authService.selectedRole() as string;
    
    const hasPermission = userRole ? requiredPermissions.includes(userRole) : false;

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Attribute Directive for tooltips
 * Usage: <button appTooltip="Click to save">Save</button>
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    '[title]': 'tooltipText',
    '[class.has-tooltip]': 'true'
  }
})
export class TooltipDirective {
  @Input('appTooltip') tooltipText = '';
}

/**
 * Attribute Directive to highlight elements on hover
 * Usage: <div appHighlight="#ffeb3b">Hover me</div>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = '#ffeb3b';
  @Input() appHighlightColor = 'black';

  private el = inject(ElementRef);

  @HostListener('mouseenter')
  onMouseEnter() {
    this.highlight(this.appHighlight, this.appHighlightColor);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.highlight('', '');
  }

  private highlight(backgroundColor: string, color: string) {
    this.el.nativeElement.style.backgroundColor = backgroundColor;
    this.el.nativeElement.style.color = color;
    this.el.nativeElement.style.transition = 'all 0.3s ease';
  }
}
