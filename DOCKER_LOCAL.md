# Local Docker Run

## 1. Prepare env files

Copy the examples:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.local.example frontend\.env.local
```

You can keep the default local values as-is for the first run.

## 2. Start everything

From the repository root:

```powershell
docker compose up --build
```

## 3. Open the app

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- pgAdmin: `http://localhost:5050`

### pgAdmin login

- Email: `admin@example.com`
- Password: `admin`

### Add the Postgres server in pgAdmin

Use these connection settings:

- Host: `db`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `postgres`

## 4. Stop containers

```powershell
docker compose down
```

To also remove the database volume:

```powershell
docker compose down -v
```

## Notes

- Frontend uses `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` for the browser.
- Frontend uses `BACKEND_URL=http://backend:8000` for server-side requests inside Docker.
- For homepage/gallery assets stored in R2, set `NEXT_PUBLIC_MEDIA_BASE_URL` in `frontend/.env.local`.
- For admin image upload and public media URLs, set the `R2_*` variables in `backend/.env`.
- Backend waits for Postgres via `depends_on` + healthcheck.
