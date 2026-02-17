"use server";

import { CartItem } from "@/types";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { success, z } from "zod";
import {
  convertToPlainObject,
  formatError,
  roundToTwoDecimalPlaces,
} from "../utils";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = roundToTwoDecimalPlaces(
    items.reduce((acc, item) => {
      return acc + Number(item.price) * item.qty;
    }, 0),
  );
  const shippingPrice = roundToTwoDecimalPlaces(itemsPrice > 100 ? 0 : 10);
  const taxPrice = roundToTwoDecimalPlaces(0.15 * itemsPrice);
  const totalPrice = roundToTwoDecimalPlaces(
    itemsPrice + shippingPrice + taxPrice,
  );
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("Cart session not found");
    }
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    if (!cart) {
      const newCart = insertCartSchema.parse({
        sessionCartId: sessionCartId,
        userId: userId,
        items: [item],
        ...calcPrice([item]),
      });

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart successfully`,
      };
    } else {
      const existingItem = (cart.items as CartItem[]).find(
        (i) => i.productId === item.productId,
      );
      if (existingItem) {
        if (product.stock < existingItem.qty + 1) {
          throw new Error(`Only ${product.stock} items in stock`);
        }
        existingItem.qty++;
      } else {
        if (product.stock < 1) throw new Error(`Not enough stock`);
        cart.items.push(item);
      }
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as CartItem[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} ${existingItem ? "updated in" : "added to"} cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // Check for cart cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("Cart session not found");
    }

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    const cart = await getMyCart();
    if (!cart) {
      throw new Error("Cart not found");
    }

    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId,
    );
    if (!exist) {
      throw new Error("Item not found in cart");
    }

    if (exist.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId,
      );
    } else {
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exist.qty - 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as CartItem[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
