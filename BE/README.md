# Backend (BE)

## Folder scope
- API server, worker, queue consumer, models, services, routes, middlewares.
- Do not upload this folder to S3.

## Run locally
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies from repository root:
   - `npm install`
3. Start API:
   - `npm run start`
4. Start worker (optional, second terminal):
   - `npm run worker`

## AWS target
- Deploy to EC2/ECS/App Runner/Lambda container.
- Store sensitive values in AWS Secrets Manager or SSM Parameter Store.
- Set `FRONTEND_BASE_URL` to your FE domain.
- Set `CORS_ORIGINS` to FE domain(s), for example:
  - `https://your-frontend-domain`
