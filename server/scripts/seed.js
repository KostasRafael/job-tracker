import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import Application from '../src/models/Application.js';

const DEMO_EMAIL = 'demo@jobtracker.dev';
const DEMO_PASSWORD = 'demo-password-123';

// [company, role, status, location, salary, notes]
const SAMPLES = [
  ['Brightloop', 'Junior Frontend Developer', 'wishlist', 'Remote', null, 'Friend works here, ask for a referral'],
  ['Northwind Labs', 'React Developer', 'wishlist', 'Berlin', 52000, null],
  ['Pixelforge', 'Full Stack Developer', 'wishlist', null, null, null],
  ['Greenfield Health', 'Frontend Engineer', 'wishlist', 'Amsterdam', 55000, 'Needs a portfolio link'],
  ['Cloudberry', 'Junior Software Engineer', 'wishlist', 'Remote', null, null],
  ['Atlas Freight', 'Junior Backend Developer', 'applied', 'Hamburg', 48000, null],
  ['Lumen Analytics', 'Frontend Developer', 'applied', 'Remote', null, 'Applied through LinkedIn'],
  ['Copperleaf', 'Web Developer', 'applied', 'Munich', 50000, null],
  ['Bluefin Payments', 'Junior Full Stack Developer', 'applied', null, null, null],
  ['Stackhouse', 'Node.js Developer', 'applied', 'Remote', 54000, 'Take-home task promised in the job ad'],
  ['Orbitly', 'UI Engineer', 'applied', 'Vienna', null, null],
  ['Meadow Software', 'Junior JavaScript Developer', 'applied', 'Cologne', 46000, null],
  ['Quillworks', 'Frontend Developer (Vue/React)', 'applied', null, null, null],
  ['Harbor & Co', 'Junior React Developer', 'interview', 'Hamburg', 49000, 'Technical interview on Thursday'],
  ['Sunline Energy', 'Software Engineer I', 'interview', 'Remote', 56000, null],
  ['Tidewater Digital', 'Full Stack Developer', 'interview', 'Berlin', null, 'Recruiter call went well'],
  ['Kestrel Games', 'Junior Web Developer', 'interview', null, 47000, null],
  ['Fernway Travel', 'Frontend Engineer', 'interview', 'Remote', null, 'Prepare questions about the team'],
  ['Mosaic Learning', 'Junior Frontend Developer', 'offer', 'Remote', 51000, 'Offer deadline is next Friday'],
  ['Redwood Systems', 'Junior Software Developer', 'offer', 'Frankfurt', 53000, null],
  ['Driftwood Media', 'Web Developer', 'rejected', 'Berlin', null, null],
  ['Ironbark Security', 'Junior Backend Engineer', 'rejected', 'Remote', 55000, 'Wanted more Go experience'],
  ['Nimbus Retail', 'Frontend Developer', 'rejected', null, null, null],
  ['Vantage Robotics', 'Software Engineer Intern', 'rejected', 'Munich', 30000, null],
  ['Willowtree Bank', 'Junior Full Stack Developer', 'rejected', 'Frankfurt', null, 'No feedback given'],
];

const DAY = 24 * 60 * 60 * 1000;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove the old demo account so the script can be run again and again
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await Application.deleteMany({ user: existing._id });
    await existing.deleteOne();
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await User.create({ name: 'Demo User', email: DEMO_EMAIL, passwordHash });

  const positions = {};
  let appliedCount = 0;
  const applications = SAMPLES.map(([company, role, status, location, salary, notes]) => {
    const position = positions[status] ?? 0;
    positions[status] = position + 1;

    // Wishlist jobs have not been applied to yet. The other 20 get one slot each,
    // 0 to 53 days ago, shuffled so every status has both recent and older dates.
    let appliedAt;
    if (status !== 'wishlist') {
      const slot = (appliedCount++ * 7) % 20;
      appliedAt = new Date(Date.now() - Math.round(slot * 2.8) * DAY);
    }

    return {
      user: user._id,
      company,
      role,
      status,
      position,
      ...(location && { location }),
      ...(salary && { salary }),
      ...(notes && { notes }),
      ...(appliedAt && { appliedAt }),
    };
  });

  await Application.insertMany(applications);
  console.log(`Seeded ${DEMO_EMAIL} / ${DEMO_PASSWORD} with ${applications.length} applications`);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
