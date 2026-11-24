import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import errorHandler from './middleware/errorHandler.js';

import authRouter from './routes/authRoutes.js';
import applicationRouter from './routes/applicationRoutes.js';
import statsRouter from './routes/statsRoutes.js';

const app = express();
// On Render the app sits behind one proxy. This makes req.ip the real visitor
// address (from X-Forwarded-For) instead of the proxy's, so the rate limiter
// counts each visitor separately.
app.set('trust proxy', 1);
app.use(helmet()); // sets safe HTTP response headers
app.use(express.json({ limit: '10kb' })); // reads JSON bodies; larger ones get 413
app.use(cookieParser()); // fills req.cookies from the Cookie header

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/stats', statsRouter);

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