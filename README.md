<div align="center">

# Animalession

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ShreyamMaity/Animalession)](https://github.com/ShreyamMaity/Animalession/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ShreyamMaity/Animalession)](https://github.com/ShreyamMaity/Animalession/network)

**A visual knowledge workspace with AI-powered artifact generation**

Navigate your ideas on an interactive canvas. Create nodes, connect them with edges, and generate interactive HTML artifacts using Claude.

</div>

---

## Features

- **Visual Knowledge Graph** - Explore and organize your ideas as nodes and edges on an interactive canvas
- **AI Artifact Generation** - Generate self-contained, interactive HTML artifacts from natural language prompts using Claude
- **Multi-User Auth** - Secure password-based authentication with per-user project isolation
- **Real-Time Workspace** - Drag, connect, and edit nodes with instant visual feedback
- **Multiple Node Types** - Text, Artifact, Link, Image, and Note nodes with customizable shapes and colors
- **Dark/Light Theme** - Full theme support with system preference detection
- **Fullscreen Artifacts** - View generated artifacts in an immersive fullscreen iframe viewer

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Canvas | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma 7](https://www.prisma.io/) |
| Auth | [NextAuth.js v5](https://authjs.dev/) |
| AI | [Anthropic Claude API](https://docs.anthropic.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| State | [Zustand](https://zustand.docs.pmnd.rs/) + [SWR](https://swr.vercel.app/) |

## Prerequisites

- **Node.js** >= 20.19
- **PostgreSQL** 16+ (or Docker)
- **Anthropic API key** (for AI features)

## Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/ShreyamMaity/Animalession.git
   cd Animalession
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values (see [Environment Variables](#environment-variables)).

4. **Start the database** (if using Docker)

   ```bash
   docker compose up db -d
   ```

5. **Run migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and create an account.

## Docker Deployment

Run the full stack with Docker Compose:

```bash
# Set required environment variables
cp .env.example .env
# Edit .env with production values

docker compose up -d
```

This starts both PostgreSQL and the Next.js app. The app auto-runs migrations on startup.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `POSTGRES_PASSWORD` | Database password (Docker Compose) | Yes |
| `AUTH_SECRET` | NextAuth secret (`openssl rand -base64 32`) | Yes |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI generation | Yes |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & signup pages
│   ├── (dashboard)/         # Dashboard with project grid
│   ├── projects/[id]/       # Workspace
│   └── api/                 # REST API routes
├── components/
│   ├── workspace/           # R3F canvas, scene, nodes, edges
│   ├── panels/              # Node editor, preview, AI, search
│   ├── dashboard/           # Project grid, topbar
│   ├── artifact/            # Iframe & fullscreen viewer
│   └── ui/                  # shadcn/ui components
├── lib/                     # DB, auth, validators, constants
├── services/                # Database service layer
├── stores/                  # Zustand state management
└── types/                   # TypeScript type definitions
```

## License

Licensed under the [Apache License 2.0](LICENSE).
