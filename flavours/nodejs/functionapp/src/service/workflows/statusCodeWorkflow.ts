import { RequestWorkflowBase, RequestWorkflowRequest } from "./abstraction/requestWorkflow";

class StatusCodeWorkflow extends RequestWorkflowBase {
    constructor(
        logger: { log: (message: string) => void },
        request: RequestWorkflowRequest, 
        statusCode: number,
        headers?: { [header: string]: string })
    {
        super(logger, request);

        this.Response.statusCode = statusCode;

        if (headers)
        {
            this.Response.headers = headers;
        }
    }

    async Handle(): Promise<void> {
        this.Logger.log(`Status code workflow invoked for status code ${this.Response.statusCode}`);
    }
}

export default StatusCodeWorkflow;