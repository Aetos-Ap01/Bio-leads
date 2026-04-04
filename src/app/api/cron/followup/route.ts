import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/chatbot';

export async function GET(request: Request) {
  // Protect cron route: only Vercel Cron or requests with valid secret can trigger
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const sentByTenant: Record<string, number> = {};

    for (const lead of leads) {
      if (lead.messages.length > 0) {
        const lastMsg = lead.messages[0];
        const diffHours = (Date.now() - lastMsg.createdAt.getTime()) / (1000 * 60 * 60);

        const pushStats = async (message: string) => {
          await sendBotMessage(lead.tenantId, lead.id, lead.phone, message);
          sentCount++;
          sentByTenant[lead.tenantId] = (sentByTenant[lead.tenantId] || 0) + 1;
        };

        if (lead.status === 'OFFER_SENT') {
          if (diffHours >= 2 && diffHours < 3) {
            await pushStats("Oi! Vi que você ainda não finalizou sua inscrição. Ficou com alguma dúvida sobre o produto ou a forma de pagamento?");
          } else if (diffHours >= 24 && diffHours < 25) {
            await pushStats("Passando para avisar que as vagas com esse valor estão quase no fim. Ainda dá tempo de garantir a sua! Qualquer dúvida estou aqui na escuta.");
          } else if (diffHours >= 48 && diffHours < 49) {
            await pushStats("Segunda chance não dura para sempre: a oferta especial encerra em breve. Quer que eu te ajude com o checkout agora?");
          } else if (diffHours >= 72 && diffHours < 73) {
            await pushStats("Ultimo lembrete: se quiser, posso colocar você em contato com um consultor para facilitar o fechamento.");
            await prisma.lead.update({ where: { id: lead.id }, data: { status: 'MANUAL' } });
          }
        }
      }
    }

    for (const [tenantId, tenantCount] of Object.entries(sentByTenant)) {
      await prisma.followupStat.create({
        data: {
          tenantId,
          sentCount: tenantCount,
        },
      });
    }

    return NextResponse.json({ success: true, commercialFollowUpsSent: sentCount });
  } catch (error) {
    console.error('Follow-up error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
