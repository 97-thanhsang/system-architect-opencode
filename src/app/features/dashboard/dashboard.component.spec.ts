import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';
import { of } from 'rxjs';

// Mock AuthService
class MockAuthService {
  user = () => ({ displayName: 'Test User', email: 'test@example.com' });
  selectedRole = () => null;
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

  it('should display user name', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test User');
  });

  it('should have 4 roles defined', () => {
    expect(component.roles.length).toBe(4);
    expect(component.roles.some(r => r.id === 'FE')).toBe(true);
    expect(component.roles.some(r => r.id === 'BE')).toBe(true);
    expect(component.roles.some(r => r.id === 'QC')).toBe(true);
    expect(component.roles.some(r => r.id === 'BA')).toBe(true);
  });

  it('should call selectRole when role is selected', () => {
    component.selectRole('FE');
    expect(authService.selectRole).toHaveBeenCalledWith('FE');
  });

  it('should call logout when logout button clicked', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
