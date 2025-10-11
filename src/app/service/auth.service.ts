import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly token = 'auth_token';
  private readonly email = 'auth_email';
  private readonly role = 'auth_role';

  loginUser(token: string, email: string, role: string){
    localStorage.setItem(this.token, token);
    localStorage.setItem(this.email, email);
    localStorage.setItem(this.role, role);
  }

  logoutUser(){
    localStorage.clear();
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem(this.token);
  }

  getRole(): string | null{
    return localStorage.getItem(this.role);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.email);
  }

  isAdmin() :boolean{
    return localStorage.getItem(this.role) === 'admin';
  }
  
  isOfficer() :boolean{
    return localStorage.getItem(this.role) === 'officer';
  }

  isResident() :boolean{
    return localStorage.getItem(this.role) === 'resident';
  }
}
