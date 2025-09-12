# 🌌 Cloud SkyShare

[![CI](https://github.com/Hasnain-Azam/Cloud-SkyShare/actions/workflows/docker-build.yml/badge.svg)](https://github.com/Hasnain-Azam/Cloud-SkyShare/actions)

## Features
- Upload files with expiring, password-protected download links  
- JWT authentication with register/login flow  
- Download limits (e.g., max 3 downloads per link)  
- Responsive frontend built with Tailwind CSS  

## 🖥️ Visuals
<p align="center">
  <img src="docs/screenshots/dashboard.png" width="520"/>
  <img src="docs/screenshots/login.png" width="500"/>
</p>

##  Tech Stack
- **Frontend:** React + Vite + Tailwind  
- **Backend:** Node.js + Express + JWT auth  
- **Database:** PostgreSQL  
- **Containerization:** Docker + Compose  
- **CI/CD:** GitHub Actions → publishes Docker images to GHCR  

## How to use:
```bash
# start backend + frontend in production mode
docker compose -f docker-compose.prod.yml up --build
