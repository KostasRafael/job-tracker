import * as authService from '../services/authService.js';
import { COOKIE_NAME } from '../utils/token.js';

export default async function requireAuth(req, res, next) {
  req.user = await authService.getUserFromToken(req.cookies[COOKIE_NAME]);
  next();
}