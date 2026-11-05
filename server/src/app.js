import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import errorHandler from './middleware/errorHandler.js';

import authRouter from './routes/authRoutes.js';
import applicationRouter from './routes/applicationRoutes.js';

const app = express();
app.use(helmet()); // sets safe HTTP response headers
app.use(express.json()); // lets the server read JSON request bodies
app.use(cookieParser()); // fills req.cookies from the Cookie header

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationRouter);

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