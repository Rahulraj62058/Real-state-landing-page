import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function userFromRequest(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = await userFromRequest(req);
  next();
}

export async function protect(req, res, next) {
  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Please log in to continue' });
  req.user = user;
  next();
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have access to this' });
