# Frontend (FE)

## Folder scope
- Static HTML pages in `views`
- Static assets in `public`
- Shared JS components in `js`
- Runtime HTML components in `views/component`

## Deploy target
- Upload this folder to S3 (static website hosting) or serve via CloudFront + S3.
- Do not deploy backend files to S3.

## API/Socket runtime config
Edit `public/config.js` before deploying:
- `deployApiBaseUrl`
- `deploySocketBaseUrl`

Example:
```js
const deployApiBaseUrl = "https://api.your-domain.com/api";
const deploySocketBaseUrl = "https://api.your-domain.com";
```

## Notes
- FE pages already use normalized paths like `../public/...` and `../js/...`.
- Socket client script is loaded from CDN, no dependency on local `/socket.io` script URL.
