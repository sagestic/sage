import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const seedSqlPath = path.resolve(__dirname, "seed.sql");
const prismaBin = path.resolve(pkgRoot, "node_modules", ".bin", "prisma");

console.log("Seeding Sage PostgreSQL database via prisma db execute...");

execFileSync(prismaBin, ["db", "execute", "--file", seedSqlPath], {
  cwd: pkgRoot,
  stdio: "inherit",
});

console.log("Database seeded successfully.");
