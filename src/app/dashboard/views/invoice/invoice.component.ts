import { NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
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
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

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
    Message,
    Toast,
    Ripple,
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
  providers: [MessageService]
})
export class InvoiceComponent {
  isFetching = signal(false);

  visible: boolean = false;

  amount?: number | null;

  readonly constants = Constants;

  invoiceData!: InvoiceSuccessResponse;
  
  selectedYear: string = '';
  selectedMonth: string = '';
  userRole: string | null = null;

  filteredYears: Array<{ label: string; value: string }> = [];
  filteredMonths: Array<{ label: string; value: string }> = [];

  years: string[] = [];
  months: string[] = [];
  
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private auth: AuthService,
    private messageService: MessageService,
  ) {}

  showSuccess(message: string) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  filterYears(event: AutoCompleteCompleteEvent): void {
    const query = event.query;
    this.years = this.years.filter((year: string) =>
      year.toString().toLowerCase().includes(query.toLowerCase())
    );
    this.filteredYears = this.years.map((year: string) => ({
      label: year,
      value: year,
    }));
  }

  filterMonths(event: AutoCompleteCompleteEvent): void {
    const query = event.query;
    this.months = this.months.filter((month: string) =>
      month.toString().toLowerCase().includes(query.toLowerCase())
    );
    this.filteredMonths = this.months.map((month: string) => ({
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

    const yearsSet = new Set<string>();
    const monthsSet = new Set<string>();

    this.invoiceData.data.forEach((item: any) => {
      yearsSet.add(item.year);
      monthsSet.add(item.month);
    });

    this.years = [...yearsSet];

    this.months = [...monthsSet];

    this.filteredYears = this.years.map((year: string) => ({
      label: year,
      value: year,
    }));
    this.filteredMonths = this.months.map((month: string) => ({
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
        this.showSuccess('Invoice issued successfully.');
        this.isFetching.set(false);
      },
      error: (err) => {
        this.isFetching.set(false);
        this.showError(this.constants.errorAddingInvoice);
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
          this.selectedMonth = '';
          this.selectedYear = '';
          this.isFetching.set(false);
        },
        error: (err) => {
          console.error(this.constants.errorSearchingInvoice, err);
          this.selectedMonth = '';
          this.selectedYear = '';
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
          this.selectedMonth = '';
          this.selectedYear = '';
          this.isFetching.set(false);
        },
        error: (err) => {
          console.error(this.constants.errorSearchingInvoice, err);
          this.selectedMonth = '';
          this.selectedYear = '';
          this.isFetching.set(false);
          this.invoiceData = { status: 'Success', message: '', data: [] };
        },
      });
      return;
    }
  }
}
