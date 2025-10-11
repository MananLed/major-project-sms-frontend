import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root',  
})
export class UserManagementGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}

    canActivate(): boolean | UrlTree{
        console.log('visited');
        if (this.auth.isAdmin()){
            return true;
        }else{
            console.log('Close to link');
            return this.router.parseUrl('/access-denied');
        }
    }
}