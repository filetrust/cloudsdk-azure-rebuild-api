import { RequestWorkflow, RequestWorkflowRequest } from "./workflows/abstraction/requestWorkflow";
import RebuildUrlRequestHandler from "./workflows/rebuildUrlWorkflow";
import StatusCodeHandler from "./workflows/statusCodeWorkflow";
import RebuildBase64Workflow from "./workflows/rebuildBase64Workflow";
import RebuildFileWorkflow from "./workflows/rebuildFileWorkflow";

class RequestWorkflowFactory {
    static GetRequestHandler(logger: { log: (message: string) => void }, request: RequestWorkflowRequest): RequestWorkflow {
        const resource = request.url.toLowerCase();
        const method = request.method.toLowerCase();

        if (resource.includes("/api/v1/rebuild/url") && method == "post") {
            return new RebuildUrlRequestHandler(logger, request);
        }
        
        if (resource.includes("/api/v1/rebuild/base64") && method == "post") {
            return new RebuildBase64Workflow(logger, request);
        }
        
        if (resource.includes("/api/v1/rebuild/file") && method == "post") {
            return new RebuildFileWorkflow(logger, request);
        }
        
        if (resource.includes("/api/v1/dummy") && method == "put") {
            return new StatusCodeHandler(logger, request, 200, { "etag": "\"dummy\"" });
        }
        
        if (resource.includes("/api/v1/health") && method == "get") {
            return  new StatusCodeHandler(logger, request, 200);
        }

        logger.log("no route matched for " + resource + " method " + method);
        return new StatusCodeHandler(logger, request, 404);
    }
}

export default RequestWorkflowFactory;