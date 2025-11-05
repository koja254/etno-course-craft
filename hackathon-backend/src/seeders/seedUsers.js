import sequelize from "../config/database.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    await sequelize.sync({ force: true }); 

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

    const users = [
      {
        firstName: "Kristine",
        lastName: "Nyaga",
        email: "kristine@example.com",
        password: await bcrypt.hash("password123", saltRounds),
      },
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: await bcrypt.hash("password123", saltRounds),
      },
    ];

    await User.bulkCreate(users);

    console.log("Seed data inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedUsers();
