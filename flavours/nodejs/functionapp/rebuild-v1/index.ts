import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { requestHandlerArgs } from "./requestHandler";
import RequestHandlerFactory from "./requestHandlerFactory";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log("HTTP trigger function processed a request.");

    const handler = RequestHandlerFactory.GetRequestHandler(req.url, context);

    const handlerArgs: requestHandlerArgs = {
        path: req.url,
        headers: req.headers,
        rawBody: req.body
    };

    try {
        const handlerResponse = await handler.Handle(handlerArgs);

        if (handlerResponse.headers) {
            Object.keys(handlerResponse.headers).forEach(header => {
                context.res.setHeader(header, handlerResponse.headers[header]);
            });
        }

        context.res.setHeader("Access-Control-Expose-Headers", "*");
        context.res.setHeader("Access-Control-Allow-Headers", "*");
        context.res.setHeader("Access-Control-Allow-Origin", "*");

        if (handlerResponse.rawBody) {
            context.res.body = handlerResponse.rawBody;
        }

        context.res.statusCode = handlerResponse.statusCode;
    }
    catch (err) {
        context.log(err);
        context.res.statusCode = 500;
    }
    finally {        
        try {
            if (global.gc) {
                console.log("GC ran");
                global.gc();
                context.res.setHeader("GC-RAN", "true");
            }

            context.res.setHeader("GC-RAN", "false");
        } catch (e) {
            console.log("`node --expose-gc index.js`");
            process.exit();
        }
    }
};

export default httpTrigger;