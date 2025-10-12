import { NgIf } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Avatar } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel, FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';

import { LoaderComponent } from '../loader/loader.component';
import { ApisService } from '../../../service/apis.service';
import {
  SocietyData,
  UserListSuccessResponse,
} from '../../../interface/user.model';
import { Constants } from '../../../shared/constants';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-management',
  imports: [
    CardModule,
    TabsModule,
    TableModule,
    ButtonModule,
    NgIf,
    DialogModule,
    LoaderComponent,
    FormsModule,
    FloatLabel,
    FloatLabelModule,
    InputTextModule,
    Tooltip,
    Avatar,
    Toast,
    Ripple,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  providers: [MessageService]
})
export class UserManagementComponent implements OnInit {
  @ViewChild('addOfficerForm') addOfficerForm?: NgForm;

  isFetching = signal(false);

  visible: boolean = false;

  residentDetails?: UserListSuccessResponse;
  officerDetails?: UserListSuccessResponse;

  noOfResidents: number = 0;
  noOfOfficers: number = 0;

  officerEmail: string = '';
  officerPassword: string = '';

  readonly constants = Constants;

  constructor(private route: ActivatedRoute, private api: ApisService, private messageService: MessageService) {}

  ngOnInit(): void {
    const societyData = this.route.snapshot.data['societyData'] as SocietyData;
    if (societyData.residentDetails.status === 'Success') {
      this.residentDetails = societyData.residentDetails;
      this.noOfResidents = this.residentDetails.data.length;
    } else {
      console.error(
        this.constants.errorResidentDetailFetch,
        societyData.residentDetails.message
      );
    }

    if (societyData.officerDetails.status === 'Success') {
      this.officerDetails = societyData.officerDetails;
      this.noOfOfficers = this.officerDetails.data.length;
    } else {
      console.error(
        this.constants.errorOfficerDetailFetch,
        societyData.officerDetails.message
      );
    }
  }

  resetAddOfficerForm(): void {
    this.addOfficerForm?.resetForm();
    this.officerEmail = '';
    this.officerPassword = '';
  }

  showDialog(): void {
    this.visible = true;
  }

  hideDialog(): void {
    this.visible = false;
    this.addOfficerForm?.resetForm();
  }

  showSuccess(message: string) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  fetchOfficers(): void {
    this.api.getOfficers().subscribe({
      next: (res: UserListSuccessResponse) => {
        this.officerDetails = res;
        this.noOfOfficers = res.data.length;
      },
      error: (err) => {
        console.error(this.constants.errorOfficerDetailFetch, err);
      },
    });
  }

  fetchResidents(): void {
    this.api.getResidents().subscribe({
      next: (res: UserListSuccessResponse) => {
        this.residentDetails = res;
        this.noOfResidents = res.data.length;
      },
      error: (err) => {
        console.error(this.constants.errorResidentDetailFetch, err);
      },
    });
  }

  addOfficer(form: NgForm): void {
    if (form.valid) {
      this.isFetching.set(true);

      this.api.putOfficer({ email: this.officerEmail, password: this.officerPassword }).subscribe({
        next: (res) => {
          this.fetchOfficers();
          this.visible = false;
          this.resetAddOfficerForm();
          this.showSuccess('Officer added successfully.');
          this.isFetching.set(false);
        },
        error: (err) => {
          this.isFetching.set(false);
          this.showError('Error in adding officer to the system.');
          console.error(this.constants.errorAddOfficer, err);
        }
      });
    }
  }

  deleteResident(residentID: string): void {
    this.isFetching.set(true);
    console.log(residentID);
    this.api.deleteResident(residentID).subscribe({
      next: (res) => {
        this.fetchResidents();
        this.showSuccess('Deletion Successful');
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.showError('Error in deletion');
        console.error(this.constants.errorDeleteResident, err);
      },
    });
  }

  deleteOfficer(officerID: string): void {
    this.isFetching.set(true);
    this.api.deleteOfficer(officerID).subscribe({
      next: (res) => {
        this.fetchOfficers();
        this.showSuccess('Deletion successful.');
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.showError('Error in deletion.');
        console.error(this.constants.errorDeleteOfficer, err);
      },
    });
  }
}
