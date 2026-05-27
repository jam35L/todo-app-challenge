/**
 * Runtime configuration for the app.
 *
 * `apiBaseUrl` points at the .NET backend. The backend is configured to listen on
 * http://localhost:5080 (see backend README), and all endpoints live under /api.
 */
export const environment = {
  apiBaseUrl: 'http://localhost:5080/api',
};
