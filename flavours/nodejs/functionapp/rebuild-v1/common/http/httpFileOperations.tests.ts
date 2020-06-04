/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import fetchMock = require("fetch-mock");
import HttpFileOperations from "./httpFileOperations";

describe("HttpFileOperations", () => {
    describe("downloadFile method", () => {
        it("should respond with status text if not OK", async () => {
            // TODO
        });
        it("should respond with buffer if OK", async () => {
            // TODO
        });
    });

    describe("uploadFile method", () => {
        it("should respond with status text if not OK", async () => {
            // TODO
        });
        it("should respond with etag if OK", async () => {
            // TODO
        });
    });
});