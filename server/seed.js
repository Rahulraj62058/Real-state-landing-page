import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedDatabase } from './seedData.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/real_estate_portal');
await seedDatabase();
await mongoose.disconnect();
