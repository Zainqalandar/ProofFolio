import connectDB from "./configs/db";
import "dotenv/config";
import app from "./app";

const startServer = async () => {
  try {
    await connectDB();
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Error: ", error);
  }
};

startServer();