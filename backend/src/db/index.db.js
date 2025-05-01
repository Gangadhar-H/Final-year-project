import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const DB_NAME = process.env.DB_NAME || "StudentManagementSystem";
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected!! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Connection Error", error);
        process.exit(1)
    }
}

export default connectDB;