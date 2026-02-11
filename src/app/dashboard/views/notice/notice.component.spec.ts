import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { NoticeComponent } from './notice.component';
import { ApisService } from '../../../service/apis.service';
import { AuthService } from '../../../service/auth.service';
import { NoticeSuccessResponse } from '../../../interface/notice.model';

describe('NoticeComponent', () => {
  let component: NoticeComponent;
  let fixture: ComponentFixture<NoticeComponent>;
  let apiService: jasmine.SpyObj<ApisService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockNoticeResponse: NoticeSuccessResponse = {
    status: 'Success',
    message: 'Fetched',
    data: [
      { year: '2024', month: 'January', content: 'Notice 1' },
      { year: '2023', month: 'December', content: 'Notice 2' }
    ]
  } as any;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApisService>('ApisService', [
      'getNotices',
      'putNotice',
      'searchNotice'
    ]);

    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getRole',
      'isAdmin',
      'isOfficer',
      'isResident'
    ]);

    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [NoticeComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                societyNotices: mockNoticeResponse
              }
            }
          }
        },
        { provide: ApisService, useValue: apiService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;

    spyOn((component as any).messageService, 'add');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize notices from resolver data', () => {
    expect(component.societyNotices).toEqual(mockNoticeResponse);
    expect(component.years.length).toBe(2);
    expect(component.months.length).toBe(2);
  });

  it('should manage dialog visibility', () => {
    component.showDialog();
    expect(component.visible).toBeTrue();

    component.hideDialog();
    expect(component.visible).toBeFalse();
  });

  it('should filter years based on query', () => {
    // Setup initial data
    component.years = ['2023', '2024'];
    
    // Simulate typing "2024"
    const event = { query: '2024' } as any; 
    component.filterYears(event);

    // Verify transformation
    expect(component.filteredYears.length).toBeGreaterThan(0);
    expect(component.filteredYears[0].label).toBeDefined();
    expect(component.filteredYears[0].value).toBeDefined();
  });

  it('should filter months based on query', () => {
    component.months = ['January', 'February'];
    
    const event = { query: 'Jan' } as any;
    component.filterMonths(event);

    expect(component.filteredMonths.length).toBeGreaterThan(0);
    expect(component.filteredMonths[0].value).toContain('Jan');
  });

  it('should search by Year only when Month is not selected', () => {
    // Arrange
    component.selectedYear = '2024';
    component.selectedMonth = '';
    
    apiService.searchNotice.and.returnValue(of(mockNoticeResponse));

    // Act
    component.searchNotice();

    // Assert
    expect(apiService.searchNotice).toHaveBeenCalledWith(null, '2024');
    expect(component.societyNotices).toEqual(mockNoticeResponse);
    expect(component.isFetching()).toBeFalse();
    // Verify reset logic
    expect(component.selectedYear).toBe('');
  });

  it('should search by Year and Month when both are selected', () => {
    // Arrange
    component.selectedYear = '2024';
    component.selectedMonth = 'January';
    
    apiService.searchNotice.and.returnValue(of(mockNoticeResponse));

    // Act
    component.searchNotice();

    // Assert
    expect(apiService.searchNotice).toHaveBeenCalledWith('January', '2024');
    expect(component.societyNotices).toEqual(mockNoticeResponse);
    expect(component.isFetching()).toBeFalse();
  });

  it('should handle error during search', () => {
    // Arrange
    component.selectedYear = '2024';
    component.selectedMonth = 'January';
    
    const errorRes = { error: { message: 'Search failed' } };
    apiService.searchNotice.and.returnValue(throwError(() => errorRes));

    // Act
    component.searchNotice();

    // Assert
    expect((component as any).messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error', detail: 'Search failed' })
    );
    expect(component.isFetching()).toBeFalse();
    expect(component.selectedYear).toBe('');
  });

  it('should use default error message when API error object is empty', () => {
    // Arrange
    const emptyError = { status: 500, error: null }; 
    apiService.getNotices.and.returnValue(throwError(() => emptyError));

    // Act
    component.fetchNotices();

    // Assert
    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        detail: 'An unexpected error occurred'
      })
    );
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
    expect(component.isResident).toBeTrue();
  });

  it('should set user role flags correctly', () => {
    expect(component.userRole).toBe('ADMIN');
    expect(component.isAdmin).toBeTrue();
    expect(component.isOfficer).toBeFalse();
    expect(component.isResident).toBeFalse();
  });

  it('should fetch notices successfully', () => {
    apiService.getNotices.and.returnValue(of(mockNoticeResponse));

    component.fetchNotices();

    expect(apiService.getNotices).toHaveBeenCalled();
    expect(component.societyNotices).toEqual(mockNoticeResponse);
  });

  it('should show error toast when fetching notices fails', () => {
    const errorResponse = {
      error: {
        message: 'Failed to fetch notices',
        errorcode: 'NOTICE_001'
      }
    };

    apiService.getNotices.and.returnValue(
      throwError(() => errorResponse)
    );

    component.fetchNotices();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch notices'
      })
    );
  });

  it('should fetch all notices when no search filters are applied', () => {
    apiService.getNotices.and.returnValue(of(mockNoticeResponse));

    component.selectedMonth = '';
    component.selectedYear = '';

    component.searchNotice();

    expect(apiService.getNotices).toHaveBeenCalled();
  });

  it('should not issue notice if content is empty', () => {
    component.content = '';

    component.issueNotice();

    expect(apiService.putNotice).not.toHaveBeenCalled();
    expect(component.isFetching()).toBeFalse();
  });

  it('should issue notice successfully', () => {
    component.content = 'New Notice';

    apiService.putNotice.and.returnValue(
      of({ status: 'Success', message: 'Notice added', data: [] } as any)
    );
    apiService.getNotices.and.returnValue(of(mockNoticeResponse));

    component.issueNotice();

    expect(apiService.putNotice).toHaveBeenCalledWith({
      content: 'New Notice'
    });

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Success',
        detail: 'Notice issued successfully.'
      })
    );

    expect(component.visible).toBeFalse();
    expect(component.content).toBe('');
  });

  it('should show error toast when issuing notice fails', () => {
    component.content = 'New Notice';

    const errorResponse = {
      error: {
        message: 'Failed to issue notice',
        errorcode: 'NOTICE_002'
      }
    };

    apiService.putNotice.and.returnValue(
      throwError(() => errorResponse)
    );

    component.issueNotice();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to issue notice'
      })
    );

    expect(component.isFetching()).toBeFalse();
  });
});
