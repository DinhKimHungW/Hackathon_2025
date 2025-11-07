#!/bin/bash

# ============================================================================
# PortLink Orchestrator - GitHub Deployment Setup Script
# ============================================================================
# This script helps you deploy PortLink Orchestrator using GitHub
# Usage: ./setup-github-deployment.sh

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
    echo -e "${CYAN}║   PortLink Orchestrator - GitHub Deployment Setup             ║${NC}"
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

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Check prerequisites
check_git() {
    print_step "Checking Git installation..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "Git is installed"
}

# Check if we're in a git repository
check_repo() {
    print_step "Checking Git repository..."
    
    if ! git rev-parse --git-dir &> /dev/null; then
        print_error "Not a Git repository. Please run this script from the repository root."
        exit 1
    fi
    
    print_success "Git repository detected"
}

# Check remote
check_remote() {
    print_step "Checking GitHub remote..."
    
    if ! git remote get-url origin &> /dev/null; then
        print_error "No remote 'origin' configured. Please add GitHub remote first."
        echo ""
        echo "Example:"
        echo "  git remote add origin https://github.com/DinhKimHungW/Hackathon_2025.git"
        exit 1
    fi
    
    local remote_url=$(git remote get-url origin)
    print_success "Remote configured: $remote_url"
}

# Verify workflows exist
verify_workflows() {
    print_step "Verifying GitHub Actions workflows..."
    
    local workflows_dir=".github/workflows"
    
    if [ ! -d "$workflows_dir" ]; then
        print_error "Workflows directory not found: $workflows_dir"
        exit 1
    fi
    
    if [ -f "$workflows_dir/docker-build.yml" ]; then
        print_success "Docker build workflow found"
    else
        print_warning "Docker build workflow not found"
    fi
    
    if [ -f "$workflows_dir/deploy-github-pages.yml" ]; then
        print_success "GitHub Pages deployment workflow found"
    else
        print_warning "GitHub Pages deployment workflow not found"
    fi
}

# Show deployment instructions
show_instructions() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Setup Complete!${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps to deploy to GitHub:"
    echo ""
    echo -e "${YELLOW}1. Enable GitHub Actions Permissions:${NC}"
    echo "   - Go to: https://github.com/DinhKimHungW/Hackathon_2025/settings/actions"
    echo "   - Under 'Workflow permissions', select:"
    echo "     ✓ Read and write permissions"
    echo "   - Click 'Save'"
    echo ""
    echo -e "${YELLOW}2. Push Code to GitHub:${NC}"
    echo "   git add ."
    echo "   git commit -m 'chore: setup GitHub deployment'"
    echo "   git push origin main"
    echo ""
    echo -e "${YELLOW}3. Wait for Build:${NC}"
    echo "   - Go to: https://github.com/DinhKimHungW/Hackathon_2025/actions"
    echo "   - Wait for 'Docker Build and Deploy' workflow to complete (~5-10 min)"
    echo ""
    echo -e "${YELLOW}4. (Optional) Enable GitHub Pages:${NC}"
    echo "   - Go to: https://github.com/DinhKimHungW/Hackathon_2025/settings/pages"
    echo "   - Source: Select 'GitHub Actions'"
    echo "   - Frontend will be available at:"
    echo "     https://dinhkimhungw.github.io/Hackathon_2025/"
    echo ""
    echo -e "${YELLOW}5. Deploy Backend:${NC}"
    echo "   Backend needs to be deployed separately. Options:"
    echo "   - Render.com (Free): See DEPLOYMENT.md"
    echo "   - Railway.app (Free)"
    echo "   - Fly.io (Free)"
    echo "   - Or pull images from GitHub Container Registry"
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Docker images will be available at:"
    echo "  ghcr.io/dinhkimhungw/hackathon_2025/backend:main"
    echo "  ghcr.io/dinhkimhungw/hackathon_2025/frontend:main"
    echo ""
    echo "View packages at:"
    echo "  https://github.com/DinhKimHungW/Hackathon_2025/pkgs/container/hackathon_2025%2Fbackend"
    echo ""
    echo -e "${GREEN}For detailed instructions, see: GITHUB_DEPLOYMENT.md${NC}"
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Navigate to script directory
    cd "$(dirname "$0")"
    
    check_git
    check_repo
    check_remote
    verify_workflows
    show_instructions
}

# Run main function
main
