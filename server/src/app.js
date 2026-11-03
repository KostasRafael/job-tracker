import 'dotenv/config';
import express from 'express';

import errorHandler from './middleware/errorHandler.js';

import authRouter from './routes/authRoutes.js';

const app = express();
app.use(express.json()); // lets the server read JSON request bodies

app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// 404 catch-all for unknown URLs
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// error handler: must be the very last line
app.use(errorHandler);

export default app;