"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getTenantId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error("Not authenticated");
  }
  return session.user.tenantId;
}

export async function getActiveScript() {
  try {
    const tenantId = await getTenantId();
    let script = await prisma.script.findFirst({
      where: { tenantId },
      include: { steps: { orderBy: { order: "asc" } } }
    });

    // Create default script if none exists
    if (!script) {
      script = await prisma.script.create({
        data: {
          tenantId,
          name: "Default Sales Funnel",
          steps: {
            create: [
              { order: 0, name: "Initial Opening", hook: "NEW_LEAD", type: "intro", messageText: "Talvez ninguém tenha te dito isso ainda...\nMas a mulher que você era antes de tudo que aconteceu ainda existe." },
              { order: 1, name: "Diagnosis Bridge", hook: "DIAGNOSIS", type: "bridge", messageText: "Criei um material curto e direto mostrando 5 passos para recuperar sua identidade e confiança." },
              { order: 2, name: "Direct Offer Drop", hook: "OFFER_SENT", type: "offer", messageText: "Hoje ele está disponível por R$19,90.\nSe quiser acessar agora:\n{checkoutUrl}" }
            ]
          }
        },
        include: { steps: { orderBy: { order: "asc" } } }
      });
    }

    return { script };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}

export async function updateScriptStep(stepId: string, messageText: string) {
  try {
    await getTenantId(); // Ensure auth
    await prisma.scriptStep.update({
      where: { id: stepId },
      data: { messageText }
    });
    revalidatePath("/dashboard/scripts");
    return { success: true };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}

export async function saveAllSteps(steps: { id: string, messageText: string }[]) {
  try {
    await getTenantId(); // Ensure auth
    for (const step of steps) {
      await prisma.scriptStep.update({
        where: { id: step.id },
        data: { messageText: step.messageText }
      });
    }
    revalidatePath("/dashboard/scripts");
    return { success: true };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}
