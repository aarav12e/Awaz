# Awaz

Awaz is a social-style media app with a modern frontend experience and a backend API foundation. The project includes:

- Frontend: Vite + React + Tailwind + DaisyUI
- Backend: Node.js + Express + MongoDB
- Auth, posts, comments, users, and media upload support

## Project Structure

- awaz-frontend/ - React/Vite frontend
- awaz-backend/ - Node/Express backend

## Getting Started

### Frontend

```bash
cd awaz-frontend
npm install
npm run dev
```

### Backend

```bash
cd awaz-backend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend folder with values such as:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secret_key
```

## Notes

- The frontend currently uses mock/demo data for parts of the UI experience.
- The backend is ready for expansion with auth, posts, comments, and media handling.

this is underprocess
