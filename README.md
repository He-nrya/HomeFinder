# HomeFinder — full-stack (React + Tailwind · Node/Express · MongoDB · Socket.io)

```
backend/   Express API, JWT auth, Cloudinary uploads, Socket.io chat, admin routes, seed script
frontend/  React (Vite) + Tailwind, Google Maps, framer-motion animations
render.yaml  Render blueprint for the API
```

## Run locally
```bash
# 1) API
cd backend && cp .env.example .env     # fill MONGODB_URI, JWT_SECRET, Cloudinary keys
npm install && npm run seed && npm run dev      # seed creates the admin + 12 sample listings

# 2) Web
cd ../frontend && cp .env.example .env # VITE_API_URL=http://localhost:5000, VITE_GOOGLE_MAPS_KEY=...
npm install && npm run dev             # http://localhost:5173
```
Admin login = `ADMIN_EMAIL` / `ADMIN_PASSWORD` from backend/.env (change the password!).

## Deploy on Render
1. **MongoDB Atlas** – create a cluster and database user, then copy the connection string. Render's outbound IPs may require Atlas network access `0.0.0.0/0`; use a strong database password and restrict access further if you have fixed egress IPs.
2. **Cloudinary and Brevo** – gather the Cloudinary cloud name, API key, and API secret, plus a Brevo API key and verified sender address. Enable the Google Maps JavaScript API and create a browser key restricted to your deployed frontend domain.
3. **Render Blueprint** – choose **New → Blueprint** and connect this repository. `render.yaml` creates the `homefinder-api` Node web service and `homefinder-frontend` static site. The frontend gets the API's public URL from Render automatically. Enter the requested MongoDB, admin, Cloudinary, email, and Google Maps values when prompted; Render generates `JWT_SECRET`.
4. After the frontend deploys, copy its `https://...onrender.com` URL into the API service's `CLIENT_URL` and `FRONTEND_URL` environment variables, then redeploy the API. These origins enable browser API calls and email links.
5. Run `npm run seed` once from the API service's Render Shell to create the admin account and sample listings. The `ADMIN_EMAIL` and `ADMIN_PASSWORD` values are the credentials you entered for the Blueprint.

The API may sleep after inactivity on a free web-service plan, so its first request can be delayed and Socket.io clients may need to reconnect. The static frontend stays served from Render's CDN. Socket.io chat works because the API runs as a long-lived Render web service.

## API
| Method | Route | Notes |
|---|---|---|
| POST | /api/auth/signup, /login | returns `{token,user}` |
| GET | /api/auth/me · PUT /api/auth/me | |
| GET | /api/properties | filters: category,type,q,minPrice,maxPrice,bedrooms,university,sort,page,limit |
| GET | /api/properties/:id | increments views |
| POST | /api/properties | multipart, field `images` (≤8) — pending until approved (or `AUTO_APPROVE=true`) |
| PUT/DELETE | /api/properties/:id | owner or admin |
| POST | /api/properties/:id/favorite | toggle save |
| GET | /api/properties/mine, /favorites | |
| GET | /api/chat/inbox, /api/chat/:room | room = `propertyId:enquirerId` |
| * | /api/admin/stats, /users, /properties | admin only (approve, reject, verify, feature, block, delete) |

Socket.io events: `join(room)`, `message({room,text})`, `typing({room})`.

## Notes
- Free Render instances sleep; the first request after idle takes ~30s.
- Notification bell in the navbar is still static sample content.
- Google sign-in button is a placeholder.
