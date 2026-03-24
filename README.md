# Marketly

Marketly is a full-stack marketplace app where users can list products, browse by category, chat in real time, and manage purchases.

## What it includes

- Product listing, editing, search, and category browsing
- Authentication (NextAuth + JWT flow)
- Real-time buyer/seller chat (Socket.io)
- Cart
- User settings and profile pages

## Tech stack

- Next.js (App Router)
- React + TypeScript
- tRPC
- PostgreSQL + Drizzle ORM
- Tailwind CSS + shadcn/ui
- Socket.io
- UploadThing

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```env
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
UPLOADTHING_SECRET=your-uploadthing-secret
NEXT_PUBLIC_UPLOADTHING_APP_ID=your-uploadthing-app-id
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
```

3. Apply database schema:

```bash
npm run db:push
```

4. Start the app:

```bash
npm run dev
```

## Project map

src/app          Next.js routes and pages
src/components   UI and feature components
src/server       API, auth, DB, socket server code
src/trpc         tRPC client/server wiring
drizzle          SQL migrations
public           Static assets