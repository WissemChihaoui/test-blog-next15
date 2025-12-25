import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb+srv://wissemchihaoui_db_user:p7krUwYi5Xrnvpxi@cluster-inno.rg9gucm.mongodb.net/test-a?appName=cluster-inno';
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('test-a');
}

export default clientPromise;