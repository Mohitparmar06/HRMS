const UserPreference = require("../models/UserPreference");
const User = require("../models/User");

exports.getUserPreferences = async (req, res) => {
  try {
    const prefs = await UserPreference.getForUser(req.user.id);
    res.status(200).json({ success: true, preferences: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const allowed = ["theme", "language", "timezone", "dateFormat", "emailNotifications", "browserNotifications"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: "No valid preference fields provided" });
    }

    const prefs = await UserPreference.upsertForUser(req.user.id, data);
    res.status(200).json({ success: true, message: "Preferences updated", preferences: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      profile: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
        department: user.department,
        designation: user.designation,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const allowed = ["phone", "address", "profileImage"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: "No valid profile fields provided" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, data, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated",
      profile: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
