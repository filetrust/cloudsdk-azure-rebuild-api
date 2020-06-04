/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import { RequestWorkflowRequest } from "./abstraction/requestWorkflow";
import RebuildBase64Workflow from "./rebuildBase64Workflow";

/** Mock dependencies */
import EngineService from "../../business/services/engineService";
import EngineServiceFactory from "../../business/services/engineServiceFactory";
import MockEngine from "../../common/test/mocks/mockEngine";
import Timer from "../../common/timer";
import { ArgumentNullException, ArgumentException } from "../../common/errors/errors";
import EngineOutcome from "../../business/engine/enums/engineOutcome";
import Metric from "../../common/metric";
import FileType from "../../business/engine/enums/fileType";
import ContentManagementFlags from "../../business/engine/contentManagementFlags";
import MockLogger from "../../common/test/mocks/mockLogger";

const mockLogger = new MockLogger();

describe("base64workflow", () => {
    const requestMock: RequestWorkflowRequest = {
        method: "POST",
        url: "example.com"
    };

    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            const workflow = new RebuildBase64Workflow(mockLogger, requestMock);

            expect(workflow.Logger).to.equal(mockLogger);
            expect(workflow.Response.statusCode).to.equal(200);
            expect(workflow.Request).to.equal(requestMock);
        });

        const constructorTest = <TException extends ArgumentException>(logger: { log: (message: string) => void }, request: RequestWorkflowRequest, expectedArg: string): void => {
            try {
                new RebuildBase64Workflow(logger, request);
            } catch (err) {
                const argNullException = err as TException;
                expect(argNullException.argumentName).to.equal(expectedArg);
            }
        };

        it("should throw with null logger", () => constructorTest(null, requestMock, "logger"));
        it("should throw with undefined logger", () => constructorTest(undefined, requestMock, "logger"));
        it("should throw with undefined request", () => constructorTest(mockLogger, null, "request"));
        it("should throw with undefined request", () => constructorTest(mockLogger, undefined, "request"));
    });

    describe("handle method", () => {
        let workflow: RebuildBase64Workflow;
        let requestMock: RequestWorkflowRequest;
        let mockEngine: MockEngine;
        let mockTimer: Timer;

        const commonSetup = (): void => {
            mockEngine = new MockEngine();

            requestMock = {
                method: "POST",
                url: "example.com"
            };

            EngineServiceFactory.Create = (): EngineService => {
                return mockEngine;
            };

            mockTimer = new Timer();
            mockTimer.Elapsed = (): string => "Some Time";

            Timer.StartNew = (): Timer => {
                return mockTimer;
            };

            mockLogger.loggedMessages = [];
            workflow = new RebuildBase64Workflow(mockLogger, requestMock);
        };

        const expectHeaderToEqual = (expectedHeader: string, expectedHeaderValue: any): void => {
            expect(Object.keys(workflow.Response.headers)).to.contain(expectedHeader);
            expect(workflow.Response.headers[expectedHeader]).to.equal(expectedHeaderValue);
        };

        describe("when request body is not set", () => {
            beforeEach(async () => {
                commonSetup();

                requestMock.body = null;

                await workflow.Handle();
            });

            it("should set response to bad request", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });

            it("should set body errors", () => {
                expect(workflow.Response.rawBody.errors.Body).to.equal("Not Supplied");
            });
        });

        const base64Test = (testCase: string): void => {
            beforeEach(async () => {
                commonSetup();

                requestMock.body = {
                    Base64: testCase
                };

                await workflow.Handle();
            });

            it("should set response to bad request", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });

            it("should set body errors", async () => {
                expect(workflow.Response.rawBody.errors.Base64).to.equal("Not Supplied");
            });
        };

        describe("when request body contains null base64", () => base64Test(null));
        describe("when request body contains undefined base64", () => base64Test(undefined));
        describe("when request body contains empty base64", () => base64Test(""));

        describe("when request body is an invalid JSON string", () => {
            beforeEach(async () => {
                commonSetup();

                workflow.Request.body = "£%$£%TW$(TW*";

                await workflow.Handle();
            });

            it("should set response to bad request", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });
        });

        describe("when request is valid and rebuilds file", () => {
            const base64In = "d293IHlvdSByZWFsbHkgdG9vayB0aGUgdGltZSB0byBkZWNvZGUgdGhpcyB0ZXN0IGNhc2U=";
            const base64Out = "d293IHlvdSBkZWNvZGVkIHRoaXMgb25lIHRvbz8gb3IgbWF5YmUgeW91IGp1c3QgZGlkIHRoaXMgb25lIGlkaw==";

            const base64InBuffer = Buffer.from(base64In, "base64");
            const base64OutBuffer = Buffer.from(base64Out, "base64");

            beforeEach(async () => {
                commonSetup();

                workflow.Request.body = {
                    Base64: base64In
                };

                const protectedFile = Buffer.from(base64Out, "base64");
                mockEngine.RebuildResponse = {
                    protectedFile,
                    protectedFileLength: protectedFile.length,
                    engineOutcome: EngineOutcome.Success,
                    engineOutcomeName: "Success",
                    errorMessage: null
                };

                await workflow.Handle();

                if (workflow.Response.statusCode === 500) {
                    console.log(workflow.Response);
                }
            });

            it("should set response to OK", () => {
                expect(workflow.Response.statusCode).to.equal(200);
            });

            it("should set response body", () => {
                expect(workflow.Response.rawBody).not.to.be.undefined;
                expect(workflow.Response.rawBody).not.equal(null);
            });

            it("should set base64 in body", () => {
                const jsonBody = JSON.parse(workflow.Response.rawBody);

                expect(jsonBody.Base64).to.equal(base64Out);
            });

            it("should have called detect file", () => {
                expect(mockEngine.GetFileTypeInvocations.length).to.equal(1);
            });

            it("should have set configuration", () => {
                expect(mockEngine.SetConfigurationInvocations.length).to.equal(1);
                expect(mockEngine.SetConfigurationInvocations[0][0]).to.be.instanceOf(ContentManagementFlags);
            });

            it("should have called get library version", () => {
                expect(mockEngine.GetLibraryVersionInvocations.length).to.equal(1);
            });

            it("should have called rebuild", () => {
                expect(mockEngine.RebuildInvocations.length).to.equal(1);
                expect(base64InBuffer.equals(base64InBuffer)).to.be.true;
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, mockTimer.Elapsed()));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, base64InBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, mockTimer.Elapsed()));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, Metric.DefaultValue));
            it("should have set ProtectedFileSize header", () => expectHeaderToEqual(Metric.ProtectedFileSize, base64OutBuffer.length));
            it("should have set UploadSize header", () => expectHeaderToEqual(Metric.UploadSize, Metric.DefaultValue));
            it("should have set UploadTime header", () => expectHeaderToEqual(Metric.UploadTime, Metric.DefaultValue));
            it("should have set UploadEtag header", () => expectHeaderToEqual(Metric.UploadEtag, Metric.DefaultValue));
            it("should have set FileType header", () => expectHeaderToEqual(Metric.FileType, mockEngine.FileType.fileTypeName));
            it("should have set EngineLoadTime header", () => expectHeaderToEqual(Metric.EngineLoadTime, mockTimer.Elapsed()));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Type", "application/json"));

            it("should have set the correct number of headers", () => {
                expect(Object.keys(workflow.Response.headers).length).to.equal(14);
            });
        });

        describe("when request is valid but file type is unsupported", () => {
            const base64In = "d293IHlvdSByZWFsbHkgdG9vayB0aGUgdGltZSB0byBkZWNvZGUgdGhpcyB0ZXN0IGNhc2U=";
            const base64Out = "d293IHlvdSBkZWNvZGVkIHRoaXMgb25lIHRvbz8gb3IgbWF5YmUgeW91IGp1c3QgZGlkIHRoaXMgb25lIGlkaw==";

            const base64InBuffer = Buffer.from(base64In, "base64");

            beforeEach(async () => {
                commonSetup();

                workflow.Request.body = {
                    Base64: base64In
                };

                const protectedFile = Buffer.from(base64Out, "base64");
                mockEngine.RebuildResponse = {
                    protectedFile,
                    protectedFileLength: protectedFile.length,
                    engineOutcome: EngineOutcome.Success,
                    engineOutcomeName: "Success",
                    errorMessage: null
                };

                mockEngine.FileType = {
                    fileType: FileType.Unknown,
                    fileTypeName: "Unknown"
                };

                await workflow.Handle();

                if (workflow.Response.statusCode === 500) {
                    console.log(workflow.Response);
                }
            });

            it("should set response to Unprocessable entity", () => {
                expect(workflow.Response.statusCode).to.equal(422);
            });

            it("should set response body", () => {
                expect(workflow.Response.rawBody).not.to.be.undefined;
                expect(workflow.Response.rawBody).not.equal(null);
            });

            it("should set error in body", () => {
                expect(workflow.Response.rawBody.error).to.equal("File Type could not be determined to be a supported type");
            });

            it("should not have set configuration", () => {
                expect(mockEngine.SetConfigurationInvocations.length).to.equal(0);
            });

            it("should have called detect file", () => {
                expect(mockEngine.GetFileTypeInvocations.length).to.equal(1);
            });

            it("should have called get library version", () => {
                expect(mockEngine.GetLibraryVersionInvocations.length).to.equal(1);
            });

            it("should not have called rebuild", () => {
                expect(mockEngine.RebuildInvocations.length).to.equal(0);
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, mockTimer.Elapsed()));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, base64InBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, Metric.DefaultValue));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, Metric.DefaultValue));
            it("should have set ProtectedFileSize header", () => expectHeaderToEqual(Metric.ProtectedFileSize, Metric.DefaultValue));
            it("should have set UploadSize header", () => expectHeaderToEqual(Metric.UploadSize, Metric.DefaultValue));
            it("should have set UploadTime header", () => expectHeaderToEqual(Metric.UploadTime, Metric.DefaultValue));
            it("should have set UploadEtag header", () => expectHeaderToEqual(Metric.UploadEtag, Metric.DefaultValue));
            it("should have set FileType header", () => expectHeaderToEqual(Metric.FileType, mockEngine.FileType.fileTypeName));
            it("should have set EngineLoadTime header", () => expectHeaderToEqual(Metric.EngineLoadTime, mockTimer.Elapsed()));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Type", "application/json"));

            it("should have set the correct number of headers", () => {
                expect(Object.keys(workflow.Response.headers).length).to.equal(14);
            });
        });

        describe("when request is valid but file could not be rebuilt due to error", () => {
            const base64In = "d293IHlvdSByZWFsbHkgdG9vayB0aGUgdGltZSB0byBkZWNvZGUgdGhpcyB0ZXN0IGNhc2U=";
            const base64InBuffer = Buffer.from(base64In, "base64");

            beforeEach(async () => {
                commonSetup();

                workflow.Request.body = {
                    Base64: base64In
                };

                mockEngine.RebuildResponse = {
                    protectedFile: null,
                    engineOutcome: EngineOutcome.Error,
                    engineOutcomeName: "Error",
                    errorMessage: "Some error"
                };

                await workflow.Handle();

                if (workflow.Response.statusCode === 500) {
                    console.log(workflow.Response);
                }
            });

            it("should set response to Unprocessable entity", () => {
                expect(workflow.Response.statusCode).to.equal(422);
            });

            it("should set response body", () => {
                expect(workflow.Response.rawBody).not.to.be.undefined;
                expect(workflow.Response.rawBody).not.equal(null);
            });

            it("should set error in body", () => {
                expect(workflow.Response.rawBody.error).to.equal(mockEngine.RebuildResponse.errorMessage);
            });

            it("should have called detect file", () => {
                expect(mockEngine.GetFileTypeInvocations.length).to.equal(1);
            });

            it("should have called get library version", () => {
                expect(mockEngine.GetLibraryVersionInvocations.length).to.equal(1);
            });

            it("should have called rebuild", () => {
                expect(mockEngine.RebuildInvocations.length).to.equal(1);
                expect(base64InBuffer.equals(mockEngine.RebuildInvocations[0][0])).to.be.true;
            });

            it("should have set configuration", () => {
                expect(mockEngine.SetConfigurationInvocations.length).to.equal(1);
                expect(mockEngine.SetConfigurationInvocations[0][0]).to.be.instanceOf(ContentManagementFlags);
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, mockTimer.Elapsed()));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, base64InBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, mockTimer.Elapsed()));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, Metric.DefaultValue));
            it("should have set ProtectedFileSize header", () => expectHeaderToEqual(Metric.ProtectedFileSize, 0));
            it("should have set UploadSize header", () => expectHeaderToEqual(Metric.UploadSize, Metric.DefaultValue));
            it("should have set UploadTime header", () => expectHeaderToEqual(Metric.UploadTime, Metric.DefaultValue));
            it("should have set UploadEtag header", () => expectHeaderToEqual(Metric.UploadEtag, Metric.DefaultValue));
            it("should have set FileType header", () => expectHeaderToEqual(Metric.FileType, mockEngine.FileType.fileTypeName));
            it("should have set EngineLoadTime header", () => expectHeaderToEqual(Metric.EngineLoadTime, mockTimer.Elapsed()));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Type", "application/json"));

            it("should have set the correct number of headers", () => {
                expect(Object.keys(workflow.Response.headers).length).to.equal(14);
            });
        });

        describe("when request is valid but file could not be rebuilt due to disallow", () => {
            const base64In = "d293IHlvdSByZWFsbHkgdG9vayB0aGUgdGltZSB0byBkZWNvZGUgdGhpcyB0ZXN0IGNhc2U=";
            const base64Out = "d293IHlvdSBkZWNvZGVkIHRoaXMgb25lIHRvbz8gb3IgbWF5YmUgeW91IGp1c3QgZGlkIHRoaXMgb25lIGlkaw==";

            const base64InBuffer = Buffer.from(base64In, "base64");
            const base64OutBuffer = Buffer.from(base64Out, "base64");

            beforeEach(async () => {
                commonSetup();

                workflow.Request.body = {
                    Base64: base64In
                };

                mockEngine.RebuildResponse = {
                    protectedFile: null,
                    engineOutcome: EngineOutcome.Error,
                    engineOutcomeName: "Error",
                    errorMessage: "embedded potatoes were disallowed"
                };

                await workflow.Handle();

                if (workflow.Response.statusCode === 500) {
                    console.log(workflow.Response);
                }
            });

            it("should set response to OK", () => {
                expect(workflow.Response.statusCode).to.equal(200);
            });

            it("should set response body", () => {
                expect(workflow.Response.rawBody).not.to.be.undefined;
                expect(workflow.Response.rawBody).not.equal(null);
            });

            it("should set error in body", () => {
                expect(workflow.Response.rawBody.error).to.equal(mockEngine.RebuildResponse.errorMessage);
            });

            it("should have set configuration", () => {
                expect(mockEngine.SetConfigurationInvocations.length).to.equal(1);
                expect(mockEngine.SetConfigurationInvocations[0][0]).to.be.instanceOf(ContentManagementFlags);
            });

            it("should have called detect file", () => {
                expect(mockEngine.GetFileTypeInvocations.length).to.equal(1);
            });

            it("should have called get library version", () => {
                expect(mockEngine.GetLibraryVersionInvocations.length).to.equal(1);
            });

            it("should have called rebuild", () => {
                expect(mockEngine.RebuildInvocations.length).to.equal(1);
                expect(base64InBuffer.equals(mockEngine.RebuildInvocations[0][0])).to.be.true;
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, mockTimer.Elapsed()));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, base64InBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, mockTimer.Elapsed()));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, Metric.DefaultValue));
            it("should have set ProtectedFileSize header", () => expectHeaderToEqual(Metric.ProtectedFileSize, 0));
            it("should have set UploadSize header", () => expectHeaderToEqual(Metric.UploadSize, Metric.DefaultValue));
            it("should have set UploadTime header", () => expectHeaderToEqual(Metric.UploadTime, Metric.DefaultValue));
            it("should have set UploadEtag header", () => expectHeaderToEqual(Metric.UploadEtag, Metric.DefaultValue));
            it("should have set FileType header", () => expectHeaderToEqual(Metric.FileType, mockEngine.FileType.fileTypeName));
            it("should have set EngineLoadTime header", () => expectHeaderToEqual(Metric.EngineLoadTime, mockTimer.Elapsed()));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Type", "application/json"));

            it("should have set the correct number of headers", () => {
                expect(Object.keys(workflow.Response.headers).length).to.equal(14);
            });
        });

        describe("when request throws an exception", () => {
            const base64In = "d293IHlvdSByZWFsbHkgdG9vayB0aGUgdGltZSB0byBkZWNvZGUgdGhpcyB0ZXN0IGNhc2U=";

            beforeEach(async () => {
                commonSetup();

                workflow.tryParseBase64 = (): Promise<Buffer> => {
                    throw "error";
                };

                workflow.Request.body = {
                    Base64: base64In
                };

                await workflow.Handle();
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages.length).to.equal(1);
                expect(mockLogger.loggedMessages[0]).to.equal("error");
            });

            it("should set status code to 500", () => {
                expect(workflow.Response.statusCode).to.equal(500);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, Metric.DefaultValue));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, Metric.DefaultValue));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, Metric.DefaultValue));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, Metric.DefaultValue));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, Metric.DefaultValue));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, Metric.DefaultValue));
            it("should have set ProtectedFileSize header", () => expectHeaderToEqual(Metric.ProtectedFileSize, Metric.DefaultValue));
            it("should have set UploadSize header", () => expectHeaderToEqual(Metric.UploadSize, Metric.DefaultValue));
            it("should have set UploadTime header", () => expectHeaderToEqual(Metric.UploadTime, Metric.DefaultValue));
            it("should have set UploadEtag header", () => expectHeaderToEqual(Metric.UploadEtag, Metric.DefaultValue));
            it("should have set FileType header", () => expectHeaderToEqual(Metric.FileType, Metric.DefaultValue));
            it("should have set EngineLoadTime header", () => expectHeaderToEqual(Metric.EngineLoadTime, Metric.DefaultValue));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Type", "application/json"));

            it("should have set the correct number of headers", () => {
                expect(Object.keys(workflow.Response.headers).length).to.equal(14);
            });
        });
    });
});