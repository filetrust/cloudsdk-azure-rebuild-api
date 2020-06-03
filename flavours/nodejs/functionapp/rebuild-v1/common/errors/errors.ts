export class ArgumentException extends Error {
    argumentName: string;
    constructor(argumentName: string, message: string) {
        super("Argument is invalid: " + argumentName + " message: " + message);
        this.name == "ArgumentException";
        this.argumentName = argumentName;
    }
}

export class ArgumentNullException extends ArgumentException {
    constructor(argumentName: string) {
        super(argumentName, "Argument must be defined:" + argumentName);
        this.name == "ArgumentNullException";
    }
}