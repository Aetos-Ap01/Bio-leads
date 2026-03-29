import { NextResponse } from 'next/server';
import { processIncomingMessage } from '@/lib/chatbot';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    
    // Parse the payload. Below is a generic fallback that assumes 
    // `{ phone: "...", text: "..."}` at the top level.
    // Real providers like Evolution API will nest this deeply (e.g. data.message.conversation)
    const body = await request.json();
    
    // Fallback extraction
    const phone = body.phone || body?.data?.key?.remoteJid?.replace('@s.whatsapp.net', '') || '';
    const text = body.text || body?.data?.message?.conversation || body?.data?.message?.extendedTextMessage?.text || '';

    if (!phone || !text) {
      return NextResponse.json({ error: 'Phone and text are required in the payload' }, { status: 400 });
    }

    // Process using the generic Multi-tenant engine
    await processIncomingMessage(tenantId, phone, text);

    return NextResponse.json({ success: true, message: 'Message processed and funnel triggered' });
  } catch (error) {
    console.error(`[Webhook Error - Tenant ${"fallback"}]:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
