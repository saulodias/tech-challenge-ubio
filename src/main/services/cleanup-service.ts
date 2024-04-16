import { dep } from 'mesh-ioc';

import { DiscoveryService } from './discovery-service.js';
import { LoggerService } from './logger-service.js';

export class CleanupService {

    @dep() private logger!: LoggerService;
    @dep() private discoveryService!: DiscoveryService;
    @dep({ key: 'HeartbeatTimeout' }) private heartbeatTimeout!: number;

    constructor() {
        this.startInstanceCleanupRoutine();
    }

    async startInstanceCleanupRoutine() {
        setInterval(async () => {
            try {
                await this.cleanupExpiredInstances();
            } catch (error: any) {
                this.logger.error('Error occurred during instance cleanup:', error);
            }
        }, this.heartbeatTimeout * 60 * 1000);
    }

    async cleanupExpiredInstances() {
        const expirationDate = Date.now() - (this.heartbeatTimeout * 60 * 1000)

        // Query all groups to get summary
        const allGroups = await this.discoveryService.getAllGroupsSummary();

        // Iterate through each group to get instances and clean up
        for (const group of allGroups) {
            const groupInstances = await this.discoveryService.getGroupInstances(group._id);

            // Filter expired instances based on updatedAt timestamp
            const expiredInstances = groupInstances.filter(instance => instance.updatedAt < expirationDate);

            if (expiredInstances.length === 0) {
                continue;
            }

            // Remove expired instances
            for (const instance of expiredInstances) {
                await this.discoveryService.unregisterInstance(group._id, instance.id);
            }

            this.logger.info(`Cleanup completed for group ${group._id}. Removed ${expiredInstances.length} expired instances.`);
        }
    }
}
