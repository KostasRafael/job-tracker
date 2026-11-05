import Application from '../models/Application.js';

export async function createApplication(userId, data) {
  const status = data.status ?? 'wishlist';
  const position = await Application.countDocuments({ user: userId, status });
  return Application.create({ ...data, user: userId, position });
}

export async function listApplications(userId) {
  return Application.find({ user: userId }).sort({ status: 1, position: 1 }).lean();
}
