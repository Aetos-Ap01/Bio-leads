"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getTenantId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error("Not authenticated");
  }
  return session.user.tenantId;
}

export async function createProduct(data: FormData) {
  const tenantId = await getTenantId();
  const name = data.get("name") as string;
  const price = parseFloat(data.get("price") as string);
  const description = (data.get("description") as string) || null;
  const checkoutUrl = (data.get("checkoutUrl") as string) || null;
  const platform = (data.get("platform") as string) || null;
  const language = (data.get("language") as string) || "PT-BR";

  if (!name || isNaN(price)) {
    return { error: "Name and price are required" };
  }

  await prisma.product.create({
    data: {
      tenantId,
      name,
      price,
      description,
      checkoutUrl,
      platform,
      language,
    },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateProduct(productId: string, data: FormData) {
  const tenantId = await getTenantId();
  const name = data.get("name") as string;
  const price = parseFloat(data.get("price") as string);
  const description = (data.get("description") as string) || null;
  const checkoutUrl = (data.get("checkoutUrl") as string) || null;
  const platform = (data.get("platform") as string) || null;
  const language = (data.get("language") as string) || "PT-BR";

  if (!name || isNaN(price)) {
    return { error: "Name and price are required" };
  }

  // Verify product belongs to tenant
  const existing = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });

  if (!existing) {
    return { error: "Product not found" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      price,
      description,
      checkoutUrl,
      platform,
      language,
    },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const tenantId = await getTenantId();

  const existing = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });

  if (!existing) {
    return { error: "Product not found" };
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}
