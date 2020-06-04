/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import { RequestWorkflowRequest } from "../abstraction/requestWorkflow";
import RebuildWorkflowBase from "./RebuildWorkflowBase";

/** Mock dependencies */
import EngineService from "../../../business/services/engineService";
import EngineServiceFactory from "../../../business/services/engineServiceFactory";
import Timer from "../../../common/timer";
import { ArgumentNullException, ArgumentException } from "../../../common/errors/errors";
import EngineOutcome from "../../../business/engine/enums/engineOutcome";
import Metric from "../../../common/metric";
import FileType from "../../../business/engine/enums/fileType";
import ContentManagementFlags from "../../../business/engine/contentManagementFlags";
import { expectToThrow } from "../../../common/test/testUtility";

let loggedMessages = [];

const validLogger: { log: (message: string) => void } = {
    log: (message: string) => {
        loggedMessages.push(message);
    }
};

const validRequest: RequestWorkflowRequest = {
    method: "POST",
    url: "www.glassgle.com"
};

describe("rebuildWorkflowBase", () => {
    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            
        });

        const testConstructor = (logger, request, expectedArgName) => {
            expectToThrow<ArgumentNullException>(() => {
                new RebuildWorkflowBase(logger, request);
            }, err => {
                expect(err.argumentName).to.equal(expectedArgName)
            });
        }

        it("should throw with null logger", () => { testConstructor(null, validRequest, "logger") });
        it("should throw with null request", () => { testConstructor(validLogger, null, "request") });
        it("should throw with undefined logger", () => { testConstructor(undefined, validRequest, "logger") });
        it("should throw with undefined request", () => { testConstructor(validLogger, undefined, "request") });
    });

    describe("handle method", () => {
        describe("when anything is supplied", () => {
            it("should throw an error", () => {
                expect(() => new RebuildWorkflowBase(validLogger, validRequest).Handle()).to.throw();
            });
        });
    });

    describe("loadEngine method", () => {

    });

    describe("handle method", () => {

    });

    describe("detect file type method", () => {

    });

    describe("rebuildFile method", () => {

    });

    describe("GetDefaultHeaders method", () => {

    });
})