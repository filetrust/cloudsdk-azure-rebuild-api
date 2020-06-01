/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RequestWorkflowRequest {
    url: string;
    method: string;
    body?: any;
    headers?: { [header: string]: string };
}

export type RequestWorkflowResponse = {
    rawBody?: any;
    statusCode?: number;
    headers?: {
        [key: string]: any;
    };
}

export type ResponseHeaders = { [header: string]: string }

export interface RequestWorkflow {
    Request: RequestWorkflowRequest;

    Response: RequestWorkflowResponse;

    Handle(): Promise<void>;
}