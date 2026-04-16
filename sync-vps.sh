# Script para Sincronizar Projeto com VPS (Linux/Mac)
# Uso: ./sync-vps.sh root@ip-do-servidor /var/www/bioleads

USER_IP=$1
REMOTE_PATH=$2

if [ -z "$USER_IP" ] || [ -z "$REMOTE_PATH" ]; then
    echo "Uso: ./sync-vps.sh root@ip-do-servidor /var/www/bioleads"
    exit 1
fi

echo "🚀 Iniciando sincronização com $USER_IP..."

rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.DS_Store' \
    ./ $USER_IP:$REMOTE_PATH

echo "✅ Sincronização concluída!"
echo "Próximos passos no servidor:"
echo "1. cd $REMOTE_PATH"
echo "2. npm install"
echo "3. npx prisma generate"
echo "4. npm run build"
echo "5. pm2 restart ecosystem.config.js"
