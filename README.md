# NexNews Portal

A modern full-stack news portal built with **Next.js**, designed for publishing, managing, and browsing news content through a clean public-facing website and a powerful admin dashboard.

## Overview

NexNews Portal is a newsroom-style content platform where visitors can read published news articles by category and slug-based URLs, while admins, editors, and reporters can manage content from a dedicated dashboard. The project includes article listing, article details pages, category browsing, recent and related news sections, role-based admin controls, and a moderated comment system. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

## Features

### Public Website

- Browse all published news articles
- Search news by keyword
- Filter news by category
- SEO-friendly slug-based news details pages
- Related stories and latest updates sidebar
- Reader comment section with moderation flow
- Share and save UI on article details page

### Admin Dashboard

- Role-based access for:
  - `super_admin`
  - `admin`
  - `editor`
  - `reporter`
- Manage news, categories, and users
- Dashboard statistics:
  - total news
  - published news
  - draft news
  - unpublished news
  - total categories
  - total users
- Recent post overview
- Comment moderation panel
- Comment enable/disable setting

### Comment System

- Comment form on news details page
- Approved comments displayed publicly
- New comments submitted as pending
- Admin can approve, reject, or delete comments
- Global comments toggle support

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Database:** MongoDB
- **ODM:** Mongoose

## Project Structure

```bash
app/
  (frontend)/
    news/
      [slug]/page.tsx
      page.tsx
    category/
      [slug]/page.tsx
  api/
    comments/
    admin/
      comments/
      settings/
components/
  frontend/
    CommentSection.tsx
    NewsCard.tsx
  ui/
lib/
  db.ts
  auth-user.ts
  site-settings.ts
models/
  News.ts
  Category.ts
  User.ts
  Comment.ts
  SiteSetting.ts
```
