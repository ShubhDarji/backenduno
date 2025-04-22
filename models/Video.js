import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
