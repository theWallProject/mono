# Docker Deployment Guide

This guide covers deploying the Telegram bot to a VPS server running Ubuntu with an existing web server (lighttpd/Apache).

## Prerequisites

- Ubuntu VPS server with SSH access
- Existing web server (lighttpd, Apache, or nginx)
- Domain name with DNS configured (for webhook HTTPS)
- Docker installed (see installation steps below)

## Docker Installation on Ubuntu

### Step 1: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Docker

```bash
# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

### Step 3: Verify Installation

```bash
docker --version
docker compose version
```

## Running Docker Alongside Existing Web Server

Docker containers run independently of your host web server. They communicate via:

1. **Port mapping**: Host port → Container port
2. **Reverse proxy**: Web server routes webhook traffic to Docker container

### Architecture Overview

```
Internet → Domain (HTTPS) → Web Server (lighttpd/Apache) → Reverse Proxy → Docker Container (port 3009)
```

The web server handles SSL/TLS termination and routes `/webhook` requests to the Docker container.

## Network Configuration

### Port Mapping

The Docker container exposes the port specified in your `.env.prod` file (PORT variable). Map it to a host port:

```bash
# PORT is read from .env.prod file
docker run -p ${PORT}:${PORT} --env-file .env.prod ...
```

This maps the host port to the container port (both read from `.env.prod`).

### Reverse Proxy Setup

#### Option 1: lighttpd mod_proxy

Edit `/etc/lighttpd/lighttpd.conf`:

```conf
server.modules += ("mod_proxy")

$HTTP["url"] =~ "^/webhook" {
    proxy.server = (
        "" => (
            (
                "host" => "127.0.0.1",
                "port" => ${PORT}  # Replace with PORT value from .env.prod
            )
        )
    )
}
```

Restart lighttpd:

```bash
sudo systemctl restart lighttpd
```

#### Option 2: Apache mod_proxy

Enable required modules:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
```

Edit your Apache virtual host configuration:

```apache
<VirtualHost *:443>
    ServerName your-domain.com

    # SSL configuration...

    ProxyPreserveHost On
    ProxyPass /webhook http://127.0.0.1:${PORT}/webhook
    ProxyPassReverse /webhook http://127.0.0.1:${PORT}/webhook
    # Replace ${PORT} with the PORT value from your .env.prod file
</VirtualHost>
```

Restart Apache:

```bash
sudo systemctl restart apache2
```

#### Option 3: nginx (if using nginx)

Edit your nginx site configuration:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL configuration...

    location /webhook {
        proxy_pass http://127.0.0.1:${PORT}/webhook;
        # Replace ${PORT} with the PORT value from your .env.prod file
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Setup

### Create .env.prod File on Server

Create `.env.prod` file in your deployment directory:

```bash
mkdir -p ~/telegram-bot
cd ~/telegram-bot
nano .env.prod
```

Add your production environment variables:

```env
BOT_TOKEN=your_production_bot_token
BOT_USERNAME=your_production_bot_username
PORT=3009
NODE_ENV=production
WEBHOOK_URL=https://your-domain.com
```

**Security Note**: Ensure `.env.prod` file has restricted permissions:

```bash
chmod 600 .env.prod
```

**Note**: The bot uses separate `.env.dev` and `.env.prod` files. For production deployment, use `.env.prod`. The bot automatically loads the correct file based on `NODE_ENV`.

## Docker Compose Setup

The project includes `docker-compose.yml` which automatically reads variables from `.env.prod`:

```yaml
version: "3.8"

services:
  telegram-bot:
    image: telegram-bot:prod
    container_name: telegram-bot-prod
    restart: unless-stopped
    ports:
      - "${PORT}:${PORT}" # Replace ${PORT} with value from .env.prod
    env_file:
      - .env.prod
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--quiet",
          "--tries=1",
          "--spider",
          "http://localhost:${PORT}/health",
        ]
      # Replace ${PORT} with value from .env.prod
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Use docker-compose commands:

```bash
# Build and start
docker compose up -d --build

# Or separately:
docker compose build
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose stop

# Stop and remove
docker compose down
```

**Note**: Docker Compose automatically reads `.env.prod` and substitutes `${PORT}` - no manual extraction needed!

## Deployment Workflow

### 1. Build Docker Image Locally

From the monorepo root:

```bash
# Build production image
pnpm docker:bot:build
# Or from telegram-bot directory:
cd packages/telegram-bot
pnpm docker:build
```

### 2. Tag and Push to Registry (Optional)

If using a container registry:

```bash
docker tag telegram-bot:prod your-registry.com/telegram-bot:prod
docker push your-registry.com/telegram-bot:prod
```

### 3. Deploy on Server

#### Option A: Direct Build on Server

```bash
# SSH into server
ssh user@your-server.com

# Clone/pull latest code
cd ~/telegram-bot
git pull

# Build image
# PORT is read from .env.prod file
docker build --build-arg PORT=${PORT} -t telegram-bot:prod .
# Replace ${PORT} with value from .env.prod, or use: node scripts/docker-helper.js build .env.prod

# Stop existing container
docker stop telegram-bot-prod || true
docker rm telegram-bot-prod || true

# Run new container
docker run -d \
  --name telegram-bot-prod \
  --restart unless-stopped \
  -p ${PORT}:${PORT} \
  # Replace ${PORT} with value from .env.prod
  --env-file .env.prod \
  telegram-bot:prod
```

#### Option B: Pull from Registry

```bash
# Pull image
docker pull your-registry.com/telegram-bot:prod

# Stop and remove old container
docker stop telegram-bot-prod || true
docker rm telegram-bot-prod || true

# Run new container
docker run -d \
  --name telegram-bot-prod \
  --restart unless-stopped \
  -p ${PORT}:${PORT} \
  # Replace ${PORT} with value from .env.prod
  --env-file .env.prod \
  your-registry.com/telegram-bot:prod
```

### 4. Verify Deployment

```bash
# Check container status
docker ps

# View logs
docker logs telegram-bot-prod

# Test health endpoint
curl http://localhost:${PORT}/health
# Replace ${PORT} with value from .env.prod

# Test webhook endpoint (from server)
curl -X POST http://localhost:${PORT}/webhook
# Replace ${PORT} with value from .env.prod
```

## Common Docker Commands

### View Logs

```bash
# Follow logs
docker logs -f telegram-bot-prod

# Last 100 lines
docker logs --tail 100 telegram-bot-prod
```

### Stop/Start Container

```bash
docker stop telegram-bot-prod
docker start telegram-bot-prod
docker restart telegram-bot-prod
```

### Remove Container

```bash
docker stop telegram-bot-prod
docker rm telegram-bot-prod
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune
```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker logs telegram-bot-prod`
2. Verify environment variables: `docker exec telegram-bot-prod env`
3. Check port availability: `sudo netstat -tulpn | grep ${PORT}` (replace with PORT from .env.prod)

### Webhook Not Receiving Requests

1. Verify reverse proxy configuration
2. Test container directly: `curl http://localhost:${PORT}/health` (replace with PORT from .env.prod)
3. Check webhook URL in Telegram: Use BotFather's `/getWebhookInfo`
4. Verify SSL certificate is valid
5. Check firewall rules: `sudo ufw status`

### Port Already in Use

```bash
# Find process using port (replace ${PORT} with value from .env.prod)
sudo lsof -i :${PORT}

# Kill process or change PORT in .env.prod
```

### Container Keeps Restarting

1. Check logs: `docker logs telegram-bot-prod`
2. Verify all required environment variables are set
3. Check database file exists: `docker exec telegram-bot-prod ls -la /app/packages/telegram-bot/db/`

### Permission Issues

If you get permission errors:

```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### SSL Certificate Issues

- Ensure your domain has valid SSL certificate
- Webhook URL must use HTTPS
- Verify certificate with: `curl -v https://your-domain.com`

## Security Best Practices

1. **Never commit `.env.dev` or `.env.prod` files** - Keep them in `.gitignore`
2. **Restrict file permissions**: `chmod 600 .env.prod` (and `.env.dev` for local dev)
3. **Use Docker secrets** for sensitive data in production
4. **Keep Docker updated**: `sudo apt update && sudo apt upgrade docker-ce`
5. **Monitor logs** regularly for suspicious activity
6. **Use firewall** to restrict access: `sudo ufw allow ${PORT}/tcp` (replace with PORT from .env.prod)

## Monitoring

### Health Checks

The bot exposes a `/health` endpoint:

```bash
curl http://localhost:${PORT}/health
# Replace ${PORT} with value from .env.prod
```

### Log Monitoring

Set up log rotation:

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/docker-telegram-bot
```

```conf
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

## Next Steps

- Set up automated deployments (CI/CD)
- Configure monitoring and alerting
- Set up log aggregation
- Implement backup strategy for database files
