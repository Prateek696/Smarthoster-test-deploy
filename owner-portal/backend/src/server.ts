import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 Server running at http://localhost:${env.port}`);
  });
};

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
  // Initialize database connection for Vercel
  connectDB().catch(console.error);
  // Export the app for Vercel
  module.exports = app;
} else {
  // Start server normally for development
  startServer();
}
