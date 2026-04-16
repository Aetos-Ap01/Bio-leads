import { prisma } from './prisma';

// ─── Variable interpolation ───────────────────────────────────────
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

// ─── Structured logger ───────────────────────────────────────────
function log(level: 'INFO' | 'WARN' | 'ERROR', event: string, ctx: Record<string, unknown>) {
  const entry = { level, event, ...ctx, ts: new Date().toISOString() };
  if (level === 'ERROR') console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Claude AI Agent ─────────────────────────────────────────────
async function callClaudeAgent(
  systemPrompt: string,
  history: { role: string; content: string }[],
  userMessage: string,
  vars: Record<string, string>
): Promise<string> {
  const interpolatedSystem = interpolate(systemPrompt, vars);

  const messages = [
    ...history.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620', // Updated to a stable version
        max_tokens: 500,
        system: interpolatedSystem,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      log('ERROR', 'claude.api_error', { status: response.status, body: err });
      return 'Desculpe, estou com uma dificuldade técnica no momento. Um atendente humano vai te ajudar em breve.';
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Não consegui processar sua mensagem.';
  } catch (e) {
    log('ERROR', 'claude.request_failed', { error: String(e) });
    return 'Desculpe, estou com uma dificuldade técnica. Um atendente humano vai te ajudar em breve.';
  }
}

// ─── Default system prompt ────────────────────────────────────────
const DEFAULT_SYSTEM_PROMPT = `Você é um assistente de vendas especializado da Bio Leads.
Seu objetivo é qualificar leads e conduzir para a compra do produto: {productName} por R${'{productPrice}'}.

Instruções:
- Seja amigável, natural e persuasivo
- Responda de forma concisa (máximo 3 linhas por mensagem)
- Quando o lead demonstrar interesse, envie o link: {checkoutUrl}
- Se o lead tiver dúvidas técnicas ou problemas com pagamento, diga que vai transferir para atendimento humano e termine com [TRANSFER_HUMAN]
- Se a compra for confirmada, comemore e termine com [PURCHASE_DONE]
- Chame o lead pelo nome quando souber: {leadName}
- Nunca invente informações sobre o produto`;

// ─── Main message processor ──────────────────────────────────────
export async function processIncomingMessage(
  tenantId: string,
  phone: string,
  text: string,
  pushName?: string
) {
  let lead = await prisma.lead.findUnique({
    where: { tenantId_phone: { tenantId, phone } },
    include: { product: true }
  });

  if (!lead) {
    const defaultProduct = await prisma.product.findFirst({ where: { tenantId } });
    lead = await prisma.lead.create({
      data: {
        tenantId,
        phone,
        name: pushName || null,
        status: 'NEW_LEAD',
        productId: defaultProduct?.id || null
      },
      include: { product: true }
    });
    log('INFO', 'lead.created', { tenantId, leadId: lead.id, phone });
  } else if (!lead.name && pushName) {
    lead = await prisma.lead.update({
      where: { id: lead.id },
      data: { name: pushName },
      include: { product: true }
    });
  }

  await prisma.message.create({
    data: { leadId: lead.id, content: text, role: 'user' }
  });

  log('INFO', 'message.received', { tenantId, leadId: lead.id, phone, status: lead.status });

  if (lead.status === 'MANUAL') {
    log('INFO', 'message.manual_ignored', { tenantId, leadId: lead.id, phone });
    return;
  }

  // ── Variable context for interpolation ──
  const vars: Record<string, string> = {
    leadName: lead.name || 'você',
    productName: lead.product?.name || 'nosso produto',
    productPrice: lead.product?.price
      ? lead.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      : '19,90',
    checkoutUrl: lead.product?.checkoutUrl || 'https://pay.kiwify.com.br/VuuSifA',
  };

  // ── Check agent mode ──
  const agentConfig = await prisma.agentConfig.findUnique({ where: { tenantId } });
  const agentMode = agentConfig?.mode || 'BOT';

  if (agentMode === 'CLAUDE') {
    // ── Claude AI Mode ──
    const messageHistory = await prisma.message.findMany({
      where: { leadId: lead.id },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    const systemPrompt = agentConfig?.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const reply = await callClaudeAgent(systemPrompt, messageHistory, text, vars);

    if (reply.includes('[TRANSFER_HUMAN]')) {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
      const cleanReply = reply.replace('[TRANSFER_HUMAN]', '').trim();
      await sendBotMessage(tenantId, lead.id, phone, cleanReply);
    } else if (reply.includes('[PURCHASE_DONE]')) {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'PURCHASE_COMPLETED' } });
      const cleanReply = reply.replace('[PURCHASE_DONE]', '').trim();
      await sendBotMessage(tenantId, lead.id, phone, cleanReply);
    } else {
      await sendBotMessage(tenantId, lead.id, phone, reply);
    }
    return;
  }

  // ── BOT Mode (state machine) ──
  const script = await prisma.script.findFirst({
    where: { tenantId },
    include: { steps: { orderBy: { order: 'asc' } } }
  });

  switch (lead.status) {
    case 'NEW_LEAD': {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'DIAGNOSIS' } });

      const step0 = script?.steps.find(s => s.hook === 'NEW_LEAD');
      const step1 = script?.steps.find(s => s.hook === 'DIAGNOSIS');
      const step2 = script?.steps.find(s => s.hook === 'OFFER_SENT');

      const msg0 = step0?.messageText ||
        "Talvez ninguém tenha te dito isso ainda...\nMas a mulher que você era antes de tudo que aconteceu ainda existe.";
      const msg1 = step1?.messageText ||
        "Criei um material curto e direto mostrando 5 passos para recuperar sua identidade e confiança.";
      const msg2 = step2?.messageText ||
        "Hoje ele está disponível por R${productPrice}.\nSe quiser acessar agora:\n{checkoutUrl}";

      await sendBotMessage(tenantId, lead.id, phone, interpolate(msg0, vars));
      await new Promise(r => setTimeout(r, 1500));
      await sendBotMessage(tenantId, lead.id, phone, interpolate(msg1, vars));
      await new Promise(r => setTimeout(r, 1500));
      await sendBotMessage(tenantId, lead.id, phone, interpolate(msg2, vars));
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'OFFER_SENT' } });
      break;
    }

    case 'DIAGNOSIS':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'OFFER_SENT' } });
      break;

    case 'OFFER_SENT': {
      const userWantsHuman = /\b(quero|ajuda|suporte|problema|dúvida|não consigo|cartão|boleto|compra)\b/i.test(text);
      if (userWantsHuman) {
        await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
        await sendBotMessage(tenantId, lead.id, phone,
          "Perfeito, já encaminhei seu caso para atendimento humano. Em breve nosso time conversa com você.");
      } else {
        await prisma.lead.update({ where: { id: lead.id }, data: { status: 'CHECKOUT_CLICKED' } });
        await sendBotMessage(tenantId, lead.id, phone,
          "Você conseguiu acessar a página? Se tiver qualquer dificuldade com o pagamento ou alguma dúvida, estou aqui para ajudar.");
      }
      break;
    }

    case 'CHECKOUT_CLICKED':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
      await sendBotMessage(tenantId, lead.id, phone,
        "Vou transferir nosso bate-papo para um consultor que vai te dar uma atenção humanizada agora. Um instante, por favor.");
      break;

    case 'PURCHASE_COMPLETED':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
      await sendBotMessage(tenantId, lead.id, phone,
        "Oi! Consta aqui que o seu acesso já foi liberado. Caso precise de suporte mais avançado, vou te transferir agora para o atendimento humano!");
      break;

    case 'MANUAL':
      log('INFO', 'message.manual_ignored', { tenantId, leadId: lead.id, phone });
      break;

    default:
      log('WARN', 'message.unknown_status', { tenantId, leadId: lead.id, status: lead.status });
      break;
  }
}

// ─── Send bot message ─────────────────────────────────────────────
export async function sendBotMessage(
  tenantId: string,
  leadId: string,
  phone: string,
  text: string
) {
  await prisma.message.create({
    data: { leadId, content: text, role: 'system' }
  });

  const evolutionConfig = await prisma.evolutionConfig.findUnique({ where: { tenantId } });

  if (!evolutionConfig) {
    log('WARN', 'whatsapp.no_config', { tenantId, leadId, phone });
    return;
  }

  try {
    const response = await fetch(`${evolutionConfig.apiUrl}/message/sendText/${tenantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionConfig.globalKey
      },
      body: JSON.stringify({ number: phone, text })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log('ERROR', 'whatsapp.send_failed', { tenantId, leadId, phone, status: response.status, body: errorBody });
    } else {
      log('INFO', 'whatsapp.sent', { tenantId, leadId, phone });
    }
  } catch (e) {
    log('ERROR', 'whatsapp.request_failed', { tenantId, leadId, phone, error: String(e) });
  }
}
