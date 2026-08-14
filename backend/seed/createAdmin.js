// Run with: npm run seed:admin
// Creates the first admin account using the ADMIN_* values in your .env file.
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = (process.env.ADMIN_EMAIL || "admin@minicrm.com").toLowerCase();
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log(`Admin with email ${email} already exists. Nothing to do.`);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || "Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
    });

    console.log("Admin created successfully:");
    console.log(`  email: ${admin.email}`);
    console.log(`  password: ${process.env.ADMIN_PASSWORD || "Admin@123"} (change this after first login)`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
};

run();
