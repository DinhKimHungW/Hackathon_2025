#!/bin/bash

# ============================================================================
# PortLink Orchestrator - Quick Deploy Script
# ============================================================================
# Quick deployment script for Docker
# Usage: ./quick-deploy.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   PortLink Orchestrator - Quick Deploy                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    print_step "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose V2 is not installed."
        exit 1
    fi
    
    print_success "Docker is installed"
}

# Setup environment file
setup_env() {
    print_step "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.docker.example ]; then
            cp .env.docker.example .env
            print_success "Created .env file from template"
            print_warning "IMPORTANT: Please edit .env file and change the default passwords!"
            print_warning "Press Enter to continue or Ctrl+C to abort and edit .env first"
            read -r
        else
            print_error ".env.docker.example not found"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
}

# Build Docker images
build_images() {
    print_step "Building Docker images (this may take a few minutes)..."
    
    if docker compose build; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    print_step "Starting services..."
    
    if docker compose up -d; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services
wait_for_services() {
    print_step "Waiting for services to be ready..."
    
    echo -n "  Waiting"
    for i in {1..30}; do
        echo -n "."
        sleep 1
        
        # Check if backend is healthy
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo ""
            print_success "Services are ready!"
            return 0
        fi
    done
    
    echo ""
    print_warning "Services may not be fully ready yet. Check logs with: docker compose logs -f"
}

# Display information
show_info() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Deployment Complete!${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Access your application:"
    echo ""
    echo -e "  ${GREEN}Frontend:${NC}    http://localhost:8080"
    echo -e "  ${GREEN}Backend API:${NC} http://localhost:3000/api/v1"
    echo -e "  ${GREEN}Health:${NC}      http://localhost:3000/health"
    echo ""
    echo "Default login credentials:"
    echo -e "  ${YELLOW}Email:${NC}    admin@portlink.com"
    echo -e "  ${YELLOW}Password:${NC} Admin@123"
    echo ""
    echo "Useful commands:"
    echo ""
    echo "  View logs:        docker compose logs -f"
    echo "  Stop services:    docker compose down"
    echo "  Restart:          docker compose restart"
    echo "  View status:      docker compose ps"
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Navigate to script directory
    cd "$(dirname "$0")"
    
    check_docker
    setup_env
    build_images
    start_services
    wait_for_services
    show_info
}

# Run main function
main
