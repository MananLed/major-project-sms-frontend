import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { ApisService } from "../service/apis.service";
import { catchError, forkJoin, Observable, of } from "rxjs";
import { AuthService } from "../service/auth.service";
import { CountResponse, DashboardData, RequestsResponse } from "../interface/dashboard.model";
import { ErrorResponse } from "../interface/user.model";

@Injectable({
    providedIn: 'root',
})
export class DashboardResolver implements Resolve<DashboardData> {
  constructor(private api: ApisService, private auth: AuthService) {}

  resolve(): Observable<DashboardData> {
    const methodName = this.auth.isResident() ? 'getAllRequestsOfResident' : 'getAllRequests';

    return forkJoin({
      residentCount: this.api.getResidentCount().pipe(
        catchError((error) => {
          console.error('Error fetching the number of residents', error);
          return of({ status: 'fail', message: 'Failed to fetch resident count.', errorCode: error.status } as ErrorResponse);
        })
      ) as Observable<CountResponse | ErrorResponse>,
      officerCount: this.api.getOfficerCount().pipe(
        catchError((error) => {
          console.error('Error fetching the number of officers', error);
          return of({ status: 'fail', message: 'Failed to fetch officer count.', errorCode: error.status } as ErrorResponse);
        })
      ) as Observable<CountResponse | ErrorResponse>,
      requestCount: this.api[methodName]().pipe(
        catchError((error) => {
          console.error('Error fetching all the requests', error);
          return of({ status: 'fail', message: 'Failed to fetch requests.', errorCode: error.status } as ErrorResponse);
        })
      ) as Observable<RequestsResponse | ErrorResponse>
    });
  }
}