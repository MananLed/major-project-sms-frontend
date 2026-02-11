import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { ApisService } from '../../../service/apis.service';
import { AuthService } from '../../../service/auth.service';
import { ProfileSuccessResponse } from '../../../interface/profile.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let apiService: jasmine.SpyObj<ApisService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockProfileResponse: ProfileSuccessResponse = {
    status: 'Success',
    message: 'Profile fetched',
    data: {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@test.com',
      mobilenumber: '9999999999'
    }
  } as any;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj('ApisService', [
      'profile',
      'updateProfile',
      'updatePassword',
      'deleteProfile'
    ]);

    authService = jasmine.createSpyObj('AuthService', ['logoutUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                userData: mockProfileResponse
              }
            }
          }
        },
        { provide: ApisService, useValue: apiService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    })
      .overrideComponent(ProfileComponent, {
        add: {
          imports: [CommonModule]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

    spyOn((component as any).messageService, 'add');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize profile data from resolver', () => {
    expect(component.userDetails).toEqual(mockProfileResponse);
  });

  it('should fetch profile successfully', () => {
    apiService.profile.and.returnValue(of(mockProfileResponse));

    component.fetchProfile();

    expect(apiService.profile).toHaveBeenCalled();
    expect(component.userDetails).toEqual(mockProfileResponse);
  });

  it('should show error toast when fetching profile fails', () => {
    apiService.profile.and.returnValue(
      throwError(() => ({
        error: { message: 'Fetch failed', errorcode: 'PROFILE_001' }
      }))
    );

    component.fetchProfile();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Fetch failed'
      })
    );
  });

  it('should manage update dialog visibility and reset form', () => {
    // Mock the ViewChild form
    component.updateProfileForm = { resetForm: jasmine.createSpy('resetForm') } as any;

    component.showDialog();
    expect(component.visible).toBeTrue();

    component.hideDialog();
    expect(component.visible).toBeFalse();
    expect(component.updateProfileForm?.resetForm).toHaveBeenCalled();
  });

  it('should manage change password dialog visibility and reset form', () => {
    // Mock the ViewChild form
    component.changePasswordForm = { resetForm: jasmine.createSpy('resetForm') } as any;

    component.showDialogChangePassword();
    expect(component.visibleChangePassword).toBeTrue();

    component.hideDialogChangePassword();
    expect(component.visibleChangePassword).toBeFalse();
    expect(component.changePasswordForm?.resetForm).toHaveBeenCalled();
  });

  it('should manage delete profile dialog visibility', () => {
    component.showDialogDeleteProfile();
    expect(component.visibleDeleteProfile).toBeTrue();

    component.hideDialogDeleteProfile();
    expect(component.visibleDeleteProfile).toBeFalse();
  });

  it('should logout and navigate to login when Email is updated', () => {
    component.email = 'newemail@test.com'; // Set email to trigger the specific branch
    component.firstname = 'John';

    apiService.updateProfile.and.returnValue(
      of({ status: 'Success', message: 'Updated' } as any)
    );
    apiService.profile.and.returnValue(of(mockProfileResponse));

    component.updateProfile();

    expect(apiService.updateProfile).toHaveBeenCalled();
    // Verify specific branch logic
    expect(authService.logoutUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should just reset fields and stay on page when Email is NOT updated', () => {
    component.email = ''; // Empty email means other fields are being updated
    component.firstname = 'John';

    apiService.updateProfile.and.returnValue(
      of({ status: 'Success', message: 'Updated' } as any)
    );
    apiService.profile.and.returnValue(of(mockProfileResponse));

    component.updateProfile();

    expect(apiService.updateProfile).toHaveBeenCalled();
    // Verify it did NOT logout
    expect(authService.logoutUser).not.toHaveBeenCalled();
    // Verify fields were reset
    expect(component.firstname).toBe('');
    expect(component.isFetching()).toBeFalse();
  });

  it('should handle error when updating profile', () => {
    component.firstname = 'John'; 
    const errorResponse = { error: { message: 'Update failed' } };
    
    apiService.updateProfile.and.returnValue(throwError(() => errorResponse));

    component.updateProfile();

    expect(component.isFetching()).toBeFalse();
    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Update failed' })
    );
  });

  it('should not update password if required fields are empty', () => {
    component.oldpassword = ''; // Missing old password
    component.newpassword = 'pass';
    component.confirmpassword = 'pass';

    component.updatePassword();

    expect(apiService.updatePassword).not.toHaveBeenCalled();
    expect(component.isFetching()).toBeFalse();
  });

  it('should handle error when updating password', () => {
    component.oldpassword = 'old';
    component.newpassword = 'new';
    component.confirmpassword = 'new';
    
    const errorResponse = { error: { message: 'Wrong old password' } };
    apiService.updatePassword.and.returnValue(throwError(() => errorResponse));

    component.updatePassword();

    expect(component.isFetching()).toBeFalse();
    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Wrong old password' })
    );
  });

  it('should use default error message when API error object is empty', () => {
    const emptyError = { status: 500, error: null }; 
    apiService.profile.and.returnValue(throwError(() => emptyError));

    component.fetchProfile();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        detail: 'An unexpected error occurred'
      })
    );
  });

  it('should not update profile when all fields are empty', () => {
    component.updateProfile();

    expect(apiService.updateProfile).not.toHaveBeenCalled();
  });

  it('should update profile successfully', () => {
    component.firstname = 'Jane';

    apiService.updateProfile.and.returnValue(
      of({ status: 'Success', message: 'Updated' } as any)
    );
    apiService.profile.and.returnValue(of(mockProfileResponse));

    component.updateProfile();

    expect(apiService.updateProfile).toHaveBeenCalled();
    expect((component as any).messageService.add).toHaveBeenCalled();
  });

  it('should not update password if passwords do not match', () => {
    component.oldpassword = 'old';
    component.newpassword = 'new';
    component.confirmpassword = 'wrong';

    component.updatePassword();

    expect(apiService.updatePassword).not.toHaveBeenCalled();
  });

  it('should update password successfully and logout', () => {
    component.oldpassword = 'old';
    component.newpassword = 'new';
    component.confirmpassword = 'new';

    apiService.updatePassword.and.returnValue(
      of({ status: 'Success' } as any)
    );

    component.updatePassword();

    expect(apiService.updatePassword).toHaveBeenCalled();
    expect(authService.logoutUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should delete profile successfully and logout', () => {
    apiService.deleteProfile.and.returnValue(
      of({ status: 'Success' } as any)
    );

    component.deleteProfile();

    expect(apiService.deleteProfile).toHaveBeenCalled();
    expect(authService.logoutUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error toast when delete profile fails', () => {
    apiService.deleteProfile.and.returnValue(
      throwError(() => ({
        error: { message: 'Delete failed', errorcode: 'PROFILE_003' }
      }))
    );

    component.deleteProfile();

    expect((component as any).messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Delete failed'
      })
    );
  });
});
