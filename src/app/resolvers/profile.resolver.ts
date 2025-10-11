import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApisService } from '../service/apis.service';
import { catchError, Observable, of } from 'rxjs';
import { ProfileResponse } from '../interface/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileResolver implements Resolve<ProfileResponse | null> {
  constructor(private api: ApisService) {}

  resolve(): Observable<ProfileResponse | null> {
    return this.api.profile().pipe(
      catchError((error) => {
        console.error('Error fetching profile data', error);
        return of({
          status: 'fail',
          message: 'Failed to fetch user profile.',
          errorCode: error.status,
        } as ProfileResponse);
      })
    );
  }
}
