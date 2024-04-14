import { dep } from 'mesh-ioc';

import { DiscoveryRepository } from '../repositories/discovery-repository.js';
import { Instance } from '../schema/instance.js';
import { DiscoveryServiceBase, GroupSummary } from './discovery-service-base.js';


export class DiscoveryService implements DiscoveryServiceBase {
    @dep() private discoveryRepository!: DiscoveryRepository;

    async registerInstance(group: string, id: string, meta: Record<string, any>): Promise<Instance> {
        return await this.discoveryRepository.registerInstance(group, id, meta);
    }

    async unregisterInstance(group: string, id: string): Promise<void> {
        await this.discoveryRepository.unregisterInstance(group, id);
    }

    async getAllGroupsSummary(): Promise<GroupSummary[]> {
        return await this.discoveryRepository.getAllGroupsSummary();
    }

    async getGroupInstances(group: string): Promise<Instance[]> {
        return await this.discoveryRepository.getGroupInstances(group);
    }
}
