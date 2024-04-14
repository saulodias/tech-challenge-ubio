import { Logger } from '@ubio/framework';
import { dep } from 'mesh-ioc';

import { DiscoveryRepository } from '../repositories/discovery-repository.js';


export class CleanupService {

    @dep() private logger!: Logger;
    @dep() private discoveryRepo!: DiscoveryRepository;

    constructor() {
        // You might start a routine or timer in the constructor to periodically check registered instances
        this.startInstanceCleanupRoutine();
    }

    async startInstanceCleanupRoutine() {
        // Implement your routine to periodically check and clean up instances
        this.logger.info('Starting instance cleanup routine...');
        setInterval(async () => {
            try {
                await this.cleanupExpiredInstances();
            } catch (error: any) {
                this.logger.error('Error occurred during instance cleanup:', error);
            }
        }, 24 * 60 * 60 * 1000); // Run every 24 hours
    }

    async cleanupExpiredInstances() {
        // Implement logic to cleanup expired instances
        this.logger.info('Cleaning up expired instances...');

        // Calculate the expiration threshold
        const expirationDate = new Date(Date.now() - (24 * 60 * 60 * 1000)).getTime(); // For example, one day ago

        // Query all groups to get summary
        const allGroups = await this.discoveryRepo.getAllGroupsSummary();

        // Iterate through each group to get instances and clean up
        for (const group of allGroups) {
            const groupInstances = await this.discoveryRepo.getGroupInstances(group.group);

            // Filter expired instances based on updatedAt timestamp
            const expiredInstances = groupInstances.filter(instance => instance.updatedAt < expirationDate);

            // Remove expired instances
            for (const instance of expiredInstances) {
                await this.discoveryRepo.unregisterInstance(group.group, instance.id);
            }

            this.logger.info(`Cleanup completed for group ${group.group}. Removed ${expiredInstances.length} expired instances.`);
        }

        this.logger.info('Cleanup completed for all groups.');
    }
}
