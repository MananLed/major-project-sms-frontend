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

    // 🔑 Spy on component-level MessageService
    spyOn((component as any).messageService, 'add');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
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
