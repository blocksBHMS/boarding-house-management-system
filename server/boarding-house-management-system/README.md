# Server Infrastructure & Deployment: BHMS Architecture

This outlines the infrastructure setup, host machine configuration, and automated container deployment workflow for running the BHMS full-stack architecture on Microsoft Azure.

---

## 1. Microsft Azure Cloud Infrastructure Specification

The application runs on a lightweight, burstable Linux compute node sized to support a multi-container Docker environment:

- **Resource Group:** `backendbhms_group`
- **Virtual Machine Name:** `backendbhms`
- **Operating System:** Ubuntu Server 24.04 LTS (x64)
- **Instance Size:** `Standard_B2als_v2` (2 vCPUs, 4 GiB Memory)
- **OS Disk Type:** `StandardSSD_LRS` *(Managed, with "Delete OS disk with VM" enabled)*
- **Availability Options:** No infrastructure redundancy required *(Recommended for single-instance free tier/low-cost setup)*
- **Region Allocation:** `East Asia`

### Network Security Group (NSG) Rules
The firewall must explicitly permit the following **Inbound Port Rules** for secure remote management and tunneling:

| Priority | Source | Source Port | Destination Port | Protocol | Action | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1000 | Any | Any | `22` | TCP | Allow | Secure SSH Management |

*(Note: Public HTTP/HTTPS traffic is handled securely via Cloudflare Tunnels (`cloudflared`), meaning raw application ports like 5000 or 8000 do not need to be opened directly in the Azure NSG firewall.)*

---

## 2. Architecture & Memory Strategy

With **4 GiB of RAM** (`Standard_B2als_v2`), the host comfortably manages the entire containerized application stack using Docker Compose under a unified deployment model:

- **Frontend & Reverse Proxy (`web` / Nginx):** Serves the compiled Vue.js Single Page Application (SPA) and handles internal request routing.
- **Backend API (`backend` / Django & DRF):** Runs as a headless JSON API server container on port 8080 internally. Nginx proxies all `/api/` traffic directly to this container across the internal Docker network.
- **Database (`db` / PostgreSQL 16-alpine):** Runs locally inside an isolated container backed by a persistent Docker volume (`pgdata`) with automated health checks (`pg_isready`).

## 3. Cloudflare Tunnel Ingress Configuration
Public traffic ingress is secured and managed entirely through Cloudflare Zero Trust without exposing raw server ports to the internet:
- **SSL/TLS Termination:** Cloudflare handles public HTTPS certificates at the edge.
- **Outbound Tunnel (`cloudflared`):** Operates as a secure background daemon on the Azure host, routing public requests safely behind the scenes.
- **Public Hostname Mapping:** 
  - **Subdomain/Domain:** Configured via the Cloudflare Zero Trust Dashboard (`Networks -> Tunnels -> Public Hostname`).
  - **Service Type:** `HTTP`
  - **URL:** `localhost:5000` (pointing directly to the Nginx frontend container mapped port).
- **Internal API Proxying:** Nginx automatically routes any incoming `/api/` traffic internally to the Django backend container (`http://backend:8080`), removing the need for a separate public backend tunnel.

## 4. Automated CI/CD Pipeline
Deployments are fully automated via GitHub Actions (`Build, Push & Deploy` workflow):
1. **Build & Push:** Triggers on pushes to the `deployment` branch, building multi-container images tagged with the Git commit SHA and pushing them to Docker Hub.
2. **Sync & Run:** Automatically copies the strict-validated `docker-compose.yml` to the server via SCP, pulls the latest images, verifies environment secrets via `.env`, and executes zero-downtime container updates (`docker compose up -d --remove-orphans`).