import { Schema } from '@ubio/framework';

export interface Instance {
    id: string;
    group: string;
    createdAt: number;
    updatedAt: number;
    meta: Record<string, any>;
}

export const InstanceSchema = new Schema<Instance>({
    schema: {
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' },
            group: { type: 'string' },
            createdAt: { type: 'number' },
            updatedAt: { type: 'number' },
            meta: { type: 'object', properties: {} },
        },
        required: ['id', 'group', 'createdAt', 'updatedAt', 'meta'],
    },
    defaults: () => {
        return {
            id: crypto.randomUUID(),
            group: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            meta: {},
        };
    }
});
