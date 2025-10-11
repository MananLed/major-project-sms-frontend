import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { Avatar } from 'primeng/avatar';
import { SelectItem } from 'primeng/select';

import { AuthService } from '../../../service/auth.service';
import { ApisService } from '../../../service/apis.service';
import { LoaderComponent } from '../loader/loader.component';
import { Constants } from '../../../shared/constants';

@Component({
  selector: 'app-service-requests',
  imports: [
    FormsModule,
    AutoComplete,
    ButtonModule,
    TableModule,
    CommonModule,
    Tooltip,
    Avatar,
    DialogModule,
    LoaderComponent,
  ],
  templateUrl: './service-requests.component.html',
  styleUrl: './service-requests.component.scss',
})
export class ServiceRequestsComponent {
  selectedService: any = null;
  selectedStatus: any = null;
  filteredService!: any[];
  filteredStatus!: any[];
  userRole: string | null = null;
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;
  totalRequestCount: any;
  pendingRequestCount: any;
  approvedRequestCount: any;
  allRequestData: any;
  pendingRequestData: any;
  approvedRequestData: any;
  isFetching = signal(false);
  displayAddRequestDialog: boolean = false;
  displayRescheduleRequestDialog: boolean = false;
  selectedServiceType: any | null = null;
  selectedTimeSlot: any | null = null;
  selectedTimeSlotIndex: any | null = null;
  selectedReTimeSlot: any | null = null;
  fetchedTimeSlots: any | null = null;
  filteredTimeSlots: SelectItem[] = [];
  allTimeSlots: SelectItem[] = [];
  selectedReServiceType: any | null;
  selectedReServiceID: any | null;
  completedRequestData: any;
  completedRequestCount: any;

  private readonly constants = Constants;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private api: ApisService
  ) {}

  private allServices = [
    { label: 'Electrician', value: 'Electrician' },
    { label: 'Plumber', value: 'Plumber' },
  ];
  private allStatuses = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Completed', value: 'Completed'},
  ];
  ngOnInit() {
    const requestData = this.route.snapshot.data['requestData'];

    console.log(requestData);

    console.log(requestData);
    this.pendingRequestCount =
      requestData.data.Pending === null ? 0 : requestData.data.Pending.length;
    this.approvedRequestCount =
      requestData.data.Approved === null ? 0 : requestData.data.Approved.length;
      this.completedRequestCount = requestData.data.Completed === null ? 0 : requestData.data.Completed.length;
      this.totalRequestCount =
        this.pendingRequestCount + this.approvedRequestCount + this.completedRequestCount;

    console.log(this.pendingRequestCount);
    console.log(this.approvedRequestCount);
    console.log(this.completedRequestCount);
    console.log(this.totalRequestCount);

    this.pendingRequestData = requestData.data.Pending || [];
    this.approvedRequestData = requestData.data.Approved || [];
    this.completedRequestData = requestData.data.Completed || [];
    this.allRequestData = this.pendingRequestData.concat(
      this.approvedRequestData
    );

    this.allRequestData = this.allRequestData.concat(
      this.completedRequestData
    );

    console.log(this.pendingRequestData);
    console.log(this.approvedRequestData);
    console.log(this.completedRequestData);
    console.log(this.allRequestData);

    this.filteredService = this.allServices;
    this.filteredStatus = this.allStatuses;
    this.userRole = this.auth.getRole();
    this.isAdmin = this.auth.isAdmin();
    this.isOfficer = this.auth.isOfficer();
    this.isResident = this.auth.isResident();
  }

  filterStatus(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredStatus = this.allStatuses.filter((status) =>
      status.label.toLowerCase().includes(query)
    );
  }

  filterService(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredService = this.allServices.filter((service) =>
      service.label.toLowerCase().includes(query)
    );
  }

  onTimeSlotSelect(event: any): void {
    const selectedItem = event.value;
    console.log(this.fetchedTimeSlots);
    this.selectedTimeSlotIndex = this.fetchedTimeSlots.data.findIndex(
      (slot: any) => slot.Label == selectedItem.label
    );
    console.log(this.selectedTimeSlotIndex);
    console.log(selectedItem);
  }

  showAddRequestDialog() {
    this.displayAddRequestDialog = true;
  }

  hideAddRequestDialog() {
    this.displayAddRequestDialog = false;
    this.selectedServiceType = null;
    this.selectedTimeSlot = null;
    this.selectedTimeSlotIndex = null;
  }

  showRescheduleRequestDialog(typeOfService: any, serviceID: any) {
    this.displayRescheduleRequestDialog = true;
    this.selectedReServiceType = typeOfService;
    this.selectedReServiceID = serviceID;
    console.log(this.selectedReServiceType);
    console.log(this.selectedReServiceID);
  }

  hideRescheduleRequestDialog() {
    this.displayRescheduleRequestDialog = false;
    this.selectedReServiceID = null;
    this.selectedReServiceType = null;
    this.selectedReTimeSlot = null;
    this.selectedTimeSlotIndex = null;
  }

  submitRescheduleRequest(): void {
    if (
      this.selectedReServiceID == null ||
      this.selectedTimeSlotIndex == null
    ) {
      return;
    }

    this.isFetching.set(true);

    this.api
      .rescheduleRequest(this.selectedReServiceID, {
        slot: Number(this.selectedTimeSlotIndex) + 1,
      })
      .subscribe({
        next: (res) => {
          this.fetchRequestsOfResident();
          this.displayRescheduleRequestDialog = false;
          this.selectedReServiceID = null;
          this.selectedTimeSlotIndex = null;
          this.isFetching.set(false);
        },
        error: (err) => {
          this.isFetching.set(false);
          console.error(this.constants.errorReschedulingRequests, err);
        },
      });
  }

  fetchAllRequests(): any {
    this.api.getAllRequests().subscribe({
      next: (res) => {
        const requestData = res;
        console.log(requestData);
        this.pendingRequestCount =
          requestData.data.Pending === null
            ? 0
            : requestData.data.Pending.length;
        this.approvedRequestCount =
          requestData.data.Approved === null
            ? 0
            : requestData.data.Approved.length;
        this.totalRequestCount =
          this.pendingRequestCount + this.approvedRequestCount;

        console.log(this.pendingRequestCount);
        console.log(this.approvedRequestCount);
        console.log(this.totalRequestCount);

        this.pendingRequestData = requestData.data.Pending || [];
        this.approvedRequestData = requestData.data.Approved || [];
        this.allRequestData = this.pendingRequestData.concat(
          this.approvedRequestData
        );

        console.log(this.pendingRequestData);
        console.log(this.approvedRequestData);
        console.log(this.allRequestData);
      },
      error: (err) => {
        console.error(this.constants.errorFetchingRequestOfResident, err);
      },
    });
  }

  approveRequest(requestID: any) {
    this.isFetching.set(true);
    this.api.approveRequest(requestID).subscribe({
      next: (res) => {
        this.fetchAllRequests();
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        console.error(this.constants.errorFetchingAllRequests, err);
      },
    });
  }

  deleteRequest(requestID: any) {
    this.isFetching.set(true);
    this.api.deleteRequest(requestID).subscribe({
      next: (res) => {
        this.fetchRequestsOfResident();
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        console.error(this.constants.errorDeleteRequest, err);
      },
    });
  }

  searchTimeSlots(event: { originalEvent: Event; query: string }) {
    let query = event.query.toLowerCase();
    this.filteredTimeSlots = this.allTimeSlots.filter(
      (slot: any) => slot.label.toLowerCase().indexOf(query) > -1
    );
  }

  fetchRequestsOfResident(): void {
    this.api.getAllRequestsOfResident().subscribe({
      next: (res) => {
        const requestData = res;
        console.log(requestData);
        this.pendingRequestCount =
          requestData.data.Pending === null
            ? 0
            : requestData.data.Pending.length;
        this.approvedRequestCount =
          requestData.data.Approved === null
            ? 0
            : requestData.data.Approved.length;
        this.totalRequestCount =
          this.pendingRequestCount + this.approvedRequestCount;

        console.log(this.pendingRequestCount);
        console.log(this.approvedRequestCount);
        console.log(this.totalRequestCount);

        this.pendingRequestData = requestData.data.Pending || [];
        this.approvedRequestData = requestData.data.Approved || [];
        this.allRequestData = this.pendingRequestData.concat(
          this.approvedRequestData
        );

        console.log(this.pendingRequestData);
        console.log(this.approvedRequestData);
        console.log(this.allRequestData);
      },
      error: (err) => {
        console.error(this.constants.errorFetchingRequestOfResident, err);
      },
    });
  }

  submitAddRequest() {
    if (!this.selectedServiceType || !(this.selectedTimeSlotIndex + 1)) {
      return;
    }

    this.isFetching.set(true);
    this.api
      .putRequest({
        servicetype: String(this.selectedServiceType.toLowerCase()),
        slotid: Number(this.selectedTimeSlotIndex) + 1,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.fetchRequestsOfResident();
          this.displayAddRequestDialog = false;
          this.isFetching.set(false);
          this.selectedServiceType = null;
          this.selectedTimeSlot = null;
          this.selectedTimeSlotIndex = null;
        },
        error: (err) => {
          this.isFetching.set(false);
          console.error(this.constants.errorAddingRequest, err);
        },
      });
  }

  fetchAvailableTimeSlots(serviceType: any) {
    if (serviceType === null) {
      return;
    }
    this.isFetching.set(true);
    this.api.getAvailableTimeSlots(serviceType.toLowerCase()).subscribe({
      next: (res) => {
        console.log(res);
        this.fetchedTimeSlots = res;
        if (res && res.data) {
          this.filteredTimeSlots = res.data.map((slot: any) => ({
            label: slot.Label,
            value: slot.Label,
          }));
        }
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        console.error(this.constants.errorFetchingTimeSlots, err);
      },
    });
  }

  searchRequests(): void {
    if (!this.selectedStatus && !this.selectedService) {
      this.isFetching.set(true);
      if (this.isResident) {
        this.fetchRequestsOfResident();
      } else {
        this.fetchAllRequests();
      }
      this.isFetching.set(false);
    }

    if (this.selectedStatus && this.selectedService) {
      this.isFetching.set(true);
      this.api
        .searchRequests(this.selectedService.toLowerCase(), this.selectedStatus.toLowerCase())
        .subscribe({
          next: (res) => {
            console.log(res);
            if (res && res.data) {
              this.allRequestData = res.data;
            } else {
              this.allRequestData = [];
            }
            this.selectedService = null;
            this.selectedStatus = null;
            this.isFetching.set(false);
          },
          error: (err) => {
            console.log(this.constants.errorSearchingRequests, err);
            this.selectedService = null;
            this.selectedStatus = null;
            this.isFetching.set(false);
          },
        });
    }
  }
}