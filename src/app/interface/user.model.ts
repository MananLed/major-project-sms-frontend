export interface User {
  firstName: string;
  middleName: string;
  lastName: string;
  flat: string;
  mobile: string;
  password: string;
  email: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface Officer {
  email: string;
  password: string;
}

export interface UserData {
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile_number: string;
  email: string;
  flat: string;
  role: string;
  id: string;
}

export interface UserListSuccessResponse {
  status: 'Success';
  message: string;
  data: UserData[]; 
}

export interface ErrorResponse {
  status: 'fail';
  message: string;
  errorCode: number;
}

export type UserListResponse = UserListSuccessResponse | ErrorResponse;

export interface SocietyData {
  residentDetails: UserListResponse;
  officerDetails: UserListResponse;
}

