import User from "../models/User.model.js";

/* ================= GET PROFILE ================= */
export const getCustomerProfile = async (req, res) => {
  try {
    const { mobile } = req.query;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      profile: {
        name: user.name || "",
        email: user.email || "",
        secondaryPhone: user.secondaryPhone || "",
        dob: user.dob || "",
        anniversary: user.anniversary || ""
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateCustomerProfile = async (req, res) => {
  try {
    const { mobile, profile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

const user = await User.findOneAndUpdate(
  { mobile },
  {
    $set: {
      name: profile.name,
      email: profile.email,
      secondaryPhone: profile.secondaryPhone,
      dob: profile.dob,
      anniversary: profile.anniversary
    }
  },
  { new: true }
);


    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      profile: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};