import { Routes } from '@angular/router';
import { AuthGuard } from './service/auth.guard';
import { ProfileResolver } from './resolvers/profile.resolver';
import { FeedbackResolver } from './resolvers/feedback.resolver';
import { NoticeResolver } from './resolvers/notice.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { InvoiceResolver } from './resolvers/invoice.resolver';
import { DashboardResolver } from './resolvers/dashboard.resolver';
import { ServiceRequestResolver } from './resolvers/service-requests.resolver';
import { UserManagementGuard } from './service/user-managment.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login-signup/login-signup.component').then(
        (c) => c.LoginSignupComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/layout.component').then((c) => c.LayoutComponent),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/views/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
        resolve: {
          dashboardData: DashboardResolver,
        },
      },
      {
        path: 'request',
        loadComponent: () =>
          import(
            './dashboard/views/service-requests/service-requests.component'
          ).then((c) => c.ServiceRequestsComponent),
        resolve: {
          requestData: ServiceRequestResolver,
        },
      },
      {
        path: 'user-management',
        loadComponent: () =>
          import(
            './dashboard/views/user-management/user-management.component'
          ).then((c) => c.UserManagementComponent),
        canActivate: [UserManagementGuard],
        resolve: {
          societyData: UserResolver,
        },
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./dashboard/views/feedback/feedback.component').then(
            (c) => c.FeedbackComponent
          ),
        resolve: {
          userFeedback: FeedbackResolver,
        },
      },
      {
        path: 'invoice',
        loadComponent: () =>
          import('./dashboard/views/invoice/invoice.component').then(
            (c) => c.InvoiceComponent
          ),
        resolve: {
          invoiceData: InvoiceResolver,
        },
      },
      {
        path: 'notice',
        loadComponent: () =>
          import('./dashboard/views/notice/notice.component').then(
            (c) => c.NoticeComponent
          ),
        resolve: {
          societyNotices: NoticeResolver,
        },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./dashboard/views/profile/profile.component').then(
            (c) => c.ProfileComponent
          ),
        resolve: {
          userData: ProfileResolver,
        },
      },
    ],
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./dashboard/views/access-denied/access-denied.component').then(
        (c) => c.AccessDeniedComponent
      ),
  },
  { path: '**', redirectTo: 'access-denied', pathMatch: 'full' },
];
