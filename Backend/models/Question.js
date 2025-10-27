import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: { type: [String], required: true },
  correct: { type: Number, required: true },
  
  level: { type: Number, required: true, index: true } 
});

export default mongoose.model('Question', questionSchema);