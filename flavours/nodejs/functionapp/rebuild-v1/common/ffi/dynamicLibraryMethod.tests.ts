/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import ffi = require("ffi-napi");
import DynamicLibraryMethod from "./dynamicLibraryMethod";
import { stub, createStubInstance, SinonStub, SinonStubbedInstance } from "sinon";

describe("DynamicLibraryMethod", () => {
    let mockLib: SinonStubbedInstance<ffi.DynamicLibrary>;
    let mockFunction: SinonStub;

    let entryPointPtr: Buffer;
    let entryPoint: any;

    beforeEach(() => {
        entryPoint = (...args: any[]): any => args;
        entryPointPtr = Buffer.from("banana");

        mockFunction = stub(ffi, "ForeignFunction").returns(entryPoint);
        mockLib = createStubInstance(ffi.DynamicLibrary, {
            get: stub().returns(entryPointPtr)
        });
    });

    afterEach(() => {
        mockFunction.restore();
    });

    describe("constructor", () => {
        it("should construct with valid args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            expect(dlm.dynamicLibrary).to.equal(mockLib);
            expect(dlm.entryPointPtr).to.equal(entryPointPtr);
            expect(dlm.entryPoint).to.equal(entryPoint);
            expect(dlm.entryPointName).to.equal(entryPoint);
        });
    });

    describe("Dispose", () => {
        it("should construct with valid args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            dlm.Dispose();

            expect(dlm.dynamicLibrary).to.equal(null);
            expect(dlm.entryPointPtr).to.equal(null);
            expect(dlm.entryPoint).to.equal(null);
            expect(dlm.entryPointName).to.equal(null);
        });
    });

    describe("Execute method", () => {
        it("should execute entrypoint with 0 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute();
            expect(result).lengthOf(0);
        });
        
        it("should execute entrypoint with 1 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute(1);
            expect(result).lengthOf(1);
        });
        
        it("should execute entrypoint with 2 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute(1, 2);
            expect(result).lengthOf(2);
        });
        
        it("should execute entrypoint with 3 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute(1, 2, 3);
            expect(result).lengthOf(3);
        });
        
        it("should execute entrypoint with 4 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute(1, 2, 3, 4);
            expect(result).lengthOf(4);
        });
        
        it("should execute entrypoint with 5 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute(1, 2, 3, 4, 5);
            expect(result).lengthOf(5);
        });
        
        it("should execute entrypoint with 6 args", async () => {
            const dlm = new DynamicLibraryMethod(mockLib, entryPoint, "string", [
                "string"
            ]);

            const result = dlm.Execute(1, 2, 3, 4, 5, 6);
            expect(result).lengthOf(6);
        });
    });
});