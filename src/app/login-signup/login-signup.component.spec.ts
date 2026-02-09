import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSignupComponent } from './login-signup.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { ApisService } from '../service/apis.service';
import { AuthService } from '../service/auth.service';

describe('LoginSignupComponent', () => {
  let component: LoginSignupComponent;
  let fixture: ComponentFixture<LoginSignupComponent>;
  let apiService: jasmine.SpyObj<ApisService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let messageService: MessageService;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApisService>('ApisService', [
      'login',
      'signUp'
    ]);

    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'loginUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LoginSignupComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: ApisService, useValue: apiService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginSignupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // 🔥 IMPORTANT FIX: get MessageService from component injector
    messageService = fixture.componentRef.injector.get(MessageService);
    spyOn(messageService, 'add');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully and navigate to dashboard', () => {
    spyOn(router, 'navigate');

    apiService.login.and.returnValue(
      of({
        status: 'Success',
        message: 'Login successful',
        data: {
          token: 'token123',
          email: 'test@example.com',
          role: 'USER'
        }
      })
    );

    component.email = 'test@example.com';
    component.password = 'password123';

    component.onLogin();

    expect(apiService.login).toHaveBeenCalled();
    expect(authService.loginUser).toHaveBeenCalledWith(
      'token123',
      'test@example.com',
      'USER'
    );
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
    expect(router.navigate).toHaveBeenCalledWith(
      ['/dashboard'],
      { replaceUrl: true }
    );
  });

  it('should handle login error', () => {
    apiService.login.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Invalid credentials',
          errorcode: 'AUTH_401'
        }
      }))
    );

    component.email = 'test@example.com';
    component.password = 'wrongpassword';

    component.onLogin();

    expect(apiService.login).toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
    expect(component.showError).toBeTrue();
  });

  it('should register successfully and switch to login tab', () => {
    apiService.signUp.and.returnValue(
      of({
        status: 'Success'
      })
    );

    component.firstName = 'Manan';
    component.middleName = '';
    component.lastName = 'Ledwani';
    component.email = 'manan@example.com';
    component.mobile = '9999999999';
    component.flat = 'A-101';
    component.password = 'password123';

    component.onRegister();

    expect(apiService.signUp).toHaveBeenCalled();
    expect(component.activeTab).toBe(0);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should handle register error', () => {
    apiService.signUp.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Invalid details',
          errorcode: 'REG_400'
        }
      }))
    );

    component.firstName = 'Manan';
    component.email = 'manan@example.com';
    component.password = 'password123';

    component.onRegister();

    expect(apiService.signUp).toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
    expect(component.showError).toBeTrue();
  });
});
