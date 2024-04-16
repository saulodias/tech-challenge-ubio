import { dep } from 'mesh-ioc';

import { HEARTBEAT_TIMEOUT } from './constants-keys.js';
import { DiscoveryServiceBase } from './discovery-service-base.js';
import { LoggerServiceBase } from './logger-service-base.js';

export class CleanupService {

    @dep() private logger!: LoggerServiceBase;
    @dep() private discoveryService!: DiscoveryServiceBase;
    @dep({ key: HEARTBEAT_TIMEOUT }) private _heartbeatTimeout!: number;

    private cleanupIntervalId: NodeJS.Timeout | null = null;

    get heartbeatTimeout() {
        return this._heartbeatTimeout;
    }

    async startCleanupRoutine() {
        this.logger.info(`Starting cleanup with ${this._heartbeatTimeout} min heartbeat timeout...`);

        this.cleanupIntervalId = setInterval(async () => {
            try {
                await this.cleanupExpiredInstances();
            } catch (error: any) {
                this.logger.error('Error occurred during instance cleanup:', error);
            }
        }, this._heartbeatTimeout * 60 * 1000);
    }

    stopCleanupRoutine() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
            this.logger.info('Cleanup routine stopped.');
        } else {
            this.logger.info('Cleanup routine is not running.');
        }
    }

    async cleanupExpiredInstances() {
        const expirationDate = Date.now() - (this._heartbeatTimeout * 60 * 1000)

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
