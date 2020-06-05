/* eslint-disable @typescript-eslint/no-explicit-any */
import "mocha";
import { expect } from "chai";
import EngineServiceFactory from "./engineServiceFactory";
import EngineService = require("./engineService");
import Sinon = require("sinon");
import MockLogger from "../../common/test/mocks/mockLogger";


describe("engineServiceFactory", () => {
    describe("create method", () => {
        let stubService: Sinon.SinonStub;
        let stubServiceInstance: Sinon.SinonStubbedInstance<EngineService.default>;
        const mockLogger = new MockLogger();

        beforeEach(() => {
            stubServiceInstance = Sinon.createStubInstance(EngineService.default);
            stubService = Sinon.stub(EngineService, "default").returns(stubServiceInstance);
        });

        afterEach(() => {
            stubService.restore();
        });

        it("should return a new service", () => {
            const actual = EngineServiceFactory.Create(mockLogger);

            expect(actual).to.not.be.undefined;
            expect(actual).to.not.be.null;
            expect(actual).to.equal(stubServiceInstance);
        });
    });
});