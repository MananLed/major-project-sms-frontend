import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { AuthService } from '../../../service/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { ApisService } from '../../../service/apis.service';
import { FeedbackSuccessResponse } from '../../../interface/feedback.model';
import { Constants } from '../../../shared/constants';
import { Avatar } from "primeng/avatar";
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-feedback',
  imports: [
    TableModule,
    ButtonModule,
    NgIf,
    Tooltip,
    DialogModule,
    AutoCompleteModule,
    FormsModule,
    LoaderComponent,
    Avatar,
    RatingModule,
    TagModule,
    CommonModule,
    Toast,
    Ripple,

],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
  providers: [MessageService]
})
export class FeedbackComponent implements OnInit {
  userFeedback!: FeedbackSuccessResponse;
  userRole: string | null = null;
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;
  isFetching = signal(false);
  content!: string;
  rating!: number;

  readonly constants = Constants;

  constructor(private route: ActivatedRoute, private auth: AuthService, private api:ApisService, private messageService: MessageService) {}

  showSuccess(message: string): void {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  ngOnInit(): void {
    this.userFeedback = this.route.snapshot.data['userFeedback'];
    console.log(this.userFeedback);
    this.userRole = this.auth.getRole();
    this.isAdmin = this.auth.isAdmin();
    this.isOfficer = this.auth.isOfficer();
    this.isResident = this.auth.isResident();
  }

  fetchFeedbacks(): void{
    this.api.getFeedbacks().subscribe({
      next: (res) => {
        this.userFeedback = res;
      },
      error: (err) => {
        this.showError(this.constants.errorFetchingFeedbacks);
        console.error(this.constants.errorFetchingFeedbacks, err);
      },
    });
  }
}
