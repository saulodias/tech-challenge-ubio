import { LogLevel, LogPayload, Schema } from '@ubio/framework';


export interface LogEntry extends LogPayload {
    id: string;
    timestamp: number;
}

export const LogEntrySchema = new Schema<LogEntry>({
    schema: {
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' },
            timestamp: { type: 'number' },
            level: { type: 'string' },
            message: { type: 'string' },
            data: {
                type: 'object', properties: {},
                optional: true
            },
        },
        required: ['id', 'level', 'message', 'timestamp'],
    },
    defaults: () => {
        return {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            level: LogLevel.INFO,
            message: '',
            data: {},
        };
    }
});
