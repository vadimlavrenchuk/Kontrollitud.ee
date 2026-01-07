#!/bin/bash
echo "========================================"
echo "Fast Deploy to kontrollitud.ee"
echo "========================================"

echo ""
echo "Step 1: Git commit and push..."
git add frontend/src/App.jsx frontend/src/App.css
git commit -m "Fix mobile header: hamburger menu click handlers"
git push

echo ""
echo "Step 2: Building frontend..."
cd frontend
npm run build
cd ..

echo ""
echo "Step 3: Copying files to server..."
scp frontend/src/App.jsx root@kontrollitud.ee:/root/Kontrollitud.ee/frontend/src/
scp frontend/src/App.css root@kontrollitud.ee:/root/Kontrollitud.ee/frontend/src/

echo ""
echo "Step 4: Rebuilding on server..."
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee && docker-compose build --no-cache frontend && docker-compose up -d"

echo ""
echo "========================================"
echo "Deployment complete!"
echo "========================================"
