import EngineService from "./engineService";

export default class EngineServiceFactory {
    static Create(logger: { log: (message: string) => void}): EngineService {
        return new EngineService(logger);
    }
}