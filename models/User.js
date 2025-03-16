import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profilePic: { type: String, default: "/uploads/default-user.png" }, // ✅ Profile Picture
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    role: { type: String, default: "customer" }, // customer by default
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
