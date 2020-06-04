/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import MultipartHelper = require("./multipartHelper");
import { stub, SinonStub } from "sinon";
import Busboy = require("busboy");

let createBusBoyStub: SinonStub;

const busboyConfig: busboy.BusboyConfig = { headers: { "content-type": 'multipart/form-data; boundary=----WebKitFormBoundary7Q0vAPYV6vaXrhS5' } }

let busboy = new Busboy(busboyConfig);

let writeStub: SinonStub;
let onStub: SinonStub;

describe("parseMultiPartForm", () => {
    beforeEach(() => {
        createBusBoyStub = stub(MultipartHelper, "createBusBoy")
        writeStub = stub(busboy, "write");
        onStub = stub(busboy, "on").returns(busboy);
    });

    afterEach(() => {
        createBusBoyStub.restore();
        writeStub.restore();
        onStub.restore();
    });

    describe("when arguments are valid", () => {
        let result: MultipartHelper.multipart[];
        let inputBuffer: Buffer;
        let inputHeaders: { [header: string]: string };

        beforeEach(async() => {
            inputBuffer = Buffer.from("test");
            inputHeaders = {
                "Content-Type": "multipart/form-data"
            };
            
            createBusBoyStub.returns(busboy);
            result = await MultipartHelper.parseMultiPartForm(inputBuffer, inputHeaders);
        });

        it("should load file data", async () => {
            
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