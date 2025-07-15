import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log("MongoDB connected successfully:", response.connection.host);
  } catch (error) {
    console.log("Error while connecting to MongoDB", error.message);
  }
};

export default connectDB;
