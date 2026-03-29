import { prisma } from './prisma';

export async function processIncomingMessage(tenantId: string, phone: string, text: string) {
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
        status: 'NEW_LEAD',
        productId: defaultProduct?.id || null
      },
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

    case 'OFFER_SENT':
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'CHECKOUT_CLICKED' } });
      await sendBotMessage(tenantId, lead.id, phone, "Você conseguiu acessar a página? Se tiver qualquer dificuldade com o pagamento ou alguma dúvida, estou aqui para ajudar.");
      break;

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
  // 1. Log the message contextually in our local DB
  await prisma.message.create({
    data: {
      leadId,
      content: text,
      role: 'system',
    },
  });

  console.log(`[BOT -> ${phone} (Tenant: ${tenantId})]: ${text}`);

  // 2. Perform OUTBOUND External API Request (Generic WhatsApp Implementation)
  /* 
    TODO: Insert exact Provider logic (e.g. Evolution API, MegaAPI) here!
    Example (Evolution API v1/v2 format):
    
    const EVOLUTION_URL = process.env.EVOLUTION_API_URL || "http://sua-evolution.com";
    const EVOLUTION_KEY = process.env.EVOLUTION_GLOBAL_KEY || "YOUR_KEY";
    
    // Na arquitetura SaaS com Evolution, o tenantId muitas vezes
    // é diretamente o NOME DA INSTÂNCIA do cliente conectada na API.
    const instanceName = tenantId; 
    
    try {
      await fetch(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": EVOLUTION_KEY
        },
        body: JSON.stringify({
          number: phone,      // Deve ser '5511999999999' sem '+'
          text: text
        })
      });
    } catch (e) {
      console.error("External Sending Error:", e)
    }
  */
}
