import mongoose from "mongoose";
import env from "../config/env";

// Database connection
const dbConnect = async () => {
    try {
        await mongoose.connect(env.mongoose.url);
        console.log("🚀 Database connected successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
};

export default dbConnect;
