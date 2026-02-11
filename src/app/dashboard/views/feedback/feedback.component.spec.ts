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
