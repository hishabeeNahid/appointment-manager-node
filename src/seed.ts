import SeedService from "./app/services/seed.service";

async function main() {
  try {
    console.log("Starting database seeding...");
    await SeedService.seedDatabase();
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();
