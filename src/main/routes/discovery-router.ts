import { BodyParam, Delete, Get, PathParam, Post, Router } from '@ubio/framework';
import { dep } from 'mesh-ioc';

import { Instance } from '../schema/instance.js';
import { DiscoveryServiceBase, GroupSummary } from '../services/discovery-service-base.js';


export class DiscoveryRouter extends Router {
    @dep() discoveryService!: DiscoveryServiceBase;

    @Post({
        path: '/{group}/{id}',
        responses: {
            200: {
                schema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        group: { type: 'string' },
                        createdAt: { type: 'number' },
                        updatedAt: { type: 'number' },
                        meta: { type: 'object' }
                    }
                }
            }
        }
    })
    async registerInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string,
        @BodyParam('meta', { schema: { type: 'object' } })
        meta: object
    ): Promise<Instance> {
        return await this.discoveryService.registerInstance(group, id, meta);
    }

    @Delete({
        path: '/{group}/{id}'
    })
    async unregisterInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string
    ): Promise<void> {
        await this.discoveryService.unregisterInstance(group, id);
    }

    @Get({
        path: '/'
    })
    async getAllGroupsSummary(): Promise<GroupSummary[]> {
        return await this.discoveryService.getAllGroupsSummary();
    }

    @Get({
        path: '/{group}'
    })
    async getGroupInstances(
        @PathParam('group', { schema: { type: 'string' } }) group: string
    ): Promise<Instance[]> {
        return await this.discoveryService.getGroupInstances(group);
    }
}
