import bcrypt from 'bcrypt';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';
import jwt from 'jsonwebtoken';

export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  return User.create({ name, email, passwordHash });
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk) throw new HttpError(401, 'Invalid email or password');
  return user;
}

export async function getUserFromToken(token) {
  if (!token) throw new HttpError(401, 'Not logged in');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid or expired session');
  }

  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user) throw new HttpError(401, 'User no longer exists');
  return user;
}