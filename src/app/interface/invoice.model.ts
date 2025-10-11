export interface Invoice{
    amount: number
}

export interface InvoiceData{
    id: string,
    amount: number,
    month: number,
    year: number,
}

export interface InvoiceSuccessResponse{
    status: 'Success',
    message: string,
    data: Invoice[],
}

export interface ErrorResponse{
    status: 'fail',
    message: string,
    errorCode: number,
}

export type InvoiceResponse = InvoiceSuccessResponse | ErrorResponse;