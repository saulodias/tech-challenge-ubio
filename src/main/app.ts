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

    override createGlobalScope() {
        this.mesh = super.createGlobalScope();

        this.mesh.service(MongoDb);
        this.mesh.service(Metrics);

        this.mesh.service(DiscoveryRepository);
        this.mesh.service(DiscoveryServiceBase, DiscoveryService);

        this.mesh.service(LoggerRepository)
        this.mesh.service(LoggerServiceBase, LoggerService);

        this.mesh.constant(HEARTBEAT_TIMEOUT, heartbeatTimeout);

        this.mesh.service(CleanupService);

        return this.mesh;
    }

    override createHttpRequestScope() {
        const mesh = super.createHttpRequestScope();
        mesh.service(DiscoveryRouter);
        return mesh;
    }

    override async beforeStart() {
        await this.mongodb.client.connect();
        await this.httpServer.startServer();
        this.mesh.resolve(CleanupService).startCleanupRoutine().then(() => console.log());

    }

    override async afterStop() {
        await this.httpServer.stopServer();
        this.mongodb.client.close();
    }

    override async start() {
        await this.mesh.resolve(CleanupService).startCleanupRoutine();
    }

    override async stop() {
        this.mesh.resolve(CleanupService).stopCleanupRoutine();
    }
}
