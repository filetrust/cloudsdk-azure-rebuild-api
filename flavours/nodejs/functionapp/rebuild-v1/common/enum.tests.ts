/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import Enum from "./enum";

enum testEnum {
    Banana = -1,
    Apple = 0,
    Pinapple = 1,
    Apricot = 2,
    Steak = 90
}

describe("enum", () => {
    describe("get string", () => {
        it("should return correct enum string if found", () => {
            const actual = Enum.GetString(testEnum, 1)

            expect(actual).to.equal("Pinapple");
        });
        
        it("should return undefined string if not found", () => {
            const actual = Enum.GetString(testEnum, 9001)

            expect(actual).to.equal(undefined);
        });
    });
});