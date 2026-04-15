# AWS FE/BE Split Checklist

## 1) What goes to FE (S3)
Copy/deploy only:
- `FE/views` (all HTML pages)
- `FE/views/component` (runtime fetched HTML fragments)
- `FE/public` (css, img, fonts, activity scripts)
- `FE/js` (shared client-side scripts)

## 2) What stays in BE (non-S3)
Deploy only backend runtime:
- `BE/src/server.js`
- `BE/src/queue_worker.js`
- `BE/src/config`
- `BE/src/controllers`
- `BE/src/routes`
- `BE/src/services`
- `BE/src/models`
- `BE/src/middlewares`
- `BE/src/utils`
- `BE/src/consumers`
- `BE/src/seeders`

## 3) Security and secrets
- Do not hardcode email/password/token secrets in source.
- Use environment variables and AWS Secrets Manager / SSM.
- Required env template: `BE/.env.example`.

## 4) Backend settings before release
- `FRONTEND_BASE_URL` must point to FE domain.
- `CORS_ORIGINS` must include FE domain(s).
- `PORT`, DB, Redis, RabbitMQ, email env must be set.

## 5) Frontend settings before release
- Update `FE/public/config.js` with production API and socket domain.
- In FE, all legacy `/src/public` and `/src/js` paths were normalized.
- `main.min.css` references were normalized to `../public/css/main.min.css`.

## 6) Invite flow checks
- Invitation route is mounted at `POST /api/invitation`.
- Invite links now use `FRONTEND_BASE_URL` and redirect to:
  - `/views/login.html?...` for existing users
  - `/views/signup.html?...` for new users
- Join redirect no longer points to missing `setup_password.html`.

## 7) Smoke test matrix
- Login page loads css/img without 404.
- Signup page can call BE API.
- Team list, subject list, task list can CRUD via BE.
- Socket real-time task updates work from FE domain.
- Invitation email link opens FE domain and join flow succeeds.
