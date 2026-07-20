# Awaz — Backend

Node.js + Express + MongoDB + Cloudinary API for the Awaz open-journalism app.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

1. **MONGO_URI** — create a free MongoDB Atlas cluster, get the connection string, replace `<username>`, `<password>`, `<cluster>`.
2. **JWT_SECRET** — any long random string. Generate one:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **CLOUDINARY_*** — from your Cloudinary dashboard (cloudinary.com) → Account Details. Free tier gives you 25GB storage/bandwidth, matches the frontend's plan.

Run it:

```bash
npm run dev      # nodemon, auto-restarts on changes
npm start         # plain node, for production
```

Server boots on `http://localhost:5000`. Health check: `GET /api/health`.

## Folder structure

```
config/
  db.js              MongoDB connection
  cloudinary.js       Cloudinary SDK config
models/
  User.js            name, handle, email, password (hashed), avatar, followers/following
  Post.js             caption, video {url, publicId, duration}, geo (2dsphere), verdict, likes
  Comment.js           post ref, author, text
controllers/
  authController.js   signup, login, getMe
  postController.js    createPost (Cloudinary upload), getFeed, getNearby, like, share, report, delete
  commentController.js  add/get/delete comments
  userController.js     profile, avatar upload, follow/unfollow
routes/
  authRoutes.js, postRoutes.js, userRoutes.js, commentRoutes.js
middleware/
  auth.js            JWT verify, attaches req.user
  upload.js           multer temp-disk config (video 500MB cap, image 5MB cap)
  errorHandler.js      central error formatter
  notFound.js           404 handler
utils/
  asyncHandler.js    wraps async routes so errors reach errorHandler
  ApiError.js         custom error class with statusCode
  generateToken.js     signs JWT
uploads/tmp/         Temp video/image storage before streaming to Cloudinary (auto-cleaned after each upload)
server.js            App entry point
```

## How video upload works

1. Frontend sends `multipart/form-data` with the video file to `POST /api/posts`.
2. `multer` (`middleware/upload.js`) writes it to `uploads/tmp/` temporarily.
3. `postController.createPost` streams that temp file to Cloudinary (`resource_type: 'video'`), which transcodes it and generates a thumbnail frame.
4. The temp file is deleted (`fs.unlink`) whether the upload succeeds or fails — nothing sits on your server's disk.
5. The returned Cloudinary URL + `public_id` are saved on the `Post` document. `public_id` is kept so `deletePost` can also remove the asset from Cloudinary, not just MongoDB.

## API reference

All `Private` routes need `Authorization: Bearer <token>` header (token comes back from signup/login).

### Auth
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | `{ name, email, password }` |
| POST | `/api/auth/login` | Public | `{ email, password }` |
| GET | `/api/auth/me` | Private | — |

### Posts
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/posts?page=1&limit=10` | Private | Paginated feed, newest first |
| GET | `/api/posts/nearby?lng=..&lat=..&radiusKm=10` | Private | Geo-based discovery |
| POST | `/api/posts` | Private | `multipart/form-data`: `video` file + `caption`, `locationName`, `lng`, `lat` |
| GET | `/api/posts/:id` | Private | Single post |
| DELETE | `/api/posts/:id` | Private | Only the post's own reporter |
| PUT | `/api/posts/:id/like` | Private | Toggles like |
| PUT | `/api/posts/:id/share` | Private | Increments share count |
| POST | `/api/posts/:id/report` | Private | `{ reason }` — flags for moderation |

### Comments
| Method | Route | Access | Body |
|---|---|---|---|
| GET | `/api/posts/:id/comments?page=1` | Private | — |
| POST | `/api/posts/:id/comments` | Private | `{ text }` |
| DELETE | `/api/comments/:commentId` | Private | Only the comment's own author |

### Users
| Method | Route | Access | Body |
|---|---|---|---|
| GET | `/api/users/:handle` | Private | Public profile + their posts |
| PUT | `/api/users/me` | Private | `{ name, bio, location }` |
| PUT | `/api/users/me/avatar` | Private | `multipart/form-data`: `avatar` file |
| PUT | `/api/users/:id/follow` | Private | Toggles follow |

## Connecting the frontend

In `awaz-frontend`, replace the mock calls:
- `src/store/useAuthStore.js` → `axios.post('http://localhost:5000/api/auth/login', ...)` / `/signup`, store the returned `token` (e.g. in memory + `Authorization` header on your axios instance)
- `src/lib/mockData.js` usage in `Feed.jsx` / `Explore.jsx` → `axios.get('/api/posts')`
- `Upload.jsx` → build a `FormData` with the video file + fields, `axios.post('/api/posts', formData)`

Want me to wire that up next?
