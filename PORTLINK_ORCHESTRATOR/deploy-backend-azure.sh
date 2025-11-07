#!/bin/bash

# ============================================================================
# PortLink Orchestrator - Azure Backend Deployment Script
# ============================================================================
# Quick deployment script for backend to Azure Container Apps
# Usage: ./deploy-backend-azure.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - CHANGE THESE!
RESOURCE_GROUP="portlink-rg"
LOCATION="southeastasia"
ACR_NAME="portlinkacr"
DB_SERVER_NAME="portlink-db-server"
DB_ADMIN_USER="portlinkadmin"
DB_ADMIN_PASSWORD=""  # Will prompt if empty
DB_NAME="portlink_db"
REDIS_NAME="portlink-redis"
CONTAINER_ENV="portlink-env"
BACKEND_APP="portlink-backend"

# Functions
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   PortLink - Azure Backend Deployment                         ║${NC}"
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

# Check prerequisites
check_azure_cli() {
    print_step "Checking Azure CLI..."
    
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed."
        echo "Install: https://learn.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    fi
    
    print_success "Azure CLI is installed"
}

check_logged_in() {
    print_step "Checking Azure login status..."
    
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Running 'az login'..."
        az login
    fi
    
    local subscription=$(az account show --query name -o tsv)
    print_success "Logged in. Using subscription: $subscription"
}

# Prompt for password if not set
get_db_password() {
    if [ -z "$DB_ADMIN_PASSWORD" ]; then
        echo ""
        echo -e "${YELLOW}Enter PostgreSQL admin password:${NC}"
        echo "(Must have: uppercase, lowercase, number, special char, 8+ chars)"
        read -s -p "Password: " DB_ADMIN_PASSWORD
        echo ""
        read -s -p "Confirm password: " DB_PASSWORD_CONFIRM
        echo ""
        
        if [ "$DB_ADMIN_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
            print_error "Passwords do not match!"
            exit 1
        fi
    fi
}

# Create resource group
create_resource_group() {
    print_step "Creating resource group: $RESOURCE_GROUP..."
    
    if az group show --name $RESOURCE_GROUP &> /dev/null; then
        print_warning "Resource group already exists"
    else
        az group create \
            --name $RESOURCE_GROUP \
            --location $LOCATION \
            --output none
        print_success "Resource group created"
    fi
}

# Create PostgreSQL
create_postgresql() {
    print_step "Creating PostgreSQL server: $DB_SERVER_NAME..."
    print_warning "This may take 5-10 minutes..."
    
    if az postgres flexible-server show --name $DB_SERVER_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
        print_warning "PostgreSQL server already exists"
    else
        az postgres flexible-server create \
            --name $DB_SERVER_NAME \
            --resource-group $RESOURCE_GROUP \
            --location $LOCATION \
            --admin-user $DB_ADMIN_USER \
            --admin-password "$DB_ADMIN_PASSWORD" \
            --sku-name Standard_B1ms \
            --tier Burstable \
            --storage-size 32 \
            --version 16 \
            --public-access 0.0.0.0-255.255.255.255 \
            --yes \
            --output none
        
        print_success "PostgreSQL server created"
        
        # Create database
        print_step "Creating database: $DB_NAME..."
        az postgres flexible-server db create \
            --resource-group $RESOURCE_GROUP \
            --server-name $DB_SERVER_NAME \
            --database-name $DB_NAME \
            --output none
        
        print_success "Database created"
    fi
}

# Create Redis
create_redis() {
    print_step "Creating Redis cache: $REDIS_NAME..."
    print_warning "This may take 10-15 minutes..."
    
    if az redis show --name $REDIS_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
        print_warning "Redis cache already exists"
    else
        az redis create \
            --name $REDIS_NAME \
            --resource-group $RESOURCE_GROUP \
            --location $LOCATION \
            --sku Basic \
            --vm-size c0 \
            --enable-non-ssl-port false \
            --output none
        
        print_success "Redis cache created"
    fi
}

# Create Container Registry
create_acr() {
    print_step "Creating Container Registry: $ACR_NAME..."
    
    if az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
        print_warning "Container registry already exists"
    else
        az acr create \
            --name $ACR_NAME \
            --resource-group $RESOURCE_GROUP \
            --location $LOCATION \
            --sku Basic \
            --admin-enabled true \
            --output none
        
        print_success "Container registry created"
    fi
}

# Build and push image
build_and_push() {
    print_step "Building and pushing backend image..."
    
    # Login to ACR
    az acr login --name $ACR_NAME
    
    # Build image
    cd backend
    docker build -t ${ACR_NAME}.azurecr.io/portlink-backend:latest .
    
    # Push image
    docker push ${ACR_NAME}.azurecr.io/portlink-backend:latest
    cd ..
    
    print_success "Image pushed to registry"
}

# Create Container Apps environment
create_container_env() {
    print_step "Creating Container Apps environment..."
    
    if az containerapp env show --name $CONTAINER_ENV --resource-group $RESOURCE_GROUP &> /dev/null; then
        print_warning "Container Apps environment already exists"
    else
        az containerapp env create \
            --name $CONTAINER_ENV \
            --resource-group $RESOURCE_GROUP \
            --location $LOCATION \
            --output none
        
        print_success "Container Apps environment created"
    fi
}

# Deploy backend
deploy_backend() {
    print_step "Deploying backend container app..."
    
    # Get connection strings
    local db_host=$(az postgres flexible-server show --name $DB_SERVER_NAME --resource-group $RESOURCE_GROUP --query "fullyQualifiedDomainName" -o tsv)
    local redis_host=$(az redis show --name $REDIS_NAME --resource-group $RESOURCE_GROUP --query "hostName" -o tsv)
    local redis_key=$(az redis list-keys --name $REDIS_NAME --resource-group $RESOURCE_GROUP --query "primaryKey" -o tsv)
    local acr_password=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
    
    # Generate JWT secrets
    local jwt_secret=$(openssl rand -base64 32)
    local jwt_refresh_secret=$(openssl rand -base64 32)
    
    # Deploy or update
    if az containerapp show --name $BACKEND_APP --resource-group $RESOURCE_GROUP &> /dev/null; then
        print_warning "Updating existing backend app..."
        az containerapp update \
            --name $BACKEND_APP \
            --resource-group $RESOURCE_GROUP \
            --image ${ACR_NAME}.azurecr.io/portlink-backend:latest \
            --output none
    else
        az containerapp create \
            --name $BACKEND_APP \
            --resource-group $RESOURCE_GROUP \
            --environment $CONTAINER_ENV \
            --image ${ACR_NAME}.azurecr.io/portlink-backend:latest \
            --registry-server ${ACR_NAME}.azurecr.io \
            --registry-username $ACR_NAME \
            --registry-password "$acr_password" \
            --target-port 3000 \
            --ingress external \
            --cpu 0.5 \
            --memory 1.0Gi \
            --min-replicas 1 \
            --max-replicas 2 \
            --env-vars \
                NODE_ENV=production \
                PORT=3000 \
                DB_HOST=$db_host \
                DB_PORT=5432 \
                DB_USER=$DB_ADMIN_USER \
                DB_PASSWORD="$DB_ADMIN_PASSWORD" \
                DB_NAME=$DB_NAME \
                REDIS_HOST=$redis_host \
                REDIS_PORT=6380 \
                REDIS_PASSWORD="$redis_key" \
                JWT_SECRET="$jwt_secret" \
                JWT_EXPIRES_IN=1d \
                JWT_REFRESH_SECRET="$jwt_refresh_secret" \
                JWT_REFRESH_EXPIRES_IN=7d \
                CORS_ORIGIN="*" \
            --output none
    fi
    
    print_success "Backend deployed"
}

# Get backend URL
get_backend_url() {
    print_step "Getting backend URL..."
    
    local backend_url=$(az containerapp show \
        --name $BACKEND_APP \
        --resource-group $RESOURCE_GROUP \
        --query "properties.configuration.ingress.fqdn" \
        -o tsv)
    
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Deployment Complete!${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Backend URL:${NC}"
    echo "  https://$backend_url"
    echo ""
    echo -e "${YELLOW}Health Check:${NC}"
    echo "  https://$backend_url/health"
    echo ""
    echo -e "${YELLOW}API Base URL:${NC}"
    echo "  https://$backend_url/api/v1"
    echo ""
    echo -e "${YELLOW}View logs:${NC}"
    echo "  az containerapp logs show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --follow"
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Navigate to script directory
    cd "$(dirname "$0")"
    
    check_azure_cli
    check_logged_in
    get_db_password
    
    create_resource_group
    create_postgresql
    create_redis
    create_acr
    build_and_push
    create_container_env
    deploy_backend
    get_backend_url
}

# Run main function
main
