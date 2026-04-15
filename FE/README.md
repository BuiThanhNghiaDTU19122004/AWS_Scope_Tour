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
- `window.APP_CONFIG.API_BASE_URL`
- `window.APP_CONFIG.SOCKET_BASE_URL`

Example:
```js
window.APP_CONFIG = {
    API_BASE_URL: "https://api.your-domain.com/api",
    SOCKET_BASE_URL: "https://api.your-domain.com"
};
```

## Notes
- FE pages already use normalized paths like `../public/...` and `../js/...`.
- Socket client script is loaded from CDN, no dependency on local `/socket.io` script URL.
