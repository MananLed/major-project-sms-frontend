import { HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const token = localStorage.getItem('auth_token');

    if(token){
        const reqWithToken = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(reqWithToken);
    }

    return next(req);
}