#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Instance 1 Setup Script: tinurik-frontend
# Run on Ubuntu 22.04 LTS / 24.04 LTS
# Installs: Node.js 20.x, Nginx, builds React application, configures reverse proxy
# ==============================================================================

set -e

if [ -z "$1" ]; then
    echo "Usage: ./setup-ec2-frontend.sh <BACKEND_PUBLIC_IP>"
    echo "Example: ./setup-ec2-frontend.sh 54.210.12.34"
    exit 1
fi

BACKEND_IP="$1"

echo "=== [1/5] Updating Packages & Installing Nginx & Node.js ==="
sudo apt-get update -y
sudo apt-get install -y curl git ufw nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== [2/5] Building React Vite Frontend ==="
REPO_DIR="/home/ubuntu/barangay-tinurik-portal/frontend"
if [ ! -d "$REPO_DIR" ]; then
    echo "Please place repository inside /home/ubuntu/barangay-tinurik-portal"
    exit 1
fi

cd "$REPO_DIR"

# Write production environment pointing to EC2 Instance 2 Backend API
cat <<EOF > .env
VITE_API_URL=http://${BACKEND_IP}:5000/api
EOF

npm install
npm run build

echo "=== [3/5] Deploying Build to /var/www/tinurik-frontend ==="
sudo mkdir -p /var/www/tinurik-frontend
sudo rm -rf /var/www/tinurik-frontend/*
sudo cp -r dist/* /var/www/tinurik-frontend/
sudo chown -R www-data:www-data /var/www/tinurik-frontend

echo "=== [4/5] Configuring Nginx Web Server ==="
sudo cp ../aws-deploy/nginx/tinurik-frontend.conf /etc/nginx/sites-available/tinurik-frontend
sudo ln -sf /etc/nginx/sites-available/tinurik-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=== FRONTEND DEPLOYMENT COMPLETE ==="
echo "Access your portal at: http://$(curl -s http://checkip.amazonaws.com)"
