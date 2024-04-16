import { LogPayload } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';
import { LogEntry } from '../schema/log-entry.js';

export class LoggerRepository {
    @dep() private mongodb!: MongoDb;

    protected get collection() {
        return this.mongodb.db.collection('logs');
    }

    async log(payload: LogPayload): Promise<void> {
        try {
            const document = { ...payload, id: crypto.randomUUID(), timestamp: Date.now() } as LogEntry;
            await this.collection.insertOne(document);
        } catch (error) {
            console.error('Error occurred while logging:', error);
        }
    }

    async getLogs(): Promise<LogEntry[]> {
        try {
            return await this.collection.find<LogEntry>({}).toArray();
        } catch (error) {
            console.error('Error occurred while retrieving logs:', error);
            return [];
        }
    }

    async clearLogs(): Promise<void> {
        try {
            await this.collection.deleteMany({});
        } catch (error) {
            console.error('Error occurred while clearing logs:', error);
        }
    }
}
