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

  // ── Variable context for interpolation ──
  const vars: Record<string, string> = {
    leadName: lead.name || 'você',
    productName: lead.product?.name || 'nosso produto',
    productPrice: lead.product?.price
      ? lead.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      : '19,90',
    checkoutUrl: lead.product?.checkoutUrl || 'https://pay.kiwify.com.br/VuuSifA',
  };

  // ── Try to use tenant script steps first ──
  const script = await prisma.script.findFirst({
    where: { tenantId },
    include: { steps: { orderBy: { order: 'asc' } } }
  });

  // ── State machine ──
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
