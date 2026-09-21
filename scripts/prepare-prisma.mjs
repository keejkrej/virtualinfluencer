import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(import.meta.dirname, "../.env") });
config({ path: resolve(import.meta.dirname, "../.env.local"), override: true });

const url = process.env.DATABASE_URL ?? "file:./data/dev.db";
const isPostgres = url.startsWith("postgres");
const schemaPath = resolve(import.meta.dirname, "../prisma/schema.prisma");
const schema = readFileSync(schemaPath, "utf8");
const provider = isPostgres ? "postgresql" : "sqlite";
const next = schema.replace(
  /datasource db \{\s*provider = "(sqlite|postgresql)"/,
  `datasource db {\n  provider = "${provider}"`,
);

if (next !== schema) {
  writeFileSync(schemaPath, next);
  console.log(`Prisma provider set to ${provider}`);
} else {
  console.log(`Prisma provider already ${provider}`);
}
