/* Third party*/
import "mocha";
import { expect } from "chai";
import { HttpRequest } from "@azure/functions";
import mockContext = require("azure-function-context-mock");

/** Code in test */
import httpTrigger from "./index";
import RequestHandlerFactory from "./service/requestWorkflowFactory";
import { RequestWorkflow, RequestWorkflowBase } from "./service/workflows/abstraction/requestWorkflow";
import Sinon = require("sinon");

const getHandle = RequestHandlerFactory.GetRequestHandler;
const gcOrig = global.gc;


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
            expect(loggedMessages.length).to.be.equal(3);
            expect(loggedMessages[0]).to.be.equal("Rebuild API HTTP trigger processed a request.");
            expect(loggedMessages[1]).to.be.equal("banana");
            expect(loggedMessages[2]).to.be.equal("Could not run GC.");
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
            expect(loggedMessages.length).to.be.equal(2);
            expect(loggedMessages[0]).to.be.equal("Rebuild API HTTP trigger processed a request.");
            expect(loggedMessages[1]).to.be.equal("Could not run GC.");
        });

        it("should call workflow factory", () => {
            expect(requestHandlerFactoryCalls).to.not.be.empty;
            expect(requestHandlerFactoryCalls.length).to.be.equal(1);
        });
    });

    describe("Garbage collection", () => {
        let stubFactory: Sinon.SinonStub;
        let stubWorkflowInstance: Sinon.SinonStubbedInstance<RequestWorkflow>;

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

        beforeEach(() => {
            stubFactory = Sinon.stub(RequestHandlerFactory, "GetRequestHandler");
            stubWorkflowInstance = Sinon.createStubInstance(RequestWorkflowBase);
            stubWorkflowInstance.Response = {
                statusCode: 200,
                rawBody: "TEST",
                headers: {
                    testHeader: "banana"
                }
            };

            stubFactory.returns(stubWorkflowInstance);
        });

        afterEach(() => {
            stubFactory.restore();
            global.gc = gcOrig;
        });

        describe("with gc switched on", () => {
            let response;
            let gcRan = false;

            beforeEach(async () => {
                loggedMessages = [];
                mockContext.log = logMock;

                global.gc = (): void => { gcRan = true; };

                response = await httpTrigger(mockContext, mockRequest);
            });

            it("should log", () => {
                expect(loggedMessages).lengthOf(2);
                expect(loggedMessages[0]).to.equal("Rebuild API HTTP trigger processed a request.");
                expect(loggedMessages[1]).to.equal("GC ran");
            });

            it("should run gc", () => {
                expect(gcRan).to.be.true;
            });

            it("should have set response headers", () => {
                expect(response, JSON.stringify(response)).to.not.be.undefined;
                expect(response, JSON.stringify(response)).to.not.be.undefined;
                expect(response.headers, JSON.stringify(response)).to.not.be.undefined;
                expect(response.headers).to.not.be.null;
                expect(response.headers["GC-RAN"]).to.equal("true");
            });
        });

        describe("with gc switched off", () => {
            let response;

            beforeEach(async () => {
                loggedMessages = [];
                mockContext.log = logMock;
                response = await httpTrigger(mockContext, mockRequest);
            });

            it("should log", () => {
                expect(loggedMessages).lengthOf(2);
                expect(loggedMessages[0]).to.equal("Rebuild API HTTP trigger processed a request.");
                expect(loggedMessages[1]).to.equal("Could not run GC.");
            });

            it("should have set response headers", () => {
                expect(response, JSON.stringify(response)).to.not.be.undefined;
                expect(response, JSON.stringify(response)).to.not.be.undefined;
                expect(response.headers, JSON.stringify(response)).to.not.be.undefined;
                expect(response.headers).to.not.be.null;
                expect(response.headers["GC-RAN"]).to.equal("false");
            });
        });
    });
});