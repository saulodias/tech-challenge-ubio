import { Application } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { Metrics } from './metrics.js';
import { DiscoveryRepository as DiscoveryRepository } from './repositories/discovery-repository.js';
import { DiscoveryRouter } from './routes/discovery-router.js';
import { CleanupService } from './services/cleanup-service.js';
import { DiscoveryService } from './services/discovery-service.js';
import { LoggerService } from './services/logger-service.js';
import { LoggerRepository } from './repositories/logger-repository.js';
import dotenv from 'dotenv';
dotenv.config();

// Set the heartbeat timeout in minutes
const heartbeatTimeout = Number(process.env.HEARTBEAT_TIMEOUT || 30);

export class App extends Application {
    @dep() mongodb!: MongoDb;

    override createGlobalScope() {
        const mesh = super.createGlobalScope();
        mesh.service(MongoDb);
        mesh.service(Metrics);

        mesh.service(DiscoveryRepository);
        mesh.service(DiscoveryService);

        mesh.service(LoggerRepository)
        mesh.service(LoggerService);

        mesh.constant("HeartbeatTimeout", heartbeatTimeout);
        
        mesh.service(CleanupService);

        return mesh;
    }

    override createHttpRequestScope() {
        const mesh = super.createHttpRequestScope();
        mesh.service(DiscoveryRouter);
        return mesh;
    }

    override async beforeStart() {
        await this.mongodb.client.connect();
        // Add other code to execute on application startup
        await this.httpServer.startServer();
    }

    override async afterStop() {
        await this.httpServer.stopServer();
        // Add other finalization code
        this.mongodb.client.close();
    }
}
