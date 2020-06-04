export default class MockLogger {
    loggedMessages: string[];

    log = (message: string): void => {
        this.loggedMessages.push(message);
    };
}