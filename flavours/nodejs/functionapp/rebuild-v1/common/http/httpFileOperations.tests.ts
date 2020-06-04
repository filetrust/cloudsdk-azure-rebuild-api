/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import fetchMock = require("fetch-mock");
import HttpFileOperations from "./httpFileOperations";
import fetch = require("node-fetch");
import { stub, SinonStub } from "sinon";

let fetchStub: SinonStub;
let fetchStubResult: any;

describe("HttpFileOperations", () => {
    describe("downloadFile method", () => {
        describe("when status is not ok", () => {
            const inputUrl = "www.glasswall.com";
            let error: any;

            beforeEach(async () => {
                fetchStubResult = {
                    ok: false,
                    statusText: "Error"
                };

                fetchStub = stub(fetch, "default").returns(fetchStubResult);

                try {
                    await HttpFileOperations.downloadFile(inputUrl);
                }
                catch (err) {
                    error = err;
                }
            });

            afterEach(() => {
                fetchStub.restore();
            });

            it("should respond with status text", () => {
                expect(error).to.not.be.undefined;
                expect(error).to.equal("Error");
            });
            
            it("should have called fetch", async () => {
                expect(fetchStub.getCalls()).lengthOf(1);
                expect(fetchStub.getCall(0).args).lengthOf(2);
                expect(fetchStub.getCall(0).args[0]).to.equal(inputUrl);
                expect(fetchStub.getCall(0).args[1].method).to.equal("GET");
            });
        });

        describe("should respond with buffer if OK", async () => {
            const inputUrl = "www.glasswall.com";
            const expectedBuffer = Buffer.from("test");
            let result: Buffer;
            let error: any;

            beforeEach(async () => {
                fetchStubResult = {
                    ok: true,
                    buffer: () => expectedBuffer
                };

                fetchStub = stub(fetch, "default").returns(fetchStubResult);
                result = await HttpFileOperations.downloadFile(inputUrl);
            });

            afterEach(() => {
                fetchStub.restore();
            });

            it("should respond with status text if not OK", () => {
                expect(result).to.not.be.undefined;
                expect(result).to.equal(expectedBuffer);
            });
            
            it("should have called fetch", async () => {
                expect(fetchStub.getCalls()).lengthOf(1);
                expect(fetchStub.getCall(0).args).lengthOf(2);
                expect(fetchStub.getCall(0).args[0]).to.equal(inputUrl);
                expect(fetchStub.getCall(0).args[1].method).to.equal("GET");
            });
        });
    });

    describe("uploadFile method", () => {
        describe("when status is not OK", () => {
            const inputUrl = "www.glasswall.com";
            const inputFile = Buffer.from("test");
            let error: any;

            beforeEach(async () => {
                fetchStubResult = {
                    ok: false,
                    statusText: "Error"
                };

                fetchStub = stub(fetch, "default").returns(fetchStubResult);

                try {
                    await HttpFileOperations.uploadFile(inputUrl, inputFile);
                }
                catch (err) {
                    error = err;
                }
            });

            afterEach(() => {
                fetchStub.restore();
            });

            it("should respond with status text", () => {
                expect(error).to.not.be.undefined;
                expect(error).to.equal("Error");
            });
            
            it("should have called fetch", async () => {
                expect(fetchStub.getCalls()).lengthOf(1);
                expect(fetchStub.getCall(0).args).lengthOf(2);
                expect(fetchStub.getCall(0).args[0]).to.equal(inputUrl);
                expect(fetchStub.getCall(0).args[1].method).to.equal("PUT");
                expect(fetchStub.getCall(0).args[1].body).to.equal(inputFile);
            });
        });

        describe("when status is OK", () => {
            const inputUrl = "www.glasswall.com";
            const inputBuffer = Buffer.from("test");
            const expectedEtag = "\"ETAG\"";
            let actualEtag: String;

            beforeEach(async () => {
                fetchStubResult = {
                    ok: true,
                    headers: {
                        get: (header: string) => {
                            if (header === "etag")
                            {
                                return expectedEtag;
                            }

                            throw "You should never have come here";
                        }
                    }
                };

                fetchStub = stub(fetch, "default").returns(fetchStubResult);
                actualEtag = await HttpFileOperations.uploadFile(inputUrl, inputBuffer);
            });

            afterEach(() => {
                fetchStub.restore();
            });

            it("should respond with etag", async () => {
                expect(actualEtag).to.equal(expectedEtag);
            });
            
            it("should have called fetch", async () => {
                expect(fetchStub.getCalls()).lengthOf(1);
                expect(fetchStub.getCall(0).args).lengthOf(2);
                expect(fetchStub.getCall(0).args[0]).to.equal(inputUrl);
                expect(fetchStub.getCall(0).args[1].method).to.equal("PUT");
                expect(fetchStub.getCall(0).args[1].body).to.equal(inputBuffer);
            });
        });
    });
});