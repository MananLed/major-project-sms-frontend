import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabel, FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { ApisService } from '../service/apis.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { Toast, ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { NgIf } from '@angular/common';
import { LoaderComponent } from '../dashboard/views/loader/loader.component';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login-signup',
  imports: [
    InputTextModule,
    FormsModule,
    TabsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    HttpClientModule,
    PasswordModule,
    FloatLabelModule,
    MessageModule,
    FloatLabel,
    NgIf,
    LoaderComponent,
    Ripple,
    Toast,
  ],
  templateUrl: './login-signup.component.html',
  styleUrl: './login-signup.component.scss',
  providers: [MessageService]
})
export class LoginSignupComponent {
  isFetching = signal(false);

  email: string = '';
  password: string = '';
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  mobile: string = '';
  flat: string = '';
  confirmPassword: string = '';
  activeTab: number = 0;

  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    private api: ApisService,
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  showSuccess(message: string) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showErrorr(message: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  onLogin() {
    this.isFetching.set(true);
    this.api
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'Success' && res && res.data) {
            this.showSuccess('User logged in successfully');
            this.auth.loginUser(res.data.token, res.data.email, res.data.role);
            this.router.navigate(['/dashboard'], {replaceUrl: true});
          }
        },
        error: (err: any) => {
          this.isFetching.set(false);
          this.errorMessage = 'Invalid credentials';
          this.showError = true;
          this.showErrorr('Invalid Credentials');

          setTimeout(() => {
            this.showError = false;
          }, 3000);
        },
        complete: () => {
          this.isFetching.set(false);
        },
      });
  }

  onRegister() {
    this.isFetching.set(true);
    this.api
      .signUp({
        firstName: this.firstName,
        middleName: this.middleName,
        lastName: this.lastName,
        email: this.email,
        mobile: this.mobile,
        flat: this.flat,
        password: this.password,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'Success') {
            this.activeTab = 0;
            this.showSuccess('Sign Up successful.');
          }
        },
        error: (err: any) => {
          this.isFetching.set(false);
          this.errorMessage = 'Invalid details';
          this.showError = true;

          setTimeout(() => {
            this.showError = false;
          }, 3000);
        },
        complete: () => {
          this.isFetching.set(false);
        },
      });
  }
}
