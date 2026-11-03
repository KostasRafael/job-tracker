import bcrypt from 'bcrypt';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';

export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  return User.create({ name, email, passwordHash });
}