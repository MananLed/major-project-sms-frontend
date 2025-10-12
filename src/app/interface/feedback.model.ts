export interface Feedback{
    rating: number,
    content: string
}

export interface FeedbackData{
    assignedto: string,
    content: string,
    date: string,
    flat: string,
    id: string,
    name: string,
    rating: number,
    request_id: string,
    resident_id: string,
    servicetype: string,
    timeslot: string,
} 

export interface FeedbackSuccessResponse {
  status: 'Success';
  message: string;
  data: FeedbackData[];
}

export interface ErrorResponse {
  status: 'fail';
  message: string;
  errorCode: number;
}

export type FeedbackResponse = FeedbackSuccessResponse | ErrorResponse;
