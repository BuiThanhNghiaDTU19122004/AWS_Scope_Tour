(function () {
	const appConfig = window.APP_CONFIG || {};
	const defaultApiBaseUrl = "http://localhost:3000/api";
	const defaultSocketBaseUrl = "http://localhost:3000";

	window.APP_CONFIG = {
		API_BASE_URL: appConfig.API_BASE_URL || window.BASE_URL || defaultApiBaseUrl,
		SOCKET_BASE_URL: appConfig.SOCKET_BASE_URL || window.SOCKET_URL || defaultSocketBaseUrl,
	};

	// Backward compatibility with existing scripts.
	window.BASE_URL = window.APP_CONFIG.API_BASE_URL;
	window.SOCKET_URL = window.APP_CONFIG.SOCKET_BASE_URL;
})();