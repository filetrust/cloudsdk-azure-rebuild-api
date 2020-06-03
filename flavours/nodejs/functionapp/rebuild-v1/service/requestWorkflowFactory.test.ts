/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import RequestHandlerFactory from "./requestWorkflowFactory";
import RebuildUrlRequestHandler from "./workflows/rebuildUrlWorkflow";
import StatusCodeHandler from "./workflows/statusCodeWorkflow";
import RebuildBase64Workflow from "./workflows/rebuildBase64Workflow";
import RebuildFileWorkflow from "./workflows/rebuildFileWorkflow";
import { RequestWorkflowRequest } from "./workflows/abstraction/requestWorkflow";

describe("requestWorkflowFactory", () => {
    let loggedMessages: string[];

    const logMock = (message: string): void => {
        loggedMessages.push(message);
    };

    let mockRequest: RequestWorkflowRequest;

    describe("Routes", () => {
        it("/api/v1/rebuild/url returns rebuild url handler", () => {
            loggedMessages = [];
            mockRequest = {
                method: "POST",
                url: "/api/v1/rebuild/url"
            };

            const handler = RequestHandlerFactory.GetRequestHandler({
                log: logMock
            }, mockRequest);

            expect(handler).to.be.instanceOf(RebuildUrlRequestHandler);
            expect(handler.Request).to.equal(mockRequest);
            expect(handler.Response).to.not.equal(undefined);
            expect(loggedMessages.length).to.equal(0);
        });
        
        it("/api/v1/rebuild/base64 returns rebuild base64 handler", () => {
            loggedMessages = [];
            mockRequest = {
                method: "POST",
                url: "/api/v1/rebuild/base64"
            };

            const handler = RequestHandlerFactory.GetRequestHandler({
                log: logMock
            }, mockRequest);

            expect(handler).to.be.instanceOf(RebuildBase64Workflow);
            expect(handler.Request).to.equal(mockRequest);
            expect(handler.Response).to.not.equal(undefined);
            expect(loggedMessages.length).to.equal(0);
        });
        
        it("/api/v1/rebuild/file returns rebuild file handler", () => {
            loggedMessages = [];
            mockRequest = {
                method: "POST",
                url: "/api/v1/rebuild/file"
            };

            const handler = RequestHandlerFactory.GetRequestHandler({
                log: logMock
            }, mockRequest);

            expect(handler).to.be.instanceOf(RebuildFileWorkflow);
            expect(handler.Request).to.equal(mockRequest);
            expect(handler.Response).to.not.equal(undefined);
            expect(loggedMessages.length).to.equal(0);
        });
        
        it("/api/v1/dummy returns status code handler", () => {
            loggedMessages = [];
            mockRequest = {
                method: "PUT",
                url: "/api/v1/dummy"
            };

            const handler = RequestHandlerFactory.GetRequestHandler({
                log: logMock
            }, mockRequest);

            expect(handler).to.be.instanceOf(StatusCodeHandler);
            expect(handler.Request).to.equal(mockRequest);
            expect(handler.Response).to.not.equal(undefined);
            expect(handler.Response.statusCode).equal(200);
            expect(handler.Response.headers["etag"]).equal("\"dummy\"");
            expect(loggedMessages.length).to.equal(0);
        });

        it("/api/v1/health returns status code handler", () => {
            loggedMessages = [];
            mockRequest = {
                method: "GET",
                url: "/api/v1/health"
            };

            const handler = RequestHandlerFactory.GetRequestHandler({
                log: logMock
            }, mockRequest);

            expect(handler).to.be.instanceOf(StatusCodeHandler);
            expect(handler.Request).to.equal(mockRequest);
            expect(handler.Response).to.not.equal(undefined);
            expect(handler.Response.statusCode).equal(200);
            expect(loggedMessages.length).to.equal(0);
        });
        
        it("Unexpected route returns status code handler", () => {
            const url = "banana";
            const method = "delete";
            loggedMessages = [];
            mockRequest = {
                method,
                url
            };

            const handler = RequestHandlerFactory.GetRequestHandler({
                log: logMock
            }, mockRequest);

            expect(handler).to.be.instanceOf(StatusCodeHandler);
            expect(handler.Request).to.equal(mockRequest);
            expect(handler.Response).to.not.equal(undefined);
            expect(handler.Response.statusCode).equal(404);
            expect(loggedMessages.length).to.equal(1);
            expect(loggedMessages[0]).to.equal("no route matched for " + url + " method " + method);
        });
    });
});