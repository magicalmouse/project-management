#!/bin/bash

# Production Deployment Script for Project Management System
set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Check if .env file exists
check_env_file() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.production .env
        print_warning "Please edit .env file with your production values before continuing."
        print_warning "Press any key to continue after editing .env file..."
        read -n 1 -s
    fi
    
    print_success "Environment configuration check passed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/ssl
    mkdir -p backend/uploads
    mkdir -p database/init
    
    print_success "Directories created"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing services if running
    docker-compose down --remove-orphans
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services deployed"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T database mysqladmin ping -h localhost --silent; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for backend
    print_status "Waiting for backend API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:4000/api/health &> /dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend API failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:80/health &> /dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Frontend failed to start within 30 seconds"
        exit 1
    fi
    
    print_success "All services are ready"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Run database setup script inside the backend container
    docker-compose exec backend node setup-database-simple.js
    
    print_success "Database setup completed"
}

# Display deployment information
show_deployment_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Service Information:"
    echo "  Frontend: http://localhost (port 80)"
    echo "  Backend API: http://localhost:4000"
    echo "  Database: localhost:3306"
    echo ""
    echo "🔧 Management Commands:"
    echo "  View logs: docker-compose logs -f [service_name]"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: ./deploy.sh"
    echo ""
    echo "📊 Health Checks:"
    echo "  Frontend: curl http://localhost/health"
    echo "  Backend: curl http://localhost:4000/api/health"
    echo ""
    
    # Show running containers
    print_status "Running containers:"
    docker-compose ps
}

# Main deployment process
main() {
    echo "🏗️  Project Management System - Production Deployment"
    echo "=================================================="
    echo ""
    
    check_dependencies
    check_env_file
    create_directories
    deploy_services
    wait_for_services
    setup_database
    show_deployment_info
    
    print_success "Deployment process completed! 🚀"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"