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
      'getAllRequests',
      'getAllRequestsOfResident',
      'searchRequests',
      'deleteRequest',
      'putRequest',
      'rescheduleRequest',
      'approveRequest',
      'completeRequest',
      'postFeedbackOnRequest',
      'getAvailableTimeSlots'
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

  it('should filter statuses based on query', () => {
    const event = { query: 'pen' } as any; // Matches "Pending"
    component.filterStatus(event);
    
    expect(component.filteredStatus.length).toBeGreaterThan(0);
    expect(component.filteredStatus[0].label).toBe('Pending');
  });

  it('should filter services based on query', () => {
    const event = { query: 'elec' } as any; // Matches "Electrician"
    component.filterService(event);

    expect(component.filteredService.length).toBeGreaterThan(0);
    expect(component.filteredService[0].label).toBe('Electrician');
  });

  it('should fetch all requests (Admin view) successfully', () => {
    const mockData = {
      data: { Pending: [1], Approved: [2], Completed: [3] }
    };
    apiServiceSpy.getAllRequests.and.returnValue(of(mockData));

    component.fetchAllRequests();

    expect(apiServiceSpy.getAllRequests).toHaveBeenCalled();
    expect(component.totalRequestCount).toBe(3);
    expect(component.pendingRequestData.length).toBe(1);
  });

  it('should handle error when fetching all requests', () => {
    apiServiceSpy.getAllRequests.and.returnValue(throwError(() => ({ error: { message: 'Fetch failed' } })));
    spyOn(componentMessageService, 'add');

    component.fetchAllRequests();

    expect(componentMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should approve request successfully when form is valid', () => {
    const mockForm = { valid: true, reset: jasmine.createSpy('reset') } as any;
    component.requestID = 123;
    component.assignedTo = 'Technician A';
    
    // Fix: Provide full structure for the refresh call
    const mockRefreshData = { 
      data: { Pending: [], Approved: [], Completed: [] } 
    };

    apiServiceSpy.approveRequest.and.returnValue(of({ message: 'Approved' }));
    apiServiceSpy.getAllRequests.and.returnValue(of(mockRefreshData)); 

    component.approveRequest(mockForm);

    expect(apiServiceSpy.approveRequest).toHaveBeenCalledWith(123, { assignedto: 'Technician A' });
    expect(component.displayApproveRequestDialog).toBeFalse();
  });

  it('should not approve request if form is invalid', () => {
    const mockForm = { valid: false } as any;
    component.approveRequest(mockForm);
    expect(apiServiceSpy.approveRequest).not.toHaveBeenCalled();
  });

  it('should fetch available time slots successfully', () => {
    const mockSlots = { data: [{ Label: '10:00 AM' }] };
    apiServiceSpy.getAvailableTimeSlots.and.returnValue(of(mockSlots));

    component.fetchAvailableTimeSlots('Electrician');

    expect(apiServiceSpy.getAvailableTimeSlots).toHaveBeenCalledWith('electrician');
    expect(component.fetchedTimeSlots).toEqual(mockSlots);
    expect(component.filteredTimeSlots.length).toBe(1);
  });

  it('should set time slot index on selection', () => {
    component.fetchedTimeSlots = { data: [{ Label: '09:00' }, { Label: '10:00' }] };
    const event = { value: { label: '10:00' } };

    component.onTimeSlotSelect(event);

    expect(component.selectedTimeSlotIndex).toBe(1);
  });

  it('should submit add request successfully', () => {
    component.selectedServiceType = 'Plumber';
    component.selectedTimeSlotIndex = 0;
    
    // Fix: Provide full structure instead of { data: {} }
    const mockRefreshData = { 
      data: { Pending: [], Approved: [], Completed: [] } 
    };

    apiServiceSpy.putRequest.and.returnValue(of({ message: 'Added' }));
    apiServiceSpy.getAllRequestsOfResident.and.returnValue(of(mockRefreshData));

    component.submitAddRequest();

    expect(apiServiceSpy.putRequest).toHaveBeenCalledWith({ servicetype: 'plumber', slotid: 1 });
    expect(component.displayAddRequestDialog).toBeFalse();
  });

  it('should not submit add request if inputs are invalid', () => {
    component.selectedServiceType = null;
    component.submitAddRequest();
    expect(apiServiceSpy.putRequest).not.toHaveBeenCalled();
  });

  it('should open reschedule dialog with correct data', () => {
    component.showRescheduleRequestDialog('Plumber', 55);
    expect(component.displayRescheduleRequestDialog).toBeTrue();
    expect(component.selectedReServiceType).toBe('Plumber');
    expect(component.selectedReServiceID).toBe(55);
  });

  it('should submit reschedule request successfully', () => {
    component.selectedReServiceID = 10;
    component.selectedTimeSlotIndex = 2;

    const mockRefreshData = { 
      data: { Pending: [], Approved: [], Completed: [] } 
    };

    apiServiceSpy.rescheduleRequest.and.returnValue(of({ message: 'Rescheduled' }));
    apiServiceSpy.getAllRequestsOfResident.and.returnValue(of(mockRefreshData));

    component.submitRescheduleRequest();

    expect(apiServiceSpy.rescheduleRequest).toHaveBeenCalledWith(10, { slotid: 3 });
    expect(component.displayRescheduleRequestDialog).toBeFalse();
  });

  it('should not submit reschedule if data is missing', () => {
    component.selectedReServiceID = null;
    component.submitRescheduleRequest();
    expect(apiServiceSpy.rescheduleRequest).not.toHaveBeenCalled();
  });

  it('should search requests using specific service and status filters', () => {
    component.selectedService = 'Plumber';
    component.selectedStatus = 'Pending';
    
    apiServiceSpy.searchRequests.and.returnValue(of({ data: [{ id: 1 }] }));

    component.searchRequests();

    expect(apiServiceSpy.searchRequests).toHaveBeenCalledWith('plumber', 'pending');
    expect(component.allRequestData.length).toBe(1);
  });

  it('should handle empty results when searching', () => {
    component.selectedService = 'Plumber';
    component.selectedStatus = 'Pending';
    
    // API returns null data
    apiServiceSpy.searchRequests.and.returnValue(of({ data: null }));

    component.searchRequests();

    expect(component.allRequestData).toEqual([]);
  });

  it('should mark request as complete', () => {
    // Fix: Provide full structure for the refresh call
    const mockRefreshData = { 
      data: { Pending: [], Approved: [], Completed: [] } 
    };

    apiServiceSpy.completeRequest.and.returnValue(of({ message: 'Completed' }));
    apiServiceSpy.getAllRequests.and.returnValue(of(mockRefreshData));

    component.markRequestComplete(100);

    expect(apiServiceSpy.completeRequest).toHaveBeenCalledWith(100);
  });

  it('should delete request successfully', () => {
    const mockRefreshData = { 
      data: { Pending: [], Approved: [], Completed: [] } 
    };

    apiServiceSpy.deleteRequest.and.returnValue(of({ message: 'Deleted' }));
    apiServiceSpy.getAllRequestsOfResident.and.returnValue(of(mockRefreshData));

    component.deleteRequest(100);

    expect(apiServiceSpy.deleteRequest).toHaveBeenCalledWith(100);
  });

  it('should manage feedback dialog', () => {
    component.showIssueFeedbackDialog(50);
    expect(component.displayIssueFeedbackDialog).toBeTrue();
    expect(component.requestID).toBe(50);

    // Mock form for reset
    component.feedbackForm = { reset: jasmine.createSpy('reset') } as any;
    component.hideIssueFeedbackDialog();
    
    expect(component.displayIssueFeedbackDialog).toBeFalse();
    expect(component.feedbackForm?.reset).toHaveBeenCalled();
  });

  it('should issue feedback successfully', () => {
    component.requestID = 50;
    component.rating = 5;
    component.content = 'Good job';

    const mockRefreshData = { 
      data: { Pending: [], Approved: [], Completed: [] } 
    };

    apiServiceSpy.postFeedbackOnRequest.and.returnValue(of({ message: 'Feedback Posted' }));
    apiServiceSpy.getAllRequestsOfResident.and.returnValue(of(mockRefreshData));

    component.issueFeedback({} as any);

    expect(apiServiceSpy.postFeedbackOnRequest).toHaveBeenCalledWith({ rating: 5, content: 'Good job', requestid: '50' });
    expect(component.displayIssueFeedbackDialog).toBeFalse();
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
