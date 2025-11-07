# ============================================================================
# PortLink Orchestrator - Makefile
# ============================================================================

.PHONY: help build up down logs restart clean backup restore

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Show this help message
help:
	@echo "$(BLUE)PortLink Orchestrator - Docker Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

## dev: Start development environment
dev:
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"

## dev-logs: View development logs
dev-logs:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

## dev-down: Stop development environment
dev-down:
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

##@ Production

## build: Build all Docker images
build:
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build --parallel
	@echo "$(GREEN)✓ Build complete$(NC)"

## up: Start all services in production mode
up:
	@echo "$(GREEN)Starting production services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend:  http://localhost:3000"

## down: Stop all services
down:
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

## restart: Restart all services
restart: down up

## logs: View logs from all services
logs:
	docker-compose logs -f

## logs-backend: View backend logs
logs-backend:
	docker-compose logs -f backend

## logs-frontend: View frontend logs
logs-frontend:
	docker-compose logs -f frontend

## logs-db: View database logs
logs-db:
	docker-compose logs -f postgres

##@ Database

## db-shell: Open PostgreSQL shell
db-shell:
	@echo "$(BLUE)Opening PostgreSQL shell...$(NC)"
	docker-compose exec postgres psql -U portlink_user -d portlink_db

## db-backup: Create database backup
db-backup:
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U portlink_user portlink_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

## db-restore: Restore database from latest backup
db-restore:
	@echo "$(YELLOW)Restoring database from latest backup...$(NC)"
	@latest=$$(ls -t backups/*.sql | head -1); \
	if [ -z "$$latest" ]; then \
		echo "$(RED)No backup files found$(NC)"; \
		exit 1; \
	fi; \
	echo "Restoring from $$latest"; \
	docker-compose exec -T postgres psql -U portlink_user -d portlink_db < $$latest
	@echo "$(GREEN)✓ Database restored$(NC)"

## db-seed: Seed database with demo data
db-seed:
	@echo "$(BLUE)Seeding database...$(NC)"
	docker-compose exec backend npm run seed:demo
	@echo "$(GREEN)✓ Database seeded$(NC)"

##@ Maintenance

## clean: Remove stopped containers and unused images
clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down -v
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

## clean-all: Remove all containers, images, and volumes (WARNING: Destroys all data!)
clean-all:
	@echo "$(RED)WARNING: This will remove all containers, images, and volumes!$(NC)"
	@echo "$(RED)Press Ctrl+C to cancel, or Enter to continue...$(NC)"
	@read confirm
	docker-compose down -v
	docker system prune -a -f --volumes
	@echo "$(GREEN)✓ Full cleanup complete$(NC)"

## rebuild: Rebuild and restart all services
rebuild:
	@echo "$(GREEN)Rebuilding all services...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

##@ Monitoring

## ps: Show running containers
ps:
	@docker-compose ps

## stats: Show container resource usage
stats:
	@docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

## health: Check health status of all services
health:
	@echo "$(BLUE)Checking service health...$(NC)"
	@docker-compose ps
	@echo "\n$(BLUE)Testing endpoints...$(NC)"
	@curl -s http://localhost:3000/api/v1/auth/verify > /dev/null && echo "$(GREEN)✓ Backend API is healthy$(NC)" || echo "$(RED)✗ Backend API is down$(NC)"
	@curl -s http://localhost:8080 > /dev/null && echo "$(GREEN)✓ Frontend is healthy$(NC)" || echo "$(RED)✗ Frontend is down$(NC)"

##@ Testing

## test: Run all tests
test:
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose exec backend npm run test
	@echo "$(GREEN)✓ Tests complete$(NC)"

## test-e2e: Run end-to-end tests
test-e2e:
	@echo "$(BLUE)Running E2E tests...$(NC)"
	docker-compose exec frontend npm run test:e2e
	@echo "$(GREEN)✓ E2E tests complete$(NC)"

##@ Quick Actions

## install: Initial setup (build + up + seed)
install: build up db-seed
	@echo "$(GREEN)✓ Installation complete!$(NC)"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend:  http://localhost:3000"
	@echo "Default credentials: admin@portlink.com / Admin@123"

## update: Pull latest code and rebuild
update:
	@echo "$(BLUE)Updating application...$(NC)"
	git pull origin main
	$(MAKE) rebuild
	@echo "$(GREEN)✓ Update complete$(NC)"
