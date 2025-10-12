import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApisService } from '../service/apis.service';
import { catchError, Observable, of } from 'rxjs';
import { ErrorResponse, FeedbackResponse, FeedbackSuccessResponse } from '../interface/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackResolver implements Resolve<FeedbackSuccessResponse | null> {
  constructor(private api: ApisService) {}

  resolve(): Observable<FeedbackSuccessResponse | null> {
    return this.api.getFeedbacks().pipe(
      catchError((error) => {
        console.error('Error fetching the feedback data', error);
        return of(null);
      })
    );
  }
}
