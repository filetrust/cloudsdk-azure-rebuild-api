/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import ContentManagementFlags from "../../business/engine/contentManagementFlags";
import UrlRequest from "./UrlRequest";

describe("UrlRequest Request", () => {
    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            const request = new UrlRequest({
                InputGetUrl: "woop",
                OutputPutUrl: "woot"
            })

            expect(request.InputGetUrl).to.equal("woop");
            expect(request.OutputPutUrl).to.equal("woot");
        });

        it("should set error if body is not defined", () => {
            const request = new UrlRequest(undefined);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Body).to.equal("Not Supplied");
        });

        it("should set error if body is null", () => {
            const request = new UrlRequest(null);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Body).to.equal("Not Supplied");
        });

        it("should set error if body does not have required arguments", () => {
            const request = new UrlRequest({
                InputGetUrl: undefined,
                OutputPutUrl: undefined
            });

            expect(Object.keys(request.Errors)).lengthOf(2);
            expect(request.Errors.InputGetUrl).to.equal("Not Supplied");
            expect(request.Errors.OutputPutUrl).to.equal("Not Supplied");
        });

        it("should set error if body has null arguments", () => {
            const request = new UrlRequest({
                InputGetUrl: null,
                OutputPutUrl: null
            });

            expect(Object.keys(request.Errors)).lengthOf(2);
            expect(request.Errors.InputGetUrl).to.equal("Not Supplied");
            expect(request.Errors.OutputPutUrl).to.equal("Not Supplied");
        });
        

        it("should set error if body has empty arguments", () => {
            const request = new UrlRequest({
                InputGetUrl: "",
                OutputPutUrl: ""
            });

            expect(Object.keys(request.Errors)).lengthOf(2);
            expect(request.Errors.InputGetUrl).to.equal("Not Supplied");
            expect(request.Errors.OutputPutUrl).to.equal("Not Supplied");
        });

        it("should set cmp to default if not supplied", () => {
            const defaultCmp = new ContentManagementFlags();
            const request = new UrlRequest({
                InputGetUrl: "test",
                OutputPutUrl: "test"
            });

            expect(request.ContentManagementFlags.Adapt).to.not.be.undefined;
            Object.keys(request.ContentManagementFlags.ExcelContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.ExcelContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.ExcelContentManagement[flag])
            });

            Object.keys(request.ContentManagementFlags.WordContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.WordContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.WordContentManagement[flag])
            });

            Object.keys(request.ContentManagementFlags.PowerPointContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PowerPointContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PowerPointContentManagement[flag])
            });

            Object.keys(request.ContentManagementFlags.PdfContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PdfContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PdfContentManagement[flag])
            });
        });

        it("should set cmp if body supplied", () => {
            const request = new UrlRequest({
                InputGetUrl: "test",
                OutputPutUrl: "test",
                ContentManagementFlags: {
                    ExcelContentManagement: {
                        Metadata: 2
                    }
                }
            });

            expect(request.ContentManagementFlags.Adapt).to.not.be.undefined;
            Object.keys(request.ContentManagementFlags.ExcelContentManagement).forEach(flag => {
                if (flag === "Metadata") {
                    expect(request.ContentManagementFlags.ExcelContentManagement[flag])
                        .to.equal(2);
                    return;
                }

                expect(request.ContentManagementFlags.ExcelContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.ExcelContentManagement[flag])
            });

            Object.keys(request.ContentManagementFlags.WordContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.WordContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.WordContentManagement[flag])
            });

            Object.keys(request.ContentManagementFlags.PowerPointContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PowerPointContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PowerPointContentManagement[flag])
            });

            Object.keys(request.ContentManagementFlags.PdfContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PdfContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PdfContentManagement[flag])
            });
        });

        it("should set error if cmp contains unknown key", () => {
            const request = new UrlRequest({
                InputGetUrl: "test",
                OutputPutUrl: "test",
                ContentManagementFlags: {
                    "banana": 2,
                    ExcelContentManagement: {
                        Metadata: 2
                    }
                }
            });
    
            expect(request.Errors.ContentManagementPolicy).to.equal("Unexpected item found in policy: banana")
        });
    });
});