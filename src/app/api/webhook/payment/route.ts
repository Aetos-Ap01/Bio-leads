import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/chatbot';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON payload. Check your curl syntax.' }, { status: 400 });
  }

  try {
    const { event, transactionId, leadPhone, productId, amount, platform } = body;

    // Filter to approved payment events
    if (!leadPhone || (event !== 'payment_approved' && event !== 'order_approved')) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const lead = await prisma.lead.findFirst({ where: { phone: leadPhone } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    let finalProductId = productId || lead.productId;
    if (!finalProductId) {
      let defaultProduct = await prisma.product.findFirst({
        where: { tenantId: lead.tenantId }
      });
      if (!defaultProduct) {
        defaultProduct = await prisma.product.create({
          data: { 
            name: 'Automated Checkout Product', 
            price: Number(amount) || 0, 
            platform: platform || 'internal',
            tenantId: lead.tenantId
          },
        });
      }
      finalProductId = defaultProduct.id;
    }

    // Register real CheckoutEvent
    await prisma.checkoutEvent.create({
      data: {
        tenantId: lead.tenantId,
        leadId: lead.id,
        productId: finalProductId, 
        transactionId: transactionId || `txn_${Date.now()}`,
        platform: platform || 'internal',
        status: 'completed',
        amount: Number(amount) || 0,
      }
    });

    // Advance Lead to PURCHASE_COMPLETED
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'PURCHASE_COMPLETED', productId: finalProductId }
    });

    // Post-purchase automated thanking message!
    await sendBotMessage(lead.id, "Pagamento confirmado! 🎉 Muito obrigado pela confiança. Seu acesso detalhado chegará no seu e-mail em instantes.");

    return NextResponse.json({ success: true, message: 'Purchase registered and processed successfully' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
