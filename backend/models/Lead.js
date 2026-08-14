const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: ["Website", "Referral", "Social Media", "Ad Campaign", "Other"],
      default: "Website",
    },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "lost"],
      default: "new",
    },
    notes: [noteSchema],
  },
  { timestamps: true } // gives us createdAt / updatedAt automatically
);

leadSchema.index({ name: "text", email: "text" });

module.exports = mongoose.model("Lead", leadSchema);
