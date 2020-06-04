/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import fetchMock = require("fetch-mock");
import ref = require("ref-napi");
import ffi = require("ffi-napi");
import { stub, createStubInstance, spy, SinonStub } from "sinon";
import { wchar_t } from "./wchar_t";
import IconvLite = require("iconv-lite");
import platform = require("../../platform");


describe("wchar_t", () => {
    const platformSpecificTests = (platformTestCase: string, wchar_size: number, encoding: string) => {
        let readPointerStub: SinonStub;
        let readPointerResult: Buffer;
    
        let reinterpretUntilZerosStub: SinonStub;
        let reinterpretUntilZerosStubResult: Buffer;
    
        let decodeStub: SinonStub;
        let decodeStubResult: string;
    
        let isNullStub: SinonStub;
        let isNullStubResult: boolean;
    
        let getProcessPlatformStub: SinonStub;
        let getProcessPlatformStubResult: string;
    
        beforeEach(() => {
            readPointerResult = Buffer.from("test");
            reinterpretUntilZerosStubResult = Buffer.from("test2");
            isNullStubResult = true;
    
            readPointerStub = stub(ref, "readPointer");
            reinterpretUntilZerosStub = stub(ref, "reinterpretUntilZeros");
            decodeStub = stub(IconvLite, "decode");
            isNullStub = stub(ref, "isNull");
            getProcessPlatformStub = stub(platform, "getProcessPlatform");
        });
    
        afterEach(() => {
            readPointerStub.restore();
            reinterpretUntilZerosStub.restore();
            decodeStub.restore();
            isNullStub.restore();
            getProcessPlatformStub.restore();
        });

        describe("get", () => {
            let inputBuffer: Buffer;
            let inputOffset: number;

            describe("when input is correct", () => {
                let wideChar;

                beforeEach(() => {
                    inputBuffer = Buffer.from("get");
                    inputOffset = 5;
                    isNullStubResult = false;
                    getProcessPlatformStubResult = platformTestCase;

                    readPointerStub.returns(readPointerResult);
                    reinterpretUntilZerosStub.returns(reinterpretUntilZerosStubResult);
                    decodeStub.returns(decodeStubResult);
                    isNullStub.returns(isNullStubResult);
                    getProcessPlatformStub.returns(getProcessPlatformStubResult);
                    wideChar = wchar_t.get(inputBuffer, inputOffset);
                });

                it("should call readPointer", () => {
                    expect(readPointerStub.getCalls()).lengthOf(1);
                    expect(readPointerStub.getCall(0).args).lengthOf(2);
                    expect(readPointerStub.getCall(0).args[0]).to.equal(inputBuffer);
                    expect(readPointerStub.getCall(0).args[1]).to.equal(inputOffset);
                });

                it("should call isNull", () => {
                    expect(isNullStub.getCalls()).lengthOf(1);
                    expect(isNullStub.getCall(0).args).lengthOf(1);
                    expect(isNullStub.getCall(0).args[0]).to.equal(readPointerResult);
                });

                it("should call reinterpretUntilZeros", () => {
                    expect(reinterpretUntilZerosStub.getCalls()).lengthOf(1);
                    expect(reinterpretUntilZerosStub.getCall(0).args).lengthOf(2);
                    expect(reinterpretUntilZerosStub.getCall(0).args[0]).to.equal(readPointerResult);
                    expect(reinterpretUntilZerosStub.getCall(0).args[1]).to.equal(wchar_size);
                });

                it("should call decode", () => {
                    expect(decodeStub.getCalls()).lengthOf(1);
                    expect(decodeStub.getCall(0).args).lengthOf(2);
                    expect(decodeStub.getCall(0).args[0]).to.equal(reinterpretUntilZerosStubResult);
                    expect(decodeStub.getCall(0).args[1]).to.equal(encoding);
                });
            });
            
            describe("when input contains null data", () => {
                let wideChar;

                beforeEach(() => {
                    inputBuffer = Buffer.from("get");
                    inputOffset = 5;
                    isNullStubResult = true;

                    readPointerStub.returns(readPointerResult);
                    reinterpretUntilZerosStub.returns(reinterpretUntilZerosStubResult);
                    decodeStub.returns(decodeStubResult);
                    isNullStub.returns(isNullStubResult);
                    getProcessPlatformStub.returns(platformTestCase);
                    wideChar = wchar_t.get(inputBuffer, inputOffset);
                });

                it("should call readPointer", () => {
                    expect(readPointerStub.getCalls()).lengthOf(1);
                    expect(readPointerStub.getCall(0).args).lengthOf(2);
                    expect(readPointerStub.getCall(0).args[0]).to.equal(inputBuffer);
                    expect(readPointerStub.getCall(0).args[1]).to.equal(inputOffset);
                });

                it("should call isNull", () => {
                    expect(isNullStub.getCalls()).lengthOf(1);
                    expect(isNullStub.getCall(0).args).lengthOf(1);
                    expect(isNullStub.getCall(0).args[0]).to.equal(readPointerResult);
                });

                it("should not have called reinterpretUntilZeros", () => {
                    expect(reinterpretUntilZerosStub.getCalls()).lengthOf(0);
                });

                it("should not have called decode", () => {
                    expect(decodeStub.getCalls()).lengthOf(0);
                });
            });
        });
        describe("set", () => {

        });
    };

    describe("win32", () => platformSpecificTests("win32", 2, "utf-16le"));
    describe("unix", () => platformSpecificTests( "unix", 4, "utf-32le"));
});