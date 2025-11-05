import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import sequelize from "./config/database.js";
// Import models to establish associations
import "./models/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Models synchronized");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
