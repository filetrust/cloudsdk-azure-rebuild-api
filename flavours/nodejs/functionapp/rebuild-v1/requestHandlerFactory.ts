import RebuildUrlRequestHandler from "./requestHandlers/rebuildUrlHandler";
import StatusCodeHandler from "./requestHandlers/statusCodeHandler";
import { RequestHandler } from "./requestHandler";

const RequestHandlerFactory = {
    GetRequestHandler: (path: string, logger: { log: (message: string) => void }): RequestHandler => {
        const resource = path.toLowerCase();

        if (resource.includes("/api/v1/rebuild/url")) {
            return new RebuildUrlRequestHandler(logger);
        }

        if (resource.includes("/api/v1/rebuild/base64")) {
            return new StatusCodeHandler(logger, 501);
        }

        if (resource.includes("/api/v1/rebuild/file")) {
            return new StatusCodeHandler(logger, 501);
        }

        if (resource.includes("/api/v1/dummy/put")) {
            return new StatusCodeHandler(logger, 200);
        }

        return new StatusCodeHandler(logger, 404);
    }
};

export default RequestHandlerFactory;