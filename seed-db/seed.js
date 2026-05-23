import "dotenv/config";
import pg from "pg";
import { faker } from "@faker-js/faker";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const TOTAL = 2000;
const BATCH_SIZE = 1000;

function generateUser(index) {
  return [
    faker.person.fullName(),
    `user${index}_${faker.string.uuid().slice(0, 8)}@example.com`,
    Math.floor(Math.random() * 60) + 18,
    Math.random() > 0.2,
    faker.date.between({
      from: "2023-01-01T00:00:00.000Z",
      to: "2026-05-23T00:00:00.000Z"
    })
  ];
}

async function insertBatch(batch) {
  const values = [];
  const placeholders = [];

  batch.forEach((user, i) => {
    const base = i * 5;

    placeholders.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
    );

    values.push(...user);
  });

  const query = `
    INSERT INTO users (name, email, age, is_active, created_at)
    VALUES ${placeholders.join(",")}
  `;

  await client.query(query, values);
}

async function seed() {
  await client.connect();

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = Array.from({ length: BATCH_SIZE }, generateUser);

    await insertBatch(batch);

    console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL)}/${TOTAL}`);
  }

  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});