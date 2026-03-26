import mongoose from "mongoose";

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 20000, 
      connectTimeoutMS: 20000
    });
    console.log("✅ [DB] Connected to MongoDB Atlas");

  } catch (error) {
    console.error("❌ [DB] Connection Failed:", error.name, "->", error.message);
    process.exit(1);
  }
};

export default connectDB;