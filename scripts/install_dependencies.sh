#!/bin/bash
cd /home/ec2-user/qlutchgrid

# Install Node modules
npm install --omit=dev

# Build NestJS application
npm run build
