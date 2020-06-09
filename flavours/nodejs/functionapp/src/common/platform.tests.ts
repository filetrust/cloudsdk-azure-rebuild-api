import "mocha";
import { expect } from "chai";
import { getProcessPlatform } from "./platform";

describe("platform", () => {
    it("should return platform", () => {
        expect(getProcessPlatform()).to.equal(process.platform);
    });
});