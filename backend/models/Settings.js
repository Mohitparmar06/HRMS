const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ["company", "attendance", "payroll", "leave", "preferences", "security"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    updatedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.statics.getSection = async function (section) {
  const doc = await this.findOne({ section });
  return doc ? doc.data : null;
};

settingsSchema.statics.updateSection = async function (section, data, updatedBy) {
  const doc = await this.findOneAndUpdate(
    { section },
    { data, updatedBy },
    { new: true, upsert: true }
  );
  return doc.data;
};

module.exports =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
