/* eslint-disable @typescript-eslint/no-explicit-any */
import "mocha";
import { expect } from "chai";
import LibGlasswallClassic from "./libGlasswallClassic";
import { stub, createStubInstance, SinonStub, SinonStubbedInstance } from "sinon";

/** class in test dependencies */
import fs = require("fs");
import ffi = require("ffi-napi");
import MethodWrapper = require("../../common/ffi/dynamicLibraryMethod");
import { ArgumentNullException } from "../../common/errors/errors";

let existsStub: SinonStub;
let dynamicLibraryStub: SinonStub;
let methodWrapperStub: SinonStub;

let lib: SinonStubbedInstance<ffi.DynamicLibrary>;
let methodWrapper: SinonStubbedInstance<MethodWrapper.default>;

describe("libGlasswallClassic", () => {
    let engine: LibGlasswallClassic;
    let inputPath: string;

    beforeEach(() => {
        methodWrapper = createStubInstance(MethodWrapper.default);
        lib = createStubInstance(ffi.DynamicLibrary);

        existsStub = stub(fs, "existsSync");
        dynamicLibraryStub = stub(ffi, "DynamicLibrary").returns(lib);
        methodWrapperStub = stub(MethodWrapper, "default").returns(methodWrapper);
    });

    afterEach(() => {
        existsStub.restore();
        dynamicLibraryStub.restore();
        methodWrapperStub.restore();
    });

    describe("constructor", () => {
        it("should construct with valid args", async () => {
            existsStub.returns(true);
            inputPath = "/home/test.so";

            engine = new LibGlasswallClassic(inputPath);

            expect(engine._GlasswallEngine).to.equal(lib);
            expect(engine._GWFileErrorMsg).to.equal(methodWrapper);
            expect(engine._GWFileDone).to.equal(methodWrapper);
            expect(engine._GWFileVersion).to.equal(methodWrapper);
            expect(engine._GWDetermineFileTypeFromFileInMem).to.equal(methodWrapper);
            expect(engine._GWFileConfigXML).to.equal(methodWrapper);
            expect(engine._GWMemoryToMemoryProtect).to.equal(methodWrapper);
        });

        it("should throw with missing file", () => {
            expect(() => {
                new LibGlasswallClassic(inputPath);
            }).to.throw("Cannot find DLL at /home/test.so");
        });
    });

    describe("GWFileVersion", () => {
        const expected = "1.2.3.4";
        let actual: string;

        beforeEach(() => {
            existsStub.returns(true);

            engine = new LibGlasswallClassic(inputPath);

            methodWrapper.Execute.returns(expected);

            actual = engine.GWFileVersion();
        });

        it("should execute method", () => {
            const calls = methodWrapper.Execute.getCalls();
            expect(calls).lengthOf(1);
            expect(calls[0].args).lengthOf(0);
        });

        it("should return result", () => {
            expect(actual).to.equal(expected);
        });
    });

    describe("GWDetermineFileTypeFromFileInMem", () => {
        const expected = 23;
        let actual: number;
        let inputBuffer: Buffer;

        describe("when buffer is not quite right", () => {
            beforeEach(() => {
                existsStub.returns(true);
                engine = new LibGlasswallClassic(inputPath);
            });

            it("should throw when buffer is null", () => {
                expect(() => {
                    engine.GWDetermineFileTypeFromFileInMem(null);
                }).to.throw(ArgumentNullException).with.property("argumentName").to.equal("buffer");
            });
        });

        describe("when buffer is correct", () => {
            beforeEach(() => {
                existsStub.returns(true);

                engine = new LibGlasswallClassic(inputPath);

                methodWrapper.Execute.returns(expected);
                inputBuffer = Buffer.from("SUCCESS");

                actual = engine.GWDetermineFileTypeFromFileInMem(inputBuffer);
            });

            it("should execute method", () => {
                const calls = methodWrapper.Execute.getCalls();
                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(2);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputBuffer.length);
            });

            it("should return result", () => {
                expect(actual).to.equal(expected);
            });
        });
    });

    describe("GWFileConfigXML", () => {
        const expected = 23;
        let actual: number;
        let inputBuffer: Buffer;

        describe("when string is not quite right", () => {
            beforeEach(() => {
                existsStub.returns(true);
                engine = new LibGlasswallClassic(inputPath);
            });

            it("should throw when buffer is null", () => {
                expect(() => {
                    engine.GWDetermineFileTypeFromFileInMem(null);
                }).to.throw(ArgumentNullException).with.property("argumentName").to.equal("buffer");
            });
        });

        describe("when buffer is correct", () => {
            beforeEach(() => {
                existsStub.returns(true);

                engine = new LibGlasswallClassic(inputPath);

                methodWrapper.Execute.returns(expected);
                inputBuffer = Buffer.from("SUCCESS");

                actual = engine.GWDetermineFileTypeFromFileInMem(inputBuffer);
            });

            it("should execute method", () => {
                const calls = methodWrapper.Execute.getCalls();
                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(2);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputBuffer.length);
            });

            it("should return result", () => {
                expect(actual).to.equal(expected);
            });
        });
    });

    // describe("GWFileVersion", () => {
    //     beforeEach(() => {
    //         existsStub.returns(true);

    //         engine = new LibGlasswallClassic(inputPath);
    //     });

    //     it("should execute method", () => {
    //         expect(lib.close.getCalls()).lengthOf(1);
    //         expect(lib.close.getCall(0).args).lengthOf(0);
    //     });
    // });


    // describe("GWFileVersion", () => {
    //     beforeEach(() => {
    //         existsStub.returns(true);

    //         engine = new LibGlasswallClassic(inputPath);
    //     });

    //     it("should execute method", () => {
    //         expect(lib.close.getCalls()).lengthOf(1);
    //         expect(lib.close.getCall(0).args).lengthOf(0);
    //     });
    // });


    // describe("GWFileVersion", () => {
    //     beforeEach(() => {
    //         existsStub.returns(true);

    //         engine = new LibGlasswallClassic(inputPath);
    //     });

    //     it("should execute method", () => {
    //         expect(lib.close.getCalls()).lengthOf(1);
    //         expect(lib.close.getCall(0).args).lengthOf(0);
    //     });
    // });


    // describe("GWFileVersion", () => {
    //     beforeEach(() => {
    //         existsStub.returns(true);

    //         engine = new LibGlasswallClassic(inputPath);
    //     });

    //     it("should execute method", () => {
    //         expect(lib.close.getCalls()).lengthOf(1);
    //         expect(lib.close.getCall(0).args).lengthOf(0);
    //     });
    // });


    // describe("GWFileVersion", () => {
    //     beforeEach(() => {
    //         existsStub.returns(true);

    //         engine = new LibGlasswallClassic(inputPath);
    //     });

    //     it("should execute method", () => {
    //         expect(lib.close.getCalls()).lengthOf(1);
    //         expect(lib.close.getCall(0).args).lengthOf(0);
    //     });
    // });


    describe("Dispose", () => {
        beforeEach(() => {
            existsStub.returns(true);

            engine = new LibGlasswallClassic(inputPath);
            engine.Dispose();
        });

        it("should close engine library", () => {
            expect(lib.close.getCalls()).lengthOf(1);
            expect(lib.close.getCall(0).args).lengthOf(0);
        });

        it("should dispose of method pointers", () => {
            expect(methodWrapper.Dispose.getCalls()).lengthOf(6);

            methodWrapper.Dispose.getCalls().forEach(call => {
                expect(call.args).lengthOf(0);
            });
        });

        it("should set fields to null", async () => {
            expect(engine._GlasswallEngine).to.be.null;
            expect(engine._GWFileErrorMsg).to.be.null;
            expect(engine._GWFileDone).to.be.null;
            expect(engine._GWFileVersion).to.be.null;
            expect(engine._GWDetermineFileTypeFromFileInMem).to.be.null;
            expect(engine._GWFileConfigXML).to.be.null;
            expect(engine._GWMemoryToMemoryProtect).to.be.null;
        });
    });
});