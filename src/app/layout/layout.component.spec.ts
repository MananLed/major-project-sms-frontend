import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getRole',
      'isAdmin',
      'isOfficer',
      'isResident',
      'logoutUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        RouterTestingModule // ✅ PROVIDES ActivatedRoute + Router
      ],
      providers: [
        provideNoopAnimations(), // ✅ FIXES PrimeNG animation error
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(false);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should initialize admin menu items when user is admin', () => {
    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(false);

    fixture.detectChanges();

    expect(component.isAdmin).toBeTrue();
    expect(component.items.length).toBe(7);
    expect(component.items.map(i => i.label)).toContain('User Management');
  });

  it('should initialize non-admin menu items when user is not admin', () => {
    authService.getRole.and.returnValue('RESIDENT');
    authService.isAdmin.and.returnValue(false);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(true);

    fixture.detectChanges();

    expect(component.isAdmin).toBeFalse();
    expect(component.items.length).toBe(6);
    expect(component.items.map(i => i.label)).not.toContain('User Management');
  });

  it('should call logout and navigate to login', () => {
    spyOn(router, 'navigate');

    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(false);

    fixture.detectChanges();

    component.logout();

    expect(authService.logoutUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
