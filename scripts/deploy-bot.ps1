param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('deploy', 'logs')]
  [string] $Mode = 'deploy'
)

$ErrorActionPreference = 'Stop'

$remoteHost = 'root@77.245.153.196'
$remotePort = 22666

if ($Mode -eq 'deploy') {
  $remoteCommand = @(
    'export PATH=/root/.nvm/versions/node/v22.18.0/bin:/root/.local/share/pnpm:$PATH',
    'cd /home/the-wall.win/mono',
    'git pull',
    # Build image via monorepo bot:build script
    'pnpm run bot:build',
    # Stop and remove existing container explicitly (ignore errors if not present)
    'docker stop telegram-bot-prod || true',
    'docker rm telegram-bot-prod || true',
    # Run fresh container directly (avoid docker-compose up bug on this host)
    'docker run -d --name telegram-bot-prod --restart unless-stopped -p 3333:3333 --env-file packages/telegram-bot/.env.prod telegram-bot:prod',
    'systemctl restart lsws'
  ) -join ' && '

  Write-Host "Running remote deploy command via ssh..." -ForegroundColor Cyan
} elseif ($Mode -eq 'logs') {
  $remoteCommand = @(
    'export PATH=/root/.nvm/versions/node/v22.18.0/bin:/root/.local/share/pnpm:$PATH',
    'docker logs -f telegram-bot-prod'
  ) -join ' && '

  Write-Host "Streaming remote bot logs via ssh..." -ForegroundColor Cyan
}

Write-Host "ssh -p $remotePort $remoteHost `"$remoteCommand`"" -ForegroundColor DarkGray

ssh -p $remotePort $remoteHost $remoteCommand

if ($LASTEXITCODE -ne 0) {
  Write-Error "Remote command '$Mode' failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

