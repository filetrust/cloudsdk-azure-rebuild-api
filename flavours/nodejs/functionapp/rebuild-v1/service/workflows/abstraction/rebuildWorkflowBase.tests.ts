import "mocha";
import { expect } from "chai";
import RebuildWorkflowBase from "./rebuildWorkflowBase";
import MockLogger from "../../../common/test/mocks/mockLogger";

describe("rebuildWorkflowBase", () => {
    describe("handle method", () => {
        it("should throw error if trying to handle", async() => {
            try {
                await new RebuildWorkflowBase(new MockLogger(), {
                    method: "POSt",
                    url: "www.gloggle.com"
                }).Handle();

                expect.fail("Did not throw anything");
            }
            catch (err) {
                expect(err).to.be.instanceOf(TypeError);
            }
        });
    });

    describe("handle error", () => {
        it("should log message plus stack for error types", () => {
            const err = new Error();
            const mockLogger = new MockLogger();
            const workflow = new RebuildWorkflowBase(mockLogger, {
                method: "POSt",
                url: "www.gloggle.com"
            });

            workflow.handleError(err);

            expect(mockLogger.loggedMessages).lengthOf(1);
            expect(mockLogger.loggedMessages[0]).to.equal(err.message + err.stack);
            expect(workflow.Response.statusCode).to.equal(500);
        });
        
        it("should log message for string types", () => {
            const err = "err";
            const mockLogger = new MockLogger();
            const workflow = new RebuildWorkflowBase(mockLogger, {
                method: "POSt",
                url: "www.gloggle.com"
            });

            workflow.handleError(err);

            expect(mockLogger.loggedMessages).lengthOf(1);
            expect(mockLogger.loggedMessages[0]).to.equal(err);
            expect(workflow.Response.statusCode).to.equal(500);
        });
    });
});