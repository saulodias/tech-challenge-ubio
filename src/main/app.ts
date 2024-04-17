import { Application } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { Mesh, dep } from 'mesh-ioc';

import dotenv from 'dotenv';
import { Metrics } from './metrics.js';
import { DiscoveryRepository } from './repositories/discovery-repository.js';
import { LoggerRepository } from './repositories/logger-repository.js';
import { DiscoveryRouter } from './routes/discovery-router.js';
import { CleanupService } from './services/cleanup-service.js';
import { HEARTBEAT_TIMEOUT } from './services/constants-keys.js';
import { DiscoveryServiceBase } from './services/discovery-service-base.js';
import { DiscoveryService } from './services/discovery-service.js';
import { LoggerServiceBase } from './services/logger-service-base.js';
import { LoggerService } from './services/logger-service.js';
dotenv.config();

// Set the heartbeat timeout in minutes
const heartbeatTimeout = Number(process.env.HEARTBEAT_TIMEOUT || 30);

export class App extends Application {
    @dep() mongodb!: MongoDb;
    override mesh!: Mesh;

    constructor() {
        super();
    }

    override createGlobalScope() {
       const mesh = super.createGlobalScope();

       mesh.service(MongoDb);
       mesh.service(Metrics);

       mesh.service(DiscoveryRepository);
       mesh.service(DiscoveryServiceBase, DiscoveryService);

       mesh.service(LoggerRepository)
       mesh.service(LoggerServiceBase, LoggerService);

       mesh.constant(HEARTBEAT_TIMEOUT, heartbeatTimeout);

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
        await this.httpServer.startServer();
        await this.mesh.resolve(CleanupService).startCleanupRoutine();

    }

    override async afterStop() {
        await this.httpServer.stopServer();
        this.mongodb.client.close();
        this.mesh.resolve(CleanupService).stopCleanupRoutine();
    }
}
