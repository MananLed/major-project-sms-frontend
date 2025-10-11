export interface CountResponse{
    status: 'Success',
    message: string,
    data: number,
}

export interface Request{
    end_time: string,
    flat: string,
    request_id: string,
    resident_id: string,
    service_type: string,
    start_time: string,
    status: string,
    time_slot: string,
}

export interface RequestData{
    Approved: Request[] | null,
    Pending: Request[] | null,
}

export interface RequestsResponse {
  status: 'Success';
  message: string;
  data: RequestData;
}

export interface ErrorResponse{
    status: 'fail',
    message: string,
    errorCode: number,
}

export interface DashboardData {
  residentCount: CountResponse | ErrorResponse | null;
  officerCount: CountResponse | ErrorResponse | null;
  requestCount: RequestsResponse | ErrorResponse | null;
}