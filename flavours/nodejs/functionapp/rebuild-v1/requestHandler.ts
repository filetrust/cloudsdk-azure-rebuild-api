/* eslint-disable @typescript-eslint/no-explicit-any */
export type requestHandlerReturnType = {
    rawBody?: any;
    statusCode?: number;
    headers: {
        [key: string]: any;
    };
};

export type requestHandlerArgs = {
    path: string;
    rawBody?: any;
    headers?: { [header: string]: string };
};

export interface RequestHandler {
    Handle(args: requestHandlerArgs): Promise<requestHandlerReturnType>;
}