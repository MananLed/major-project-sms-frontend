export interface Notice{
    content: string
}

export interface NoticeData{
    id: string,
    date_issued: string,
    content: string, 
    month: number,
    year: number,
}

export interface NoticeSuccessResponse {
  status: 'Success';
  message: string;
  data: Notice[];
}

export interface ErrorResponse {
  status: 'fail';
  message: string;
  errorCode: number;
}

export type NoticeResponse = NoticeSuccessResponse | ErrorResponse;

