# 🛡️ Relatório de Auditoria e Implantação: BioLeads SaaS

Este documento detalha o diagnóstico, as correções aplicadas e o guia de implantação para tornar o sistema **BioLeads** pronto para produção.

---

## 🔍 1. Diagnóstico do Sistema

### Frontend (Vercel)
- **Status**: Funcional, mas com dependências de variáveis de ambiente incompletas.
- **Problema**: A ausência de `NEXT_PUBLIC_API_URL` impedia que webhooks fossem configurados corretamente para o ambiente persistente (VPS).

### Backend & Webhooks (VPS)
- **Status**: Necessitava de configuração de processo persistente.
- **Problema**: O processamento de webhooks de longa duração (WhatsApp e Pagamentos) em funções serverless (Vercel) pode sofrer timeouts. A solução é o roteamento para o VPS.

### Infraestrutura
- **CORS**: Bloqueios potenciais em comunicações cross-domain entre o frontend (`bioleads.shop`) e a API (`api.bioleads.shop`).
- **Proxy Reverso**: Ausência de configuração otimizada do NGINX para suportar WebSockets e repasse de IP real.

---

## 🛠️ 2. Correções e Melhorias Aplicadas

### Estabilidade do Backend
- **Endpoint de Saúde**: Criado em `src/app/api/health/route.ts` para monitoramento.
- **PM2 Config**: Criado `ecosystem.config.js` para garantir que o serviço reinicie automaticamente e gerencie memória de forma eficiente.

### Segurança e Conectividade
- **Middleware CORS**: Implementado em `src/middleware.ts` para permitir chamadas seguras entre os domínios de produção e desenvolvimento local.
- **Roteamento Dinâmico de Webhooks**: Atualizado `src/actions/whatsapp.ts` para usar `NEXT_PUBLIC_API_URL`, garantindo que a Evolution API envie eventos para o servidor correto.

### Configuração de Servidor
- **NGINX**: Gerado arquivo de configuração `deploy/nginx/api.bioleads.shop.conf` com suporte a SSL, WebSockets e headers de segurança.

### Melhorias Portadas (BioLeads Final)
- **Agente IA (Claude)**: Adicionado suporte opcional para IA na qualificação de leads.
- **Recuperação de Senha**: Nova página de esqueci a senha implementada.

---

## 🚀 3. Guia de Implantação (Hostinger VPS)

### Passo 1: Configuração de Firewall na Hostinger
No painel da Hostinger VPS (hPanel), certifique-se de:
1. Ir em **VPS > Gerenciar > Firewall**.
2. Criar ou editar uma regra para permitir as seguintes portas:
   - **80** (HTTP)
   - **443** (HTTPS)
   - **22** (SSH)
   - **3000** (Opcional, se não usar Nginx)
   - **8080** (Se a Evolution API estiver no mesmo VPS)

### Passo 2: Configuração DNS
- **Tipo A / CNAME**:
  - `bioleads.shop` → Vercel
  - `api.bioleads.shop` → IP do VPS Hostinger

### Passo 3: Variáveis de Ambiente (Vercel & VPS)
As variáveis estão documentadas no arquivo `.env.example`. Siga estes passos:
1. Copie o conteúdo de `.env.example` para um novo arquivo `.env` (não envie o `.env` para o GitHub).
2. Preencha os valores reais de banco de dados, chaves de API e segredos.

### Passo 4: Sincronização com o VPS (Upload de Pastas)
Para subir as pastas para o servidor sem enviar arquivos desnecessários (como `node_modules`), você pode usar os scripts criados:

**No Windows (PowerShell):**
```powershell
.\sync-vps.ps1 -UserIP "root@seu-ip-hostinger" -RemotePath "/var/www/bioleads"
```

**No Linux/Mac (Terminal):**
```bash
chmod +x sync-vps.sh
./sync-vps.sh root@seu-ip-hostinger /var/www/bioleads
```

### Passo 5: Comandos no VPS Hostinger
Após sincronizar as pastas, execute estes comandos dentro da pasta do projeto no servidor (via SSH):
```bash
# Navegar para a pasta
cd /var/www/bioleads

# Instalação
npm install
npx prisma generate

# Build do projeto (Next.js)
npm run build

# Iniciar Processo com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Passo 6: Validação Final
1. **Saúde da API**: `https://api.bioleads.shop/api/health` -> Deve retornar `{"status": "UP"}`.
2. **Sessão Auth**: `https://bioleads.shop/api/auth/session` -> Deve retornar JSON válido.
3. **WhatsApp**: Testar a geração de QR Code no dashboard.

---

## ✅ Condições de Sucesso
- [x] Sem erros 404 nas rotas de autenticação.
- [x] Webhooks da Evolution API apontando para o VPS.
- [x] Comunicação Frontend <-> Backend sem erros de CORS.
- [x] Banco de dados Supabase conectado via porta 6543 (Pooler).

---
**Relatório atualizado em:** 16 de Abril de 2026
**Responsável:** BioLeads DevOps Engine
