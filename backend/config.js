const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://shivathallapally5:Shiva%403312@shareeasy.s3i1s.mongodb.net/ShareEasy?retryWrites=true&w=majority");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
