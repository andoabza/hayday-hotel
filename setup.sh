#!/bin/bash

# Hayday Hotel - Quick Development Start
# This script starts both backend and frontend in development mode

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Hayday Hotel Development Environment...${NC}"

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cp frontend/.env.example frontend/.env
fi

# Start Redis if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo -e "${YELLOW}Starting Redis with Docker...${NC}"
    docker-compose up -d redis
fi

# Start MySQL if not running
if command -v mysql >/dev/null 2>&1; then
    if ! mysqladmin ping -h localhost -u root -p"$MYSQL_PASSWORD" >/dev/null 2>&1; then
        echo -e "${YELLOW}Starting MySQL with Docker...${NC}"
        docker-compose up -d mysql
        sleep 10
    fi
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd backend
npx prisma migrate dev --name init 2>/dev/null || true
npx prisma generate

# Seed database (optional)
read -p "Seed database with sample data? (y/n): " seed_db
if [[ $seed_db == "y" || $seed_db == "Y" ]]; then
    npm run seed
fi
cd ..

# Start both servers
echo -e "${GREEN}Starting servers...${NC}"
echo -e "Backend will run on ${YELLOW}http://localhost:5000${NC}"
echo -e "Frontend will run on ${YELLOW}http://localhost:5173${NC}"
echo -e "${GREEN}Press Ctrl+C to stop both servers${NC}"

# Use concurrently to run both servers
npx concurrently \
    --names "BACKEND,FRONTEND" \
    --prefix-colors "blue,green" \
    "cd backend && npm run dev" \
    "cd frontend && npm run dev"