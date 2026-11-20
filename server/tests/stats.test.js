import request from 'supertest';
import app from '../src/app.js';

// Registering also sets the login cookie, which the agent keeps for later requests
async function registerAndLogin(agent, email) {
  await agent.post('/api/auth/register').send({ name: 'Test User', email, password: 'password123' });
}

describe('GET /api/stats', () => {
  test('returns 401 without a login', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(401);
  });

  test('counts only the logged-in user’s applications', async () => {
    const alice = request.agent(app);
    const bob = request.agent(app);
    await registerAndLogin(alice, 'alice@example.com');
    await registerAndLogin(bob, 'bob@example.com');

    // Two Wednesdays in different weeks (their Mondays are Oct 5 and Oct 12)
    await alice
      .post('/api/applications')
      .send({ company: 'Alice Co', role: 'Dev', status: 'applied', appliedAt: '2026-10-07' });
    await alice
      .post('/api/applications')
      .send({ company: 'Alice Inc', role: 'Dev', status: 'interview', appliedAt: '2026-10-14' });
    // Same week as Alice's first one, so a leak would show up in perWeek too
    await bob
      .post('/api/applications')
      .send({ company: 'Bob Co', role: 'Dev', status: 'applied', appliedAt: '2026-10-07' });

    const res = await alice.get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.byStatus).toEqual({
      wishlist: 0,
      applied: 1,
      interview: 1,
      offer: 0,
      rejected: 0,
    });
    expect(res.body.perWeek).toEqual([
      { weekStart: '2026-10-05', count: 1 },
      { weekStart: '2026-10-12', count: 1 },
    ]);
  });
});
