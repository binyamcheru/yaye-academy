import "dotenv/config";

async function main() {
  const { prisma } = await import("../src/lib/db");

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection successful.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Database connection failed.", error);
  process.exitCode = 1;
});
