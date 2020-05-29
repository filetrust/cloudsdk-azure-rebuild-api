
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
        const hourMinuteSeconds =  duration.get("hours").toString() 
                                 + ":" 
                                 + duration.get("minutes").toString() 
                                 + ":" 
                                 + duration.get("seconds").toString();
                                 
        const ticks = Math.round(nanoSeconds / NS_PER_TICK).toString().padStart(7, "0");
        return hourMinuteSeconds + "." + ticks;
    }

    static StartNew(): Timer {
        return new Timer();
    }

    // static ExecuteAndMeasure<TResult>(func: any): functionTimeResult<TResult> {
    //     const ret: functionTimeResult<TResult> = {
    //         elapsed: ""
    //     };
        
    //     const timer = Timer.StartNew();
    //     ret.result = func();
    //     ret.elapsed = timer.Elapsed();

    //     return ret;
    // }
}

export default Timer;