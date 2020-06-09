/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import Timer from "./timer";

/** Mock dependencies */
import moment = require("moment");
import MockLogger from "./test/mocks/mockLogger";
import { fail } from "assert";

const mockLogger = new MockLogger();
const momentDuration = moment.duration;


describe("timer", () => {
    describe("constructor", () => {
        it("should construct with valid arguments", () => {
            expect(new Timer()).to.not.be.undefined;
        });
    });

    describe("start new", () => {
        it("should return a new timer", () => {
            expect(Timer.StartNew()).to.not.be.undefined;
        })
    })

    describe("elapsed method", () => {
        describe("with a valid timer", () => {
            const expectedHours = 3;
            const expectedMinutes = 2;
            const expectedSeconds = 5;
            const timer = new Timer();

            let result: string | any[];

            beforeEach(() => {
                const mockMoment = moment.duration(expectedSeconds, "seconds");

                mockMoment.get = (type: string): number => {
                    if (type === "hours") {
                        return expectedHours;
                    }
                    if (type === "minutes") {
                        return expectedMinutes;
                    }
                    if (type === "seconds") {
                        return expectedSeconds;
                    }

                    fail("should never have come here");
                }

                moment.duration = () => {
                    return mockMoment
                };

                result = timer.Elapsed();
            });

            afterEach(() => {
                moment.duration = momentDuration;
            });

            it("should generate a timestamp", () => {
                expect(result).to.not.be.undefined;
                expect(result.length).to.be.equal(16);
            });

            it("should set hours", () => {
                const elapsed = timer.Elapsed();
                const hourPart = elapsed.split(":")[0];

                expect(hourPart).to.be.length(2);
                expect(hourPart).to.equal(expectedHours.toString().padStart(2, "0"));
            });

            it("should set minutes", () => {
                const elapsed = timer.Elapsed();
                const minutesPart = elapsed.split(":")[1];

                expect(minutesPart).to.be.length(2);
                expect(minutesPart).to.equal(expectedMinutes.toString().padStart(2, "0"));
            });

            it("should set seconds", () => {
                const elapsed = timer.Elapsed();
                const secondsPart = elapsed.split(":")[2].split(".")[0];

                expect(secondsPart).to.be.length(2);
                expect(secondsPart).to.equal(expectedSeconds.toString().padStart(2, "0"));
            });
            
            it("should set ticks", () => {
                const elapsed = timer.Elapsed();
                const tickPart = elapsed.split(".")[1];

                expect(tickPart).to.be.length(7);
                expect(tickPart).to.equal(Math.round(timer.timeEnd[1] / 1e2).toString().padStart(7, "0"));
            });
        })
    })
})