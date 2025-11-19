import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { LoaderComponent } from '../loader/loader.component';
import { Tooltip } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { Message, MessageModule } from 'primeng/message';

import { ApisService } from '../../../service/apis.service';
import { AuthService } from '../../../service/auth.service';
import {
  ProfileResponse,
  ProfileSuccessResponse,
} from '../../../interface/profile.model';
import { Constants } from '../../../shared/constants';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  imports: [
    Button,
    FormsModule,
    DialogModule,
    LoaderComponent,
    InputTextModule,
    FloatLabelModule,
    Tooltip,
    MessageModule,
    Message,
    MessagesModule,
    Toast,
    Ripple,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [MessageService],
})
export class ProfileComponent implements OnInit {
  userDetails?: ProfileResponse;
  @ViewChild('updateProfileForm') updateProfileForm?: NgForm;
  @ViewChild('changePasswordForm') changePasswordForm?: NgForm;

  isFetching = signal(false);

  visible: boolean = false;
  visibleChangePassword: boolean = false;
  visibleDeleteProfile: boolean = false;

  firstname: string = '';
  middlename: string = '';
  lastname: string = '';
  mobile: string = '';
  email: string = '';
  oldpassword: string = '';
  newpassword: string = '';
  confirmpassword: string = '';

  readonly constants = Constants;

  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private routes: Router,
    private auth: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const userData = this.route.snapshot.data['userData'];
    console.log(this.userDetails);
    if (userData && userData.status === 'Success') {
      this.userDetails = userData as ProfileSuccessResponse;
    }
  }

  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  showDialog(): void {
    this.visible = true;
  }

  hideDialog(): void {
    this.visible = false;

    this.updateProfileForm?.resetForm();
  }

  showDialogChangePassword(): void {
    this.visibleChangePassword = true;
  }

  hideDialogChangePassword(): void {
    this.visibleChangePassword = false;
    this.changePasswordForm?.resetForm();
  }

  showDialogDeleteProfile(): void {
    this.visibleDeleteProfile = true;
  }

  hideDialogDeleteProfile(): void {
    this.visibleDeleteProfile = false;
  }

  fetchProfile(): void {
    this.api.profile().subscribe({
      next: (res) => {
        this.userDetails = res;
      },
      error: (err) => {
        console.error(this.constants.errorProfileFetch, err);
      },
    });
  }

  updateProfile(): void {
    this.isFetching.set(true);

    if (
      this.firstname === '' &&
      this.middlename === '' &&
      this.lastname === '' &&
      this.mobile === '' &&
      this.email === ''
    ) {
      this.isFetching.set(false);
      return;
    }

    this.api
      .updateProfile({
        firstname: this.firstname,
        middlename: this.middlename,
        lastname: this.lastname,
        email: this.email,
        mobilenumber: this.mobile,
      })
      .subscribe({
        next: (res) => {
          this.fetchProfile();
          this.visible = false;
          if (this.email != '') {
            this.firstname = '';
            this.middlename = '';
            this.lastname = '';
            this.mobile = '';
            this.email = '';
            this.showSuccess('Profile updated successfully.');
            this.auth.logoutUser();
            this.routes.navigate(['/login']);
          }
          this.firstname = '';
          this.middlename = '';
          this.lastname = '';
          this.mobile = '';
          this.email = '';
          this.showSuccess('Profile updated successfully.');
          this.isFetching.set(false);
        },
        error: (err) => {
          this.isFetching.set(false);
          this.showError(this.constants.errorProfileUpdate);
          console.error(this.constants.errorProfileUpdate, err);
        },
      });
  }

  updatePassword(): void {
    if (this.newpassword !== this.confirmpassword) {
      return;
    }

    this.isFetching.set(true);

    if (this.oldpassword === '' || this.newpassword === '') {
      this.isFetching.set(false);
      return;
    }

    this.api
      .updatePassword({
        oldPassword: this.oldpassword,
        newPassword: this.newpassword,
      })
      .subscribe({
        next: (res) => {
          this.visibleChangePassword = false;
          this.oldpassword = '';
          this.newpassword = '';
          this.isFetching.set(false);
          this.showSuccess('Password changed successfully.');
          this.auth.logoutUser();
          this.routes.navigate(['/login']);
        },
        error: (err) => {
          this.isFetching.set(false);
          this.showError(this.constants.errorPasswordUpdate);
          console.error(this.constants.errorPasswordUpdate, err);
        },
      });
  }

  deleteProfile(): void {
    this.isFetching.set(true);
    this.api.deleteProfile().subscribe({
      next: (res) => {
        this.isFetching.set(false);
        this.auth.logoutUser();
        this.routes.navigate(['/login']);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.showError(this.constants.errorDeletingProfile);
        console.error(this.constants.errorDeletingProfile, err);
      },
    });
  }
}
