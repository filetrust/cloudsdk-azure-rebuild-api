/* eslint-disable @typescript-eslint/no-explicit-any */
import "mocha";
import { expect } from "chai";
import EngineService, { FileTypeResponse, EngineStatusResponse, RebuildResponse } from "./engineService";
import LibGlasswallClassic = require("../engine/libGlasswallClassic");
import Sinon = require("sinon");
import MockLogger from "../../common/test/mocks/mockLogger";
import FileType from "../engine/enums/fileType";
import EngineOutcome from "../engine/enums/engineOutcome";
import { ArgumentNullException, ArgumentException } from "../../common/errors/errors";
import ContentManagementFlags from "../engine/contentManagementFlags";
import { fail } from "assert";

describe("engineServiceFactory", () => {
    let mockLogger: MockLogger;
    let stubEngine: Sinon.SinonStub;
    let stubEngineInstance: Sinon.SinonStubbedInstance<LibGlasswallClassic.default>;

    beforeEach(() => {
        mockLogger = new MockLogger();
        stubEngineInstance = Sinon.createStubInstance(LibGlasswallClassic.default);
        stubEngine = Sinon.stub(LibGlasswallClassic, "default").returns(stubEngineInstance);
    });

    afterEach(() => {
        stubEngine.restore();
    });

    describe("constructor", () => {
        let originalPlatform: PropertyDescriptor;

        beforeEach(() => {
            originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
        });

        afterEach(() => {
            Object.defineProperty(process, "platform", {
                value: originalPlatform
            });
        });

        it("should construct with valid args", () => {
            const engineService = new EngineService(mockLogger);

            expect(engineService.Logger).to.equal(mockLogger);
            expect(engineService.Sdk).to.equal(stubEngineInstance);
        });

        it("should set up the engine path on win32", () => {
            Object.defineProperty(process, "platform", {
                value: "win32"
            });

            new EngineService(mockLogger);

            const engineConstructorCalls = stubEngine.getCalls();
            expect(engineConstructorCalls).lengthOf(1);
            expect(engineConstructorCalls[0].args).lengthOf(1);
            expect(engineConstructorCalls[0].args[0]).to.equal(process.cwd() + "\\dist\\lib\\windows\\SDK\\glasswall.classic.dll");
        });

        it("should set up the engine path on linux", () => {
            Object.defineProperty(process, "platform", {
                value: "linux"
            });

            new EngineService(mockLogger);

            const engineConstructorCalls = stubEngine.getCalls();
            expect(engineConstructorCalls).lengthOf(1);
            expect(engineConstructorCalls[0].args).lengthOf(1);
            expect(engineConstructorCalls[0].args[0]).to.equal(process.cwd() + "/dist/lib/linux/SDK/libglasswall.classic.so");
        });
    });

    describe("dispose method", () => {
        it("should dispose sdk", () => {
            const engineService = new EngineService(mockLogger);
            engineService.Dispose();

            expect(engineService.Logger).to.be.null;
            expect(engineService.Sdk).to.be.null;
            expect(stubEngineInstance.Dispose.getCalls()).lengthOf(1);
        });
    });

    describe("GetLibraryVersion method", () => {
        let engineService: EngineService;
        const expected = "1.2.3.4.5.6.7";
        let actual: string;

        describe("when lib call is successful", () => {
            beforeEach(() => {
                stubEngineInstance.GWFileVersion.returns(expected);
                engineService = new EngineService(mockLogger);
                actual = engineService.GetLibraryVersion();
            });

            it("should return correct value", () => {
                expect(actual).to.equal(expected);
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWFileVersion.getCalls();

                expect(calls).lengthOf(1);
            });
        });

        describe("when lib call throws", () => {
            let error: Error;

            beforeEach(() => {
                error = new Error("banana");
                stubEngineInstance.GWFileVersion.throws(error);
                engineService = new EngineService(mockLogger);
                actual = engineService.GetLibraryVersion();
            });

            it("should return correct value", () => {
                expect(actual).to.equal("Error Retrieving");
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWFileVersion.getCalls();

                expect(calls).lengthOf(1);
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain(error);
            });
        });
    });

    describe("Rebuild method", () => {
        let engineService: EngineService;
        let inputBuffer: Buffer;
        let inputFileType: string;
        let expected: RebuildResponse;
        let actual: RebuildResponse;

        describe("when buffer is not defined", () => {
            it("should throw with null buffer", () => {
                try {
                    new EngineService(mockLogger).Rebuild(null, "Bmp");
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("buffer");
                }
            });
            it("should throw with undefined buffer", () => {
                try {
                    new EngineService(mockLogger).Rebuild(undefined, "Bmp");
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("buffer");
                }
            });
            it("should throw with empty buffer", () => {
                try {
                    new EngineService(mockLogger).Rebuild(Buffer.alloc(0), "Bmp");
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentException);
                    expect(err.argumentName).to.equal("buffer");
                }
            });
        });

        describe("when filetype is not defined", () => {
            it("should throw with null filetype", () => {
                try {
                    new EngineService(mockLogger).Rebuild(Buffer.from("TEST"), undefined);
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("fileType");
                }
            });
            it("should throw with undefined filetype", () => {
                try {
                    new EngineService(mockLogger).Rebuild(Buffer.from("TEST"), undefined);
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("fileType");
                }
            });
            it("should throw with empty filetype", () => {
                try {
                    new EngineService(mockLogger).Rebuild(Buffer.from("TEST"), "");
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentException);
                    expect(err.argumentName).to.equal("fileType");
                }
            });
        });

        describe("when lib call is successful", () => {
            beforeEach(() => {
                inputBuffer = Buffer.from("TEST");
                inputFileType = "TEST";

                expected = {
                    engineOutcome: EngineOutcome.Success,
                    engineOutcomeName: "Success",
                    protectedFile: inputBuffer,
                    protectedFileLength: inputBuffer.length,
                    errorMessage: ""
                };

                stubEngineInstance.GWMemoryToMemoryProtect.returns({
                    engineOutcome: expected.engineOutcome,
                    protectedFile: expected.protectedFile
                });

                engineService = new EngineService(mockLogger);
                actual = engineService.Rebuild(inputBuffer, inputFileType);
            });

            it("should return correct value", () => {
                Object.keys(expected).forEach(key => {
                    expect(actual[key], key).to.equal(expected[key]);
                });
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWMemoryToMemoryProtect.getCalls();

                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(2);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputFileType);
            });

            it("should log filetype", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("Successfully rebuilt file.");
            });
        });

        describe("when lib call is successful with no data", () => {
            beforeEach(() => {
                inputBuffer = Buffer.from("TEST");
                inputFileType = "TEST";

                expected = {
                    engineOutcome: EngineOutcome.Success,
                    engineOutcomeName: "Success",
                    protectedFile: null,
                    protectedFileLength: undefined,
                    errorMessage: ""
                };

                stubEngineInstance.GWMemoryToMemoryProtect.returns({
                    engineOutcome: expected.engineOutcome,
                    protectedFile: null
                });

                engineService = new EngineService(mockLogger);
                actual = engineService.Rebuild(inputBuffer, inputFileType);
            });

            it("should return correct value", () => {
                Object.keys(expected).forEach(key => {
                    expect(actual[key], key).to.equal(expected[key]);
                });
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWMemoryToMemoryProtect.getCalls();

                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(2);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputFileType);
            });

            it("should log filetype", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("Successfully rebuilt file.");
            });
        });

        describe("when lib call is unsuccessful", () => {
            beforeEach(() => {
                expected = {
                    engineOutcome: EngineOutcome.Error,
                    engineOutcomeName: "Error",
                    errorMessage: "Error"
                };
                inputBuffer = Buffer.from("TEST");
                inputFileType = "TEST";

                stubEngineInstance.GWMemoryToMemoryProtect.returns({
                    engineOutcome: expected.engineOutcome
                });
                stubEngineInstance.GWFileErrorMsg.returns(expected.errorMessage);
                engineService = new EngineService(mockLogger);
                actual = engineService.Rebuild(inputBuffer, inputFileType);
            });

            it("should return correct value", () => {
                Object.keys(expected).forEach(key => {
                    expect(actual[key], key).to.equal(expected[key]);
                });
            });

            it("should call GWMemoryToMemoryProtect", () => {
                const calls = stubEngineInstance.GWMemoryToMemoryProtect.getCalls();

                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(2);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputFileType);
            });

            it("should call GWFileErrorMsg", () => {
                const calls = stubEngineInstance.GWFileErrorMsg.getCalls();

                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(0);
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWMemoryToMemoryProtect.getCalls();

                expect(calls).lengthOf(1);
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("Unable to protect file: Error");
            });
        });

        describe("when lib call throws", () => {
            let error: Error;

            beforeEach(() => {
                expected = {
                    engineOutcome: EngineOutcome.Error,
                    engineOutcomeName: "Error",
                    errorMessage: "Error"
                };
                inputBuffer = Buffer.from("TEST");
                inputFileType = "TEST";

                error = new Error("ERROR");
                stubEngineInstance.GWMemoryToMemoryProtect.throws(error);
                stubEngineInstance.GWFileErrorMsg.returns(expected.errorMessage);
                engineService = new EngineService(mockLogger);

                try {
                    actual = engineService.Rebuild(inputBuffer, inputFileType);

                    fail();
                }
                catch (err) {
                    expect(err).to.equal(error);
                }
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWMemoryToMemoryProtect.getCalls();

                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(2);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputFileType);
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("Error rebuilding file: " + error.toString());
            });
        });
    });

    describe("GetFileType method", () => {
        let engineService: EngineService;
        let inputBuffer: Buffer;

        const expected: FileTypeResponse = {
            fileType: FileType.Bmp,
            fileTypeName: "Bmp"
        };

        let actual: FileTypeResponse;

        describe("when buffer is not defined", () => {
            it("should throw with null buffer", () => {
                try {
                    new EngineService(mockLogger).GetFileType(null);
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("buffer");
                }
            });
            it("should throw with undefined buffer", () => {
                try {
                    new EngineService(mockLogger).GetFileType(undefined);
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("buffer");
                }
            });
            it("should throw with empty buffer", () => {
                try {
                    new EngineService(mockLogger).GetFileType(Buffer.alloc(0));
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentException);
                    expect(err.argumentName).to.equal("buffer");
                }
            });
        });

        describe("when lib call is successful", () => {
            beforeEach(() => {
                inputBuffer = Buffer.from("TEST");
                stubEngineInstance.GWDetermineFileTypeFromFileInMem.returns(expected.fileType);
                engineService = new EngineService(mockLogger);
                actual = engineService.GetFileType(inputBuffer);
            });

            it("should return correct value", () => {
                expect(actual.fileType).to.equal(expected.fileType);
                expect(actual.fileTypeName).to.equal(expected.fileTypeName);
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWDetermineFileTypeFromFileInMem.getCalls();

                expect(calls).lengthOf(1);
            });

            it("should log filetype", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("File Type: '" + expected.fileType + "' - '" + expected.fileTypeName + "'");
            });
        });

        describe("when lib call throws", () => {
            let error: Error;

            beforeEach(() => {
                inputBuffer = Buffer.from("TEST");
                error = new Error("banana");
                stubEngineInstance.GWDetermineFileTypeFromFileInMem.throws(error);
                engineService = new EngineService(mockLogger);
                actual = engineService.GetFileType(inputBuffer);
            });

            it("should return correct value", () => {
                expect(actual.fileType).to.equal(FileType.Unknown);
                expect(actual.fileTypeName).to.equal("Unknown");
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWDetermineFileTypeFromFileInMem.getCalls();

                expect(calls).lengthOf(1);
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("Error, defaulting to Unknown. Error: " + error.toString());
            });
        });
    });

    describe("SetConfiguration method", () => {
        describe("when buffer is not defined", () => {
            it("should throw with null buffer", () => {
                try {
                    new EngineService(mockLogger).SetConfiguration(null);
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("contentManagementFlags");
                }
            });
            it("should throw with undefined buffer", () => {
                try {
                    new EngineService(mockLogger).SetConfiguration(undefined);
                }
                catch (err) {
                    expect(err).instanceOf(ArgumentNullException);
                    expect(err.argumentName).to.equal("contentManagementFlags");
                }
            });
        });

        describe("when lib call is successful", () => {
            const expectedXml = "xml";
            let inputFlags: ContentManagementFlags;

            let actual: EngineStatusResponse;
            let stubAdapt: Sinon.SinonStub;

            const expected: EngineStatusResponse = {
                engineOutcome: EngineOutcome.Success,
                engineOutcomeName: "Success",
            };

            beforeEach(() => {
                inputFlags = new ContentManagementFlags();
                stubAdapt = Sinon.stub(inputFlags, "Adapt").returns(expectedXml);
                stubEngineInstance.GWFileConfigXML.returns(expected.engineOutcome);

                actual = new EngineService(mockLogger).SetConfiguration(inputFlags);
            });

            afterEach(() => {
                stubAdapt.restore();
            });

            it("should adapt content management flags", () => {
                expect(stubAdapt.getCalls()).lengthOf(1);
            });

            it("should call engine", () => {
                expect(stubEngineInstance.GWFileConfigXML.getCalls()).lengthOf(1);
                expect(stubEngineInstance.GWFileConfigXML.getCalls()[0].args).lengthOf(1);
                expect(stubEngineInstance.GWFileConfigXML.getCalls()[0].args[0]).to.equal(expectedXml);
            });

            it("should return engine result", () => {
                expect(actual.engineOutcome).to.equal(expected.engineOutcome);
                expect(actual.engineOutcomeName).to.equal(expected.engineOutcomeName);
            });

            it("should log", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages[0]).to.equal("Successfully set configuration");
            });
        });

        describe("when lib call is unsuccessful", () => {
            const expectedXml = "xml";
            const error = "ERROR";

            let inputFlags: ContentManagementFlags;

            let stubAdapt: Sinon.SinonStub;

            const expected: EngineStatusResponse = {
                engineOutcome: EngineOutcome.Error,
                engineOutcomeName: "Error",
            };

            beforeEach(() => {
                inputFlags = new ContentManagementFlags();
                stubAdapt = Sinon.stub(inputFlags, "Adapt").returns(expectedXml);
                stubEngineInstance.GWFileConfigXML.returns(expected.engineOutcome);
                stubEngineInstance.GWFileErrorMsg.returns(error);

                try {
                    new EngineService(mockLogger).SetConfiguration(inputFlags);
                }
                catch (err) {
                    expect(err).to.equal("Could not set Engine Configuration, status: Error error: ERROR");
                }
            });

            afterEach(() => {
                stubAdapt.restore();
            });

            it("should adapt content management flags", () => {
                expect(stubAdapt.getCalls()).lengthOf(1);
            });

            it("should call GWFileErrorMsg", () => {
                expect(stubEngineInstance.GWFileErrorMsg.getCalls()).lengthOf(1);
                expect(stubEngineInstance.GWFileErrorMsg.getCalls()[0].args).lengthOf(0);
            });

            it("should call GWFileConfigXML", () => {
                expect(stubEngineInstance.GWFileConfigXML.getCalls()).lengthOf(1);
                expect(stubEngineInstance.GWFileConfigXML.getCalls()[0].args).lengthOf(1);
                expect(stubEngineInstance.GWFileConfigXML.getCalls()[0].args[0]).to.equal(expectedXml);
            });

            it("should log", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages[0]).to.equal(`Could not set engine config, inner error Could not set Engine Configuration, status: Error error: ${error}`);
            });
        });
    });

    describe("GetErrorMessage method", () => {
        let engineService: EngineService;
        const expected = "1.2.3.4.5.6.7";
        let actual: string;

        describe("when lib call is successful", () => {
            beforeEach(() => {
                stubEngineInstance.GWFileErrorMsg.returns(expected);
                engineService = new EngineService(mockLogger);
                actual = engineService.GetErrorMessage();
            });

            it("should return correct value", () => {
                expect(actual).to.equal(expected);
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWFileErrorMsg.getCalls();

                expect(calls).lengthOf(1);
            });
        });

        describe("when lib call throws", () => {
            let error: Error;

            beforeEach(() => {
                error = new Error("banana");
                stubEngineInstance.GWFileErrorMsg.throws(error);

                try {
                    new EngineService(mockLogger).GetErrorMessage();
                    fail();
                }
                catch (err) {
                    expect(err).to.equal(error);
                }
            });

            it("should call engine", () => {
                const calls = stubEngineInstance.GWFileErrorMsg.getCalls();

                expect(calls).lengthOf(1);
            });

            it("should log error", () => {
                expect(mockLogger.loggedMessages).lengthOf(1);
                expect(mockLogger.loggedMessages).contain("Error getting Error from engine: " + error.toString());
            });
        });
    });
});