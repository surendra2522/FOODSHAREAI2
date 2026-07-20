import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Backend is running, but database connection is unavailable. Check MongoDB service status.');
    // Do not terminate process immediately so the server can still start and serve requests with fallback mock behaviors if needed
  }
};

export default connectDB;
