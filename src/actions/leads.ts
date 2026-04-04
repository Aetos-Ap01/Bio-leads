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

export async function createLead(data: FormData) {
  const tenantId = await getTenantId();
  const name = (data.get("name") as string) || null;
  const phone = data.get("phone") as string;
  const status = (data.get("status") as string) || "NEW_LEAD";
  const productId = (data.get("productId") as string) || null;

  if (!phone) {
    return { error: "Phone is required" };
  }

  // Check for duplicate phone
  const existing = await prisma.lead.findFirst({
    where: { tenantId, phone },
  });

  if (existing) {
    return { error: "A lead with this phone number already exists" };
  }

  await prisma.lead.create({
    data: {
      tenantId,
      name,
      phone,
      status,
      productId: productId || null,
    },
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function updateLead(leadId: string, data: FormData) {
  const tenantId = await getTenantId();
  const name = (data.get("name") as string) || null;
  const phone = data.get("phone") as string;
  const status = (data.get("status") as string) || "NEW_LEAD";
  const productId = (data.get("productId") as string) || null;

  if (!phone) {
    return { error: "Phone is required" };
  }

  const existing = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
  });

  if (!existing) {
    return { error: "Lead not found" };
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      name,
      phone,
      status,
      productId: productId || null,
    },
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function deleteLead(leadId: string) {
  const tenantId = await getTenantId();

  const existing = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
  });

  if (!existing) {
    return { error: "Lead not found" };
  }

  await prisma.lead.delete({
    where: { id: leadId },
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function updateLeadStatus(leadId: string, status: string) {
  const tenantId = await getTenantId();

  const existing = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
  });

  if (!existing) {
    return { error: "Lead not found" };
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/conversations");
  return { success: true };
}

export async function toggleManualMode(leadId: string) {
  const tenantId = await getTenantId();

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
  });

  if (!lead) return { error: "Lead not found" };

  const nextStatus = lead.status === 'MANUAL' ? 'OFFER_SENT' : 'MANUAL';

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: nextStatus }
  });

  revalidatePath("/dashboard/conversations");
  return { success: true, status: nextStatus };
}
