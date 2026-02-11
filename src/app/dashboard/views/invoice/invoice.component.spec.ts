import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { InvoiceComponent } from './invoice.component';
import { ApisService } from '../../../service/apis.service';
import { AuthService } from '../../../service/auth.service';
import { InvoiceSuccessResponse } from '../../../interface/invoice.model';

describe('InvoiceComponent', () => {
  let component: InvoiceComponent;
  let fixture: ComponentFixture<InvoiceComponent>;
  let apiService: jasmine.SpyObj<ApisService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockInvoiceResponse: InvoiceSuccessResponse = {
    status: 'Success',
    message: 'Fetched',
    data: [
      { year: '2024', month: 'January', amount: 1000 },
      { year: '2023', month: 'December', amount: 2000 }
    ]
  } as any;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApisService>('ApisService', [
      'getInvoices',
      'putInvoice',
      'searchInvoice'
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
      imports: [InvoiceComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                invoiceData: mockInvoiceResponse
              }
            }
          }
        },
        { provide: ApisService, useValue: apiService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceComponent);
    component = fixture.componentInstance;

    spyOn((component as any).messageService, 'add');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should manage dialog visibility', () => {
    component.showDialog();
    expect(component.visible).toBeTrue();

    component.hideDialog();
    expect(component.visible).toBeFalse();
  });

  it('should reset dialog input', () => {
    component.amount = 999;
    component.resetDialog();
    expect(component.amount).toBeNull();
  });

  it('should filter years based on query', () => {
    component.years = ['2022', '2023', '2024'];
    
    // Simulate typing "23"
    const event = { query: '23' } as any; 
    component.filterYears(event);

    expect(component.filteredYears.length).toBe(1);
    expect(component.filteredYears[0].value).toBe('2023');
  });

  it('should filter months based on query', () => {
    component.months = ['January', 'February', 'March'];
    
    // Simulate typing "Jan"
    const event = { query: 'Jan' } as any;
    component.filterMonths(event);

    expect(component.filteredMonths.length).toBe(1);
    expect(component.filteredMonths[0].value).toBe('January');
  });

  it('should handle error when issuing invoice fails', () => {
    component.amount = 500;
    const errorResponse = { error: { message: 'Database error' } };
    
    apiService.putInvoice.and.returnValue(throwError(() => errorResponse));

    component.issueInvoice();

    expect(component.isFetching()).toBeFalse();
    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Database error' })
    );
  });

  it('should search by Year only when Month is not selected', () => {
    component.selectedYear = '2024';
    component.selectedMonth = '';
    
    // Mock response needs to follow structure expected by component
    apiService.searchInvoice.and.returnValue(of(mockInvoiceResponse));

    component.searchInvoice();

    // Verify it called searchInvoice with null for month
    expect(apiService.searchInvoice).toHaveBeenCalledWith(null, '2024');
    expect(component.isFetching()).toBeFalse();
    // Verify inputs were reset
    expect(component.selectedYear).toBe('');
  });

  it('should normalize single object data to array when searching by Year and Month', () => {
    component.selectedYear = '2024';
    component.selectedMonth = 'January';

    // Scenario: API returns a single object in data, not an array
    const singleObjectResponse = {
      status: 'Success',
      message: 'Found',
      data: { year: '2024', month: 'January', amount: 500 } // Not an array
    } as any;

    apiService.searchInvoice.and.returnValue(of(singleObjectResponse));

    component.searchInvoice();

    expect(apiService.searchInvoice).toHaveBeenCalledWith('January', '2024');
    // Expect component to wrap it in an array
    expect(Array.isArray(component.invoiceData.data)).toBeTrue();
    expect(component.invoiceData.data.length).toBe(1);
    expect(component.invoiceData.data[0].amount).toBe(500);
  });

  it('should handle empty data when searching by Year and Month', () => {
    component.selectedYear = '2024';
    component.selectedMonth = 'March';

    // Scenario: API returns null data
    const emptyResponse = { status: 'Success', message: 'No Data', data: null } as any;

    apiService.searchInvoice.and.returnValue(of(emptyResponse));

    component.searchInvoice();

    expect(component.invoiceData.data).toEqual([]);
  });

  it('should handle API error during specific search', () => {
    component.selectedYear = '2024';
    component.selectedMonth = 'January';
    
    apiService.searchInvoice.and.returnValue(throwError(() => ({ error: { message: 'Search failed' } })));

    component.searchInvoice();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error', detail: 'Search failed' })
    );
    // Ensure data is reset to empty array on error as per your code
    expect(component.invoiceData.data).toEqual([]);
    expect(component.selectedYear).toBe('');
  });

  it('should set flags correctly for RESIDENT role', () => {
    authService.getRole.and.returnValue('RESIDENT');
    authService.isAdmin.and.returnValue(false);
    authService.isOfficer.and.returnValue(false);
    authService.isResident.and.returnValue(true);

    component.ngOnInit();

    expect(component.isResident).toBeTrue();
    expect(component.isAdmin).toBeFalse();
  });

  it('should initialize invoice data from resolver', () => {
    expect(component.invoiceData).toEqual(mockInvoiceResponse);
    expect(component.years.length).toBe(2);
    expect(component.months.length).toBe(2);
  });

  it('should set user role flags correctly', () => {
    expect(component.userRole).toBe('ADMIN');
    expect(component.isAdmin).toBeTrue();
    expect(component.isOfficer).toBeFalse();
    expect(component.isResident).toBeFalse();
  });

  it('should fetch invoices successfully', () => {
    apiService.getInvoices.and.returnValue(of(mockInvoiceResponse));

    component.fetchInvoices();

    expect(apiService.getInvoices).toHaveBeenCalled();
    expect(component.invoiceData).toEqual(mockInvoiceResponse);
  });

  it('should show error toast when fetching invoices fails', () => {
    const errorResponse = {
      error: {
        message: 'Failed to fetch invoices',
        errorcode: 'INV_001'
      }
    };

    apiService.getInvoices.and.returnValue(
      throwError(() => errorResponse)
    );

    component.fetchInvoices();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch invoices'
      })
    );
  });

  it('should not issue invoice if amount is invalid', () => {
    component.amount = 0;

    component.issueInvoice();

    expect(apiService.putInvoice).not.toHaveBeenCalled();
    expect(component.isFetching()).toBeFalse();
  });

  it('should issue invoice successfully', () => {
    component.amount = 500;

    apiService.putInvoice.and.returnValue(
      of({ status: 'Success', message: 'Invoice issued', data: [] } as any)
    );
    apiService.getInvoices.and.returnValue(of(mockInvoiceResponse));

    component.issueInvoice();

    expect(apiService.putInvoice).toHaveBeenCalledWith({ amount: 500 });
    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice issued'
      })
    );
    expect(component.visible).toBeFalse();
    expect(component.amount).toBeNull();
  });

  it('should fetch all invoices when no filters are selected', () => {
    apiService.getInvoices.and.returnValue(of(mockInvoiceResponse));

    component.selectedMonth = '';
    component.selectedYear = '';

    component.searchInvoice();

    expect(apiService.getInvoices).toHaveBeenCalled();
  });
});
