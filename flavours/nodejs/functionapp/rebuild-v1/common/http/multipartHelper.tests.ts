/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";
import MultipartHelper = require("./multipartHelper");
import { stub, SinonStub } from "sinon";
import Busboy = require("busboy");

let createBusBoyStub: SinonStub;

const busboyConfig: busboy.BusboyConfig = { headers: { "content-type": "multipart/form-data; boundary=---------------------------9051914041544843365972754266" } };

describe("parseMultiPartForm", () => {
    let busboy: busboy.Busboy;

    beforeEach(() => {
        busboy = new Busboy(busboyConfig);
        createBusBoyStub = stub(MultipartHelper, "createBusBoy").returns(busboy);
    });

    afterEach(() => {
        createBusBoyStub.restore();
    });

    describe("when arguments are valid", () => {
        let result: MultipartHelper.multipart[];
        let inputBuffer: Buffer;
        let inputHeaders: { [header: string]: string };

        beforeEach(async() => {
            inputBuffer = Buffer.from(
                "-----------------------------9051914041544843365972754266"
              + "\r\nContent-Disposition: form-data; name=\"Text\"" 
              + "\r\n\r\ntext default"
              + "\r\n-----------------------------9051914041544843365972754266" 
              + "\r\nContent-Disposition: form-data; name=\"file1\"; filename=\"a.txt\"\r\nContent-Type: text/plain" 
              + "\r\n\r\nContent of a.txt." 
              + "\r\n-----------------------------9051914041544843365972754266"
              + "\r\nContent-Disposition: form-data; name=\"file2\"; filename=\"a.html\"\r\nContent-Type: text/html"
              + "\r\n\r\n<!DOCTYPE html><title>Content of a.html.</title>"
              + "\r\n-----------------------------9051914041544843365972754266--");
            inputHeaders = {
                "Content-Type": "multipart/form-data"
            };
            
            result = await MultipartHelper.parseMultiPartForm(inputBuffer, inputHeaders);
        });

        it("should return correct number of fields", () => {
            expect(result).to.not.be.undefined;
            expect(result).lengthOf(3);
        });

        it("should return text field", () => {
            expect(result[0].fieldName).to.equal("text");
            expect(result[0].data).to.equal("text default");
            expect(result[0].encoding).to.equal(undefined);
            expect(result[0].fileName).to.equal(undefined);
            expect(result[0].mimetype).to.equal(undefined);
        });
        
        it("should return files", () => {
            expect(result[1].fieldName).to.equal("file1");
            expect(result[1].data.toString()).to.equal("Content of a.txt.");
            expect(result[1].encoding).to.equal("7bit");
            expect(result[1].fileName).to.equal("a.txt");
            expect(result[1].mimetype).to.equal("text/plain");
            
            expect(result[2].fieldName).to.equal("file2");
            expect(result[2].data.toString()).to.equal("<!DOCTYPE html><title>Content of a.html.</title>");
            expect(result[2].encoding).to.equal("7bit");
            expect(result[2].fileName).to.equal("a.html");
            expect(result[2].mimetype).to.equal("text/html");
        });
    });
});

describe("createBusBoy", () => {
    it("should construct a new busboy", () => {
        const boy = MultipartHelper.createBusBoy(busboyConfig.headers);

        expect(boy).to.not.be.undefined;
    });
});