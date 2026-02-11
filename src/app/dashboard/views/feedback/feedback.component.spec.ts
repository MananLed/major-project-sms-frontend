import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedbackComponent } from './feedback.component';
import { AuthService } from '../../../service/auth.service';
import { ApisService } from '../../../service/apis.service';
import { FeedbackSuccessResponse } from '../../../interface/feedback.model';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiService: jasmine.SpyObj<ApisService>;

  const mockFeedbackResponse: FeedbackSuccessResponse = {
    status: 'Success',
    data: [
      {
        id: 1,
        content: 'Great service',
        rating: 5
      }
    ]
  } as any;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getRole',
      'isAdmin',
      'isOfficer',
      'isResident'
    ]);

    apiService = jasmine.createSpyObj<ApisService>('ApisService', [
      'getFeedbacks'
    ]);

    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [FeedbackComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                userFeedback: mockFeedbackResponse
              }
            }
          }
        },
        { provide: AuthService, useValue: authService },
        { provide: ApisService, useValue: apiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;

    spyOn((component as any).messageService, 'add');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load feedback from route resolver on init', () => {
    expect(component.userFeedback).toEqual(mockFeedbackResponse);
  });

  it('should set flags correctly for OFFICER role', () => {
    // Arrange
    authService.getRole.and.returnValue('OFFICER');
    authService.isAdmin.and.returnValue(false);
    authService.isOfficer.and.returnValue(true);
    authService.isResident.and.returnValue(false);

    // Act
    component.ngOnInit();

    // Assert
    expect(component.userRole).toBe('OFFICER');
    expect(component.isAdmin).toBeFalse();
    expect(component.isOfficer).toBeTrue();
    expect(component.isResident).toBeFalse();
  });

  it('should set flags correctly for RESIDENT role', () => {
    // Arrange
    authService.getRole.and.returnValue('RESIDENT');
    authService.isAdmin.and.returnValue(false);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(true);

    // Act
    component.ngOnInit();

    // Assert
    expect(component.userRole).toBe('RESIDENT');
    expect(component.isAdmin).toBeFalse();
    expect(component.isOfficer).toBeFalse();
    expect(component.isResident).toBeTrue();
  });

  it('should use default error message when API error is empty', () => {
    // Arrange
    const emptyError = { status: 500, error: null }; // No message property
    apiService.getFeedbacks.and.returnValue(throwError(() => emptyError));

    // Act
    component.fetchFeedbacks();

    // Assert
    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        detail: 'An unexpected error occurred' // The fallback string
      })
    );
  });

  it('should call messageService with success severity when showSuccess is triggered', () => {
    // Act
    component.showSuccess('Operation successful');

    // Assert
    expect((component as any).messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation successful'
    });
  });

  it('should call messageService with error severity when showError is triggered', () => {
    // Act
    component.showError('Something went wrong');

    // Assert
    expect((component as any).messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Something went wrong'
    });
  });

  it('should have constants defined', () => {
    expect(component.constants).toBeDefined();
  });

  it('should initialize isFetching signal to false', () => {
    expect(component.isFetching()).toBeFalse();
  });

  it('should set user role flags correctly', () => {
    expect(component.userRole).toBe('ADMIN');
    expect(component.isAdmin).toBeTrue();
    expect(component.isOfficer).toBeFalse();
    expect(component.isResident).toBeFalse();
  });

  it('should fetch feedbacks successfully', () => {
    apiService.getFeedbacks.and.returnValue(of(mockFeedbackResponse));

    component.fetchFeedbacks();

    expect(apiService.getFeedbacks).toHaveBeenCalled();
    expect(component.userFeedback).toEqual(mockFeedbackResponse);
  });

  it('should show error toast when fetching feedbacks fails', () => {
    const errorResponse = {
      error: {
        message: 'Failed to fetch feedbacks',
        errorcode: 'FB_001'
      }
    };

    apiService.getFeedbacks.and.returnValue(
      throwError(() => errorResponse)
    );

    component.fetchFeedbacks();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch feedbacks'
      })
    );
  });
});
