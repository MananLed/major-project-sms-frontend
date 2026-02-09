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

    // 🔑 THIS IS THE KEY FIX
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
