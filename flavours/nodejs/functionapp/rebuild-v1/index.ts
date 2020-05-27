import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import RequestHandlerFactory from "./requestHandlerFactory";
import { requestHandlerArgs } from "./requestHandler";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
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

        if (handlerResponse.rawBody)
        {
            context.res.body = handlerResponse.rawBody;
        }

        context.res.statusCode = handlerResponse.statusCode;
        context.done();
    }
    catch (err) {
        context.log(err);
        context.res.statusCode = 500;
        context.done();
    }
};

export default httpTrigger;