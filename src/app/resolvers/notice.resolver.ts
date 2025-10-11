import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApisService } from '../service/apis.service';
import { catchError, Observable, of } from 'rxjs';
import { ErrorResponse, NoticeResponse } from '../interface/notice.model';

@Injectable({
  providedIn: 'root',
})
export class NoticeResolver implements Resolve<NoticeResponse> {
  constructor(private api: ApisService) {}

  resolve(): Observable<NoticeResponse> {
    return this.api.getNotices().pipe(
      catchError((error) => {
        console.error('Error fetching the notice data', error);
        return of({
          status: 'fail',
          message: 'Failed to fetch notice data.',
          errorCode: error.status,
        } as ErrorResponse);
      })
    );
  }
}
