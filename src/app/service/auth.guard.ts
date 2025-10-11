import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router, UrlTree } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private auth: AuthService, private router: Router){

    }

    canActivate(): boolean | UrlTree {
        return this.checkLogin();
    }

    canActivateChild(): boolean | UrlTree {
        return this.checkLogin();
    }

    private checkLogin(): boolean | UrlTree {
        if (this.auth.isLoggedIn()){
            return true;
        }
        return this.router.parseUrl('/login');
    }
}