import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  dob: { 
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        return value === null || value instanceof Date;
      },
      message: "Invalid date format",
    },
  },
  
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: false
  },
  address: {
    type: String,
    default: "",
  },
  
  bio: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  verificationCode: String,
  codeExpiry: Date,
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Hash password before saving

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);

