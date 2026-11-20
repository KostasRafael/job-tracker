import Application, { STATUSES } from '../models/Application.js';

export async function getStats(userId) {
  // userId is already an ObjectId (req.user._id); aggregate() does not convert strings
  const [statusRows, weekRows] = await Promise.all([
    Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: { user: userId, appliedAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$appliedAt', unit: 'week', startOfWeek: 'monday' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // MongoDB omits statuses with no applications, so start every status at 0
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const row of statusRows) {
    byStatus[row._id] = row.count;
  }

  const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);

  // row._id is a Date (Monday 00:00 UTC); keep only the 'YYYY-MM-DD' part
  const perWeek = weekRows.map((row) => ({
    weekStart: row._id.toISOString().slice(0, 10),
    count: row.count,
  }));

  return { total, byStatus, perWeek };
}
