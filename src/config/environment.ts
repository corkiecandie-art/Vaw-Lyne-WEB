export const ENVIRONMENT = {
  isProduction: !!(import.meta as any).env.PROD,
  isDevelopment: !!(import.meta as any).env.DEV,
  apiUrl: (import.meta as any).env.VITE_API_URL || 'http://localhost:3000',
  songlinkApiUrl: 'https://api.song.link/v1-alpha.1/links'
};
