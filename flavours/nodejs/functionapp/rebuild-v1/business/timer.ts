const NS_PER_TICK = 1e2;

import moment = require("moment");

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
}

export default Timer;