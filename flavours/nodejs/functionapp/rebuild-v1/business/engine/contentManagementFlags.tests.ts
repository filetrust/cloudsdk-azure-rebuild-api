/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "mocha";
import { expect } from "chai";
import ContentManagementFlags, { EngineConfig } from "./ContentManagementFlags";
import Sinon = require("sinon");

describe("ContentManagementFlags", () => {
    describe("constructor", () => {
        it("should set all flags to sanitise", () => {
            const classInTest = new ContentManagementFlags();
            expect(classInTest.PdfContentManagement.Metadata).to.equal(1);
            expect(classInTest.PdfContentManagement.InternalHyperlinks).to.equal(1);
            expect(classInTest.PdfContentManagement.ExternalHyperlinks).to.equal(1);
            expect(classInTest.PdfContentManagement.EmbeddedFiles).to.equal(1);
            expect(classInTest.PdfContentManagement.EmbeddedImages).to.equal(1);
            expect(classInTest.PdfContentManagement.Javascript).to.equal(1);
            expect(classInTest.PdfContentManagement.Acroform).to.equal(1);
            expect(classInTest.PdfContentManagement.ActionsAll).to.equal(1);
            expect(classInTest.ExcelContentManagement.Metadata).to.equal(1);
            expect(classInTest.ExcelContentManagement.InternalHyperlinks).to.equal(1);
            expect(classInTest.ExcelContentManagement.ExternalHyperlinks).to.equal(1);
            expect(classInTest.ExcelContentManagement.EmbeddedFiles).to.equal(1);
            expect(classInTest.ExcelContentManagement.EmbeddedImages).to.equal(1);
            expect(classInTest.ExcelContentManagement.DynamicDataExchange).to.equal(1);
            expect(classInTest.ExcelContentManagement.Macros).to.equal(1);
            expect(classInTest.ExcelContentManagement.ReviewComments).to.equal(1);
            expect(classInTest.PowerPointContentManagement.Metadata).to.equal(1);
            expect(classInTest.PowerPointContentManagement.InternalHyperlinks).to.equal(1);
            expect(classInTest.PowerPointContentManagement.ExternalHyperlinks).to.equal(1);
            expect(classInTest.PowerPointContentManagement.EmbeddedFiles).to.equal(1);
            expect(classInTest.PowerPointContentManagement.EmbeddedImages).to.equal(1);
            expect(classInTest.PowerPointContentManagement.Macros).to.equal(1);
            expect(classInTest.PowerPointContentManagement.ReviewComments).to.equal(1);
            expect(classInTest.WordContentManagement.Metadata).to.equal(1);
            expect(classInTest.WordContentManagement.InternalHyperlinks).to.equal(1);
            expect(classInTest.WordContentManagement.ExternalHyperlinks).to.equal(1);
            expect(classInTest.WordContentManagement.EmbeddedFiles).to.equal(1);
            expect(classInTest.WordContentManagement.EmbeddedImages).to.equal(1);
            expect(classInTest.WordContentManagement.DynamicDataExchange).to.equal(1);
            expect(classInTest.WordContentManagement.Macros).to.equal(1);
            expect(classInTest.WordContentManagement.ReviewComments).to.equal(1);
        });
    });

    describe("Adapt method", () => {
        let classInTest: ContentManagementFlags;
        let result: string;
        let calledXmlSerialiser: true;
        let configThatGetsSerialised: EngineConfig;

        describe("with default flags", () => {
            beforeEach(() => {
                classInTest = new ContentManagementFlags();

                result = classInTest.Adapt((engineConfig: EngineConfig): string => {
                    configThatGetsSerialised = engineConfig;
                    calledXmlSerialiser = true;
                    return "xml contents";
                });
            });

            it("should call o2x", () => {
                expect(calledXmlSerialiser).to.be.true;
            });

            it("should return correct xml", () => {
                expect(result).to.equal("<?xml version=\"1.0\" encoding=\"utf-8\"?>xml contents");
            });

            it("should serialise correct flags", () => {
                expect(configThatGetsSerialised).to.not.be.undefined;
                expect(configThatGetsSerialised.config.pdfConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.javascript).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.acroform).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.actions_all).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.watermark).to.equal("");
                expect(configThatGetsSerialised.config.xlsConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.review_comments).to.equal("sanitise");
            });
        });

        describe("with some set to disallow", () => {
            beforeEach(() => {
                classInTest = new ContentManagementFlags();

                classInTest.ExcelContentManagement.Metadata = 2;
                classInTest.PowerPointContentManagement.Metadata = 2;
                classInTest.WordContentManagement.Metadata = 2;
                classInTest.PdfContentManagement.Metadata = 2;

                result = classInTest.Adapt((engineConfig: EngineConfig): string => {
                    configThatGetsSerialised = engineConfig;
                    calledXmlSerialiser = true;
                    return "xml contents";
                });
            });

            it("should call o2x", () => {
                expect(calledXmlSerialiser).to.be.true;
            });

            it("should return correct xml", () => {
                expect(result).to.equal("<?xml version=\"1.0\" encoding=\"utf-8\"?>xml contents");
            });

            it("should serialise correct flags", () => {
                expect(configThatGetsSerialised).to.not.be.undefined;
                expect(configThatGetsSerialised.config.pdfConfig.metadata).to.equal("disallow");
                expect(configThatGetsSerialised.config.pdfConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.javascript).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.acroform).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.actions_all).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.watermark).to.equal("");
                expect(configThatGetsSerialised.config.xlsConfig.metadata).to.equal("disallow");
                expect(configThatGetsSerialised.config.xlsConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.metadata).to.equal("disallow");
                expect(configThatGetsSerialised.config.pptConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.metadata).to.equal("disallow");
                expect(configThatGetsSerialised.config.wordConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.review_comments).to.equal("sanitise");
            });
        });

        describe("with some set to allow", () => {
            beforeEach(() => {
                classInTest = new ContentManagementFlags();

                classInTest.ExcelContentManagement.Metadata = 0;
                classInTest.PowerPointContentManagement.Metadata = 0;
                classInTest.WordContentManagement.Metadata = 0;
                classInTest.PdfContentManagement.Metadata = 0;

                result = classInTest.Adapt((engineConfig: EngineConfig): string => {
                    configThatGetsSerialised = engineConfig;
                    calledXmlSerialiser = true;
                    return "xml contents";
                });
            });

            it("should call o2x", () => {
                expect(calledXmlSerialiser).to.be.true;
            });

            it("should return correct xml", () => {
                expect(result).to.equal("<?xml version=\"1.0\" encoding=\"utf-8\"?>xml contents");
            });

            it("should serialise correct flags", () => {
                expect(configThatGetsSerialised).to.not.be.undefined;
                expect(configThatGetsSerialised.config.pdfConfig.metadata).to.equal("allow");
                expect(configThatGetsSerialised.config.pdfConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.javascript).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.acroform).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.actions_all).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.watermark).to.equal("");
                expect(configThatGetsSerialised.config.xlsConfig.metadata).to.equal("allow");
                expect(configThatGetsSerialised.config.xlsConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.metadata).to.equal("allow");
                expect(configThatGetsSerialised.config.pptConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.metadata).to.equal("allow");
                expect(configThatGetsSerialised.config.wordConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.review_comments).to.equal("sanitise");
            });
        });

        describe("with some not set", () => {
            beforeEach(() => {
                classInTest = new ContentManagementFlags();

                classInTest.ExcelContentManagement.Metadata = undefined;
                classInTest.PowerPointContentManagement.Metadata = undefined;
                classInTest.WordContentManagement.Metadata = undefined;
                classInTest.PdfContentManagement.Metadata = undefined;

                result = classInTest.Adapt((engineConfig: EngineConfig): string => {
                    configThatGetsSerialised = engineConfig;
                    calledXmlSerialiser = true;
                    return "xml contents";
                });
            });

            it("should call o2x", () => {
                expect(calledXmlSerialiser).to.be.true;
            });

            it("should return correct xml", () => {
                expect(result).to.equal("<?xml version=\"1.0\" encoding=\"utf-8\"?>xml contents");
            });

            it("should serialise correct flags", () => {
                expect(configThatGetsSerialised).to.not.be.undefined;
                expect(configThatGetsSerialised.config.pdfConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.javascript).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.acroform).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.actions_all).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.watermark).to.equal("");
                expect(configThatGetsSerialised.config.xlsConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.review_comments).to.equal("sanitise");
            });
        });

        describe("with some set to a number out of range", () => {
            beforeEach(() => {
                classInTest = new ContentManagementFlags();

                classInTest.ExcelContentManagement.Metadata = 34515;
                classInTest.PowerPointContentManagement.Metadata = 34515;
                classInTest.WordContentManagement.Metadata = 34515;
                classInTest.PdfContentManagement.Metadata = 34515;

                result = classInTest.Adapt((engineConfig: EngineConfig): string => {
                    configThatGetsSerialised = engineConfig;
                    calledXmlSerialiser = true;
                    return "xml contents";
                });
            });

            it("should call o2x", () => {
                expect(calledXmlSerialiser).to.be.true;
            });

            it("should return correct xml", () => {
                expect(result).to.equal("<?xml version=\"1.0\" encoding=\"utf-8\"?>xml contents");
            });

            it("should serialise correct flags", () => {
                expect(configThatGetsSerialised).to.not.be.undefined;
                expect(configThatGetsSerialised.config.pdfConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.javascript).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.acroform).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.actions_all).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pdfConfig.watermark).to.equal("");
                expect(configThatGetsSerialised.config.xlsConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.xlsConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.pptConfig.review_comments).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.metadata).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.internal_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.external_hyperlinks).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_files).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.embedded_images).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.dynamic_data_exchange).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.macros).to.equal("sanitise");
                expect(configThatGetsSerialised.config.wordConfig.review_comments).to.equal("sanitise");
            });
        });
    });
});