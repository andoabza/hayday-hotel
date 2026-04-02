import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  seed: {
    path: 'prisma/seed.js',
  },
  // Database connection is now handled via the PrismaClient constructor
  
});