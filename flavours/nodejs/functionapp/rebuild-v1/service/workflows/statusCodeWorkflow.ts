import { RequestWorkflow, RequestWorkflowRequest, RequestWorkflowResponse } from "../requestWorkflow";

class StatusCodeWorkflow implements RequestWorkflow {
    Logger: { log: (message: string) => void };

    Request: RequestWorkflowRequest;
    Response: RequestWorkflowResponse;

    constructor(logger: { log: (message: string) => void }, statusCode: number)
    {
        this.Logger = logger;
        this.Response = {
            headers: { },
            statusCode
        };
    }

    async Handle(): Promise<void> {
        this.Logger.log("Status code workflow invoked for url: " + this.Request.url);
    }
}

export default StatusCodeWorkflow;