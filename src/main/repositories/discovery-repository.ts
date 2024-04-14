import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { Instance } from '../schema/instance.js';
import { GroupSummary } from '../services/discovery-service-base.js';
import { DeleteResult } from 'mongodb';

export class DiscoveryRepository {
    @dep() private mongodb!: MongoDb;

    protected get collection() {
        return this.mongodb.db.collection<Instance>('discovery_instances');
    }

    async registerInstance(group: string, id: string, meta: Record<string, any>): Promise<Instance> {
        const query = { group, id };
        
        const update = {
            $set: {
                updatedAt: Date.now(),
                meta 
            },
            $setOnInsert: {
                id,
                group,
                createdAt: Date.now(),
            },
        };
    
        const result = await this.collection.findOneAndUpdate(
            query,
            update,
            { upsert: true, returnDocument: 'after' } 
        );
               
        return result!;
    }
    

    async unregisterInstance(group: string, id: string): Promise<DeleteResult> {
        return await this.collection.deleteOne({ group, id });
    }

    async getAllGroupsSummary(): Promise<any[]> {
        const summary = await this.collection.aggregate<GroupSummary>([
            {
                $group: {
                    _id: '$group',
                    instances: { $sum: 1 },
                    createdAt: { $min: '$createdAt' },
                    lastUpdatedAt: { $max: '$updatedAt' }
                }
            }
        ]).toArray();
        return summary;
    }

    async getGroupInstances(group: string): Promise<Instance[]> {
        const instances = await this.collection.find<Instance>({ group }).toArray();
        return instances;
    }

}
