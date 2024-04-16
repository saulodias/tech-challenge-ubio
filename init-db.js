const dbName = "tech-challenge-ubio";

conn = new Mongo();

db = conn.getDB(dbName);

// Create collections
db.createCollection("discovery_instances");
db.createCollection("logs");
