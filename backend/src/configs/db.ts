const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("BG Connected Success");
  } catch (error) {
    console.error("DB Errors: ", error);
    process.exit(1);
  }
};

export default connectDB;
