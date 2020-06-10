
/* eslint-disable @typescript-eslint/no-explicit-any */
const NS_PER_TICK = 1e2;

import moment = require("moment");

type functionTimeResult<TResult> = { 
    result?: TResult;
    elapsed: string;
}

class Timer {
    // seconds / nanoseconds
    timeStart: [number, number]
    timeEnd: [number, number]

    constructor() {
        this.timeStart = process.hrtime();
    }

    Elapsed(): string {
        this.timeEnd = process.hrtime(this.timeStart);
        const duration = moment.duration(this.timeEnd[0], "seconds");
        return duration.get("hours").toString().padStart(2, "0")
            + ":" 
            + duration.get("minutes").toString().padStart(2, "0")
            + ":" 
            + duration.get("seconds").toString().padStart(2, "0")
            + "."
            + Math.round(this.timeEnd[1] / NS_PER_TICK).toString().padStart(7, "0");
    }

    static StartNew(): Timer {
        return new Timer();
    }
}

export default Timer;