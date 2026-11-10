import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Application from '../src/models/Application.js';
import { moveApplication } from '../src/services/applicationService.js';

// Registering also sets the login cookie, which the agent keeps for later requests
async function registerAndLogin(agent, email) {
  await agent.post('/api/auth/register').send({ name: 'Test User', email, password: 'password123' });
}

const job = { company: 'Acme', role: 'Junior Developer' };

describe('applications API', () => {
  test('returns 401 without a login', async () => {
    const res = await request(app).get('/api/applications');

    expect(res.status).toBe(401);
  });

  test('creates an application', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'a@example.com');

    const res = await agent.post('/api/applications').send({ ...job, salary: 50000 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...job, salary: 50000, status: 'wishlist', position: 0 });
    expect(res.body._id).toBeDefined();
  });

  test('rejects an application without a company', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'a@example.com');

    const res = await agent.post('/api/applications').send({ role: 'Junior Developer' });

    expect(res.status).toBe(400);
  });

  test('lists only the logged-in user’s applications', async () => {
    const alice = request.agent(app);
    const bob = request.agent(app);
    await registerAndLogin(alice, 'alice@example.com');
    await registerAndLogin(bob, 'bob@example.com');
    await alice.post('/api/applications').send({ company: 'Alice Co', role: 'Dev' });
    await bob.post('/api/applications').send({ company: 'Bob Co', role: 'Dev' });

    const res = await alice.get('/api/applications');

    expect(res.status).toBe(200);
    expect(res.body.map((a) => a.company)).toEqual(['Alice Co']);
  });

  test('returns 404 for another user’s application', async () => {
    const alice = request.agent(app);
    const bob = request.agent(app);
    await registerAndLogin(alice, 'alice@example.com');
    await registerAndLogin(bob, 'bob@example.com');
    const created = await alice.post('/api/applications').send(job);

    const res = await bob.get(`/api/applications/${created.body._id}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for an invalid id', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'a@example.com');

    const res = await agent.get('/api/applications/hello');

    expect(res.status).toBe(400);
  });

  test('moves a card to another column and position', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'a@example.com');
    const card = await agent.post('/api/applications').send(job);
    await agent.post('/api/applications').send({ company: 'Other', role: 'Dev', status: 'interview' });

    const res = await agent
      .patch(`/api/applications/${card.body._id}/move`)
      .send({ status: 'interview', position: 0 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'interview', position: 0 });
  });
});

describe('moveApplication service', () => {
  test('renumbers both columns without gaps', async () => {
    const user = await User.create({ name: 'U', email: 'u@example.com', passwordHash: 'x' });
    const make = (company, status, position) =>
      Application.create({ user: user._id, company, role: 'Dev', status, position });
    await make('A', 'wishlist', 0);
    const b = await make('B', 'wishlist', 1);
    await make('C', 'wishlist', 2);
    await make('X', 'applied', 0);
    await make('Y', 'applied', 1);

    await moveApplication(user._id, b._id, { status: 'applied', position: 1 });

    const board = await Application.find({ user: user._id }).sort({ status: 1, position: 1 }).lean();
    const summary = board.map((card) => `${card.company}:${card.status}:${card.position}`);
    expect(summary).toEqual([
      'X:applied:0',
      'B:applied:1',
      'Y:applied:2',
      'A:wishlist:0',
      'C:wishlist:1',
    ]);
  });
});
