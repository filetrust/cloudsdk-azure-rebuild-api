/* eslint-disable @typescript-eslint/no-explicit-any */
export type RequestWorkflowRequest = {
    path: string;
    method: string;
    rawBody?: any;
    headers?: { [header: string]: string };
    logger: { log: (message: string) => void };
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