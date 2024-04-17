import { Instance } from '../schema/instance.js';

export interface GroupSummary {
    group: string;
    instances: number;
    createdAt: number;
    lastUpdatedAt: number;
}

export abstract class DiscoveryServiceBase {

    abstract registerInstance(group: string, id: string, meta: Record<string, any>): Promise<Instance>;

    abstract unregisterInstance(group: string, id: string): Promise<void>;

    abstract getAllGroupsSummary(): Promise<GroupSummary[]>;

    abstract getGroupInstances(group: string): Promise<Instance[]>;
}
