import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    listingType: { type: String, enum: ['sale', 'rent'], required: true },
    propertyType: { type: String, enum: ['apartment', 'house', 'villa', 'plot', 'commercial'], required: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    areaSqft: { type: Number, default: 0, min: 0 },
    city: { type: String, required: [true, 'City is required'], trim: true },
    address: { type: String, trim: true },
    images: [String], // image URLs
    amenities: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

propertySchema.index({ status: 1, city: 1, price: 1 });

export default mongoose.model('Property', propertySchema);
