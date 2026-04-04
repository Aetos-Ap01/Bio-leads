# 📊 Relatório Geral: Projeto Bio Leads

Este documento detalha o estado técnico e funcional do desenvolvimento do SaaS **Bio Leads**, focado em automação de vendas via WhatsApp.

---

## ✅ Status Atual: ~90% Concluído

| Módulo | Progresso | Status |
| --- | --- | --- |
| **Arquitetura (DB/Multi-tenant)** | 100% | ✅ Concluído |
| **Interface (UI/UX Premium)** | 100% | ✅ Concluído |
| **Integração WhatsApp (Evolution)** | 100% | ✅ Concluído |
| **Chat Manual + Toggle Bot/Manual** | 100% | ✅ Concluído |
| **Funil de Automação (chatbot.ts)** | 100% | ✅ Concluído |
| **Follow-up Cron (2h/24h/48h/72h)** | 100% | ✅ Concluído |
| **Webhook de Pagamento** | 100% | ✅ Concluído |
| **Landing Page + Login + Register** | 100% | ✅ Concluído |
| **Integração Pagamentos (Teste Real)** | 60% | 💳 Aguardando Configuração |

---

## 1. 🔧 O que você (humano) deve fazer para colocar 100% no ar

### Vercel — Variáveis de Ambiente (Settings > Environment Variables)
Adicionar todas as variáveis do `.env.example`:
- `DATABASE_URL` — string de conexão Supabase (produção)
- `DIRECT_URL` — mesma string Supabase
- `NEXTAUTH_SECRET` — string aleatória segura (ex: gerada em https://generate-secret.vercel.app)
- `NEXTAUTH_URL` — URL de produção ex: `https://bio-leads-three.vercel.app`
- `EVOLUTION_API_URL` — **HTTPS** da sua Evolution API (não HTTP)
- `EVOLUTION_GLOBAL_KEY` — chave global da Evolution
- `CRON_SECRET` — string aleatória para proteger o endpoint de follow-up

### Evolution API no VPS
- Colocar a API atrás de HTTPS/SSL (ex: Nginx + Let's Encrypt ou Cloudflare Tunnel)
- A URL usada no Vercel e nos webhooks precisa ser HTTPS obrigatoriamente

### Kiwify / Stripe — Webhook de Pagamento
- Criar produto na plataforma de pagamento
- Configurar a URL de webhook: `https://bio-leads-three.vercel.app/api/webhook/payment`
- Eventos esperados: `payment_approved` ou `order_approved`
- O payload deve conter: `event`, `leadPhone`, `amount`, `platform`, `transactionId`

---

## 2. 📝 Copy das mensagens automáticas
As mensagens do bot estão em `src/lib/chatbot.ts`. Ajuste os textos conforme sua estratégia de vendas.

---

## 3. 🔗 Após infraestrutura configurada
- Testar envio real de mensagens via QR Code na página Settings
- Validar que webhook da Evolution chega em `/api/webhook/whatsapp/[tenantId]`
- Testar compra real e verificar se o evento aparece em Payments
