import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApisService } from '../service/apis.service';
import { catchError, Observable, of } from 'rxjs';
import { ErrorResponse, FeedbackResponse } from '../interface/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackResolver implements Resolve<FeedbackResponse> {
  constructor(private api: ApisService) {}

  resolve(): Observable<FeedbackResponse> {
    return this.api.getFeedbacks().pipe(
      catchError((error) => {
        console.error('Error fetching the feedback data', error);
  
        return of({
          status: 'fail',
          message: 'Failed to fetch feedback data.',
          errorCode: error.status,
        } as ErrorResponse);
      })
    );
  }
}
