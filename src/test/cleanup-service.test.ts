import { Application, ConsoleLogger } from "@ubio/framework";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import dotenv from 'dotenv';
import sinon from 'sinon';
import { Instance } from "../main/schema/instance.js";
import { CleanupService } from "../main/services/cleanup-service.js";
import { HEARTBEAT_TIMEOUT } from "../main/services/constants-keys.js";
import { DiscoveryServiceBase, GroupSummary } from "../main/services/discovery-service-base.js";
import { LoggerServiceBase } from "../main/services/logger-service-base.js";

chai.use(chaiHttp);

dotenv.config({ path: '.env.test' });

const heartbeatTimeout = Number(process.env.HEARTBEAT_TIMEOUT || 30);

class DiscoveryServiceMock extends DiscoveryServiceBase {
    override registerInstance(group: string, id: string, meta: Record<string, any>): Promise<Instance> {
        // Simulate registering a new instance
        const currentTime = Date.now();
        const newInstance: Instance = { id, group, createdAt: currentTime, updatedAt: currentTime, meta };
        return Promise.resolve(newInstance);
    }

    override unregisterInstance(group: string, id: string): Promise<void> {
        // Simulate unregistering an instance
        return Promise.resolve();
    }

    override getAllGroupsSummary(): Promise<GroupSummary[]> {
        // Simulate getting summary of all groups
        const groups: GroupSummary[] = [
            {
                group: 'group1',
                instances: 1,
                createdAt: Date.now() - 60000, // Created 1 minute ago
                lastUpdatedAt: Date.now() - 30000 // Updated 30 seconds ago
            },
            {
                group: 'group2',
                instances: 1,
                createdAt: Date.now() - 120000, // Created 2 minutes ago
                lastUpdatedAt: Date.now() - 60000 // Updated 1 minute ago
            },
            // Add more mock data for other groups if needed
        ];
        return Promise.resolve(groups);
    }

    override async getGroupInstances(group: string): Promise<Instance[]> {
        // Simulate getting instances of a group
        // For now, let's return a single expired instance for simplicity
        const expiredInstance: Instance = {
            id: 'expiredInstance',
            group: group,
            createdAt: Date.now() - 120000, // Created 2 minutes ago
            updatedAt: Date.now() - 60000, // Updated 1 minute ago
            meta: { key1: "value1", key2: "value2" }
        };
        return Promise.resolve([expiredInstance]);
    }
}

describe("CleanupService", () => {
    let app: TestApp;
    let cleanupService: CleanupService;
    let loggerService: LoggerServiceBase;
    let loggerSpy: sinon.SinonSpy;

    class TestApp extends Application {
        override createGlobalScope() {
            const mesh = super.createGlobalScope();

            mesh.constant(HEARTBEAT_TIMEOUT, heartbeatTimeout);
            mesh.service(DiscoveryServiceBase, DiscoveryServiceMock);
            mesh.service(LoggerServiceBase, ConsoleLogger);
            mesh.service(CleanupService);

            return mesh;
        }
    }

    before(() => {
        app = new TestApp()
        app.beforeStart().then(() => {
            loggerService = app.mesh.resolve(LoggerServiceBase);
            cleanupService = app.mesh.resolve(CleanupService);
            cleanupService.startCleanupRoutine().then(() => {
                it("should set the correct heartbeat timeout", () => {
                    expect(cleanupService.heartbeatTimeout).to.equal(heartbeatTimeout);
                })

                it("should verify that the correct log message was called", () => {
                    expect(loggerSpy.calledWith(`Starting cleanup with ${cleanupService.heartbeatTimeout} min heartbeat timeout...`)).to.be.true;
                })
            })
            loggerSpy = sinon.spy(loggerService, 'info');
        })
    });

    after(() => {
        if (loggerSpy) {
            loggerSpy.restore(); // Restore the original method after the tests
        }

        app.stop().then(() => {
            
        })
    });

    it("should trigger cleanup routine and clean up expired instances", async () => {
        // Wait for a brief period to allow the cleanup routine to finish
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

        // Verify that the correct log message was called
        expect(loggerSpy.calledWithMatch(/Cleanup completed for .*\. Removed .* expired instances\./)).to.be.true;

        // Stop the cleanup routine
        cleanupService.stopCleanupRoutine();

        // Verify that the correct log message was called
        expect(loggerSpy.calledWith('Cleanup routine stopped.')).to.be.true;

        // // Try to stop the cleanup routine again
        // cleanupService.stopCleanupRoutine();
        // expect(loggerSpy.calledWith('Cleanup routine is not running.')).to.be.true; 

    });

    it("should handle stopping when cleanup routine is not running", () => {
        // Try to stop the cleanup routine again
        cleanupService.stopCleanupRoutine();
        expect(loggerSpy.calledWith('Cleanup routine is not running.')).to.be.true;
    });
    
});
