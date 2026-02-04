import User from "../models/User.model.js";

export const updateCustomerProfile = async (req, res) => {
  try {
    const { mobile, name } = req.body;

    if (!mobile || !name) {
      return res.status(400).json({ message: "Mobile and name required" });
    }

    const user = await User.findOneAndUpdate(
      { mobile, role: "customer" },
      { name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};