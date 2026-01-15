import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client';
import sampleData from "../db/sample-data";

const connectionString = `${process.env.DATABASE_URL}`

async function main() {
    const adapter = new PrismaPg({ connectionString })
    const prisma = new PrismaClient({ adapter })
    await prisma.product.deleteMany();
    await prisma.product.createMany({
        data: sampleData.products,
    });
    console.log("Database has been seeded with sample data.");
}

main();