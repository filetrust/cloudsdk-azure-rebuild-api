class Enum {
    static GetString = (enumeration: { [key: number]: string }, enumerationValue: number): string => {
        return Object.keys(enumeration).find(key => enumeration[key] == enumerationValue);
    }
}

export default Enum;