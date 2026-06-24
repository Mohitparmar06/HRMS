const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: "",
    },

    joinDate: {
      type: String,
      default: "",
    },
    gender: {
  type: String,
  default: "",
},

dob: {
  type: String,
  default: "",
},

address: {
  type: String,
  default: "",
},

emergencyName: {
  type: String,
  default: "",
},

emergencyContact: {
  type: String,
  default: "",
},

profilePicture: {
  type: String,
  default: "",
},
lastCheckIn: {
  type: String,
  default: "",
},

performance: {
  type: Number,
  default: 75,
},

projectsCompleted: {
  type: Number,
  default: 0,
},

hoursWorked: {
  type: Number,
  default: 0,
},

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);