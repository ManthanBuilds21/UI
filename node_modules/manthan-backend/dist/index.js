import { config } from './config.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { ensureAdminUser } from './services/admin.js';
const app = createApp();
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
