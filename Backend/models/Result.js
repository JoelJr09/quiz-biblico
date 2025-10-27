import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Result", resultSchema);
