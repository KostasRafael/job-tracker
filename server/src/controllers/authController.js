import { registerSchema, loginSchema } from '../validators/auth.js';
import * as authService from '../services/authService.js';
import parseBody from '../utils/parseBody.js';
import { COOKIE_NAME, cookieOptions, signToken } from '../utils/token.js';

export async function register(req, res) {
  const data = parseBody(registerSchema, req.body);
  const user = await authService.register(data);
  res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
  res.status(201).json(authService.toPublicUser(user));
}

export async function login(req, res) {
  const data = parseBody(loginSchema, req.body);
  const user = await authService.login(data);
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
