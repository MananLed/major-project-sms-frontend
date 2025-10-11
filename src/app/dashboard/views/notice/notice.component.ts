import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';

import { ApisService } from '../../../service/apis.service';
import { LoaderComponent } from '../loader/loader.component';
import { AuthService } from '../../../service/auth.service';
import { NoticeSuccessResponse } from '../../../interface/notice.model';
import { Constants } from '../../../shared/constants';

@Component({
  selector: 'app-notice',
  imports: [
    AutoComplete,
    ButtonModule,
    FormsModule,
    TableModule,
    NgIf,
    NgFor,
    DialogModule,
    LoaderComponent,
    Tooltip,
    CommonModule,
  ],
  templateUrl: './notice.component.html',
  styleUrl: './notice.component.scss',
})
export class NoticeComponent implements OnInit {
  societyNotices!: NoticeSuccessResponse;
  isFetching = signal(false);
  content!: string;
  visible: boolean = false;
  userRole: string | null = null;
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;

  readonly constants = Constants;

  selectedItem: any;

  selectedYear: any = null;
  selectedMonth: any = null;

  filteredYears!: any[];
  filteredMonths!: any[];

  years: any = [];
  months: any = [];


  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private auth: AuthService
  ) {}

  filterYears(event: any) {
    const query = event.query;
    this.filteredYears = this.years.filter((year: any) =>
      this.years.toString().toLowerCase().includes(query.toLowerCase())
    );
    this.filteredYears = this.years.map((year: any) => ({
      label: year,
      value: year,
    }));
  }

  filterMonths(event: any) {
    const query = event.query;
    this.filteredMonths = this.months.filter((month: any) =>
      month.toString().toLowerCase().includes(query.toLowerCase())
    );
    this.filteredMonths = this.months.map((month: any) => ({
      label: month,
      value: month,
    }));
  }

  ngOnInit(): void {
    this.societyNotices = this.route.snapshot.data['societyNotices'];
    console.log(this.societyNotices);
    this.userRole = this.auth.getRole();
    this.isAdmin = this.auth.isAdmin();
    this.isOfficer = this.auth.isOfficer();
    this.isResident = this.auth.isResident();

    const yearsSet = new Set<any>();
    const monthsSet = new Set<any>();

    this.societyNotices.data.forEach((item: any) => {
      yearsSet.add(item.year);
      monthsSet.add(item.month);
    });

    this.years = [...yearsSet];
    this.months = [...monthsSet];

    this.filteredYears = [...this.years];
    this.filteredMonths = [...this.months];

    this.filteredYears = this.years.map((year: any) => ({
      label: year,
      value: year,
    }));
    this.filteredMonths = this.months.map((month: any) => ({
      label: month,
      value: month,
    }));
  }

  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.visible = false;
  }

  fetchNotices(): void {
    this.api.getNotices().subscribe({
      next: (res: NoticeSuccessResponse) => {
        this.societyNotices = res;
      },
      error: (err) => {
        console.error(this.constants.errorFetchingNotices, err);
      },
    });
  }

  searchNotice(){
    if(!this.selectedYear && !this.selectedMonth){
      this.isFetching.set(true);
      this.fetchNotices();
      this.isFetching.set(false);
      return;
    }

    if(!this.selectedMonth && this.selectedYear){
      this.isFetching.set(true);
      this.api.searchNotice(null, this.selectedYear).subscribe({
        next: (res) => {
          this.societyNotices = res;
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        },
        error: (err) => {
          console.error(this.constants.errorSearchingNotices, err);
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        }
      });
      return;
    }

    if(this.selectedMonth && this.selectedYear){
      this.isFetching.set(true);
      this.api.searchNotice(this.selectedMonth, this.selectedYear).subscribe({
        next: (res) => {
          console.log(res);
          console.log(this.selectedMonth);
          console.log(this.selectedYear);
          this.societyNotices = res;
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        },
        error: (err) => {
          console.error(this.constants.errorFetchingNotices, err);
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        }
      });
      return;
    }
  }

  issueNotice(): void {
    this.isFetching.set(true);

    if (this.content === '') {
      this.isFetching.set(false);
      return;
    }

    this.api.putNotice({ content: this.content }).subscribe({
      next: (res) => {
        this.fetchNotices();
        this.visible = false;
        this.content = '';
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        console.error(this.constants.errorAddingNotices, err);
      },
    });
  }
}
