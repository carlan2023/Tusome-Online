# Deploying Tusome Online to DigitalOcean

Two parts: the React frontend (free) and the Django backend (cheap, not free — options below).

## Cost reality check (June 2026)

| Piece | Where | Cost |
|---|---|---|
| React frontend | DO App Platform static site | **Free** (up to 3 static apps, 1 GiB transfer/mo each) |
| Django backend | DO App Platform web service | ~$5/mo (smallest instance) |
| PostgreSQL | DO dev database | $7/mo |
| PostgreSQL (free alternative) | Neon.tech or Supabase free tier | **Free** |

**Fully free options:**
- New DO accounts get a **$200 / 60-day credit** — everything free for two months.
- Or: frontend free on DO + free Postgres on Neon + backend on a $5 instance (~$5/mo total).

---

## 0. Prerequisites

1. Push this project to GitHub (one repo with `Tusome/` and `backend/` folders is fine).
2. Make sure `backend/.env` is in `.gitignore` — never commit it.

## 1. Backend → App Platform web service

1. DO dashboard → **Create → App Platform** → pick your GitHub repo.
2. Set **Source Directory** to `/backend`. DO detects Python automatically.
3. **Run command:**
   ```
   gunicorn --worker-tmp-dir /dev/shm config.wsgi
   ```
4. **Environment variables** (App → Settings → Environment Variables):
   ```
   DEBUG=False
   SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_urlsafe(50))">
   ALLOWED_HOSTS=${APP_DOMAIN}
   DATABASE_URL=<from step 5>
   CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
   CSRF_TRUSTED_ORIGINS=https://${APP_DOMAIN}
   DJANGO_LOG_LEVEL=INFO
   ```
5. **Database:** either attach a DO dev database ($7/mo — DO injects `DATABASE_URL` automatically), or create a free Postgres at neon.tech and paste its connection string as `DATABASE_URL` (append `?sslmode=require`).
6. Add a **migrate** step — App → Settings → Components → add a *Pre-Deploy Job*:
   ```
   python manage.py migrate
   ```
7. Deploy. Your API will be at `https://<app-name>.ondigitalocean.app/api/auth/...`

## 2. Frontend → App Platform static site (free)

1. Same app (or a new one) → **Add Component → Static Site**, source directory `/Tusome`.
2. **Build command:** `npm run build` — **Output directory:** `dist`
3. **Environment variable (build-time):**
   ```
   VITE_API_URL=https://<your-backend-domain>/api
   ```
4. **SPA routing:** set **Catchall Document** to `index.html` (Settings → the static site component). Without this, refreshing `/login` returns 404.
5. Deploy. Update the backend's `CORS_ALLOWED_ORIGINS` with this site's final URL.

## 3. Test production before/after deploying

**Locally simulate production (backend):**
```bash
cd backend
# temporarily in .env: DEBUG=False, ALLOWED_HOSTS=localhost,127.0.0.1, SECURE_SSL_REDIRECT=False
python manage.py check --deploy        # security audit — fix warnings it lists
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py runserver             # then restore DEBUG=True for dev
```

**Locally simulate production (frontend):**
```bash
cd Tusome
npm run build && npm run preview       # serves the real dist/ build
```

**Smoke-test the live API:**
```bash
curl -X POST https://<backend>/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Smoke Test","email":"smoke@test.com","password":"Str0ngPass!23","role":"student"}'

curl -X POST https://<backend>/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"Str0ngPass!23"}'
```
Expect `201` then `200` with `access`/`refresh`/`user`. Then in the browser: register → auto-login → dashboard, and confirm a wrong password highlights the fields in red.

**Checklist before calling it done:**
- [ ] `check --deploy` shows no critical warnings
- [ ] Register/login work on the live site (no CORS errors in browser console)
- [ ] Refreshing `/login` and `/register` directly doesn't 404
- [ ] `DEBUG=False` — error pages don't leak stack traces
- [ ] Admin reachable at `/admin/` (create superuser via App Platform Console: `python manage.py createsuperuser`)
