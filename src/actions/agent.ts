"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface UpdateAgentConfigInput {
  tenantId: string;
  mode: string;
  systemPrompt?: string;
}

export async function updateAgentConfig({ tenantId, mode, systemPrompt }: UpdateAgentConfigInput) {
  try {
    await prisma.agentConfig.upsert({
      where: { tenantId },
      update: { mode, systemPrompt: systemPrompt || null, updatedAt: new Date() },
      create: { tenantId, mode, systemPrompt: systemPrompt || null }
    });
    revalidatePath("/dashboard/agent");
    return { success: true };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}
