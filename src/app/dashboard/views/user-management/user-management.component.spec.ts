import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserManagementComponent } from './user-management.component';
import { ApisService } from '../../../service/apis.service';
import { MessageService } from 'primeng/api';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let apiSpy: jasmine.SpyObj<ApisService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApisService', [
      'getResidents',
      'getOfficers',
      'deleteResident',
      'deleteOfficer',
      'putOfficer'
    ]);

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        { provide: ApisService, useValue: apiSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                societyData: {
                  residentDetails: {
                    status: 'Success',
                    data: [{ id: 'r1' }]
                  },
                  officerDetails: {
                    status: 'Success',
                    data: [{ id: 'o1' }]
                  }
                }
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;

    spyOn(component['messageService'], 'add');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete resident successfully', () => {
    apiSpy.deleteResident.and.returnValue(
      of({ message: 'Resident deleted' })
    );
    apiSpy.getResidents.and.returnValue(
      of({ data: [] } as any)
    );

    component.deleteResident('r1');

    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Success',
        detail: 'Resident deleted'
      })
    );
  });

  it('should fetch residents successfully', () => {
    const mockResidents = { data: [1, 2, 3] } as any;
    apiSpy.getResidents.and.returnValue(of(mockResidents));

    component.fetchResidents();

    expect(component.residentDetails).toEqual(mockResidents);
    expect(component.noOfResidents).toBe(3);
  });

  it('should fetch officers successfully', () => {
    const mockOfficers = { data: [1, 2] } as any;
    apiSpy.getOfficers.and.returnValue(of(mockOfficers));

    component.fetchOfficers();

    expect(component.officerDetails).toEqual(mockOfficers);
    expect(component.noOfOfficers).toBe(2);
  });

  it('should not add officer if form is invalid', () => {
    const invalidForm = { valid: false } as any;
    component.addOfficer(invalidForm);
    
    // Ensure API is NOT called
    expect(apiSpy.putOfficer).not.toHaveBeenCalled();
    expect(component.isFetching()).toBeFalse();
  });

  it('should add officer successfully', () => {
    const validForm = { valid: true, resetForm: jasmine.createSpy('resetForm') } as any;
    component.officerEmail = 'test@test.com';
    component.officerPassword = 'password';
    
    // Mock the ViewChild if used in logic, though here it's passed as arg or used for reset
    component.addOfficerForm = validForm;

    apiSpy.putOfficer.and.returnValue(of({ message: 'Officer added' }));
    apiSpy.getOfficers.and.returnValue(of({ data: [] } as any)); // Mock refresh call

    component.addOfficer(validForm);

    expect(apiSpy.putOfficer).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(apiSpy.getOfficers).toHaveBeenCalled(); // Ensure list is refreshed
    expect(component.visible).toBeFalse();
    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success', detail: 'Officer added' })
    );
    // Verify form reset logic
    expect(validForm.resetForm).toHaveBeenCalled();
    expect(component.officerEmail).toBe('');
  });

  it('should show error when adding officer fails', () => {
    const validForm = { valid: true } as any;
    apiSpy.putOfficer.and.returnValue(throwError(() => ({ error: { message: 'Email exists' } })));

    component.addOfficer(validForm);

    expect(component.isFetching()).toBeFalse();
    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Email exists' })
    );
  });

  it('should manage dialog visibility and reset form', () => {
    component.showDialog();
    expect(component.visible).toBeTrue();

    // Mock the form to test reset logic inside hideDialog
    component.addOfficerForm = { resetForm: jasmine.createSpy('resetForm') } as any;
    
    component.hideDialog();
    expect(component.visible).toBeFalse();
    expect(component.addOfficerForm?.resetForm).toHaveBeenCalled();
  });

  it('should reset add officer form manually', () => {
    component.addOfficerForm = { resetForm: jasmine.createSpy('resetForm') } as any;
    component.officerEmail = 'temp';
    component.officerPassword = 'temp';

    component.resetAddOfficerForm();

    expect(component.addOfficerForm?.resetForm).toHaveBeenCalled();
    expect(component.officerEmail).toBe('');
    expect(component.officerPassword).toBe('');
  });

  it('should display success message', () => {
    component.showSuccess('Test Success');
    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success', detail: 'Test Success' })
    );
  });

  it('should display error message', () => {
    component.showError('Test Error');
    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Test Error' })
    );
  });

  it('should show error toast when delete resident fails', () => {
    apiSpy.deleteResident.and.returnValue(
      throwError(() => ({
        error: { message: 'Delete failed' }
      }))
    );

    component.deleteResident('r1');

    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Delete failed'
      })
    );
  });

  it('should delete officer successfully', () => {
    apiSpy.deleteOfficer.and.returnValue(
      of({ message: 'Officer deleted' })
    );
    apiSpy.getOfficers.and.returnValue(
      of({ data: [] } as any)
    );

    component.deleteOfficer('o1');

    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Success',
        detail: 'Officer deleted'
      })
    );
  });

  it('should show error toast when delete officer fails', () => {
    apiSpy.deleteOfficer.and.returnValue(
      throwError(() => ({
        error: { message: 'Delete officer failed' }
      }))
    );

    component.deleteOfficer('o1');

    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Delete officer failed'
      })
    );
  });

  it('should show error toast when fetch residents fails', () => {
    apiSpy.getResidents.and.returnValue(
      throwError(() => ({
        error: { message: 'Failed to fetch residents' }
      }))
    );

    component.fetchResidents();

    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch residents'
      })
    );
  });

  it('should show error toast when fetch officers fails', () => {
    apiSpy.getOfficers.and.returnValue(
      throwError(() => ({
        error: { message: 'Failed to fetch officers' }
      }))
    );

    component.fetchOfficers();

    expect(component['messageService'].add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch officers'
      })
    );
  });
});
