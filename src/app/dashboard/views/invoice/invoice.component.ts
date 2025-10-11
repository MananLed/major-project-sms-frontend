import { NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';

import { ApisService } from '../../../service/apis.service';
import { LoaderComponent } from '../loader/loader.component';
import { AuthService } from '../../../service/auth.service';
import { InvoiceSuccessResponse } from '../../../interface/invoice.model';
import { Constants } from '../../../shared/constants';

@Component({
  selector: 'app-invoice',
  imports: [
    AutoComplete,
    ButtonModule,
    FormsModule,
    TableModule,
    NgIf,
    DialogModule,
    FloatLabelModule,
    LoaderComponent,
    InputTextModule,
    Tooltip,
    InputMaskModule,
    Message
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
})
export class InvoiceComponent {
  isFetching = signal(false);

  visible: boolean = false;
  amount?: number | null;

  readonly constants = Constants;

  invoiceData!: InvoiceSuccessResponse;

  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private auth: AuthService
  ) {}

  selectedYear: any = null;
  selectedMonth: any = null;

  filteredYears!: any[];
  filteredMonths!: any[];

  years: any = [];
  months: any = [];

  userRole: string | null = null;
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;

  filterYears(event: any): void {
    const query = event.query;
    this.filteredYears = this.years.filter((year: any) =>
      year.toString().toLowerCase().includes(query.toLowerCase())
    );
    this.filteredYears = this.years.map((year: any) => ({
      label: year,
      value: year,
    }));
  }

  filterMonths(event: any): void {
    const query = event.query;
    this.filteredMonths = this.months.filter((month: any) =>
      month.toString().toLowerCase().includes(query.toLowerCase())
    );
    this.filteredMonths = this.months.map((month: any) => ({
      label: month,
      value: month,
    }));
  }

  showDialog(): void {
    this.visible = true;
  }

  hideDialog(): void {
    this.visible = false;
  }

  ngOnInit(): void {
    this.invoiceData = this.route.snapshot.data['invoiceData'];
    this.userRole = this.auth.getRole();
    this.isAdmin = this.auth.isAdmin();
    this.isOfficer = this.auth.isOfficer();
    this.isResident = this.auth.isResident();

    console.log(this.invoiceData);

    const yearsSet = new Set<any>();
    const monthsSet = new Set<any>();

    this.invoiceData.data.forEach((item: any) => {
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

  resetDialog(): void{
    this.amount = null;
  }

  fetchInvoices(): void {
    this.api.getInvoices().subscribe({
      next: (res) => {
        this.invoiceData = res;
      },
      error: (err) => {
        console.error(this.constants.errorFetchingInvoices, err);
      },
    });
  }

  issueInvoice(): void {
    this.isFetching.set(true);

    if (Number(this.amount) <= 0) {
      this.isFetching.set(false);
      return;
    }

    this.api.putInvoice({ amount: Number(this.amount) }).subscribe({
      next: (res: InvoiceSuccessResponse) => {
        this.fetchInvoices();
        this.visible = false;
        this.amount = null;
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        console.error(this.constants.errorAddingInvoice, err);
      },
    });
  }

  searchInvoice(): void {
    if (!this.selectedYear && !this.selectedMonth) {
      this.isFetching.set(true);
      this.fetchInvoices();
      this.isFetching.set(false);
      return;
    }

    if (!this.selectedMonth && this.selectedYear) {
      this.isFetching.set(true);
      this.api.searchInvoice(null, this.selectedYear).subscribe({
        next: (res) => {
          this.invoiceData = res;
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        },
        error: (err) => {
          console.error(this.constants.errorSearchingInvoice, err);
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        },
      });
      return;
    }

    if (this.selectedMonth && this.selectedYear) {
      this.isFetching.set(true);
      this.api.searchInvoice(this.selectedMonth, this.selectedYear).subscribe({
        next: (res) => {
          console.log(res);
          console.log(this.selectedMonth);
          console.log(this.selectedYear);
          if (res && res.data) {
            if (!Array.isArray(res.data)) {
              this.invoiceData = { ...res, data: [res.data] };
            } else {
              this.invoiceData = res;
            }
          } else {
            this.invoiceData = { status: 'Success', message: '', data: [] };
          }
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
        },
        error: (err) => {
          console.error(this.constants.errorSearchingInvoice, err);
          this.selectedMonth = null;
          this.selectedYear = null;
          this.isFetching.set(false);
          this.invoiceData = { status: 'Success', message: '', data: [] };
        },
      });
      return;
    }
  }
}
