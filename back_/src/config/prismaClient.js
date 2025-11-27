import { PrismaClient } from '@prisma/client'; 

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export const prisma = new PrismaClient();