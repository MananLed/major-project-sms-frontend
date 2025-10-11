import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Menu } from 'primeng/menu';
import { Menubar } from 'primeng/menubar';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    CardModule,
    ButtonModule,
    CommonModule,
    RouterModule,
    Menu,
    AvatarModule,
    Menubar,
    RouterOutlet,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  userRole: string | null = null;
  isAdmin: boolean = false;
  isOfficer: boolean = false;
  isResident: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  items: MenuItem[] = [];

  ngOnInit() {
    this.userRole = this.auth.getRole();
    this.isAdmin = this.auth.isAdmin();
    this.isOfficer = this.auth.isOfficer();
    this.isResident = this.auth.isResident();

    if(this.isAdmin){
      this.items = [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
        {
          label: 'Service Requests',
          icon: 'pi pi-briefcase',
          routerLink: ['/dashboard/request'],
        },
        {
          label: 'User Management',
          icon: 'pi pi-users',
          routerLink: ['/dashboard/user-management'],
        },
        {
          label: 'Feedback',
          icon: 'pi pi-comment',
          routerLink: ['/dashboard/feedback'],
        },
        {
          label: 'Invoice',
          icon: 'pi pi-file',
          routerLink: ['/dashboard/invoice'],
        },
        {
          label: 'Notice',
          icon: 'pi pi-bell',
          routerLink: ['/dashboard/notice'],
        },
        {
          label: 'Profile',
          icon: 'pi pi-user',
          routerLink: ['/dashboard/profile'],
        },
      ];
    }else{
      this.items = [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
        {
          label: 'Service Requests',
          icon: 'pi pi-briefcase',
          routerLink: ['/dashboard/request'],
        },
        {
          label: 'Feedback',
          icon: 'pi pi-comment',
          routerLink: ['/dashboard/feedback'],
        },
        {
          label: 'Invoice',
          icon: 'pi pi-file',
          routerLink: ['/dashboard/invoice'],
        },
        {
          label: 'Notice',
          icon: 'pi pi-bell',
          routerLink: ['/dashboard/notice'],
        },
        {
          label: 'Profile',
          icon: 'pi pi-user',
          routerLink: ['/dashboard/profile'],
        },
      ];
    }

  }

  logout() {
    this.auth.logoutUser();
    this.router.navigate(['/login']);
  }
}
