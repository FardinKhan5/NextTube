# 🎥 NextTube – Modern Video Sharing Platform

NextTube is a modern **video sharing platform inspired by YouTube**, built with **Next.js, TypeScript, ShadCN UI, and Appwrite**.  
The platform allows users to upload, browse, and watch videos through a responsive and clean user interface.

This project demonstrates **modern full-stack frontend architecture** using the latest Next.js ecosystem and backend services powered by Appwrite.

---

## 🚀 Live Demo

🔗 https://next-tube-fardin-khan.vercel.app/

---

## ✨ Features

- 🔐 User Authentication (Appwrite Auth)
- 📤 Video Upload System
- 🎬 Video Playback
- 📜 Infinite Scrolling Video Feed
- 👤 User Profiles
- 🌙 Dark / Light Theme
- ⚡ Fast UI with Next.js App Router
- 📱 Fully Responsive Design
- 🧩 Modern UI using ShadCN & Radix UI

---

## 🏗️ Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI
- Radix UI
- React Hook Form
- Zod Validation

### Backend Services
- Appwrite (Authentication, Database, Storage)

### Deployment
- Vercel

---

## 📂 Project Structure
```
NextTube
│
├── app/ # Next.js App Router pages
├── components/ # Reusable UI components
├── features/ # Feature based modules
├── hooks/ # Custom React hooks
├── lib/ # Utilities and configurations
├── services/ # Appwrite service functions
├── types/ # TypeScript types
└── public/ # Static assets
```
---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/fardinkhan5/NextTube.git
cd NextTube
npm install
npm run dev
http://localhost:3000
```
🔑 Environment Variables
Create a .env.local file in the root directory.
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_BUCKET_ID=
```
🚀 Deployment
The project is deployed using Vercel.
To deploy your own version:
```bash
npm run build
```
👨‍💻 Author
Fardin Khan
GitHub: https://github.com/fardinkhan5
LinkedIn: https://linkedin.com/in/fardin-khan-93a7a7229
