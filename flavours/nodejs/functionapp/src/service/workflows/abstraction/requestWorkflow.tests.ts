import "mocha";
import { expect } from "chai";
import { RequestWorkflowBase } from "./requestWorkflow";
import MockLogger from "../../../common/test/mocks/mockLogger";

describe("RequestWorkflowBase", () => {
    describe("Handle", async () => {
        try {
            await new RequestWorkflowBase(new MockLogger(), {
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