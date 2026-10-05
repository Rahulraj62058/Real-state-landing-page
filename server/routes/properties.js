import { Router } from 'express';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import { optionalAuth, protect, requireRole } from '../middleware/auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public: search + filter approved listings
router.get('/', wrap(async (req, res) => {
  const { q, city, listingType, propertyType, minPrice, maxPrice, beds, sort = 'new' } = req.query;
  const page = Math.max(1, +req.query.page || 1);
  const limit = Math.min(24, +req.query.limit || 9);

  const filter = { status: 'approved' };
  if (q) {
    const rx = new RegExp(esc(q), 'i');
    filter.$or = [{ title: rx }, { city: rx }, { address: rx }];
  }
  if (city) filter.city = new RegExp(`^${esc(city)}$`, 'i');
  if (['sale', 'rent'].includes(listingType)) filter.listingType = listingType;
  if (propertyType) filter.propertyType = propertyType;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = +minPrice;
    if (maxPrice) filter.price.$lte = +maxPrice;
  }
  if (beds) filter.bedrooms = { $gte: +beds };

  const sorts = { new: { createdAt: -1 }, low: { price: 1 }, high: { price: -1 } };
  const [items, total] = await Promise.all([
    Property.find(filter).sort(sorts[sort] || sorts.new).skip((page - 1) * limit).limit(limit).populate('owner', 'name'),
    Property.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

router.get('/meta/cities', wrap(async (_req, res) => {
  res.json(await Property.distinct('city', { status: 'approved' }));
}));

// Owner: my listings (must be before /:id)
router.get('/mine/list', protect, requireRole('owner', 'admin'), wrap(async (req, res) => {
  res.json(await Property.find({ owner: req.user._id }).sort({ createdAt: -1 }));
}));

router.get('/:id', optionalAuth, wrap(async (req, res) => {
  const p = await Property.findById(req.params.id).populate('owner', 'name');
  if (!p) return res.status(404).json({ message: 'Property not found' });
  const isOwner = Boolean(p.owner && req.user && (p.owner._id ? p.owner._id.equals(req.user._id) : p.owner.equals?.(req.user._id)));
  const canSee = p.status === 'approved' || (req.user && (req.user.role === 'admin' || isOwner));
  if (!canSee) return res.status(404).json({ message: 'Property not found' });
  res.json(p);
}));

const clean = (b) => ({
  title: b.title, description: b.description, listingType: b.listingType, propertyType: b.propertyType,
  price: b.price, bedrooms: b.bedrooms, bathrooms: b.bathrooms, areaSqft: b.areaSqft,
  city: b.city, address: b.address,
  images: (Array.isArray(b.images) ? b.images : []).map((s) => String(s).trim()).filter(Boolean),
  amenities: (Array.isArray(b.amenities) ? b.amenities : []).map((s) => String(s).trim()).filter(Boolean),
});

router.post('/', protect, requireRole('owner', 'admin'), wrap(async (req, res) => {
  const p = await Property.create({
    ...clean(req.body),
    owner: req.user._id,
    status: req.user.role === 'admin' ? 'approved' : 'pending',
  });
  res.status(201).json(p);
}));

router.put('/:id', protect, requireRole('owner', 'admin'), wrap(async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Property not found' });
  const isAdmin = req.user.role === 'admin';
  const isOwner = Boolean(p.owner && (p.owner.equals ? p.owner.equals(req.user._id) : String(p.owner) === String(req.user._id)));
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'This is not your listing' });
  Object.assign(p, clean(req.body));
  if (!isAdmin) p.status = 'pending'; // edits by owners go back for review
  await p.save();
  res.json(p);
}));

router.delete('/:id', protect, requireRole('owner', 'admin'), wrap(async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Property not found' });
  const isAdmin = req.user.role === 'admin';
  const isOwner = Boolean(p.owner && (p.owner.equals ? p.owner.equals(req.user._id) : String(p.owner) === String(req.user._id)));
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'This is not your listing' });
  }
  await Promise.all([
    p.deleteOne(),
    User.updateMany({}, { $pull: { favorites: p._id } }),
    Inquiry.deleteMany({ property: p._id }),
  ]);
  res.json({ deleted: true });
}));

export default router;
