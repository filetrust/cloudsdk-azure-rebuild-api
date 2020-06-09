/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import fetchMock = require("fetch-mock");
import ref = require("ref-napi");
import { stub, SinonStub } from "sinon";
import { wchar_t } from "./wchar_t";
import IconvLite = require("iconv-lite");
import platform = require("../../platform");

describe("wchar_t", () => {
    const platformSpecificTests = (platformTestCase: string, wchar_size: number, encoding: string) => {
        let readPointerStub: SinonStub;
        let readPointerResult: Buffer;

        let writePointerStub: SinonStub;
        let writePointerResult: Buffer;
    
        let reinterpretUntilZerosStub: SinonStub;
        let reinterpretUntilZerosStubResult: Buffer;
    
        let encodeStub: SinonStub;
        let encodeStubResult: Buffer;

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
            writePointerStub = stub(ref, "writePointer");
            reinterpretUntilZerosStub = stub(ref, "reinterpretUntilZeros");
            encodeStub = stub(IconvLite, "encode");
            decodeStub = stub(IconvLite, "decode");
            isNullStub = stub(ref, "isNull");
            getProcessPlatformStub = stub(platform, "getProcessPlatform");
        });
    
        afterEach(() => {
            readPointerStub.restore();
            reinterpretUntilZerosStub.restore();
            encodeStub.restore();
            decodeStub.restore();
            isNullStub.restore();
            getProcessPlatformStub.restore();
            writePointerStub.restore();
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
            let inputBuffer;
            let inputOffset;
            let inputValue;

            beforeEach(() => {
                inputBuffer = Buffer.from("get");
                inputOffset = 5;
                isNullStubResult = true;

                readPointerStub.returns(readPointerResult);
                writePointerStub.returns(writePointerResult);
                reinterpretUntilZerosStub.returns(reinterpretUntilZerosStubResult);
                decodeStub.returns(decodeStubResult);
                isNullStub.returns(isNullStubResult);
                getProcessPlatformStub.returns(platformTestCase);
            });

            describe("when value is a string", () => {
                let value: string;

                beforeEach(() => {
                    inputValue = "SOME VALUE";
                    wchar_t.set(inputBuffer, inputOffset, inputValue);
                });

                it("should call encode", () => {
                    expect(encodeStub.getCalls()).lengthOf(1);
                    expect(encodeStub.getCall(0).args).lengthOf(2);
                    expect(encodeStub.getCall(0).args[0]).to.equal(inputValue + "\0");
                    expect(encodeStub.getCall(0).args[1]).to.equal(encoding);
                });

                it("should call write pointer", () => {
                    expect(writePointerStub.getCalls()).lengthOf(1);
                    expect(writePointerStub.getCall(0).args).lengthOf(3);
                    expect(writePointerStub.getCall(0).args[0]).to.equal(inputBuffer);
                    expect(writePointerStub.getCall(0).args[1]).to.equal(inputOffset);
                    expect(writePointerStub.getCall(0).args[2]).to.equal(encodeStubResult);
                });
            });
            
            describe("when value is a buffer", () => {
                let value: Buffer;

                beforeEach(() => {
                    inputValue = Buffer.from("SOME VALUE");
                    wchar_t.set(inputBuffer, inputOffset, inputValue);
                });

                it("should not call encode", () => {
                    expect(encodeStub.getCalls()).lengthOf(0);
                });

                it("should call write pointer", () => {
                    expect(writePointerStub.getCalls()).lengthOf(1);
                    expect(writePointerStub.getCall(0).args).lengthOf(3);
                    expect(writePointerStub.getCall(0).args[0]).to.equal(inputBuffer);
                    expect(writePointerStub.getCall(0).args[1]).to.equal(inputOffset);
                    expect(writePointerStub.getCall(0).args[2]).to.equal(inputValue);
                });
            });
        });
    };

    describe("win32", () => platformSpecificTests("win32", 2, "utf-16le"));
    describe("unix", () => platformSpecificTests( "unix", 4, "utf-32le"));
});