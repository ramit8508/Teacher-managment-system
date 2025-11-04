import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load environment variables
dotenv.config({
  path: "./.env"
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("ERROR: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚡️ Server is running at port: ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("MONGODB connection failed !!!", err);
    process.exit(1);
  });
