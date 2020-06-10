export default class MockLogger {
    loggedMessages: string[];

    constructor() {
        this.loggedMessages = [];
    }

    log = (message: string): void => {
        this.loggedMessages.push(message);
    };
}