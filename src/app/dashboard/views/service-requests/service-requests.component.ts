import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { Avatar } from 'primeng/avatar';
import { SelectItem } from 'primeng/select';
import { FloatLabel } from "primeng/floatlabel";
import { RatingModule } from 'primeng/rating';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';

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
    FloatLabel,
    RatingModule,
    Toast,
    Ripple,
    InputTextModule
],
  templateUrl: './service-requests.component.html',
  styleUrl: './service-requests.component.scss',
  providers: [MessageService]
})
export class ServiceRequestsComponent {
  selectedService: string = '';
  selectedStatus: string = '';
  userRole: string | null = null;
  assignedTo: string = '';

  filteredService: Array<{ label: string; value: string }> = [];
  filteredStatus: Array<{ label: string; value: string }> = [];
  
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;
  displayAddRequestDialog: boolean = false;
  displayRescheduleRequestDialog: boolean = false;

  totalRequestCount: number = 0;
  pendingRequestCount: number = 0;
  approvedRequestCount: number = 0;
  completedRequestCount: number = 0;

  isFetching = signal(false);
  
  displayApproveRequestDialog: boolean = false;
  displayIssueFeedbackDialog: boolean = false;
  
  filteredTimeSlots: SelectItem[] = [];
  allTimeSlots: SelectItem[] = [];

  allRequestData: any;
  pendingRequestData: any;
  approvedRequestData: any;
  completedRequestData: any;
  
  selectedServiceType: any | null = null;
  selectedTimeSlot: any | null = null;
  selectedTimeSlotIndex: any | null = null;
  selectedReTimeSlot: any | null = null;
  fetchedTimeSlots: any | null = null;
  selectedReServiceType: any | null;
  selectedReServiceID: any | null;

  @ViewChild('approveForm') approveForm?: NgForm;
  @ViewChild('feedbackForm') feedbackForm?: NgForm;
  
  requestID: any;
  rating: number = 0;
  content: string = '';

  private readonly constants = Constants;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private api: ApisService,
    private messageService: MessageService
  ) {}

  private allServices: Array<{ label: string; value: string }> = [
    { label: 'Electrician', value: 'Electrician' },
    { label: 'Plumber', value: 'Plumber' },
  ];
  private allStatuses: Array<{ label: string; value: string }> = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Completed', value: 'Completed'},
  ];
  ngOnInit(): void {
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

  filterStatus(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredStatus = this.allStatuses.filter((status) =>
      status.label.toLowerCase().includes(query)
    );
  }

  filterService(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredService = this.allServices.filter((service) =>
      service.label.toLowerCase().includes(query)
    );
  }

  showSuccess(message: string): void {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
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

  showAddRequestDialog(): void {
    this.displayAddRequestDialog = true;
  }

  hideAddRequestDialog(): void {
    this.displayAddRequestDialog = false;
    this.selectedServiceType = null;
    this.selectedTimeSlot = null;
    this.selectedTimeSlotIndex = null;
  }

  showRescheduleRequestDialog(typeOfService: any, serviceID: any): void {
    this.displayRescheduleRequestDialog = true;
    this.selectedReServiceType = typeOfService;
    this.selectedReServiceID = serviceID;
    console.log(this.selectedReServiceType);
    console.log(this.selectedReServiceID);
  }

  hideRescheduleRequestDialog(): void {
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
        slotid: Number(this.selectedTimeSlotIndex) + 1,
      })
      .subscribe({
        next: (res) => {
          this.fetchRequestsOfResident();
          this.displayRescheduleRequestDialog = false;
          this.selectedReServiceID = null;
          this.selectedTimeSlotIndex = null;
          this.showSuccess('Request rescheduled successfully.')
          this.isFetching.set(false);
        },
        error: (err) => {
          this.isFetching.set(false);
          this.showError('Error in rescheduling request.')
          console.error(this.constants.errorReschedulingRequests, err);
        },
      });
  }

  fetchAllRequests(): void {
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
        this.completedRequestCount = requestData.data.Completed === null ? 0 : requestData.data.Completed.length;
        this.totalRequestCount =
          this.pendingRequestCount + this.approvedRequestCount + this.completedRequestCount;

        console.log(this.pendingRequestCount);
        console.log(this.approvedRequestCount);
        console.log(this.totalRequestCount);

        this.pendingRequestData = requestData.data.Pending || [];
        this.approvedRequestData = requestData.data.Approved || [];
        this.completedRequestData = requestData.data.Completed || [];
        this.allRequestData = this.pendingRequestData.concat(
          this.approvedRequestData
        );
        this.allRequestData = this.allRequestData.concat(this.completedRequestData);

        console.log(this.pendingRequestData);
        console.log(this.approvedRequestData);
        console.log(this.allRequestData);
      },
      error: (err) => {
        console.error(this.constants.errorFetchingRequestOfResident, err);
      },
    });
  }

  approveRequest(form: NgForm): void {
    if (form.valid){
    this.isFetching.set(true);
    this.api.approveRequest(this.requestID, {assignedto: this.assignedTo}).subscribe({
      next: (res) => {
        this.fetchAllRequests();
        this.hideApproveRequestDialog();
        this.showSuccess('Request approved successfully.')
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.hideApproveRequestDialog();
        this.showError('Error in approving request.')
        console.error(this.constants.errorFetchingAllRequests, err);
      },
    });
  }
  }

  showIssueFeedbackDialog(requestID: any){
    this.requestID = requestID;
    this.displayIssueFeedbackDialog = true;
  }

  hideIssueFeedbackDialog(){
    this.feedbackForm?.reset();
    this.rating = 0;
    this.content = '';
    this.displayIssueFeedbackDialog = false;
  }

  issueFeedback(form: NgForm): void{
    console.log(this.rating);
    console.log(this.content);
    console.log(this.requestID);
    this.isFetching.set(true);
    this.api.postFeedbackOnRequest({rating: this.rating, content: this.content, requestid: String(this.requestID)}).subscribe({
      next: (res) => {
        this.hideIssueFeedbackDialog();
        this.fetchRequestsOfResident();
        this.showSuccess('Feedback issued successfully.')
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.hideIssueFeedbackDialog();
        this.showError('Error in giving feedback.')
        console.error(this.constants.errorAddingFeedbacks, err);
      }
    })
  }


  markRequestComplete(requestID: any){
    this.isFetching.set(true);
    this.api.completeRequest(requestID).subscribe({
      next: (res) => {
        this.fetchAllRequests();
        this.showSuccess('Request marked completed successfully')
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.showError('Error in marking request complete')
        console.error(this.constants.errorCompletingRequest, err);
      }
    })
  }

  deleteRequest(requestID: any) {
    this.isFetching.set(true);
    this.api.deleteRequest(requestID).subscribe({
      next: (res) => {
        this.fetchRequestsOfResident();
        this.showSuccess('Request deleted successfully.')
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.showError('Error in deleting service request.')
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
        this.completedRequestCount = requestData.data.Completed === null ? 0 : requestData.data.Completed.length;
        this.totalRequestCount =
          this.pendingRequestCount + this.approvedRequestCount + this.completedRequestCount;

        console.log(this.pendingRequestCount);
        console.log(this.approvedRequestCount);
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
          this.showSuccess('Request submitted successfully.')
          this.displayAddRequestDialog = false;
          this.isFetching.set(false);
          this.selectedServiceType = null;
          this.selectedTimeSlot = null;
          this.selectedTimeSlotIndex = null;
        },
        error: (err) => {
          this.isFetching.set(false);
          this.showError('Error in submitting request.')
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

  showApproveRequestDialog(requestID: any){
    this.displayApproveRequestDialog = true;
    this.requestID = requestID;
  }

  hideApproveRequestDialog(){
    this.approveForm?.reset();
    this.assignedTo = '';
    this.displayApproveRequestDialog = false;
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
            this.selectedService = '';
            this.selectedStatus = '';
            this.isFetching.set(false);
          },
          error: (err) => {
            console.log(this.constants.errorSearchingRequests, err);
            this.selectedService = '';
            this.selectedStatus = '';
            this.isFetching.set(false);
          },
        });
    }
  }
}