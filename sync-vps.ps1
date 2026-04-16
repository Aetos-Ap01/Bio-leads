# Script para Sincronizar Projeto com VPS (Windows PowerShell)
# Uso: .\sync-vps.ps1 -UserIP "root@ip-do-servidor" -RemotePath "/var/www/bioleads"

param (
    [Parameter(Mandatory=$true)]
    [string]$UserIP,
    
    [Parameter(Mandatory=$true)]
    [string]$RemotePath
)

Write-Host "🚀 Iniciando sincronização com $UserIP..." -ForegroundColor Cyan

# Verifica se rsync está disponível, senão usa scp (mais comum no Windows)
if (Get-Command rsync -ErrorAction SilentlyContinue) {
    rsync -avz --progress `
        --exclude 'node_modules' `
        --exclude '.next' `
        --exclude '.git' `
        --exclude '.env' `
        ./ "$UserIP`:$RemotePath"
} else {
    Write-Host "⚠️ rsync não encontrado, usando scp (mais lento e não exclui pastas automaticamente)..." -ForegroundColor Yellow
    Write-Host "Dica: Instale o rsync via 'winget install Git.Git' ou use o WSL." -ForegroundColor Gray
    
    # Comando SCP básico como fallback
    scp -r ./ "$UserIP`:$RemotePath"
}

Write-Host "✅ Sincronização concluída!" -ForegroundColor Green
Write-Host "`nPróximos passos no servidor:" -ForegroundColor White
Write-Host "1. cd $RemotePath"
Write-Host "2. npm install"
Write-Host "3. npx prisma generate"
Write-Host "4. npm run build"
Write-Host "5. pm2 restart ecosystem.config.js"
