import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/chatbot';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        status: {
          notIn: ['PURCHASE_COMPLETED', 'MANUAL'],
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    let sentCount = 0;

    for (const lead of leads) {
      if (lead.messages.length > 0) {
        const lastMsg = lead.messages[0];
        const diffHours = (Date.now() - lastMsg.createdAt.getTime()) / (1000 * 60 * 60);

        if (diffHours >= 2 && diffHours < 3 && lead.status === 'OFFER_SENT') {
          await sendBotMessage(lead.tenantId, lead.id, lead.phone, "Oi! Vi que você ainda não finalizou sua inscrição. Ficou com alguma dúvida sobre o produto ou a forma de pagamento?");
          sentCount++;
        } 
        else if (diffHours >= 24 && diffHours < 25 && lead.status === 'OFFER_SENT') {
          await sendBotMessage(lead.tenantId, lead.id, lead.phone, "Passando para avisar que as vagas com esse valor estão quase no fim. Ainda dá tempo de garantir a sua! Qualquer dúvida estou aqui na escuta.");
          sentCount++;
        }
      }
    }

    return NextResponse.json({ success: true, commercialFollowUpsSent: sentCount });
  } catch (error) {
    console.error('Follow-up error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
