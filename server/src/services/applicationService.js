import Application from '../models/Application.js';
import HttpError from '../utils/HttpError.js';

export async function createApplication(userId, data) {
  const status = data.status ?? 'wishlist';
  const position = await Application.countDocuments({ user: userId, status });
  return Application.create({ ...data, user: userId, position });
}

const SORTS = {
  board: { status: 1, position: 1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  company: { company: 1 },
};

export async function listApplications(userId, { status, q, sort } = {}) {
  const filter = { user: userId };
  if (status) {
    filter.status = status;
  }
  if (q) {
    // Escape regex special characters so the search text is matched literally
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQ, 'i');
    filter.$or = [{ company: regex }, { role: regex }];
  }

  return Application.find(filter).sort(SORTS[sort] ?? SORTS.board).lean();
}

async function findOwned(userId, id) {
  const card = await Application.findOne({ _id: id, user: userId });
  if (!card) throw new HttpError(404, 'Application not found');
  return card;
}

export async function getApplication(userId, id) {
  return findOwned(userId, id);
}

export async function updateApplication(userId, id, data) {
  const card = await findOwned(userId, id);

  if (data.status && data.status !== card.status) {
    card.position = await Application.countDocuments({ user: userId, status: data.status });
  }

  card.set(data);
  await card.save();
  return card;
}

export async function deleteApplication(userId, id) {
  const card = await findOwned(userId, id);
  await card.deleteOne();
}

// Saves each card's index in `cards` as its position, all in one round trip.
async function writePositions(cards, status) {
  if (cards.length === 0) {
    return;
  }
  await Application.bulkWrite(
    cards.map((c, i) => ({
      updateOne: { filter: { _id: c._id }, update: { status, position: i } },
    }))
  );
}

export async function moveApplication(userId, id, { status, position }) {
  const card = await findOwned(userId, id);
  const oldStatus = card.status;

  const column = await Application.find({ user: userId, status, _id: { $ne: card._id } })
    .sort({ position: 1 })
    .select('_id')
    .lean();
  const index = Math.min(position, column.length);
  column.splice(index, 0, card);
  await writePositions(column, status);

  if (status !== oldStatus) {
    const oldColumn = await Application.find({ user: userId, status: oldStatus })
      .sort({ position: 1 })
      .select('_id')
      .lean();
    await writePositions(oldColumn, oldStatus);
  }

  card.set({ status, position: index });
  return card;
}
