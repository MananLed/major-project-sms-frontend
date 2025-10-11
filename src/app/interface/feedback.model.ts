export interface Feedback{
    rating: number,
    content: string
}

export interface FeedbackData{
    content: string,
    flat: string,
    id: string,
    name: string,
    rating: number,
    resident_id: string,
}

export interface FeedbackSuccessResponse {
  status: 'Success';
  message: string;
  data: Feedback[];
}

export interface ErrorResponse {
  status: 'fail';
  message: string;
  errorCode: number;
}

export type FeedbackResponse = FeedbackSuccessResponse | ErrorResponse;
