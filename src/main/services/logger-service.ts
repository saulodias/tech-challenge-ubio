import { LogData, LogFormatter, Logger, LogLevel, LogPayload } from '@ubio/framework';
import { dep } from 'mesh-ioc';

import { LoggerRepository } from '../repositories/logger-repository.js';


export class LoggerService implements Logger {
    @dep() private loggerRepository!: LoggerRepository;

    level: LogLevel = LogLevel.ERROR;

    formatter: LogFormatter = {
        format: (payload: LogPayload) => payload,
    };

    async write(payload: LogPayload): Promise<void> {
        try {
            if (payload.level < this.level) {
                return;
            }
            await this.loggerRepository.log(this.formatter.format(payload));
        } catch (error) {
            console.error('Error occurred while logging:', error);
        }
    }

    log(level: LogLevel, message: string, data?: LogData): void {
        this.write({ level, message, data });
    }

    info(message: string, data?: LogData): void {
        this.write({ level: LogLevel.INFO, message, data });
    }

    warn(message: string, data?: LogData): void {
        this.write({ level: LogLevel.WARN, message, data });
    }

    error(message: string, data?: LogData): void {
        this.write({ level: LogLevel.ERROR, message, data });
    }

    debug(message: string, data?: LogData): void {
        this.write({ level: LogLevel.DEBUG, message, data });
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

}
