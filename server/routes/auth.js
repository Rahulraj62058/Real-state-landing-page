import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, favorites: (u.favorites || []).map(String) });
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  // Only "user" and "owner" can be chosen at sign-up. Admins are created via seed/admin panel.
  const safeRole = role === 'owner' ? 'owner' : 'user';
  const user = await User.create({ name: name.trim(), email: String(email).toLowerCase().trim(), password, role: safeRole });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matches(password))) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
}));

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
