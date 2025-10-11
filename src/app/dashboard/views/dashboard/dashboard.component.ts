import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule} from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../../service/auth.service';
import { CountResponse, DashboardData, RequestsResponse } from '../../../interface/dashboard.model';
import { Constants } from '../../../shared/constants';


@Component({
  selector: 'app-dashboard',
  imports: [CardModule, ButtonModule, CommonModule, RouterModule, AvatarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  residentCount?: CountResponse;
  officerCount?: CountResponse;
  requestCount?: RequestsResponse;

  pendingRequestCount: number = 0;
  approvedRequestCount: number = 0;

  userRole: string | null = null;
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;

  readonly constants = Constants;

  constructor(private auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const dashboardData = this.route.snapshot.data['dashboardData'] as DashboardData;

    if (dashboardData.residentCount?.status === 'Success') {
      this.residentCount = dashboardData.residentCount;
    }
    if (dashboardData.officerCount?.status === 'Success') {
      this.officerCount = dashboardData.officerCount;
    }
    if (dashboardData.requestCount?.status === 'Success') {
      this.requestCount = dashboardData.requestCount;
      this.pendingRequestCount = this.requestCount.data.Pending?.length ?? 0;
      this.approvedRequestCount = this.requestCount.data.Approved?.length ?? 0;
    }

    console.log('Resident Count: ', this.residentCount);
    console.log('Officer Count: ', this.officerCount);
    console.log('Request Count:', this.requestCount);
    console.log(this.pendingRequestCount);
    console.log(this.approvedRequestCount);

    if (this.auth.isLoggedIn()) {
      this.userRole = this.auth.getRole();
      this.isAdmin = this.auth.isAdmin();
      this.isOfficer = this.auth.isOfficer();
      this.isResident = this.auth.isResident();
    }
  }
}
