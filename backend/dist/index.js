import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import catalogRouter from './routes/catalog.js';
import newsletterRouter from './routes/newsletter.js';
import storeRouter from './routes/store.js';
import adminRouter from './routes/admin.js';
import { ensureAdminUser } from './services/admin.js';
const app = express();
app.use(cors({
    origin: config.clientOrigin,
}));
app.use(express.json());
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
});
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/store', storeRouter);
app.use('/api/admin', adminRouter);
app.use(notFoundHandler);
app.use(errorHandler);
async function startServer() {
    await prisma.$connect();
    await ensureAdminUser();
    app.listen(config.port, () => {
        console.log(`MANTHAN API listening on http://localhost:${config.port}`);
    });
}
void startServer().catch((error) => {
    console.error('Failed to start backend.', error);
    process.exit(1);
});
