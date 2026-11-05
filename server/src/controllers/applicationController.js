import { createApplicationSchema } from '../validators/application.js';
import * as applicationService from '../services/applicationService.js';
import HttpError from '../utils/HttpError.js';

export async function createApplication(req, res) {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0].message);
  }

  const application = await applicationService.createApplication(req.user._id, parsed.data);
  res.status(201).json(application);
}

export async function listApplications(req, res) {
  const applications = await applicationService.listApplications(req.user._id);
  res.json(applications);
}
