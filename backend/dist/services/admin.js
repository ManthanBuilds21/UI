import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
export async function ensureAdminUser() {
    if (!config.admin) {
        return;
    }
    await prisma.user.upsert({
        where: {
            email: config.admin.email,
        },
        update: {
            name: 'Admin',
            role: 'ADMIN',
            passwordHash: await bcrypt.hash(config.admin.password, 12),
        },
        create: {
            name: 'Admin',
            email: config.admin.email,
            role: 'ADMIN',
            passwordHash: await bcrypt.hash(config.admin.password, 12),
        },
    });
}
