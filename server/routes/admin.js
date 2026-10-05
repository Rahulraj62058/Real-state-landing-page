import { Router } from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
router.use(protect, requireRole('admin'));

router.get('/stats', wrap(async (_req, res) => {
  const [users, owners, approved, pending, rejected, inquiries] = await Promise.all([
    User.countDocuments(), User.countDocuments({ role: 'owner' }),
    Property.countDocuments({ status: 'approved' }), Property.countDocuments({ status: 'pending' }),
    Property.countDocuments({ status: 'rejected' }), Inquiry.countDocuments(),
  ]);
  res.json({ users, owners, approved, pending, rejected, inquiries });
}));

router.get('/properties', wrap(async (req, res) => {
  const filter = ['pending', 'approved', 'rejected'].includes(req.query.status) ? { status: req.query.status } : {};
  res.json(await Property.find(filter).sort({ createdAt: -1 }).populate('owner', 'name email'));
}));

router.patch('/properties/:id/status', wrap(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const p = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!p) return res.status(404).json({ message: 'Property not found' });
  res.json(p);
}));

router.get('/users', wrap(async (_req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }).select('name email role createdAt'));
}));

router.patch('/users/:id/role', wrap(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'owner', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'You cannot change your own role' });
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
}));

router.delete('/users/:id', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account' });
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) return res.status(404).json({ message: 'User not found' });
  const props = await Property.find({ owner: u._id }).select('_id');
  const ids = props.map((p) => p._id);
  await Promise.all([
    Property.deleteMany({ owner: u._id }),
    Inquiry.deleteMany({ $or: [{ owner: u._id }, { property: { $in: ids } }] }),
    User.updateMany({}, { $pull: { favorites: { $in: ids } } }),
  ]);
  res.json({ deleted: true });
}));

export default router;
