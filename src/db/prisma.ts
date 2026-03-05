import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

console.log("Prisma initializing with URL:", process.env.DATABASE_URL ? "FOUND" : "MISSING");

export default prisma;