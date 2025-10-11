import { Injectable } from "@angular/core";
import { ApisService } from "../service/apis.service";
import { catchError, Observable, of } from "rxjs";
import { Resolve } from "@angular/router";
import { AuthService } from "../service/auth.service";

@Injectable({
    providedIn: 'root', 
})
export class ServiceRequestResolver implements Resolve<any> {
    constructor(private api: ApisService, private auth: AuthService) {}
    
    resolve(): Observable<any> {

        const methodName = this.auth.isResident() ? 'getAllRequestsOfResident' : 'getAllRequests';
        return this.api[methodName]().pipe(
            catchError((error) => {
                console.log('Error fetching the request data', error)
                return of(null);
            })
        );
    }

}