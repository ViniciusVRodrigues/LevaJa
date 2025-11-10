const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function connectMongoDB() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/levaja-products';
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB (Products)');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function closeMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectMongoDB,
  closeMongoDB
};
