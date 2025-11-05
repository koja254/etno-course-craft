import dotenv from "dotenv";
import sequelize from "../config/database.js";
import Resource from "../models/resource.model.js";

dotenv.config();

const seedResources = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    // Ensure tables exist without dropping existing data
    await sequelize.sync({ alter: true });

    const resources = [
      {
        name: "Project Docs",
        type: "link",
        url: "https://example.com/docs",
      },
      {
        name: "API Reference",
        type: "link",
        url: "https://example.com/api",
      },
      {
        name: "Design Mockups",
        type: "asset",
        url: "https://example.com/designs/mockups.pdf",
      },
      {
        name: "Onboarding Guide",
        type: "document",
        url: "https://example.com/onboarding",
      },
    ];

    await Resource.bulkCreate(resources, { ignoreDuplicates: true });

    console.log("Resource seed data inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding resources:", error);
    process.exit(1);
  }
};

seedResources();
