import { registerSchema, loginSchema } from '../validators/auth.js';
import * as authService from '../services/authService.js';
import HttpError from '../utils/HttpError.js';
import { COOKIE_NAME, cookieOptions, signToken } from '../utils/token.js';

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  const user = await authService.register(parsed.data);
  res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
  res.status(201).json(authService.toPublicUser(user));
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  const user = await authService.login(parsed.data);
  res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
  res.status(200).json(authService.toPublicUser(user));
}

export function me(req, res) {
  res.json(authService.toPublicUser(req.user));
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
}
