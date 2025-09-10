import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("EXPRESS app connection FAILED: ", error);
      throw error;
    });
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Server is listening to port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });
