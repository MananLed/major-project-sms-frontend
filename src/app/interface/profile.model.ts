export interface Profile{
    firstname: string,
    middlename: string,
    lastname: string,
    email: string, 
    mobilenumber: string
}

export interface ChangePassword{
    oldPassword: string,
    newPassword: string 
}

export interface ProfileResponseData{
    email: string,
    first_name: string,
    flat: string,
    id: string,
    last_name: string,
    middle_name: string,
    mobile_number: string,
    password: string,
    role: string,
}

export interface ProfileSuccessResponse {
  status: 'Success'; 
  message: string;
  data: ProfileResponseData;
}

export interface ProfileErrorResponse {
  status: 'fail';
  message: string;
  errorCode: number;
  data?: any;
}

export type ProfileResponse = ProfileSuccessResponse | ProfileErrorResponse;