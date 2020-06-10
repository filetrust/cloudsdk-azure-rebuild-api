/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import { RequestWorkflowRequest } from "./abstraction/requestWorkflow";

/** Mock dependencies */
import EngineService from "../../business/services/engineService";
import EngineServiceFactory from "../../business/services/engineServiceFactory";
import MockEngine from "../../common/test/mocks/mockEngine";
import Timer from "../../common/timer";
import { ArgumentException } from "../../common/errors/errors";
import multipartHelper = require("../../common/http/multipartHelper");
import EngineOutcome from "../../business/engine/enums/engineOutcome";
import Metric from "../../common/metric";
import FileType from "../../business/engine/enums/fileType";
import ContentManagementFlags from "../../business/engine/contentManagementFlags";
import RebuildFileWorkflow from "./rebuildFileWorkflow";
import contentDisposition = require("content-disposition");
import MockLogger from "../../common/test/mocks/mockLogger";

const fileInBuffer = Buffer.from("IN");
const fileName = "test.pdf";

const fileOutBuffer = Buffer.from("OUT");

const mockLogger = new MockLogger();

describe("rebuild file workflow", () => {
    const requestMock: RequestWorkflowRequest = {
        method: "POST",
        url: "example.com"
    };

    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            const workflow = new RebuildFileWorkflow(mockLogger, requestMock);

            expect(workflow.Logger).to.equal(mockLogger);
            expect(workflow.Response.statusCode).to.equal(200);
            expect(workflow.Request).to.equal(requestMock);
        });

        const constructorTest = <TException extends ArgumentException>(logger: { log: (message: string) => void }, request: RequestWorkflowRequest, expectedArg: string): void => {
            try {
                new RebuildFileWorkflow(logger, request);
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
        let workflow: RebuildFileWorkflow;
        let requestMock: RequestWorkflowRequest;
        let mockEngine: MockEngine;
        let mockTimer: Timer;

        const commonSetup = (): void => {
            mockEngine = new MockEngine();

            mockLogger.loggedMessages = [];

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

            workflow = new RebuildFileWorkflow(mockLogger, requestMock);
        };

        const expectHeaderToEqual = (expectedHeader: string, expected: any): void => {
            const actual = workflow.Response.headers[expectedHeader];
            expect(Object.keys(workflow.Response.headers)).to.contain(expectedHeader);
            expect(actual, `Expected header '${expectedHeader}' to equal '${expected}' but it was '${actual}'. Response: ${JSON.stringify(workflow.Response)}. Messages Logged: ${JSON.stringify(mockLogger.loggedMessages)}`).to.equal(expected);
        };

        describe("when request form cannot be read", () => {
            beforeEach(async () => {
                commonSetup();

                multipartHelper.parseMultiPartForm = async (): Promise<multipartHelper.multipart[]> => {
                    return null;
                };

                await workflow.Handle();
            });

            it("should set response to bad request", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });

            it("should set body errors", () => {
                expect(workflow.Response.rawBody.errors.Form).to.equal("Could not read the supplied form.");
            });
        });

        const fileTest = (testCase: Buffer, expectedMessage: string): void => {
            beforeEach(async () => {
                commonSetup();

                workflow.tryReadForm = (): Promise<multipartHelper.multipart[]> => {
                    return Promise.resolve([{
                        data: testCase,
                        fieldName: "file",
                        fileName
                    }]);
                };

                await workflow.Handle();
            });

            it("should set response to bad request", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });

            it("should set body errors", async () => {
                expect(workflow.Response.rawBody.errors).to.have.key("File");
                expect(workflow.Response.rawBody.errors.File).to.equal(expectedMessage);
            });
        };

        describe("when request body contains null file", () => fileTest(null, "File does not have any data"));
        describe("when request body contains undefined file", () => fileTest(undefined, "File does not have any data"));
        describe("when request body contains empty file", () => fileTest(Buffer.alloc(0), "File does not have any data"));

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
            beforeEach(async () => {
                commonSetup();

                mockEngine.RebuildResponse = {
                    protectedFile: fileOutBuffer,
                    protectedFileLength: fileOutBuffer.length,
                    engineOutcome: EngineOutcome.Success,
                    engineOutcomeName: "Success",
                    errorMessage: null
                };

                mockEngine.FileType = {
                    fileType: FileType.Pdf,
                    fileTypeName: "Pdf"
                };

                multipartHelper.parseMultiPartForm = (): Promise<multipartHelper.multipart[]> => {
                    return Promise.resolve([{
                        data: fileInBuffer,
                        fieldName: "file",
                        fileName
                    }]);
                };

                await workflow.Handle();
            });

            it("should set response to OK", () => {
                expect(workflow.Response.statusCode).to.equal(200);
            });

            it("should set response body", () => {
                expect(workflow.Response.rawBody).not.to.be.undefined;
                expect(workflow.Response.rawBody).not.equal(null);
            });

            it("should set file in body", () => {
                expect(workflow.Response.rawBody).to.equal(fileOutBuffer);
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
                expect(mockEngine.RebuildInvocations[0][0].equals(fileInBuffer)).to.be.true;
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, Metric.DefaultValue));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, fileInBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, mockTimer.Elapsed()));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, mockTimer.Elapsed()));
            it("should have set ProtectedFileSize header", () => expectHeaderToEqual(Metric.ProtectedFileSize, fileOutBuffer.length));
            it("should have set UploadSize header", () => expectHeaderToEqual(Metric.UploadSize, Metric.DefaultValue));
            it("should have set UploadTime header", () => expectHeaderToEqual(Metric.UploadTime, Metric.DefaultValue));
            it("should have set UploadEtag header", () => expectHeaderToEqual(Metric.UploadEtag, Metric.DefaultValue));
            it("should have set FileType header", () => expectHeaderToEqual(Metric.FileType, mockEngine.FileType.fileTypeName));
            it("should have set EngineLoadTime header", () => expectHeaderToEqual(Metric.EngineLoadTime, mockTimer.Elapsed()));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Type", "application/octet-stream"));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Length", fileOutBuffer.length));
            it("should have set Content-Type header", () => expectHeaderToEqual("Content-Disposition", contentDisposition(fileName)));

            it("should have set the correct number of headers", () => {
                expect(Object.keys(workflow.Response.headers).length).to.equal(16);
            });
        });

        describe("when request is valid but file type is unsupported", () => {
            beforeEach(async () => {
                commonSetup();

                mockEngine.RebuildResponse = {
                    protectedFile: fileOutBuffer,
                    protectedFileLength: fileOutBuffer.length,
                    engineOutcome: EngineOutcome.Success,
                    engineOutcomeName: "Success",
                    errorMessage: null
                };

                mockEngine.FileType = {
                    fileType: FileType.Unknown,
                    fileTypeName: "Unknown"
                };

                multipartHelper.parseMultiPartForm = (): Promise<multipartHelper.multipart[]> => {
                    return Promise.resolve([{
                        data: fileInBuffer,
                        fieldName: "file",
                        fileName
                    }]);
                };

                await workflow.Handle();
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
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, Metric.DefaultValue));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, fileInBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, Metric.DefaultValue));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, mockTimer.Elapsed()));
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
            beforeEach(async () => {
                commonSetup();

                mockEngine.RebuildResponse = {
                    protectedFile: null,
                    engineOutcome: EngineOutcome.Error,
                    engineOutcomeName: "Error",
                    errorMessage: "embedded potatoes were errorneous"
                };

                mockEngine.FileType = {
                    fileType: FileType.Pdf,
                    fileTypeName: "Pdf"
                };

                multipartHelper.parseMultiPartForm = (): Promise<multipartHelper.multipart[]> => {
                    return Promise.resolve([{
                        data: fileInBuffer,
                        fieldName: "file",
                        fileName
                    }]);
                };

                await workflow.Handle();
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
                expect(fileInBuffer.equals(mockEngine.RebuildInvocations[0][0])).to.be.true;
            });

            it("should have set configuration", () => {
                expect(mockEngine.SetConfigurationInvocations.length).to.equal(1);
                expect(mockEngine.SetConfigurationInvocations[0][0]).to.be.instanceOf(ContentManagementFlags);
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, Metric.DefaultValue));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, fileInBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, mockTimer.Elapsed()));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, mockTimer.Elapsed()));
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
            beforeEach(async () => {
                commonSetup();

                mockEngine.RebuildResponse = {
                    protectedFile: null,
                    engineOutcome: EngineOutcome.Error,
                    engineOutcomeName: "Error",
                    errorMessage: "embedded potatoes were disallowed"
                };

                mockEngine.FileType = {
                    fileType: FileType.Pdf,
                    fileTypeName: "Pdf"
                };

                multipartHelper.parseMultiPartForm = (): Promise<multipartHelper.multipart[]> => {
                    return Promise.resolve([{
                        data: fileInBuffer,
                        fieldName: "file",
                        fileName
                    }]);
                };

                await workflow.Handle();
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
                expect(fileInBuffer.equals(mockEngine.RebuildInvocations[0][0])).to.be.true;
            });

            it("should have disposed engine", () => {
                expect(mockEngine.DisposeInvocations.length).to.equal(1);
            });

            it("should have set DetectFileTypeTime header", () => expectHeaderToEqual(Metric.DetectFileTypeTime, mockTimer.Elapsed()));
            it("should have set Base64DecodeTime header", () => expectHeaderToEqual(Metric.Base64DecodeTime, Metric.DefaultValue));
            it("should have set FileSize header", () => expectHeaderToEqual(Metric.FileSize, fileInBuffer.length));
            it("should have set DownloadTime header", () => expectHeaderToEqual(Metric.DownloadTime, Metric.DefaultValue));
            it("should have set Version header", () => expectHeaderToEqual(Metric.Version, mockEngine.LibVersion));
            it("should have set RebuildTime header", () => expectHeaderToEqual(Metric.RebuildTime, mockTimer.Elapsed()));
            it("should have set FormFileReadTime header", () => expectHeaderToEqual(Metric.FormFileReadTime, mockTimer.Elapsed()));
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
            beforeEach(async () => {
                commonSetup();

                workflow.tryReadForm = (): Promise<multipartHelper.multipart[]> => {
                    throw "error";
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

        describe("when there are no files in the form", () => {
            beforeEach(async () => {
                commonSetup();

                multipartHelper.parseMultiPartForm = async (): Promise<multipartHelper.multipart[]> => {
                    return [];
                };

                await workflow.Handle();
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages.length).to.equal(1);
                expect(mockLogger.loggedMessages[0]).to.equal("File could not be found in form");
            });

            it("should set status code to 400", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });
        });
        
        describe("when file has no data", () => {
            beforeEach(async () => {
                commonSetup();

                multipartHelper.parseMultiPartForm = async (): Promise<multipartHelper.multipart[]> => {
                    return [
                        {
                            data: null,
                            fieldName: "file"
                        }
                    ];
                };

                await workflow.Handle();
            });

            it("should set status code to 400", () => {
                expect(workflow.Response.statusCode).to.equal(400);
            });
        });
    });
});