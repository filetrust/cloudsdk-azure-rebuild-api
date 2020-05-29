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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const exitHandler = (options: { cleanup: any; exit: any }, exitCode: number): any => {
    if (exitCode || exitCode === 0) {
        console.log("got exit code: " + exitCode);
    }

    if (options.exit) {
        process.exit();
    }
};

const executeApi: AzureFunction = async(context: Context, req: HttpRequest) => {
    const uncaughtException: NodeJS.UncaughtExceptionListener = (err: Error): void => {
        console.log("UNCAUGHT: " + err);
        process.exit();
    };
    const exited: NodeJS.ExitListener = (code: number): void => {
        console.log("EXIT: " + code);
        process.exit(code);
    };

    process.on("exit", exited);
    process.on("SIGINT", exitHandler.bind(null, {exit:true}));
    process.on("SIGUSR1", exitHandler.bind(null, {exit:true}));
    process.on("SIGUSR2", exitHandler.bind(null, {exit:true}));
    process.on("uncaughtException", uncaughtException);

    const workflow = RequestHandlerFactory.GetRequestHandler({
        path: req.url,
        headers: req.headers,
        rawBody: req.body,
        method: req.method,
        logger: context
    });

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