# Fast Azure Deploy (backend + frontend)

This file explains how to run the quick deploy script that builds the backend and frontend Docker images, pushes them to Azure Container Registry (ACR), and creates two App Services (Linux) that run those container images.

Prerequisites
- Azure CLI installed and authenticated: `az login`
- Docker installed and running (Docker Desktop)
- Sufficient Azure subscription quota for App Service and ACR

Quick steps
1. Open PowerShell in the repository root (where `deploy-azure-fast.ps1` is located).
2. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-azure-fast.ps1
```

3. Follow prompts: provide resource group, location and an ACR name (must be globally unique). The script will:
   - Build `./backend` and `./frontend` images (the frontend is built with VITE args pointing to the backend URL constructed deterministically).
   - Create an Azure Resource Group (if missing).
   - Create an Azure Container Registry (ACR) and push both images.
   - Create an App Service plan and two Web Apps (backend and frontend) configured to pull images from ACR.

Notes & Caveats
- The ACR name must be globally unique and only lowercase letters and numbers.
- Frontend build bakes the API base URL during build time. The script uses an app name derived deterministically from your resource group and a timestamp so it can bake the correct API URL.
- If you prefer to deploy the frontend as static artifact to Azure Storage/Static Web App, tell me and I can provide that alternative.

Post-deploy checks
- Backend URL: `https://<resourceGroup>-backend-<tag>.azurewebsites.net`
- Frontend URL: `https://<resourceGroup>-frontend-<tag>.azurewebsites.net`
- Check logs: `az webapp log tail --name <appName> --resource-group <rg>`

If you want, I can:
- Add a GitHub Actions workflow to build/push and deploy on push.
- Switch to deploying backend as an App Service and frontend to Azure Static Web Apps (which is often cheaper and faster for static sites).
