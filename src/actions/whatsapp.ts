"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Configuration is now handled inside functions to support multi-tenant settings and runtime environment variables.

export async function getWhatsAppStatus() {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return { status: 'NOT_AUTHENTICATED' };

  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.evolutionConfig.findUnique({
    where: { tenantId }
  });

  const url = config?.apiUrl || process.env.EVOLUTION_API_URL;
  const key = config?.globalKey || process.env.EVOLUTION_GLOBAL_KEY;

  if (!url || !key) {
    return { status: 'NOT_CONFIGURED' };
  }

  try {
    const response = await fetch(`${url}/instance/connectionState/${tenantId}`, {
      headers: { "apikey": key }
    });
    if (!response.ok) return { status: 'DISCONNECTED' };
    const data = await response.json();
    return { status: data.instance?.state || 'DISCONNECTED' };
  } catch {
    return { status: 'OFFLINE' };
  }
}

export async function connectWhatsApp() {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return { error: "Not authenticated" };

  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.evolutionConfig.findUnique({
    where: { tenantId }
  });

  const url = config?.apiUrl || process.env.EVOLUTION_API_URL;
  const key = config?.globalKey || process.env.EVOLUTION_GLOBAL_KEY;

  if (!url || !key) {
    return { error: "Evolution API not configured. Please check your settings." };
  }

  try {
    // 1. Try to create instance (it might already exist, which is fine)
    const APP_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    await fetch(`${url}/instance/create`, {
      method: 'POST',
      headers: { 
        "apikey": key, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        instanceName: tenantId,
        token: tenantId,
        qrcode: true
      })
    });

    // 2. Set Webhook for this instance
    await fetch(`${url}/webhook/set/${tenantId}`, {
      method: 'POST',
      headers: { 
        "apikey": key, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        enabled: true,
        url: `${APP_URL}/api/webhook/whatsapp/${tenantId}`,
        webhook_by_events: false,
        events: ["MESSAGES_UPSERT"]
      })
    });

    // 3. Get QR Code
    const response = await fetch(`${url}/instance/connect/${tenantId}`, {
      headers: { "apikey": key }
    });
    
    const data = await response.json();
    
    if (data.base64) {
      return { qrcode: data.base64 };
    }
    
    if (data.instance?.state === 'open') {
      return { status: 'CONNECTED' };
    }

    return { error: "Could not generate QR code. Is the instance already connected?" };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: "Connection to Evolution API failed: " + errorMessage };
  }
}

export async function connectWhatsAppByPhone(phoneNumber: string) {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return { error: "Not authenticated" };

  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.evolutionConfig.findUnique({
    where: { tenantId }
  });

  const url = config?.apiUrl || process.env.EVOLUTION_API_URL;
  const key = config?.globalKey || process.env.EVOLUTION_GLOBAL_KEY;

  if (!url || !key) {
    return { error: "Evolution API not configured. Please check your settings." };
  }

  if (!phoneNumber) {
    return { error: "Phone number is required for phone connection method." };
  }

  try {
    // 1. Try to create instance (it might already exist, which is fine)
    const APP_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    await fetch(`${url}/instance/create`, {
      method: 'POST',
      headers: { 
        "apikey": key, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        instanceName: tenantId,
        token: tenantId,
        qrcode: false,
        number: phoneNumber
      })
    });

    // 2. Set Webhook for this instance
    await fetch(`${url}/webhook/set/${tenantId}`, {
      method: 'POST',
      headers: { 
        "apikey": key, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        enabled: true,
        url: `${APP_URL}/api/webhook/whatsapp/${tenantId}`,
        webhook_by_events: false,
        events: ["MESSAGES_UPSERT"]
      })
    });

    // 3. Try to connect with phone number
    const response = await fetch(`${url}/instance/connect/${tenantId}`, {
      method: 'POST',
      headers: { 
        "apikey": key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        number: phoneNumber
      })
    });
    
    const data = await response.json();
    
    if (data.instance?.state === 'open') {
      return { status: 'CONNECTED' };
    }

    return { error: "Could not connect with phone number. Please check the number format and try again." };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: "Connection to Evolution API failed: " + errorMessage };
  }
}

export async function disconnectWhatsApp() {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return { error: "Not authenticated" };

  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.evolutionConfig.findUnique({
    where: { tenantId }
  });

  const url = config?.apiUrl || process.env.EVOLUTION_API_URL;
  const key = config?.globalKey || process.env.EVOLUTION_GLOBAL_KEY;

  if (!url || !key) return { error: "Evolution API not configured" };

  try {
    await fetch(`${url}/instance/logout/${tenantId}`, {
      method: 'DELETE',
      headers: { "apikey": key }
    });
    return { success: true };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}

export async function sendWhatsAppMessage(phone: string, text: string, leadId: string) {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return { error: "Not authenticated" };

  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.evolutionConfig.findUnique({
    where: { tenantId }
  });

  const url = config?.apiUrl || process.env.EVOLUTION_API_URL;
  const key = config?.globalKey || process.env.EVOLUTION_GLOBAL_KEY;

  if (!url || !key) {
    return { error: "Evolution API not configured" };
  }

  try {
    // 1. Send to Evolution API
    const response = await fetch(`${url}/message/sendText/${tenantId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key
      },
      body: JSON.stringify({
        number: phone,
        text: text
      })
    });

    if (!response.ok) {
      const respText = await response.text();
      return { error: `API Error: ${respText}` };
    }

    // 2. Save to our Database
    const { prisma } = await import("@/lib/prisma");
    await prisma.message.create({
      data: {
        leadId,
        content: text,
        role: 'system' // System/Bot role for panel sent messages
      }
    });

    revalidatePath("/dashboard/conversations");
    return { success: true };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}

export async function sendCheckoutMessage(leadId: string) {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return { error: "Not authenticated" };

  try {
    const { prisma } = await import("@/lib/prisma");
    const lead = await prisma.lead.findUnique({
      where: { id: leadId, tenantId },
      include: { product: true }
    });

    if (!lead || !lead.product) return { error: "Lead or product not found" };

    const checkoutUrl = lead.product.checkoutUrl;
    const priceStr = lead.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const message = `Aqui está o link para finalizar sua compra do ${lead.product.name} (R$ ${priceStr}):\n\n${checkoutUrl}`;

    return await sendWhatsAppMessage(lead.phone, message, lead.id);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return { error: errorMessage };
  }
}
