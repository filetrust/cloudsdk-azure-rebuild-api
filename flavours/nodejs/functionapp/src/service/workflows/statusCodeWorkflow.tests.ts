/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import StatusCodeWorkflow from "./statusCodeWorkflow";
import { RequestWorkflowRequest } from "./abstraction/requestWorkflow";

describe("statusCodeWorkflow", () => {
    let loggedMessages: string[];

    const logMock = (message: string): void => {
        loggedMessages.push(message);
    };

    const requestMock: RequestWorkflowRequest = {
        method: "POST",
        url: "example.com"
    };

    describe("constructor", () => {
        it("valid arguments construct", () => {
            const workflow = new StatusCodeWorkflow({ log: logMock }, requestMock, 413);

            expect(workflow.Logger.log).to.equal(logMock);
            expect(workflow.Response.statusCode).to.equal(413);
        });
    });

    describe("handle", () => {
        beforeEach(() => {
            loggedMessages = [];
        });

        it("logs the correct message", async () => {
            const workflow = new StatusCodeWorkflow({ log: logMock }, requestMock, 413);

            await workflow.Handle(); 

            expect(loggedMessages.length).to.equal(1);
            expect(loggedMessages[0]).to.equal(`Status code workflow invoked for status code ${413}`);
        });
    });
});