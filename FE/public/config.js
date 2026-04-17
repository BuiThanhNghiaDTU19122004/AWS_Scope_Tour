(function () {
    const appConfig = window.APP_CONFIG || {};
    const isLocalHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    // Đã cập nhật DNS của AWS Application Load Balancer
    // Lưu ý: Tạm thời dùng http://, xem cảnh báo bên dưới
    const deployApiBaseUrl = "http://scopetour-alb-2062935477.ap-southeast-1.elb.amazonaws.com/api";
    const deploySocketBaseUrl = "http://scopetour-alb-2062935477.ap-southeast-1.elb.amazonaws.com";

    const defaultApiBaseUrl = isLocalHost
        ? "http://localhost:3000/api"
        : (deployApiBaseUrl || `${window.location.origin}/api`);
    const defaultSocketBaseUrl = isLocalHost
        ? "http://localhost:3000"
        : (deploySocketBaseUrl || window.location.origin);

    const normalizeUrl = (url) =>
        typeof url === "string" ? url.replace(/\/$/, "") : url;

    window.APP_CONFIG = {
        API_BASE_URL: normalizeUrl(
            appConfig.API_BASE_URL || window.BASE_URL || defaultApiBaseUrl
        ),
        SOCKET_BASE_URL: normalizeUrl(
            appConfig.SOCKET_BASE_URL || window.SOCKET_URL || defaultSocketBaseUrl
        ),
    };

    if (!isLocalHost && /localhost|127\.0\.0\.1/.test(window.APP_CONFIG.API_BASE_URL)) {
        console.warn(
            "[config.js] API_BASE_URL is localhost in a non-local environment. Update deployApiBaseUrl before deploying."
        );
    }

    // Backward compatibility with existing scripts.
    window.BASE_URL = window.APP_CONFIG.API_BASE_URL;
    window.SOCKET_URL = window.APP_CONFIG.SOCKET_BASE_URL;
})();