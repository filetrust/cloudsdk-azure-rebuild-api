
/* eslint-disable @typescript-eslint/no-explicit-any */
const NS_PER_TICK = 1e2;

import moment = require("moment");

type functionTimeResult<TResult> = { 
    result?: TResult;
    elapsed: string;
}

class Timer {
    #time: [number, number]

    constructor() {
        this.#time = process.hrtime();
    }

    Restart(): void {
        this.#time = process.hrtime();
    }

    Elapsed(): string {
        const [seconds, nanoSeconds] = process.hrtime(this.#time);
        const duration = moment.duration(seconds, "seconds");
        return duration.get("hours").toString().padStart(2, "0")
            + ":" 
            + duration.get("minutes").toString().padStart(2, "0")
            + ":" 
            + duration.get("seconds").toString().padStart(2, "0")
            + "."
            + Math.round(nanoSeconds / NS_PER_TICK).toString().padStart(7, "0");
    }

    static StartNew(): Timer {
        return new Timer();
    }
}

export default Timer;