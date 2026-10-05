import { Router } from 'express';
import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';
import { optionalAuth, protect, requireRole } from '../middleware/auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Owner inbox (admin sees everything) - declared before /:propertyId
router.get('/received/list', protect, requireRole('owner', 'admin'), wrap(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
  res.json(await Inquiry.find(filter).sort({ createdAt: -1 }).populate('property', 'title city'));
}));

// Contact owner (works for guests too; logged-in users are linked to the message)
router.post('/:propertyId', optionalAuth, wrap(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.propertyId, status: 'approved' });
  if (!property) return res.status(404).json({ message: 'Property not found' });
  const { name, email, phone, message } = req.body;
  const inquiry = await Inquiry.create({
    property: property._id, owner: property.owner, sender: req.user?._id, name, email, phone, message,
  });
  res.status(201).json({ sent: true, id: inquiry._id });
}));

export default router;
