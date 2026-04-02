#!/bin/bash

# Hayday Hotel - Production Deployment Script
# This script deploys the application to production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="hayday-hotel"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

print_color() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    print_color "=========================================" "$BLUE"
    print_color "$1" "$BLUE"
    print_color "=========================================" "$BLUE"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        print_color "Docker is not installed. Please install Docker first." "$RED"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_color "Docker Compose is not installed. Please install Docker Compose first." "$RED"
        exit 1
    fi
    
    # Check kubectl (optional)
    if command -v kubectl >/dev/null 2>&1; then
        print_color "✓ kubectl found" "$GREEN"
    else
        print_color "⚠ kubectl not found (optional)" "$YELLOW"
    fi
    
    print_color "✓ All prerequisites satisfied" "$GREEN"
}

# Load environment variables
load_env() {
    print_header "Loading Environment Variables"
    
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        print_color "✓ Loaded .env.production" "$GREEN"
    else
        print_color "⚠ .env.production not found. Using default values." "$YELLOW"
    fi
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    
    print_color "Building backend image..." "$BLUE"
    docker build -t $APP_NAME-backend:$IMAGE_TAG ./backend
    
    print_color "Building frontend image..." "$BLUE"
    docker build -t $APP_NAME-frontend:$IMAGE_TAG ./frontend
    
    print_color "✓ Images built successfully" "$GREEN"
}

# Push to registry
push_images() {
    if [ -n "$DOCKER_REGISTRY" ]; then
        print_header "Pushing Images to Registry"
        
        docker tag $APP_NAME-backend:$IMAGE_TAG $DOCKER_REGISTRY/$APP_NAME-backend:$IMAGE_TAG
        docker tag $APP_NAME-frontend:$IMAGE_TAG $DOCKER_REGISTRY/$APP_NAME-frontend:$IMAGE_TAG
        
        docker push $DOCKER_REGISTRY/$APP_NAME-backend:$IMAGE_TAG
        docker push $DOCKER_REGISTRY/$APP_NAME-frontend:$IMAGE_TAG
        
        print_color "✓ Images pushed to registry" "$GREEN"
    fi
}

# Deploy with Docker Compose
deploy_compose() {
    print_header "Deploying with Docker Compose"
    
    # Pull latest images
    docker-compose pull
    
    # Stop and remove old containers
    docker-compose down
    
    # Start new containers
    docker-compose up -d
    
    # Wait for services
    print_color "Waiting for services to start..." "$BLUE"
    sleep 15
    
    # Run migrations
    print_color "Running database migrations..." "$BLUE"
    docker-compose exec -T backend npx prisma migrate deploy
    
    # Check health
    print_color "Checking health..." "$BLUE"
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        print_color "✓ Backend is healthy" "$GREEN"
    else
        print_color "⚠ Backend health check failed" "$RED"
    fi
    
    print_color "✓ Docker Compose deployment complete" "$GREEN"
}

# Deploy to Kubernetes
deploy_k8s() {
    print_header "Deploying to Kubernetes"
    
    # Check if kubectl is available
    if ! command -v kubectl >/dev/null 2>&1; then
        print_color "kubectl not found. Skipping Kubernetes deployment." "$YELLOW"
        return
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace $APP_NAME --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply secrets
    kubectl create secret generic db-secret \
        --from-literal=url="$DATABASE_URL" \
        --namespace $APP_NAME \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations
    kubectl apply -f k8s/
    
    # Wait for rollout
    print_color "Waiting for rollout to complete..." "$BLUE"
    kubectl rollout status deployment/$APP_NAME-backend -n $APP_NAME --timeout=300s
    
    # Get service URL
    SERVICE_URL=$(kubectl get service $APP_NAME-backend-service -n $APP_NAME -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -n "$SERVICE_URL" ]; then
        print_color "✓ Service available at: http://$SERVICE_URL" "$GREEN"
    fi
    
    print_color "✓ Kubernetes deployment complete" "$GREEN"
}

# Setup monitoring
setup_monitoring() {
    print_header "Setting up Monitoring"
    
    # Deploy Prometheus
    kubectl apply -f k8s/monitoring/prometheus.yaml -n $APP_NAME 2>/dev/null || true
    
    # Deploy Grafana
    kubectl apply -f k8s/monitoring/grafana.yaml -n $APP_NAME 2>/dev/null || true
    
    print_color "✓ Monitoring setup complete" "$GREEN"
}

# Backup database
backup_database() {
    print_header "Backing up Database"
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/hayday_hotel_$TIMESTAMP.sql"
    
    docker-compose exec -T mysql mysqldump -u root -p"$DB_PASSWORD" hayday_hotel > $BACKUP_FILE
    
    # Compress backup
    gzip $BACKUP_FILE
    
    print_color "✓ Database backed up to: $BACKUP_FILE.gz" "$GREEN"
    
    # Keep only last 30 backups
    ls -t $BACKUP_DIR/*.gz | tail -n +31 | xargs rm -f 2>/dev/null || true
}

# Show status
show_status() {
    print_header "Deployment Status"
    
    echo "Docker Containers:"
    docker-compose ps
    
    echo ""
    echo "Kubernetes Resources (if applicable):"
    kubectl get all -n $APP_NAME 2>/dev/null || true
    
    echo ""
    echo "Services:"
    echo "- Backend API: http://localhost:5000"
    echo "- Frontend: http://localhost:80"
    echo "- MySQL: localhost:3306"
    echo "- Redis: localhost:6379"
    echo "- Prometheus: http://localhost:9090"
    echo "- Grafana: http://localhost:3000 (admin/admin)"
}

# Main deployment
main() {
    print_header "Hayday Hotel Production Deployment"
    
    # Check deployment type
    echo "Select deployment method:"
    echo "1) Docker Compose (Local/VM)"
    echo "2) Kubernetes (Cloud)"
    echo "3) Both"
    read -p "Enter choice [1-3]: " deployment_choice
    
    # Run checks
    check_prerequisites
    load_env
    
    # Build and push images
    build_images
    push_images
    
    # Deploy based on choice
    case $deployment_choice in
        1)
            deploy_compose
            ;;
        2)
            deploy_k8s
            setup_monitoring
            ;;
        3)
            deploy_compose
            deploy_k8s
            setup_monitoring
            ;;
        *)
            print_color "Invalid choice. Using Docker Compose." "$YELLOW"
            deploy_compose
            ;;
    esac
    
    # Backup database
    read -p "Do you want to backup the database? (y/n): " backup_choice
    if [[ $backup_choice == "y" || $backup_choice == "Y" ]]; then
        backup_database
    fi
    
    # Show status
    show_status
    
    print_header "Deployment Complete!"
    print_color "Your Hayday Hotel application is now live!" "$GREEN"
}

# Run main function
main