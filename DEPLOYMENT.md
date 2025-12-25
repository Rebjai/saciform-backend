# 🚀 Deployment Guide - Sacifor Backend

This guide explains how to deploy the Sacifor Backend to a VPS using GitHub Actions and SSH.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [VPS Server Setup](#vps-server-setup)
- [GitHub Repository Setup](#github-repository-setup)
- [First-Time Deployment](#first-time-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Local Machine
- Git installed
- SSH key pair for VPS access

### VPS Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- At least 1GB RAM
- Node.js 20.x installed
- MySQL 8.0+ installed and configured
- PM2 process manager (will be installed automatically)

## 🖥️ VPS Server Setup

### 1. Create Deployment User

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Create deployment user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### 2. Install Node.js and pnpm

```bash
# Install Node.js 20.x using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Setup PM2 to start on system boot
pm2 startup
# Run the command it outputs
```

### 3. Setup MySQL Database

```bash
# Login to MySQL
sudo mysql -u root

# Create database and user
CREATE DATABASE sacifor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sacifor_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON sacifor_db.* TO 'sacifor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Create Deployment Directory

```bash
# Create application directory
sudo mkdir -p /var/www/sacifor-backend
sudo chown -R deploy:deploy /var/www/sacifor-backend

# Navigate to directory
cd /var/www/sacifor-backend

# Create logs directory
mkdir -p logs
```

### 5. Setup Environment Variables

```bash
# Create .env file
nano /var/www/sacifor-backend/.env
```

Add the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=sacifor_user
DB_PASSWORD=your_secure_password
DB_DATABASE=sacifor_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12
```

### 6. Setup SSH Key for GitHub Actions

```bash
# Generate SSH key pair (on your local machine)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub deploy@your-vps-ip

# Test connection
ssh -i ~/.ssh/github_actions_deploy deploy@your-vps-ip
```

### 7. Setup Firewall (Optional but Recommended)

```bash
# On VPS
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp  # Application port
sudo ufw enable
```

## 🔐 GitHub Repository Setup

### 1. Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SSH_PRIVATE_KEY` | Private SSH key content | Content of `~/.ssh/github_actions_deploy` |
| `VPS_HOST` | VPS IP address or domain | `123.45.67.89` or `vps.example.com` |
| `VPS_USER` | SSH username | `deploy` |
| `DEPLOY_PATH` | Deployment directory path | `/var/www/sacifor-backend` |
| `PRODUCTION_URL` | Production application URL | `https://api.sacifor.com` |

### 2. Get SSH Private Key Content

```bash
# On your local machine
cat ~/.ssh/github_actions_deploy
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and paste it into the `SSH_PRIVATE_KEY` secret.

## 🎯 First-Time Deployment

### 1. Push Code to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add deployment workflow"

# Push to main branch
git push origin main
```

### 2. Monitor Deployment

1. Go to GitHub repository → Actions tab
2. Watch the deployment workflow execution
3. Check each job: Test → Build → Deploy → Notify

### 3. Verify Deployment on VPS

```bash
# SSH into VPS
ssh deploy@your-vps-ip

# Check PM2 status
pm2 status

# View logs
pm2 logs sacifor-backend

# Test application
curl http://localhost:3000
```

## 📊 Monitoring & Maintenance

### PM2 Commands

```bash
# View application status
pm2 status

# View logs (real-time)
pm2 logs sacifor-backend

# View last 100 log lines
pm2 logs sacifor-backend --lines 100

# Restart application
pm2 restart sacifor-backend

# Stop application
pm2 stop sacifor-backend

# Delete application from PM2
pm2 delete sacifor-backend

# Monitor resources
pm2 monit

# View detailed info
pm2 describe sacifor-backend
```

### Log Files

Logs are stored in `/var/www/sacifor-backend/logs/`:
- `pm2-error.log` - Error logs
- `pm2-out.log` - Standard output logs
- `pm2-combined.log` - Combined logs

### Backup Management

Backups are automatically created before each deployment in `/var/www/sacifor-backend/backups/`

To restore from backup:

```bash
cd /var/www/sacifor-backend
tar -xzf backups/backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart sacifor-backend
```

## 🔧 Troubleshooting

### Deployment Fails at SSH Connection

**Problem**: Cannot connect to VPS

**Solution**:
1. Verify SSH key is correctly added to GitHub secrets
2. Check VPS firewall allows SSH (port 22)
3. Verify VPS_HOST and VPS_USER secrets are correct
4. Test SSH connection manually:
   ```bash
   ssh -i ~/.ssh/github_actions_deploy deploy@your-vps-ip
   ```

### Application Doesn't Start

**Problem**: PM2 shows app as errored or stopped

**Solution**:
1. Check logs: `pm2 logs sacifor-backend --lines 50`
2. Verify .env file exists and has correct values
3. Check database connection
4. Ensure all dependencies installed: `pnpm install --prod`
5. Try starting manually: `node dist/main.js`

### Database Connection Errors

**Problem**: Cannot connect to MySQL

**Solution**:
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check database credentials in .env
3. Verify database and user exist:
   ```bash
   mysql -u sacifor_user -p
   SHOW DATABASES;
   ```
4. Check MySQL logs: `sudo tail -f /var/log/mysql/error.log`

### Out of Memory Errors

**Problem**: Application crashes with memory errors

**Solution**:
1. Reduce PM2 instances in `ecosystem.config.js`:
   ```javascript
   instances: 1,  // Instead of 'max'
   ```
2. Increase swap space on VPS
3. Upgrade VPS plan for more RAM

### Port Already in Use

**Problem**: Cannot bind to port 3000

**Solution**:
1. Check what's using the port: `sudo lsof -i :3000`
2. Kill the process or change PORT in .env
3. Restart application: `pm2 restart sacifor-backend`

## 🔄 Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
# On your local machine
git clone https://github.com/yourusername/sacifor-backend.git
cd sacifor-backend
pnpm install
pnpm run build

# Create deployment archive
tar -czf deployment.tar.gz dist/ package.json pnpm-lock.yaml ecosystem.config.js

# Copy to VPS
scp deployment.tar.gz deploy@your-vps-ip:/var/www/sacifor-backend/

# On VPS
ssh deploy@your-vps-ip
cd /var/www/sacifor-backend
tar -xzf deployment.tar.gz
pnpm install --prod
pm2 restart sacifor-backend
```

## 📝 Additional Configuration

### Setup Nginx as Reverse Proxy (Recommended)

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/sacifor-backend
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.sacifor.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/sacifor-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.sacifor.com

# Auto-renewal is setup automatically
sudo certbot renew --dry-run
```

## 🎉 Success!

Your Sacifor Backend is now deployed and running on your VPS with automated CI/CD via GitHub Actions!

### Next Steps:
- Setup monitoring (e.g., UptimeRobot, Datadog)
- Configure automated backups
- Setup log rotation
- Implement health checks
- Configure alerts for downtime

---

**Need help?** Check the logs or reach out to the development team.
