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
    
    // 1. Ignore events that are not message upserts or are sent by the bot itself
    if (body.event !== 'messages.upsert' || body.data?.key?.fromMe) {
      return NextResponse.json({ ignored: true });
    }

    // 2. Extract Data (Evolution API pattern)
    const phone = body.data?.key?.remoteJid?.replace('@s.whatsapp.net', '') || '';
    const pushName = body.data?.pushName || '';
    
    // Support for multiple message types (text, image caption, etc.)
    const text = body.data?.message?.conversation || 
                 body.data?.message?.extendedTextMessage?.text || 
                 body.data?.message?.imageMessage?.caption || 
                 '';

    if (!phone || !text) {
      return NextResponse.json({ error: 'Valid phone and text are required' }, { status: 400 });
    }

    // 3. Process using the Multi-tenant engine
    await processIncomingMessage(tenantId, phone, text, pushName);

    return NextResponse.json({ success: true, message: 'Message processed and funnel triggered' });
  } catch (error) {
    console.error(`[Webhook Error - Tenant ${"fallback"}]:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
