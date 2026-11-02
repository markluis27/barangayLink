#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Instance 2 Setup Script: tinurik-backend
# Run on Ubuntu 22.04 LTS / 24.04 LTS
# Installs: Node.js 20.x, PostgreSQL 14+, initializes database and starts systemd service
# ==============================================================================

set -e

echo "=== [1/6] Updating System Packages ==="
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw postgresql postgresql-contrib

echo "=== [2/6] Installing Node.js LTS (v20.x) ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "=== [3/6] Configuring PostgreSQL Database ==="
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create postgres user and database
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'AdminPostgres2026!';"
sudo -u postgres psql -c "CREATE DATABASE barangay_tinurik;" || true

echo "=== [4/6] Setting Up Backend Application ==="
# Clone or navigate to repository directory
REPO_DIR="/home/ubuntu/barangay-tinurik-portal/backend"
if [ ! -d "$REPO_DIR" ]; then
    echo "Please place the repository inside /home/ubuntu/barangay-tinurik-portal"
    exit 1
fi

cd "$REPO_DIR"
npm install --production

# Create Production .env
cat <<EOF > .env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://<FRONTEND_PUBLIC_IP>
JWT_SECRET=super_secret_jwt_key_tinurik_change_before_launch_2026
DATABASE_URL=postgresql://postgres:AdminPostgres2026!@localhost:5432/barangay_tinurik
USE_SQLITE=false
EOF

echo "=== [5/6] Initializing PostgreSQL Schema and Demo Accounts ==="
npm run db:init

echo "=== [6/6] Registering Systemd Background Service ==="
sudo cp ../aws-deploy/systemd/tinurik-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tinurik-backend
sudo systemctl restart tinurik-backend

echo "=== BACKEND DEPLOYMENT COMPLETE ==="
echo "Check backend status: sudo systemctl status tinurik-backend"
echo "Test endpoint: curl http://localhost:5000/api/health"
