/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import fetchMock = require("fetch-mock");
import HttpFileOperations from "./httpFileOperations";
import { parseMultiPartForm } from "./multipartHelper";

describe("parseMultiPartForm", () => {
    describe("when form contains files", () => {
        it("should load file data", async () => {
            // TODO
        });
    });

    describe("when form contains fields", () => {
        it("should load field data", async () => {
            // TODO
        });
    });
    
    describe("when form cannot be read", () => {
        it("should respond with error", async () => {
            // TODO
        });
    });
});