import { App } from '../main/app.js';
import { DiscoveryServiceMock } from './discovery-service-mock.js';

export class TestApp extends App {
    
    override createGlobalScope() {
        const mesh = super.createGlobalScope();
        this.mesh.service(DiscoveryServiceMock);
        return mesh;
    }
}

const app = new TestApp();

try {
    await app.start();
} catch (error: any) {
    app.logger.error('Failed to start', { error });
    process.exit(1);
}
