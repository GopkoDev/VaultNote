# VaultNote

A local-first Markdown note-taking app. Your notes stay on your machine — VaultNote is just a UI for reading and editing them.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)

## Features

- Rich Markdown editor (TipTap) with live preview
- File tree sidebar with drag-and-drop, rename, create, delete
- Full-text search across all notes
- Bookmarks
- Mermaid diagrams, code highlighting, tables, task lists
- Dark / light theme
- Auto-save (500ms debounce)
- Tabs with persistent state

## Tech Stack

| Layer    | Stack                                                          |
| -------- | -------------------------------------------------------------- |
| Frontend | React 19, Vite, TipTap, MobX, Tailwind CSS v4, shadcn/ui       |
| Backend  | Express.js, TypeScript                                         |
| Storage  | Local filesystem (`DOCS_ROOT`) + SQLite via Prisma (bookmarks) |

## Getting Started

**Requirements:** Node.js 18+, npm

```sh
git clone https://github.com/your-username/vaultnote.git
cd vaultnote
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

By default, notes are stored in the `./docs` folder at the repo root.

## Configuration

Create a `.env` file in the repo root:

```env
PORT=3001
DOCS_ROOT=./docs
CLIENT_URL=http://localhost:5173
```

The client reads `VITE_API_URL` (defaults to `http://localhost:3001`).

| Variable     | Default                 | Description                  |
| ------------ | ----------------------- | ---------------------------- |
| `PORT`       | `3001`                  | Server port                  |
| `DOCS_ROOT`  | `./docs`                | Path to your notes directory |
| `CLIENT_URL` | `http://localhost:5173` | Client origin for CORS       |

Point `DOCS_ROOT` at any existing folder of `.md` files to use VaultNote as a viewer/editor for it.

## Project Structure

```
vaultnote/
├── client/          # React + Vite SPA
│   └── src/
│       ├── api/     # Fetch wrappers
│       ├── components/
│       ├── store/   # MobX stores
│       └── views/
└── server/          # Express REST API
    └── src/
        ├── controllers/
        ├── middleware/
        └── routes/
```

## Commands

```sh
npm run dev           # Start server + client
npm run dev:server    # Server only
npm run dev:client    # Client only
npm run build         # Build both
npm run lint          # ESLint
npm run format        # Prettier
```

```sh
# Client only
cd client && npm run typecheck
```

## License

MIT
