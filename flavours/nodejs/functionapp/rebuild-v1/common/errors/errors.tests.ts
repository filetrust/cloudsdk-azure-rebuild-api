import "mocha";
import { expect } from "chai";
import { ArgumentException, ArgumentNullException } from "./errors";

describe("errors", () => {
    describe("ArgumentException", () => {
        describe("constructor", () => {
            it("should set argumentName", () => {
                const error = new ArgumentException("arg", "some message");
                expect(error.argumentName).to.equal("arg");
            });

            it("should set name", () => {
                const error = new ArgumentException("arg", "some message");
                expect(error.name).to.equal("ArgumentException");
            });

            it("should set message", () => {
                const error = new ArgumentException("arg", "some message");
                expect(error.message).to.equal("Argument is invalid: 'arg' message: 'some message'");
            });
        });
    });
    describe("ArgumentNullException", () => {
        describe("constructor", () => {
            it("should set argumentName", () => {
                const error = new ArgumentNullException("arg");
                expect(error.argumentName).to.equal("arg");
            });

            it("should set name", () => {
                const error = new ArgumentNullException("arg");
                expect(error.name).to.equal("ArgumentNullException");
            });

            it("should set message", () => {
                const error = new ArgumentNullException("arg");
                expect(error.message).to.equal("Argument is invalid: 'arg' message: 'Argument must be defined: 'arg''");
            });
        });
    });
})