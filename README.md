# 🚀 Smart Bookmark App

A full-stack bookmark manager built with **Next.js + Supabase**.  
Save, organize, and manage your bookmarks securely with authentication and Row Level Security (RLS).

---

## ✨ Features

- 🔐 Google Authentication (Supabase Auth)
- 🗂️ User-specific bookmarks (RLS protected)
- ➕ Add bookmarks
- ❌ Delete bookmarks
- 👤 Secure account deletion
- 🛡️ Database-level user isolation

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Next.js API Routes
- **Database & Auth:** Supabase
- **Deployment:** Vercel
- **Language:** JavaScript

---

## 📦 Installation

Clone the repository

## Install dependencies

npm install

## Create a .env.local file in the root directory
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key


## create table

create table bookmarks(
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  created_at timestamp default now(),
  user_id uuid references auth.users(id) on delete cascade
)

## Enable Row Level Security (RLS)

CREATE POLICY "Users can view their own bookmarks"
ON bookmarks
FOR SELECT
USING (auth.uid() = user_id);


CREATE POLICY "Users can insert their own bookmarks"
ON bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks
FOR DELETE
USING (auth.uid() = user_id);


## Run Locally
npm run dev

