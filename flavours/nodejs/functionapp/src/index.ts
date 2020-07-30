/* eslint-disable @typescript-eslint/no-explicit-any */
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

const executeApi: AzureFunction = async (context: Context, req: HttpRequest) => {
    const workflow = RequestHandlerFactory.GetRequestHandler(context, req);

    await workflow.Handle();

    workflow.Response.headers["Access-Control-Expose-Headers"] = "*";
    workflow.Response.headers["Access-Control-Allow-Headers"] = "*";
    workflow.Response.headers["Access-Control-Allow-Origin"] = "*";

    return {
        headers: workflow.Response.headers,
        statusCode: workflow.Response.statusCode,
        body: workflow.Response.rawBody
    };
};

const runGc = (context: Context, headers: { [x: string]: string }): void => {
    try {
        global.gc();
        context.log("GC ran");
        headers["GC-RAN"] = "true";
    } catch (e) {
        context.log("Could not run GC.");
        headers["GC-RAN"] = "false";
    }
};

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
    let response: any;

    try {
        context.log("Rebuild API HTTP trigger processed a request.");
        response = await executeApi(context, req);
    }
    catch (err) {
        context.log(err);

        response = {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
    finally {
        runGc(context, response.headers);
    }
    
    response.headers["X-Content-Type-Options"] = "nosniff";
    response.headers["Cache-Control"] = "no-cache";
    response.headers["Pragma"] = "no-cache";

    return response;
};

export default httpTrigger;