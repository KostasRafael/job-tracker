import {
  createApplicationSchema,
  updateApplicationSchema,
  moveSchema,
  listQuerySchema,
} from '../validators/application.js';
import * as applicationService from '../services/applicationService.js';
import parseBody from '../utils/parseBody.js';

export async function createApplication(req, res) {
  const data = parseBody(createApplicationSchema, req.body);
  const application = await applicationService.createApplication(req.user._id, data);
  res.status(201).json(application);
}

export async function listApplications(req, res) {
  const query = parseBody(listQuerySchema, req.query);
  const applications = await applicationService.listApplications(req.user._id, query);
  res.json(applications);
}

export async function getApplication(req, res) {
  const application = await applicationService.getApplication(req.user._id, req.params.id);
  res.json(application);
}

export async function updateApplication(req, res) {
  const data = parseBody(updateApplicationSchema, req.body);
  const application = await applicationService.updateApplication(req.user._id, req.params.id, data);
  res.json(application);
}

export async function deleteApplication(req, res) {
  await applicationService.deleteApplication(req.user._id, req.params.id);
  res.status(204).end();
}

export async function moveApplication(req, res) {
  const data = parseBody(moveSchema, req.body);
  const application = await applicationService.moveApplication(req.user._id, req.params.id, data);
  res.json(application);
}
