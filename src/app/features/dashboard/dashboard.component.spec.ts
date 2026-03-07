import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';
import { signal } from '@angular/core';

/**
 * Mock AuthService for testing
 * Uses Angular signals to match the actual service API
 */
class MockAuthService {
  user = signal<{ displayName: string; email: string } | null>({ 
    displayName: 'Test User', 
    email: 'test@example.com' 
  });
  selectedRole = signal<string | null>(null);
  selectRole = jasmine.createSpy('selectRole');
  logout = jasmine.createSpy('logout');
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have ChangeDetectionStrategy.OnPush', () => {
    // Verify the component uses OnPush change detection
    const annotation = Reflect.getOwnPropertyDescriptor(
      DashboardComponent, 
      'ɵcmp'
    )?.value;
    expect(annotation?.onPush).toBe(true);
  });

  it('should use standalone: true', () => {
    // Verify standalone component
    const annotation = Reflect.getOwnPropertyDescriptor(
      DashboardComponent, 
      'ɵcmp'
    )?.value;
    expect(annotation?.standalone).toBe(true);
  });

  it('should display user name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test User');
  });

  it('should have 4 roles defined', () => {
    expect(component.roles.length).toBe(4);
    expect(component.roles.some(r => r.id === 'FE')).toBe(true);
    expect(component.roles.some(r => r.id === 'BE')).toBe(true);
    expect(component.roles.some(r => r.id === 'QC')).toBe(true);
    expect(component.roles.some(r => r.id === 'BA')).toBe(true);
  });

  it('should have correct role structure', () => {
    const feRole = component.roles.find(r => r.id === 'FE');
    expect(feRole).toBeDefined();
    expect(feRole?.name).toBe('Frontend Developer');
    expect(feRole?.color).toBe('blue');
    expect(feRole?.icon).toBe('code');
  });

  it('should call selectRole when role is selected', () => {
    component.onSelectRole('FE');
    expect(authService.selectRole).toHaveBeenCalledWith('FE');
  });

  it('should call logout when logout button clicked', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should use material-icons-outlined for icons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = compiled.querySelectorAll('.material-icons-outlined');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should use g-page class for page layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pageElement = compiled.querySelector('.g-page');
    expect(pageElement).toBeTruthy();
  });

  it('should use g-card class for role cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.g-card');
    expect(cards.length).toBe(4);
  });

  it('should use g-btn class for buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.g-btn');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle error when selectRole fails', () => {
    authService.selectRole.and.throwError('Auth error');
    spyOn(console, 'error');
    
    component.onSelectRole('FE');
    
    expect(console.error).toHaveBeenCalledWith('Failed to select role:', jasmine.any(Error));
  });

  it('should handle error when logout fails', () => {
    authService.logout.and.throwError('Logout error');
    spyOn(console, 'error');
    
    component.logout();
    
    expect(console.error).toHaveBeenCalledWith('Failed to logout:', jasmine.any(Error));
  });

  describe('Role Selection UI', () => {
    it('should mark card as selected when role matches', () => {
      authService.selectedRole.set('FE');
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const selectedCard = compiled.querySelector('.role-card--selected');
      expect(selectedCard).toBeTruthy();
    });

    it('should have keyboard accessibility (tabindex and role)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('.role-card');
      
      cards.forEach(card => {
        expect(card.getAttribute('role')).toBe('button');
        expect(card.getAttribute('tabindex')).toBe('0');
      });
    });
  });
});
