'use server'
import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import {prisma} from "@/db/prisma";

// const connectionString = `${process.env.DATABASE_URL}`
// const adapter = new PrismaPg({ connectionString })
// const prisma = new PrismaClient({ adapter })

export async function getLatestProducts() {
    const data = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: LATEST_PRODUCTS_LIMIT
    });
    return convertToPlainObject(data);
}

export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: { slug: slug },
    })
};
