import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { ServiceRequestsComponent } from './service-requests.component';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../service/auth.service';
import { ApisService } from '../../../service/apis.service';

describe('ServiceRequestsComponent', () => {
  let component: ServiceRequestsComponent;
  let fixture: ComponentFixture<ServiceRequestsComponent>;

  let apiServiceSpy: jasmine.SpyObj<ApisService>;
  let componentMessageService: MessageService;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApisService', [
      'getAllRequestsOfResident'
    ]);

    await TestBed.configureTestingModule({
      imports: [ServiceRequestsComponent],
      providers: [
        {
          provide: ApisService,
          useValue: apiServiceSpy
        },
        {
          provide: AuthService,
          useValue: {
            getRole: () => 'resident',
            isAdmin: () => false,
            isOfficer: () => false,
            isResident: () => true
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                requestData: {
                  data: {
                    Pending: [],
                    Approved: [],
                    Completed: []
                  }
                }
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestsComponent);
    component = fixture.componentInstance;

    // 🔥 THIS is the important line
    componentMessageService =
      fixture.debugElement.injector.get(MessageService);

    fixture.detectChanges();
  });

  it('should initialize request counts from route resolver data', () => {
    expect(component.pendingRequestCount).toBe(0);
    expect(component.approvedRequestCount).toBe(0);
    expect(component.completedRequestCount).toBe(0);
    expect(component.totalRequestCount).toBe(0);
  });

  it('should set user role flags correctly', () => {
    expect(component.isResident).toBeTrue();
    expect(component.isAdmin).toBeFalse();
    expect(component.isOfficer).toBeFalse();
  });

  it('should fetch resident requests successfully', () => {
    apiServiceSpy.getAllRequestsOfResident.and.returnValue({
      subscribe: ({ next }: any) =>
        next({
          data: {
            Pending: [{ id: 1 }],
            Approved: [],
            Completed: []
          }
        })
    } as any);

    component.fetchRequestsOfResident();

    expect(component.pendingRequestCount).toBe(1);
    expect(component.totalRequestCount).toBe(1);
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error toast when fetching resident requests fails', () => {
    const errorResponse = {
      error: {
        message: 'Failed to fetch requests',
        errorcode: 'REQ_001'
      }
    };

    spyOn(componentMessageService, 'add');

    apiServiceSpy.getAllRequestsOfResident.and.returnValue(
      throwError(() => errorResponse)
    );

    component.fetchRequestsOfResident();

    expect(componentMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch requests'
      })
    );
  });
});
