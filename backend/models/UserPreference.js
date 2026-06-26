const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC+00:00",
    },
    dateFormat: {
      type: String,
      default: "YYYY-MM-DD",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    browserNotifications: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userPreferenceSchema.statics.getForUser = async function (userId) {
  const doc = await this.findOne({ userId });
  if (!doc) {
    return {
      theme: "dark",
      language: "en",
      timezone: "UTC+00:00",
      dateFormat: "YYYY-MM-DD",
      emailNotifications: true,
      browserNotifications: false,
    };
  }
  return doc.toObject();
};

userPreferenceSchema.statics.upsertForUser = async function (userId, data) {
  const doc = await this.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true }
  );
  return doc.toObject();
};

module.exports =
  mongoose.models.UserPreference ||
  mongoose.model("UserPreference", userPreferenceSchema);
