# Docker Deployment Guide

This guide covers deploying the Telegram bot to a VPS server running Ubuntu with LiteSpeed web server.

## Prerequisites

- Ubuntu VPS server with SSH access
- LiteSpeed web server (or Apache-compatible server using `.htaccess`)
- Domain name with DNS configured (for webhook HTTPS)
- Docker installed (see installation steps below)

## Port Configuration

The Telegram bot uses **port 3333** (hardcoded).

**Port Conflicts Check:**

- ✅ **Port 3333** - Telegram bot (no conflict)
- ⚠️ **Port 3001** - Backend service (different port, no conflict)
- ⚠️ **Port 8080** - Frontend service (different port, no conflict)

If port 3333 is already in use, you'll need to modify the code to use a different port.

**Path Conflicts:**

- The bot uses `/webhook` path - ensure this doesn't conflict with your existing routes
- The proxy configuration specifically matches `/webhook` and won't interfere with other paths

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
Internet → Domain (HTTPS) → LiteSpeed → Reverse Proxy (.htaccess) → Docker Container (port 3333)
```

The web server handles SSL/TLS termination and routes `/webhook` requests to the Docker container.

**Coexistence with Other Services:**

- The Telegram bot runs independently in its own Docker container
- Uses port 3333 (hardcoded) - no conflict with other services
- Only `/webhook` path is proxied - all other paths handled by existing configuration
- Can run alongside other Docker services (backend on port 3001, frontend on port 8080, etc.)

## Network Configuration

### Port Mapping

The Docker container exposes port 3333 (hardcoded). Map it to the same host port:

```bash
docker run -p 3333:3333 --env-file .env.prod ...
```

This maps host port 3333 to container port 3333.

### Reverse Proxy Setup

#### LiteSpeed / .htaccess Configuration

If your site runs on LiteSpeed (or Apache-compatible) and already uses an `.htaccess` file for the React SPA:

1. **Ensure the bot container is listening on port 3333** (see Port Mapping above).
2. **Edit the site's `.htaccess`** (the one in the React app doc root).
3. **Add this rule after the HTTPS redirect and before the React Router catch-all**:

   ```apache
   # Telegram bot webhook → Docker on port 3333
   RewriteRule ^webhook(/.*)?$ http://127.0.0.1:3333/webhook$1 [P,L]
   ```

4. **Test from the server**:

   ```bash
   # Docker container directly
   curl http://localhost:3333/health

   # Through LiteSpeed proxy
   curl -v https://your-domain.com/webhook
   ```

This keeps all app-specific routing in `.htaccess` and only proxies the `/webhook` path to the Docker container.

**Troubleshooting:**

If `/webhook` requests are not being proxied:

1. **Check that the rule is placed before the React Router catch-all** (the `RewriteRule ^(.*)$ /dist/index.html` rule)
2. **Verify Docker container is running**: `docker ps | grep telegram-bot`
3. **Test container directly**: `curl http://localhost:3333/health`
4. **Check LiteSpeed error logs** for proxy-related errors
5. **Ensure proxy feature is enabled** in LiteSpeed WebAdmin if using `[P]` flag

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
NODE_ENV=production
WEBHOOK_URL=https://your-domain.com
```

```bash
mkdir -p ~/telegram-bot
cd ~/telegram-bot
nano .env.prod
```

Add your production environment variables:

```env
BOT_TOKEN=your_production_bot_token
BOT_USERNAME=your_production_bot_username
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
      - "3333:3333"
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
          "http://localhost:3333/health",
        ]
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

**Note**: Port 3333 is hardcoded in the configuration.

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
docker build -t telegram-bot:prod .

# Stop existing container
docker stop telegram-bot-prod || true
docker rm telegram-bot-prod || true

# Run new container
docker run -d \
  --name telegram-bot-prod \
  --restart unless-stopped \
  -p 3333:3333 \
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
  -p 3333:3333 \
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
curl http://localhost:3333/health

# Test webhook endpoint (from server)
curl -X POST http://localhost:3333/webhook
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
3. Check port availability: `sudo netstat -tulpn | grep 3333`

### Webhook Not Receiving Requests

1. Verify reverse proxy configuration
2. Test container directly: `curl http://localhost:3333/health`
3. Check webhook URL in Telegram: Use BotFather's `/getWebhookInfo`
4. Verify SSL certificate is valid
5. Check firewall rules: `sudo ufw status`

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3333

# Kill process if needed
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
6. **Use firewall** to restrict access: `sudo ufw allow 3333/tcp`

## Monitoring

### Health Checks

The bot exposes a `/health` endpoint:

```bash
curl http://localhost:3333/health
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
