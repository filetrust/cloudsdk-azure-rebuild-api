/* Third party*/
import "mocha";
import { expect } from "chai";
import { HttpRequest } from "@azure/functions";
import mockContext = require("azure-function-context-mock");

/** Code in test */
import httpTrigger from "./index";
import RequestHandlerFactory from "./service/requestWorkflowFactory";
import { RequestWorkflow } from "./service/workflows/abstraction/requestWorkflow";

const getHandle = RequestHandlerFactory.GetRequestHandler;

describe("httpTrigger", () => {
    let loggedMessages: string[];

    const logMock = (message: string): void => {
        loggedMessages.push(message);
    };

    describe("When request raises an exception", () => {
        let expectedRequest;
        let expectedResponse;
        let actualResponse;
        let requestHandlerFactoryCalls;

        const mockRequest: HttpRequest = {
            method: "POST",
            body: {
                SomeArg: "SomeValue"
            },
            headers: {
                "Content-Type": "application/json"
            },
            url: "www.rebuild-is-awesome.com",
            query: {},
            params: {}
        };

        beforeEach(async () => {
            loggedMessages = [];
            requestHandlerFactoryCalls = [];
            mockContext.log = logMock;
            expectedRequest = { 

            };

            expectedResponse = {
                statusCode: 200,
                rawBody: "TEST",
                headers: {
                    testHeader: "banana"
                }
            };

            RequestHandlerFactory.GetRequestHandler = (): RequestWorkflow => {
                return {
                    Request: expectedRequest,
                    Response: expectedResponse,
                    Handle: async (...args): Promise<void> => { 
                        requestHandlerFactoryCalls.push(args);
                        throw "banana";
                    }
                };
            };
            
            actualResponse = await httpTrigger(mockContext, mockRequest);
        });

        afterEach(() => {
            RequestHandlerFactory.GetRequestHandler = getHandle;
        });

        it("returns 500", () => {
            expect(actualResponse.statusCode).to.equal(500);

        });

        it ("returns json", () => {
            expect(actualResponse.headers["Content-Type"]).to.equal("application/json");
        });

        it("should call workflow factory", () => {
            expect(requestHandlerFactoryCalls).to.not.be.empty;
            expect(requestHandlerFactoryCalls.length).to.be.equal(1);
        });

        it("logs correct messages", () => {
            expect(loggedMessages).to.not.be.empty; 
            expect(loggedMessages.length).to.be.equal(2);
            expect(loggedMessages[0]).to.be.equal("Rebuild API HTTP trigger processed a request.");
            expect(loggedMessages[1]).to.be.equal("banana");
        });
    });

    describe("When request is well formed", () => {
        let expectedRequest;
        let expectedResponse;
        let actualResponse;
        let requestHandlerFactoryCalls;

        const mockRequest: HttpRequest = {
            method: "POST",
            body: {
                SomeArg: "SomeValue"
            },
            headers: {
                "Content-Type": "application/json"
            },
            url: "www.rebuild-is-awesome.com",
            query: {},
            params: {}
        };
    
        beforeEach(async () => {
            loggedMessages = [];
            requestHandlerFactoryCalls = [];
            mockContext.log = logMock;
            expectedRequest = { 

            };

            expectedResponse = {
                statusCode: 200,
                rawBody: "TEST",
                headers: {
                    testHeader: "banana"
                }
            };

            RequestHandlerFactory.GetRequestHandler = (): RequestWorkflow => {
                return {
                    Request: expectedRequest,
                    Response: expectedResponse,
                    Handle: async (...args): Promise<void> => { 
                        requestHandlerFactoryCalls.push(args);
                    }
                };
            };
            
            actualResponse = await httpTrigger(mockContext, mockRequest);
        });
    
        afterEach(() => {
            RequestHandlerFactory.GetRequestHandler = getHandle;
        });

        it("returns defined response", () => {    
            expect(actualResponse).not.to.be.equal(undefined).and.not.to.be.equal(null);
        });

        it("returns correct headers", () => {
            expect(actualResponse.headers).not.to.be.equal(undefined).and.not.to.be.equal(null);
            expect(Object.keys(actualResponse.headers).length).to.equal(5);
            expect(actualResponse.headers["testHeader"]).to.equal(expectedResponse.headers.testHeader);
            expect(actualResponse.headers["Access-Control-Expose-Headers"]).to.equal("*");
            expect(actualResponse.headers["Access-Control-Allow-Headers"]).to.equal("*");
            expect(actualResponse.headers["Access-Control-Allow-Origin"]).to.equal("*");
            expect(actualResponse.headers["GC-RAN"]).to.equal("false");
        });
    
        it("returns correct statusCode", () => {
            expect(actualResponse.statusCode).not.to.be.equal(undefined).and.not.to.be.equal(null);
            expect(actualResponse.statusCode).to.equal(expectedResponse.statusCode);
        });
    
        it("returns correct body", () => {
            expect(actualResponse.body).not.to.equal(undefined).and.not.to.equal(null);
            expect(actualResponse.body).to.equal(expectedResponse.rawBody);
        });

        it("logs correct messages", () => {
            expect(loggedMessages).to.not.be.empty; 
            expect(loggedMessages.length).to.be.equal(1);
            expect(loggedMessages[0]).to.be.equal("Rebuild API HTTP trigger processed a request.");
        });

        it("should call workflow factory", () => {
            expect(requestHandlerFactoryCalls).to.not.be.empty;
            expect(requestHandlerFactoryCalls.length).to.be.equal(1);
        });
    });
});