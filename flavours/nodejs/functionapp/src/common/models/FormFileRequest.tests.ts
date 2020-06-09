/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import ContentManagementFlags from "../../business/engine/contentManagementFlags";
import FormFileRequest from "./FormFileRequest";

describe("Form File Request", () => {
    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            const request = new FormFileRequest([
                {
                    fieldName: "file",
                    data: Buffer.from("banana")
                }
            ]);

            expect(Buffer.from("banana").equals(request.File)).to.be.true;
        });

        it("should set error if form is not defined", () => {
            const request = new FormFileRequest(undefined);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Form).to.equal("Could not read the supplied form.");
        });

        it("should set error if form is null", () => {
            const request = new FormFileRequest(null);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.Form).to.equal("Could not read the supplied form.");
        });

        it("should set error if body does not have file", () => {
            const request = new FormFileRequest([]);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.File).to.equal("Not Supplied");
        });

        it("should set error if body does not have file data", () => {
            const request = new FormFileRequest([
                {
                    fieldName: "file",
                    data: Buffer.alloc(0)
                }
            ]);

            expect(Object.keys(request.Errors)).lengthOf(1);
            expect(request.Errors.File).to.equal("File does not have any data");
        });

        it("should set cmp to default if not supplied", () => {
            const request = new FormFileRequest([
                {
                    fieldName: "file",
                    data: Buffer.from("banana")
                }
            ]);

            expect(request.ContentManagementFlags.Adapt).to.not.be.undefined;
            Object.keys(request.ContentManagementFlags.ExcelContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.ExcelContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.ExcelContentManagement[flag]);
            });

            Object.keys(request.ContentManagementFlags.WordContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.WordContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.WordContentManagement[flag]);
            });

            Object.keys(request.ContentManagementFlags.PowerPointContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PowerPointContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PowerPointContentManagement[flag]);
            });

            Object.keys(request.ContentManagementFlags.PdfContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PdfContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PdfContentManagement[flag]);
            });
        });

        it("should set cmp if body supplied", () => {
            const request = new FormFileRequest([
                {
                    fieldName: "file",
                    data: Buffer.from("banana")
                },
                {
                    fieldName: "contentmanagementflags",
                    data: JSON.stringify({
                        ExcelContentManagement: {
                            "Metadata": 2
                        }
                    })
                }
            ]);

            expect(request.ContentManagementFlags.Adapt).to.not.be.undefined;
            Object.keys(request.ContentManagementFlags.ExcelContentManagement).forEach(flag => {
                if (flag === "Metadata") {
                    expect(request.ContentManagementFlags.ExcelContentManagement[flag])
                        .to.equal(2);
                    return;
                }

                expect(request.ContentManagementFlags.ExcelContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.ExcelContentManagement[flag]);
            });

            Object.keys(request.ContentManagementFlags.WordContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.WordContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.WordContentManagement[flag]);
            });

            Object.keys(request.ContentManagementFlags.PowerPointContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PowerPointContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PowerPointContentManagement[flag]);
            });

            Object.keys(request.ContentManagementFlags.PdfContentManagement).forEach(flag => {
                expect(request.ContentManagementFlags.PdfContentManagement[flag])
                    .to.equal(request.ContentManagementFlags.PdfContentManagement[flag]);
            });
        });
    });

    it("should set error if cmp contains unknown key", () => {
        const request = new FormFileRequest([
            {
                fieldName: "file",
                data: Buffer.from("banana")
            },
            {
                fieldName: "contentmanagementflags",
                data: JSON.stringify({
                    "banana": 2,
                    ExcelContentManagement: {
                        Metadata: 2
                    }
                })
            }
        ]);

        expect(request.Errors.ContentManagementPolicy).to.equal("Unexpected item found in policy: banana");
    });
});