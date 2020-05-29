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
        this.Logger.log("Not Implemented method invoked: " + this.Request.path);
    }
}

export default StatusCodeWorkflow;