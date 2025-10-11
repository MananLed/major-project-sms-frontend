import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginUser, Officer, User } from '../interface/user.model';
import { Invoice } from '../interface/invoice.model';
import { Notice } from '../interface/notice.model';
import { ChangePassword, Profile } from '../interface/profile.model';
import { Feedback } from '../interface/feedback.model';
import { ServiceRequest } from '../interface/request.model';

@Injectable({
  providedIn: 'root'
})
export class ApisService {

  baseUrl = "http://localhost:8080";

  constructor(private http:HttpClient) {

  }

  signUp(userData :User): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, userData);
  }

  login(userData :LoginUser): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, userData);
  }

  profile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`);
  }

  getFeedbacks(): Observable<any>{
    return this.http.get(`${this.baseUrl}/feedbacks`);
  }

  getNotices(): Observable<any>{
    return this.http.get(`${this.baseUrl}/notices`);
  }

  getResidents(): Observable<any>{
    return this.http.get(`${this.baseUrl}/society/residents`);
  }

  getOfficers(): Observable<any>{
    return this.http.get(`${this.baseUrl}/society/officers`);
  }

  getInvoices(): Observable<any>{
    const params = new HttpParams().set('year', '0');
    return this.http.get(`${this.baseUrl}/invoices/month-year`, {params});
  }

  putInvoice(invoice: Invoice): Observable<any>{
    return this.http.post(`${this.baseUrl}/invoices/issue`, invoice);
  }

  putNotice(notice: Notice): Observable<any>{
    return this.http.post(`${this.baseUrl}/notices/issue`, notice);
  }

  putOfficer(officer: Officer): Observable<any>{
    return this.http.post(`${this.baseUrl}/officers`, officer);
  }

  updateProfile(profile: Profile): Observable<any>{
    return this.http.patch(`${this.baseUrl}/profile/update`, profile);
  }

  putFeedback(feedback: Feedback): Observable<any>{
    return this.http.post(`${this.baseUrl}/feedbacks`, feedback);
  }

  getResidentCount(): Observable<any>{
    return this.http.get(`${this.baseUrl}/society/residents/count`);
  }

  getOfficerCount(): Observable<any>{
    return this.http.get(`${this.baseUrl}/society/officers/count`);
  }

  getAllRequests(): Observable<any>{
    return this.http.get(`${this.baseUrl}/service/all`);
  }

  getAllRequestsOfResident(): Observable<any>{
    return this.http.get(`${this.baseUrl}/service/resident/all`);
  }

  updatePassword(passwordDetails: ChangePassword): Observable<any>{
    return this.http.patch(`${this.baseUrl}/profile/password`, passwordDetails);
  }

  deleteProfile(): Observable<any>{
    return this.http.delete(`${this.baseUrl}/profile`);
  }

  getAvailableTimeSlots(serviceType: string): Observable<any>{
    return this.http.get(`${this.baseUrl}/service/time-slots`, {
      params: {serviceType}
    });
  }

  deleteRequest(id: any): Observable<any>{
    return this.http.delete(`${this.baseUrl}/service/cancel/${id}`);
  }

  approveRequest(id: any): Observable<any>{
    return this.http.patch(`${this.baseUrl}/service/approve/${id}`, {});
  }

  rescheduleRequest(id: any, slot: {slot: number}): Observable<any>{
    return this.http.patch(`${this.baseUrl}/service/reschedule/${id}`, slot);
  }

  putRequest(service: ServiceRequest): Observable<any>{
    return this.http.post(`${this.baseUrl}/service`, service);
  }

  deleteOfficer(officerID: any): Observable<any>{
    const params = new HttpParams().set('id', officerID);
    return this.http.delete(`${this.baseUrl}/credentials/officer`, {params});
  }

  deleteResident(residentID: any): Observable<any>{
    const params = new HttpParams().set('id', residentID);
    return this.http.delete(`${this.baseUrl}/credentials/resident`, {params});
  }

  searchNotice(selectedMonth: any, selectedYear: any): Observable<any>{
    if(selectedMonth == null){
      const params = new HttpParams().set('year', selectedYear);
      return this.http.get(`${this.baseUrl}/notices/month-year`, {params});
    }else{
      const params = new HttpParams().set('month', selectedMonth).set('year', selectedYear);
      return this.http.get(`${this.baseUrl}/notices/month-year`, {params});
    }
  }

  searchInvoice(selectedMonth: any, selectedYear: any): Observable<any>{
    if(selectedMonth == null){
      const params = new HttpParams().set('year', selectedYear);
      return this.http.get(`${this.baseUrl}/invoices/month-year`, {params});
    }else{
      const params = new HttpParams().set('month', selectedMonth).set('year', selectedYear);
      return this.http.get(`${this.baseUrl}/invoices/month-year`, {params});
    }
  }

  searchRequests(selectedService: any, selectedStatus: any): Observable<any>{
    const params = new HttpParams().set('status', selectedStatus).set('serviceType', selectedService);
    return this.http.get(`${this.baseUrl}/service/type-status`, {params});
  }
}
