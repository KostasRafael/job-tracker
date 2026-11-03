import { registerSchema } from '../validators/auth.js';
import * as authService from '../services/authService.js';
import HttpError from '../utils/HttpError.js';

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  const user = await authService.register(parsed.data);
  res.status(201).json(authService.toPublicUser(user));
}