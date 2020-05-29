import RebuildUrlRequestHandler from "./workflows/rebuildUrlWorkflow";
import StatusCodeHandler from "./workflows/statusCodeWorkflow";
import { RequestWorkflow, RequestWorkflowRequest } from "./requestWorkflow";

class RequestWorkflowFactory {
    static GetRequestHandler(request: RequestWorkflowRequest): RequestWorkflow {
        const resource = request.path.toLowerCase();
        const method = request.method.toLowerCase();
        let workflow: RequestWorkflow;

        if (resource.includes("/api/v1/rebuild/url") && method == "post") {
            workflow = new RebuildUrlRequestHandler(request.logger);
        }
        else
        if (resource.includes("/api/v1/rebuild/base64") && method == "post") {
            workflow = new StatusCodeHandler(request.logger, 501);
        }
        else
        if (resource.includes("/api/v1/rebuild/file") && method == "post") {
            workflow = new StatusCodeHandler(request.logger, 501);
        }
        else
        if (resource.includes("/api/v1/dummy") && method == "put") {
            workflow = new StatusCodeHandler(request.logger, 200);
            workflow.Response.headers["etag"] = "\"dummy\"";
            workflow.Response.rawBody = {
                Yes: true
            };
        }
        else
        if (resource.includes("/api/v1/health") && method == "get") {
            workflow = new StatusCodeHandler(request.logger, 200);
        }
        else {
            workflow = new StatusCodeHandler(request.logger, 404);
            request.logger.log("no route matched for " + resource + " method " + method);
        }

        workflow.Request = request;
        return workflow;
    }
}

export default RequestWorkflowFactory;