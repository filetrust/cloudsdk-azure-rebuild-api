/* eslint-disable @typescript-eslint/no-explicit-any */
import "mocha";
import { expect } from "chai";
import LibGlasswallClassic from "./libGlasswallClassic";
import { stub, createStubInstance, SinonStub, SinonStubbedInstance } from "sinon";

/** class in test dependencies */
import fs = require("fs");
import ffi = require("ffi-napi");
import MethodWrapper = require("../../common/ffi/dynamicLibraryMethod");
import { ArgumentNullException, ArgumentException } from "../../common/errors/errors";
import EngineOutcome from "./enums/engineOutcome";
import Ref = require("ref-napi");

let existsStub: SinonStub;
let dynamicLibraryStub: SinonStub;
let methodWrapperStub: SinonStub;

let readUInt64LEStub: SinonStub;
let readUInt64LEStubResult: number;

let readPointerStub: SinonStub;
let readPointerStubResult: Buffer;

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
        readUInt64LEStub = stub(Ref, "readUInt64LE");
        readPointerStub = stub(Ref, "readPointer");
    });

    afterEach(() => {
        existsStub.restore();
        dynamicLibraryStub.restore();
        methodWrapperStub.restore();
        readUInt64LEStub.restore();
        readPointerStub.restore();
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

    describe("GWFileErrorMsg", () => {
        const expected = "ERROR";
        let actual: string;

        beforeEach(() => {
            existsStub.returns(true);

            engine = new LibGlasswallClassic(inputPath);

            methodWrapper.Execute.returns(expected);

            actual = engine.GWFileErrorMsg();
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

    describe("GWFileDone", () => {
        const expected = 0;
        let actual: number;

        beforeEach(() => {
            existsStub.returns(true);

            engine = new LibGlasswallClassic(inputPath);

            methodWrapper.Execute.returns(expected);

            actual = engine.GWFileDone();
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
        let inputXml: string;

        describe("when string is not quite right", () => {
            beforeEach(() => {
                existsStub.returns(true);
                engine = new LibGlasswallClassic(inputPath);
            });

            it("should throw when string is null", () => {
                expect(() => {
                    engine.GWFileConfigXML(null);
                }).to.throw(ArgumentNullException).with.property("argumentName").to.equal("xmlConfig");
            });

            it("should throw when string is undefined", () => {
                expect(() => {
                    engine.GWFileConfigXML(undefined);
                }).to.throw(ArgumentNullException).with.property("argumentName").to.equal("xmlConfig");
            });

            it("should throw when string is empty", () => {
                const expected = expect(() => {
                    engine.GWFileConfigXML("");
                });
                
                expected.to.throw(ArgumentException).with.property("argumentName").to.equal("xmlConfig");
                expected.to.throw(ArgumentException).with.property("message").to.equal("Argument is invalid: 'xmlConfig' message: 'Argument must be defined: 'xmlConfig''");
            });
        });

        describe("when buffer is correct", () => {
            beforeEach(() => {
                existsStub.returns(true);

                engine = new LibGlasswallClassic(inputPath);

                methodWrapper.Execute.returns(expected);
                inputXml = "SUCCESS";

                actual = engine.GWFileConfigXML(inputXml);
            });

            it("should execute method", () => {
                const calls = methodWrapper.Execute.getCalls();
                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(1);
                expect(calls[0].args[0]).to.equal(inputXml);
            });

            it("should return result", () => {
                expect(actual).to.equal(expected);
            });
        });
    });
    
    describe("GWMemoryToMemoryProtect", () => {
        let result: { engineOutcome: number; protectedFile?: Buffer };
        let inputBuffer: Buffer;
        let outputBuffer: Buffer;
        let inputFileType: string;

        describe("when args are not quite right", () => {
            beforeEach(() => {
                existsStub.returns(true);
                engine = new LibGlasswallClassic(inputPath);
            });

            it("should throw when buffer is null", () => {
                expect(() => {
                    engine.GWMemoryToMemoryProtect(null, "File Type");
                }).to.throw(ArgumentNullException).with.property("argumentName").to.equal("buffer");
            });

            it("should throw when buffer is empty", () => {
                expect(() => {
                    engine.GWMemoryToMemoryProtect(Buffer.alloc(0), "File Type");
                }).to.throw(ArgumentException).with.property("argumentName").to.equal("buffer");
            });

            it("should throw when file type is null", () => {
                expect(() => {
                    engine.GWMemoryToMemoryProtect(Buffer.from("SUCCESS"), null);
                }).to.throw(ArgumentNullException).with.property("argumentName").to.equal("fileType");
            });

            it("should throw when file type is empty", () => {
                expect(() => {
                    engine.GWMemoryToMemoryProtect(Buffer.from("SUCCESS"), "");
                }).to.throw(ArgumentException).with.property("argumentName").to.equal("fileType");
            });
        });

        describe("when engine can rebuild", () => {
            beforeEach(() => {
                existsStub.returns(true);

                engine = new LibGlasswallClassic(inputPath);

                methodWrapper.Execute.returns(EngineOutcome.Success);
                inputBuffer = Buffer.from("SUCCESS");
                inputFileType = "png";
                outputBuffer = Buffer.from("Banana");                

                readUInt64LEStubResult = 5;
                readUInt64LEStub.returns(readPointerStubResult);

                readPointerStubResult = outputBuffer;
                readPointerStub.returns(readPointerStubResult);

                result = engine.GWMemoryToMemoryProtect(inputBuffer, inputFileType);
            });

            it("should execute method", () => {
                const calls = methodWrapper.Execute.getCalls();
                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(5);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputBuffer.length);
                expect(calls[0].args[2]).to.equal(inputFileType);
                expect(Ref.alloc(Ref.refType(Ref.types.void)).equals(calls[0].args[3])).to.be.true;
                expect(Ref.alloc(Ref.refType(Ref.types.size_t)).equals(calls[0].args[4])).to.be.true;
            });

            it("should return result", () => {
                expect(result.engineOutcome).to.equal(EngineOutcome.Success);
                expect(result.protectedFile).to.equal(outputBuffer);
            });
        });
        
        describe("when engine cannot be rebuilt", () => {
            beforeEach(() => {
                existsStub.returns(true);

                engine = new LibGlasswallClassic(inputPath);

                methodWrapper.Execute.returns(EngineOutcome.Error);
                inputBuffer = Buffer.from("SUCCESS");
                inputFileType = "png";

                result = engine.GWMemoryToMemoryProtect(inputBuffer, inputFileType);
            });

            it("should execute method", () => {
                const calls = methodWrapper.Execute.getCalls();
                expect(calls).lengthOf(1);
                expect(calls[0].args).lengthOf(5);
                expect(calls[0].args[0]).to.equal(inputBuffer);
                expect(calls[0].args[1]).to.equal(inputBuffer.length);
                expect(calls[0].args[2]).to.equal(inputFileType);
                expect(Ref.alloc(Ref.refType(Ref.types.void)).equals(calls[0].args[3])).to.be.true;
                expect(Ref.alloc(Ref.refType(Ref.types.size_t)).equals(calls[0].args[4])).to.be.true;
            });

            it("should return result", () => {
                expect(result.engineOutcome).to.equal(EngineOutcome.Error);
                expect(result.protectedFile).to.be.undefined;
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