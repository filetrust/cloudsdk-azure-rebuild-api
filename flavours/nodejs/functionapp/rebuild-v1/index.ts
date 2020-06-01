import appInsights = require("applicationinsights");
appInsights.setup("<instrumentation_key>")
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .start();

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import RequestHandlerFactory from "./service/requestWorkflowFactory";

const executeApi: AzureFunction = async(context: Context, req: HttpRequest) => {
    const workflow = RequestHandlerFactory.GetRequestHandler(context, req);

    await workflow.Handle();

    workflow.Response.headers["Access-Control-Expose-Headers"] = "*";
    workflow.Response.headers["Access-Control-Allow-Headers"] = "*";
    workflow.Response.headers["Access-Control-Allow-Origin"] = "*";

    try {
        if (global.gc) {
            context.log("GC ran");
            global.gc();
            context.res.setHeader("GC-RAN", "true");
        }

        context.res.setHeader("GC-RAN", "false");
    } catch (e) {
        context.log("`node --expose-gc index.js`");
    }

    return {
        headers: workflow.Response.headers,
        statusCode: workflow.Response.statusCode,
        body: workflow.Response.rawBody
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
    try {
        context.log("Rebuild API HTTP trigger processed a request.");
        return await executeApi(context, req);
    }
    catch (err) {
        return {
            statusCode: 500,
            body: {
                error: err
            },
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
};

export default httpTrigger;