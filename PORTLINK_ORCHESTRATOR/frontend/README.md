# PortLink Orchestrator - Frontend

**Digital Twin Platform for Port Operations Management**

A modern, responsive React + TypeScript frontend application for managing port operations, ship schedules, tasks, assets, and real-time simulations.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)

---

## ✨ Features

### Core Functionality
- 🔐 **Authentication & Authorization** - JWT-based auth with RBAC
- 📊 **Dashboard** - Real-time KPIs and operational metrics
- 🚢 **Ship Visits Management** - Track vessel operations
- 📅 **Schedules & Tasks** - Gantt charts, Kanban boards
- 🏗️ **Assets Management** - Berths, cranes, yards, trucks
- ⚠️ **Conflicts Management** - Detect and resolve conflicts
- 🎮 **Simulation (What-If)** - Run scenarios and analyze impacts
- 📝 **Event Logs** - Comprehensive audit trail
- 🎨 **UI/UX Polish** - Responsive, light/dark mode, accessible

---

## 🛠 Technology Stack

- **React 18.3** + **TypeScript 5.6** + **Vite 6.0**
- **Redux Toolkit 2.5** - State management
- **Material-UI (MUI) 6.2** - Component library
- **React Hook Form 7.54** + **Yup 1.6** - Forms & validation
- **Recharts 2.15** + **react-big-calendar 1.15** - Charts & calendar
- **Socket.IO Client 4.8** - Real-time WebSocket
- **Axios 1.7** - HTTP client
- **date-fns 4.1** - Date utilities

---

## 📦 Prerequisites

- **Node.js** v20.x or higher
- **npm** v10.x or higher

```bash
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

---

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_APP_NAME=PortLink Orchestrator
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm run dev
```

App available at `http://localhost:5173`

---

## 💻 Development

### Workflow

1. Start: `npm run dev`
2. Edit: `src/` files
3. Hot reload: Changes reflect automatically
4. Fix: TypeScript/ESLint errors
5. Test: Verify features
6. Commit: `git commit -m "message"`

### Code Standards

- TypeScript strict mode, avoid `any`
- Functional components with hooks
- PascalCase components, camelCase functions
- Use `import type` for types
- MUI theme, no inline styles

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                 # API clients
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── charts/          # Chart components
│   │   ├── forms/           # Form components
│   │   └── layout/          # Layout components
│   ├── features/            # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── shipVisits/
│   │   ├── schedules/
│   │   ├── tasks/
│   │   ├── assets/
│   │   ├── conflicts/
│   │   ├── simulation/
│   │   └── eventLogs/
│   ├── hooks/               # Custom hooks
│   ├── store/               # Redux store
│   ├── theme/               # MUI theme
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   └── main.tsx             # Entry point
├── .env                     # Environment variables
├── package.json
└── vite.config.ts
```

---

## 📜 Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:3000` |
| `VITE_APP_NAME` | App name | `PortLink Orchestrator` |
| `VITE_APP_VERSION` | App version | `1.0.0` |

**Note**: Prefix all env vars with `VITE_`

---

## 📚 Documentation

- **[Development Guide](./DEVELOPMENT.md)** - Architecture, debugging
- **[User Guide](./USER_GUIDE.md)** - Feature walkthroughs
- **[API Integration](./API_INTEGRATION.md)** - API endpoints
- **[Testing Guide](./TESTING.md)** - Testing strategy

### Phase Documentation

- [Phase 5.1-5.9 Complete](../PHASE5.1_COMPLETE.md) - All phases

---

## 🐛 Troubleshooting

**Port 5173 in use:**
```bash
npx kill-port 5173
npm run dev
```

**Module errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection failed:**
```bash
# Check .env VITE_API_URL
# Ensure backend running
```

---

**PortLink Orchestrator Frontend - Built with ❤️ using React + TypeScript**
