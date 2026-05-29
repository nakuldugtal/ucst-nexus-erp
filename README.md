# UCST Nexus ERP

Modern full-stack university ERP scaffold for UCST College.

## Stack

- Next.js App Router frontend
- Express.js + MongoDB backend
- JWT auth with role-based access
- Dark SaaS-style dashboard UI

## Structure

- `src/app` - frontend routes and pages
- `src/components` - reusable UI and layout pieces
- `server` - REST API, models, middleware, and controllers

## Run

1. Copy `.env.example` to `.env.local` and `server/.env`.
2. Install dependencies with `npm install`.
3. Start both apps with `npm run dev`.

## Seeded Demo Access

The backend seeds one admin account and demo student accounts on startup when the MongoDB collection is empty.

- Admin: `UCST/ADMIN/001` / `Admin@12345!`
- Student: `UCST/BCA/401` / `BCA@12345`
- Student: `UCST/BMLT/202` / `BMLT@12345`
- Student: `UCST/BBA/303` / `BBA@12345`
- Student: `UCST/BMRIT/104` / `BMRIT@12345`

## Roles

- Student: login only, access personalized ERP modules
- Admin: hidden control center at `/ucst-core`
