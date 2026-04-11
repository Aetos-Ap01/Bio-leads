"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error("Not authenticated");
  }
  return session;
}

export async function updateProfile(data: FormData) {
  const session = await getSession();
  const name = data.get("name") as string;
  const email = data.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  // Check if email is taken by another user
  const existingUser = await prisma.user.findFirst({
    where: { email, NOT: { id: session.user.id } },
  });

  if (existingUser) {
    return { error: "Email already in use by another account" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function changePassword(data: FormData) {
  const session = await getSession();
  const currentPassword = data.get("currentPassword") as string;
  const newPassword = data.get("newPassword") as string;
  const confirmPassword = data.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.password) {
    return { error: "User not found" };
  }

  const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrectPassword) {
    return { error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

export async function updateTenantName(data: FormData) {
  const session = await getSession();
  const tenantName = data.get("tenantName") as string;

  if (!tenantName) {
    return { error: "Workspace name is required" };
  }

  await prisma.tenant.update({
    where: { id: session.user.tenantId! },
    data: { name: tenantName },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateEvolutionConfig(data: FormData) {
  const session = await getSession();
  const apiUrl = data.get("apiUrl") as string;
  const globalKey = data.get("globalKey") as string;
  const phoneNumber = data.get("phoneNumber") as string;

  if (!apiUrl || !globalKey) {
    return { error: "API URL and Global Key are required" };
  }

  await prisma.evolutionConfig.upsert({
    where: { tenantId: session.user.tenantId! },
    update: { apiUrl, globalKey, phoneNumber: phoneNumber || null, updatedAt: new Date() },
    create: { tenantId: session.user.tenantId!, apiUrl, globalKey, phoneNumber: phoneNumber || null },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
