import { RequestHandler, requestHandlerReturnType, requestHandlerArgs } from "../requestHandler";

class StatusCodeHandler implements RequestHandler {
    Logger: { log: (message: string) => void };
    StatusCode: number;

    constructor(logger: { log: (message: string) => void }, statusCode: number)
    {
        this.Logger = logger;
        this.StatusCode = statusCode;
    }

    async Handle(args: requestHandlerArgs): Promise<requestHandlerReturnType> {
        this.Logger.log("Not Implemented method invoked: " + args.path);

        return {
            headers: args.headers,
            statusCode: this.StatusCode
        };
    }
}

export default StatusCodeHandler;