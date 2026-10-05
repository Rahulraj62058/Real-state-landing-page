import { Router } from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', protect, wrap(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites', match: { status: 'approved' }, populate: { path: 'owner', select: 'name' },
  });
  res.json((user?.favorites || []).filter(Boolean));
}));

router.post('/:id', protect, wrap(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, status: 'approved' });
  if (!property) return res.status(404).json({ message: 'Property not found' });
  const has = (req.user.favorites || []).some((f) => f && (f.equals ? f.equals(property._id) : String(f) === String(property._id)));
  await User.findByIdAndUpdate(req.user._id, has ? { $pull: { favorites: property._id } } : { $addToSet: { favorites: property._id } });
  res.json({ favorited: !has });
}));

export default router;
