import { expect } from "chai";
import { fail } from "assert";

const create = <T>(type: { new(): T }) => {
    return new type();
}

export const expectToThrow = <TError extends Error>(func: () => void, callback: (err: TError) => void): void => {
    try {
        func()

        fail("Method did not throw");
    }
    catch (err) {
        expect(err).to.be.instanceOf(Error);
        callback(err);
    }
}