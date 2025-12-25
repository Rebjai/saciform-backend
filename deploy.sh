#!/bin/bash

# Deployment script for Sacifor Backend
# This script is executed on the VPS server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment process...${NC}"

# Configuration
APP_NAME="sacifor-backend"
BACKUP_DIR="backups"
CURRENT_DIR=$(pwd)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current deployment
if [ -d "dist" ]; then
    echo -e "${YELLOW}📦 Creating backup of current deployment...${NC}"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_FILE" dist/ .env 2>/dev/null || true
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    cd "$CURRENT_DIR"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with required environment variables${NC}"
    exit 1
fi

# Install dependencies (only production)
echo -e "${YELLOW}📦 Installing/updating production dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm install --prod --frozen-lockfile
else
    echo -e "${YELLOW}⚠️  pnpm not found, using npm...${NC}"
    npm install --production --frozen-lockfile
fi

# Run database migrations (if applicable)
# Uncomment the following lines when you have migrations
# echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
# pnpm typeorm migration:run || npm run typeorm migration:run

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed!${NC}"
    echo -e "${YELLOW}Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Stop the application gracefully
echo -e "${YELLOW}🛑 Stopping application...${NC}"
pm2 stop $APP_NAME 2>/dev/null || echo "App not running"

# Start/Restart the application with PM2
echo -e "${YELLOW}🔄 Starting application with PM2...${NC}"
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    echo -e "${YELLOW}Restarting existing process...${NC}"
    pm2 restart $APP_NAME --update-env
else
    echo -e "${YELLOW}Starting new process...${NC}"
    pm2 start ecosystem.config.js
fi

# Save PM2 process list
pm2 save

# Show application status
echo -e "${GREEN}📊 Application status:${NC}"
pm2 status

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 5  # Wait for app to start

# Get the port from .env or use default
PORT=$(grep -E "^PORT=" .env | cut -d '=' -f2 | tr -d '\r' || echo "3000")

if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed! Application is running on port $PORT${NC}"
else
    echo -e "${RED}⚠️  Health check warning: Application may not be responding yet${NC}"
    echo -e "${YELLOW}Please check logs with: pm2 logs $APP_NAME${NC}"
fi

# Display recent logs
echo -e "${GREEN}📝 Recent logs:${NC}"
pm2 logs $APP_NAME --lines 15 --nostream

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Useful commands:${NC}"
echo -e "${YELLOW}  - View logs: pm2 logs $APP_NAME${NC}"
echo -e "${YELLOW}  - Restart app: pm2 restart $APP_NAME${NC}"
echo -e "${YELLOW}  - Stop app: pm2 stop $APP_NAME${NC}"
echo -e "${YELLOW}  - Monitor: pm2 monit${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
