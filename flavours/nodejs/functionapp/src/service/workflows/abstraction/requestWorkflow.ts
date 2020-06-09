import { ArgumentNullException } from "../../../common/errors/errors";

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

export class RequestWorkflowBase implements RequestWorkflow {
    Request: RequestWorkflowRequest
    Response: RequestWorkflowResponse

    Logger: { log: (message: string) => void  }

    constructor(logger: { log: (message: string) => void  }, request: RequestWorkflowRequest) {
        if (!logger) {
            throw new ArgumentNullException("logger");
        }
        
        if (!request) {
            throw new ArgumentNullException("request");
        }

        this.Logger = logger;
        this.Request = request;
        this.Response = {
            headers: {
                
            }
        };
    }

    Handle(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}