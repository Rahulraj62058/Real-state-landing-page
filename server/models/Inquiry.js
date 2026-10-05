import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: [true, 'Your name is required'], trim: true },
    email: { type: String, required: [true, 'Your email is required'], trim: true },
    phone: { type: String, trim: true },
    message: { type: String, required: [true, 'Write a message for the owner'], maxlength: 1000 },
  },
  { timestamps: true }
);

export default mongoose.model('Inquiry', inquirySchema);
