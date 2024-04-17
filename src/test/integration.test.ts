import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import dotenv from 'dotenv';

chai.use(chaiHttp);

dotenv.config({ path: '.env.test' });

const baseUrl = process.env.API_BASE_URL; 


describe("DiscoveryRouter", () => {
  const createdInstances: { group: string; id: string }[] = [];

  // After all tests, clean up all instances
  after(async () => {
    for (const { id, group } of createdInstances) {
      await chai.request(baseUrl).delete(`/${group}/${id}`);
    }
  });

  describe("POST /{group}/{id}", () => {
    it("should register multiple instances for diverse groups", (done) => {
      const numGroups = 3;
      const numInstancesPerGroup = 2;
      const groupIds = Array.from(
        { length: numGroups },
        (_, index) => `MyGroup${index + 1}`
      );
      const intancesNumber = Array.from(
        { length: numInstancesPerGroup },
        () => null
      );

      let completedRequests = 0;

      // Callback function to be executed after each request completes
      const requestCallback = (err: any, res: any) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("id")
          .that.is.a("string")
        expect(groupIds.includes(res.body.group)).to.be.true; // Check if the group ID is one of the diverse groups
        expect(res.body).to.have.property("createdAt").that.is.a("number");
        expect(res.body).to.have.property("updatedAt").that.is.a("number");
        expect(res.body.createdAt).to.be.equal(res.body.updatedAt);
        expect(res.body.meta).to.deep.equal({ key1: "example" });

        // Add the created instance ID and group to the array
        createdInstances.push({ id: res.body.id, group: res.body.group });

        // Increment the counter
        completedRequests++;

        if (completedRequests === numGroups * numInstancesPerGroup) {
          done();
        }
      };

      // Send requests to create instances for diverse groups
      groupIds.forEach((groupId) => {
        intancesNumber.forEach(() => {
          const instanceId = crypto.randomUUID();
          chai
            .request(baseUrl)
            .post(`/${groupId}/${instanceId}`)
            .send({ meta: { key1: "example" } })
            .end(requestCallback);
        });
      });
    });
  });

  describe("POST /{group}/{id}", () => {
    it("should register update all instances created in the previous test", (done) => {
      let completedRequests = 0;

      const requestCallback = (err: any, res: any) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("id")
          .that.is.a("string")
        expect(res.body).to.have.property("createdAt").that.is.a("number");
        expect(res.body).to.have.property("updatedAt").that.is.a("number");

        expect(res.body.updatedAt).to.be.greaterThan(res.body.createdAt);
        expect(res.body.meta).to.deep.equal({ key1: "exampleUpdated" });

        // Increment the counter
        completedRequests++;

        if (completedRequests === createdInstances.length) {
          done();
        }
      };

      // Send requests to create instances for diverse groups
      createdInstances.forEach(({ group, id }) => {
        chai
          .request(baseUrl)
          .post(`/${group}/${id}`)
          .send({ meta: { key1: "exampleUpdated" } })
          .end(requestCallback);
      });
    });
  });

  describe("GET /", () => {
    it("should get a list of groups", (done) => {
      chai
        .request(baseUrl)
        .get("/")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body.length).to.be.greaterThan(0); // Ensure at least one group is returned
          expect(res.body[0]).to.have.property("group").that.is.a("string");
          expect(res.body[0]).to.have.property("instances").that.is.a("number");
          expect(res.body[0]).to.have.property("createdAt").that.is.a("number");
          expect(res.body[0])
            .to.have.property("lastUpdatedAt")
            .that.is.a("number");
          done();
        });
    });
  });

  describe("GET /{group}", () => {
    it("should get instances of a group", (done) => {
      chai
        .request(baseUrl)
        .get("/GroupA")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");

          // Ensure each instance has the expected properties
          res.body.forEach((instance: any) => {
            expect(instance).to.have.property("id").that.is.a("string");
            expect(instance).to.have.property("group").equal("GroupA");
            expect(instance).to.have.property("createdAt").that.is.a("number");
            expect(instance).to.have.property("updatedAt").that.is.a("number");
            expect(instance).to.have.property("meta").that.is.an("object");
          });

          done();
        });
    });
  });

  describe("DELETE /{group}/{id}", () => {
    it("should unregister an instance", (done) => {
      // First, create an instance to delete
      chai
        .request(baseUrl)
        .post("/GroupA/38b4e940-9d93-4f35-a9e7-8f3475c8f7fc")
        .send({ meta: { key1: "example" } })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);

          chai
            .request(baseUrl)
            .delete(`/GroupA/${res.body.id}`)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.body).to.be.empty;
              done();
            });
        });
    });
  });
});
