const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const hpp = require("hpp");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const router = require("./routes/route");
const errorHandler = require("./middlewares/errors");
const mongoose = require("mongoose");

// Load env vars
dotenv.config({ path: "./.env" });

// Connect to DB
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {});
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

connectDB();

const app = express();

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent http param pollution

app.use(hpp());

// Enable CORS

app.use(cors());

// Dev logging middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api", router);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
