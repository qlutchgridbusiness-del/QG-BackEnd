#!/bin/bash
cd /home/ec2-user/qlutchgrid

# Load env vars from .env if needed
export $(grep -v '^#' .env | xargs)

# Start or restart PM2
pm2 describe qlutchgrid > /dev/null
if [ $? -eq 0 ]; then
  pm2 restart qlutchgrid
else
  pm2 start dist/main.js --name qlutchgrid
fi
