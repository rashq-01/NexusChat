import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function seedUsers() {
  await client.connect();

  const db = client.db("NexusChat");
  const users = db.collection("users");

//   let data = [];

//   for (let i = 0; i < 100; i++) {
//     data.push({
//       firstName: "Test",
//       lastName: `User${i}`,
//       username: `testuser${i}`,
//       email: `testuser${i}@test.com`,
//       password: "$2b$10$uupZOtnIZrmkHe3pHrmdzuj8oU6lsIVRqOMLp4efiiwnAIhugp/Gy"
//     });
//   }

  const result = await users.deleteMany(data);

  console.log(`${result.insertedCount} users inserted`);

  await client.close();
}

seedUsers();