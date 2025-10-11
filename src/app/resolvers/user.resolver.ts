import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { catchError, forkJoin, Observable, of } from 'rxjs';

import { ApisService } from '../service/apis.service';
import { SocietyData, UserListResponse } from '../interface/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<SocietyData> {
  constructor(private api: ApisService) {}

  resolve(): Observable<SocietyData> {
    return forkJoin({
      residentDetails: this.api.getResidents().pipe(
        catchError((error) => {
          console.error('Error fetching resident details', error);
          return of({
            status: 'fail',
            message: 'Failed to fetch resident details.',
            errorCode: error.status,
          } as UserListResponse);
        })
      ),
      officerDetails: this.api.getOfficers().pipe(
        catchError((error) => {
          console.error('Error fetching officer details', error);
          return of({
            status: 'fail',
            message: 'Failed to fetch officer details.',
            errorCode: error.status,
          } as UserListResponse);
        })
      ),
    });
  }
}
