import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../../service/auth.service';
import { CountResponse, DashboardData, RequestsResponse } from '../../../interface/dashboard.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockDashboardData: DashboardData = {
    residentCount: {
      status: 'Success',
      data:  10 ,
      message: "dlfj"
    },
    officerCount: {
      status: 'Success',
      data: 1,
      message: "sflj"
    },
    requestCount: {
      status: 'Success',
      message:"dsf",
      data: {
        Approved: null,
        Pending: null,
      },
    }
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'getRole',
      'isAdmin',
      'isOfficer',
      'isResident'
    ]);

    authService.isLoggedIn.and.returnValue(true);
    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                dashboardData: mockDashboardData
              }
            }
          }
        },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set dashboard counts from resolver data', () => {
    expect(component.residentCount).toEqual(mockDashboardData.residentCount as CountResponse);
    expect(component.officerCount).toEqual(mockDashboardData.officerCount as CountResponse);
    expect(component.requestCount).toEqual(mockDashboardData.requestCount as RequestsResponse);
  });

  it('should calculate pending and approved request counts correctly', () => {
    expect(component.pendingRequestCount).toBe(0);
    expect(component.approvedRequestCount).toBe(0);
  });

  it('should set user role and flags when user is logged in', () => {
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(component.userRole).toBe('ADMIN');
    expect(component.isAdmin).toBeTrue();
    expect(component.isOfficer).toBeFalse();
    expect(component.isResident).toBeFalse();
  });
});
