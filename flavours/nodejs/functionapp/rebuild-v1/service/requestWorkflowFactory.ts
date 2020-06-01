import { RequestWorkflow, RequestWorkflowRequest } from "./requestWorkflow";
import RebuildUrlRequestHandler from "./workflows/rebuildUrlWorkflow";
import StatusCodeHandler from "./workflows/statusCodeWorkflow";
import RebuildBase64Workflow from "./workflows/rebuildBase64Workflow";
import RebuildFileWorkflow from "./workflows/rebuildFileWorkflow";

class RequestWorkflowFactory {
    static GetRequestHandler(logger: { log: (message: string) => void }, request: RequestWorkflowRequest): RequestWorkflow {
        const resource = request.url.toLowerCase();
        const method = request.method.toLowerCase();
        let workflow: RequestWorkflow;

        if (resource.includes("/api/v1/rebuild/url") && method == "post") {
            workflow = new RebuildUrlRequestHandler(logger);
        }
        else
        if (resource.includes("/api/v1/rebuild/base64") && method == "post") {
            workflow = new RebuildBase64Workflow(logger);
        }
        else
        if (resource.includes("/api/v1/rebuild/file") && method == "post") {
            workflow = new RebuildFileWorkflow(logger);
        }
        else
        if (resource.includes("/api/v1/dummy") && method == "put") {
            workflow = new StatusCodeHandler(logger, 200);
            workflow.Response.headers["etag"] = "\"dummy\"";
            workflow.Response.rawBody = {
                Yes: true
            };
        }
        else
        if (resource.includes("/api/v1/health") && method == "get") {
            workflow = new StatusCodeHandler(logger, 200);
        }
        else {
            workflow = new StatusCodeHandler(logger, 404);
            logger.log("no route matched for " + resource + " method " + method);
        }

        workflow.Request = request;
        return workflow;
    }
}

export default RequestWorkflowFactory;