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
import { ProfileResponse, ProfileSuccessResponse } from '../../../interface/profile.model';
import { Constants } from '../../../shared/constants';

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
    MessagesModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
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
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userData = this.route.snapshot.data['userData'];
    console.log(this.userDetails);
    if (userData && userData.status === 'Success') {
      this.userDetails = userData as ProfileSuccessResponse;
    }
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
        firstname: String(this.firstname),
        middlename: String(this.middlename),
        lastname: String(this.lastname),
        email: String(this.email),
        mobilenumber: String(this.mobile),
      })
      .subscribe({
        next: (res) => {
          this.fetchProfile();
          this.visible = false;
          this.firstname = '';
          this.middlename = '';
          this.lastname = '';
          this.mobile = '';
          this.email = '';
          this.isFetching.set(false);
        },
        error: (err) => {
          this.isFetching.set(false);
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
        oldPassword: String(this.oldpassword),
        newPassword: String(this.newpassword),
      })
      .subscribe({
        next: (res) => {
          this.visibleChangePassword = false;
          this.oldpassword = '';
          this.newpassword = '';
          this.isFetching.set(false);
          this.auth.logoutUser();
          this.routes.navigate(['/login']);
        },
        error: (err) => {
          this.isFetching.set(false);
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
        console.error(this.constants.errorDeletingProfile, err);
      },
    });
  }
}
