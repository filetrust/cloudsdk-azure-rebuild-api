/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import Base64Request from "./Base64Request";
import ContentManagementFlags from "../../business/engine/contentManagementFlags";

describe("Base64 Request", () => {
    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            const request = new Base64Request({
                Base64: "woop"
            })

            expect(request.Base64).to.equal("woop");
        });

        it("should set error if body is not defined", () => {
            const request = new Base64Request(undefined);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Body).to.equal("Not Supplied");
        });

        it("should set error if body is null", () => {
            const request = new Base64Request(null);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Body).to.equal("Not Supplied");
        });

        it("should set error if body does not have base64", () => {
            const request = new Base64Request({
                Base64: undefined
            });

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Base64).to.equal("Not Supplied");
        });

        it("should set error if body has null base64", () => {
            const request = new Base64Request({
                Base64: null
            });

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Base64).to.equal("Not Supplied");
        });

        it("should set cmp to default if not supplied", () => {
            const defaultCmp = new ContentManagementFlags();
            const request = new Base64Request({
                Base64: "Some 64"
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
            const request = new Base64Request({
                Base64: "Some 64",
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
    });

    it("should set error if cmp contains unknown key", () => {
        const request = new Base64Request({
            Base64: "Some 64",
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