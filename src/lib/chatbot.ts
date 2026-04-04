import { prisma } from './prisma';

export async function processIncomingMessage(tenantId: string, phone: string, text: string, pushName?: string) {
  let lead = await prisma.lead.findUnique({
    where: { 
      tenantId_phone: {
        tenantId,
        phone
      }
    },
    include: { product: true }
  });

  if (!lead) {
    const defaultProduct = await prisma.product.findFirst({
      where: { tenantId }
    });
    
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
  } else if (!lead.name && pushName) {
    lead = await prisma.lead.update({
      where: { id: lead.id },
      data: { name: pushName },
      include: { product: true }
    });
  }

  // Store incoming message
  await prisma.message.create({
    data: { leadId: lead.id, content: text, role: 'user' },
  });

  // Funnel State Machine
  switch (lead.status) {
    case 'NEW_LEAD':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'DIAGNOSIS' } });
      await sendBotMessage(tenantId, lead.id, phone, "Talvez ninguém tenha te dito isso ainda...\nMas a mulher que você era antes de tudo que aconteceu ainda existe.");
      await new Promise(r => setTimeout(r, 1500));
      await sendBotMessage(tenantId, lead.id, phone, "Criei um material curto e direto mostrando 5 passos para recuperar sua identidade e confiança.");
      await new Promise(r => setTimeout(r, 1500));
      
      const priceStr = lead.product?.price ? lead.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "19,90";
      const checkoutUrl = lead.product?.checkoutUrl || "https://pay.kiwify.com.br/VuuSifA";
      
      await sendBotMessage(tenantId, lead.id, phone, `Hoje ele está disponível por R$${priceStr}.\nSe quiser acessar agora:\n${checkoutUrl}`);
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'OFFER_SENT' } });
      break;

    case 'DIAGNOSIS':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'OFFER_SENT' } });
      break;

    case 'OFFER_SENT': {
      const userWantsHuman = /\b(quero|ajuda|suporte|problema|dúvida|não consigo|cartão|boleto|compra)\b/i.test(text);
      if (userWantsHuman) {
        await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
        await sendBotMessage(tenantId, lead.id, phone, "Perfeito, já encaminhei seu caso para atendimento humano. Em breve nosso time conversa com você.");
      } else {
        await prisma.lead.update({ where: { id: lead.id }, data: { status: 'CHECKOUT_CLICKED' } });
        await sendBotMessage(tenantId, lead.id, phone, "Você conseguiu acessar a página? Se tiver qualquer dificuldade com o pagamento ou alguma dúvida, estou aqui para ajudar.");
      }
      break;
    }

    case 'CHECKOUT_CLICKED':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
      await sendBotMessage(tenantId, lead.id, phone, "Vou transferir nosso bate-papo para um consultor que vai te dar uma atenção humanizada agora. Um instante, por favor.");
      break;

    case 'PURCHASE_COMPLETED':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
      await sendBotMessage(tenantId, lead.id, phone, "Oi! Consta aqui que o seu acesso já foi liberado. Caso precise de suporte mais avançado, vou te transferir agora para o atendimento humano!");
      break;

    case 'MANUAL':
      console.log(`Lead ${lead.id} is in MANUAL mode. Bot ignored message.`);
      break;
      
    default:
      console.log(`Unknown status ${lead.status}`);
      break;
  }
}

export async function sendBotMessage(tenantId: string, leadId: string, phone: string, text: string) {
  // 1. Store message in database
  await prisma.message.create({
    data: {
      leadId,
      content: text,
      role: 'system',
    },
  });

  console.log(`[BOT -> ${phone} (Tenant: ${tenantId})]: ${text}`);

  // 2. Get Evolution config for tenant
  const evolutionConfig = await prisma.evolutionConfig.findUnique({
    where: { tenantId },
  });

  if (!evolutionConfig) {
    console.warn(`[BOT] No Evolution config found for tenant ${tenantId}. Message saved to DB only.`);
    return;
  }

  // 3. Send via Evolution API (real WhatsApp delivery)
  try {
    const response = await fetch(`${evolutionConfig.apiUrl}/message/sendText/${tenantId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionConfig.globalKey
      },
      body: JSON.stringify({
        number: phone,
        text: text
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[BOT] Evolution API error (${response.status}):`, errorBody);
    } else {
      console.log(`[BOT] Message delivered to ${phone} via Evolution API`);
    }
  } catch (e) {
    console.error("[BOT] Evolution API request failed:", e);
  }
}
