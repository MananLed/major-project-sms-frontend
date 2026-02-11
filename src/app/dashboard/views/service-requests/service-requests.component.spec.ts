import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError, of } from 'rxjs';

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

  apiServiceSpy = jasmine.createSpyObj('ApisService', [
    'getAllRequestsOfResident',
    'searchRequests',
    'deleteRequest',
  ]);

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApisService', [
      'getAllRequestsOfResident',
    ]);

    await TestBed.configureTestingModule({
      imports: [ServiceRequestsComponent],
      providers: [
        {
          provide: ApisService,
          useValue: apiServiceSpy,
        },
        {
          provide: AuthService,
          useValue: {
            getRole: () => 'resident',
            isAdmin: () => false,
            isOfficer: () => false,
            isResident: () => true,
          },
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
                    Completed: [],
                  },
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestsComponent);
    component = fixture.componentInstance;

    componentMessageService = fixture.debugElement.injector.get(MessageService);

    fixture.detectChanges();
  });

  it('should fetch resident requests when no filters are selected', () => {
    spyOn(component, 'fetchRequestsOfResident');

    component.selectedService = '';
    component.selectedStatus = '';

    component.searchRequests();

    expect(component.fetchRequestsOfResident).toHaveBeenCalled();
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

  it('should open add request dialog', () => {
    component.showAddRequestDialog();
    expect(component.displayAddRequestDialog).toBeTrue();
  });

  it('should reset fields when add request dialog is closed', () => {
    component.selectedServiceType = 'Electrician';
    component.selectedTimeSlot = '10AM';
    component.selectedTimeSlotIndex = 1;

    component.hideAddRequestDialog();

    expect(component.displayAddRequestDialog).toBeFalse();
    expect(component.selectedServiceType).toBeNull();
    expect(component.selectedTimeSlot).toBeNull();
    expect(component.selectedTimeSlotIndex).toBeNull();
  });

  it('should show approve request dialog with request ID', () => {
    component.showApproveRequestDialog(123);

    expect(component.displayApproveRequestDialog).toBeTrue();
    expect(component.requestID).toBe(123);
  });

  it('should reset approve form on dialog close', () => {
    component.assignedTo = 'Officer A';

    component.hideApproveRequestDialog();

    expect(component.displayApproveRequestDialog).toBeFalse();
    expect(component.assignedTo).toBe('');
  });

  it('should return true for today pending request', () => {
    const today = new Date();
    const data = {
      status: 'pending',
      date: `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`,
    };

    expect(component.isTodayAndPending(data)).toBeTrue();
  });

  it('should return false for non-today pending request', () => {
    const data = {
      status: 'pending',
      date: '01-01-2000',
    };

    expect(component.isTodayAndPending(data)).toBeFalse();
  });

  it('should return true if status is not pending', () => {
    const data = {
      status: 'approved',
      date: '01-01-2000',
    };

    expect(component.isTodayAndPending(data)).toBeTrue();
  });

  it('should fetch resident requests successfully', () => {
    apiServiceSpy.getAllRequestsOfResident.and.returnValue({
      subscribe: ({ next }: any) =>
        next({
          data: {
            Pending: [{ id: 1 }],
            Approved: [],
            Completed: [],
          },
        }),
    } as any);

    component.fetchRequestsOfResident();

    expect(component.pendingRequestCount).toBe(1);
    expect(component.totalRequestCount).toBe(1);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show success toast', () => {
    spyOn(componentMessageService, 'add');

    component.showSuccess('Done');

    expect(componentMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Done',
    });
  });

  it('should show error toast', () => {
    spyOn(componentMessageService, 'add');

    component.showError('Failed');

    expect(componentMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed',
    });
  });

  it('should show error toast when fetching resident requests fails', () => {
    const errorResponse = {
      error: {
        message: 'Failed to fetch requests',
        errorcode: 'REQ_001',
      },
    };

    spyOn(componentMessageService, 'add');

    apiServiceSpy.getAllRequestsOfResident.and.returnValue(
      throwError(() => errorResponse),
    );

    component.fetchRequestsOfResident();

    expect(componentMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch requests',
      }),
    );
  });
});
