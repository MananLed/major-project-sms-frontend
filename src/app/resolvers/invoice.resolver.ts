import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApisService } from '../service/apis.service';
import { catchError, Observable, of } from 'rxjs';
import { InvoiceResponse } from '../interface/invoice.model';
import { ErrorResponse } from '../interface/user.model';

@Injectable({
  providedIn: 'root',
})
export class InvoiceResolver implements Resolve<InvoiceResponse> {
  constructor(private api: ApisService) {}

  resolve(): Observable<InvoiceResponse> {
    return this.api.getInvoices().pipe(
      catchError((error) => {
        console.error('Error fetching the invoice data', error);
        return of({
          status: 'fail',
          message: 'Failed to fetch invoice data.',
          errorCode: error.status,
        } as ErrorResponse);
      })
    );
  }
}
