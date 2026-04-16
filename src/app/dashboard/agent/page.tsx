import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AgentConfigClient from "@/components/AgentConfigClient";

export default async function AgentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) redirect("/login");

  const agentConfig = await prisma.agentConfig.findUnique({
    where: { tenantId: session.user.tenantId }
  });

  const DEFAULT_PROMPT = `Você é um assistente de vendas especializado.
Seu objetivo é qualificar leads e conduzir para a compra do produto: {productName} por R${"{productPrice}"}.

Instruções:
- Seja amigável, natural e persuasivo
- Responda de forma concisa (máximo 3 linhas por mensagem)
- Quando o lead demonstrar interesse, envie o link: {checkoutUrl}
- Se o lead tiver dúvidas técnicas ou problemas, diga que vai transferir para atendimento humano e termine com [TRANSFER_HUMAN]
- Chame o lead pelo nome: {leadName}`;

  return (
    <AgentConfigClient
      tenantId={session.user.tenantId}
      currentMode={agentConfig?.mode || 'BOT'}
      currentPrompt={agentConfig?.systemPrompt || DEFAULT_PROMPT}
    />
  );
}
