import * as statsService from '../services/statsService.js';

export async function getStats(req, res) {
  res.json(await statsService.getStats(req.user._id));
}
