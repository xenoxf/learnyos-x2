/**
 * MAPEO DE VARIABLES .ENV
 * ========================
 * 
 * Este archivo documenta cómo se mapean las variables .env
 * a las variables usadas en el código del proyecto.
 * 
 * ⚠️  IMPORTANTE: Los nombres de las variables .env NO SE MODIFICAN
 * Se usan exactamente como están definidas en .env
 */

// ==================== MAPEO ACTUAL ====================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║         CONFIGURACIÓN DE VARIABLES DE ENTORNO             ║
╠═══════════════════════════════════════════════════════════╣
║ Backend URL:                                              ║
║   .env: NEXT_PUBLIC_BACKEND_URL                          ║
║   → Usado en: app/lib/env.ts (BACKEND_URL)               ║
║   → Usado en: app/services/apiService.ts                 ║
║                                                           ║
║ API Key (Backend):                                        ║
║   .env: NEXT_BACKEND_API_KEY                             ║
║   → Usado en: app/lib/env.ts (BACKEND_API_KEY)           ║
║   → Usado en: app/services/apiService.ts                 ║
║                                                           ║
║ Google Auth:                                              ║
║   .env: NEXT_PUBLIC_GOOGLE_CLIENT_ID                     ║
║   .env: VITE_GOOGLE_CLIENT_SECRET                        ║
║   .env: GOOGLE_REDIRECT_URI                              ║
║   → Usado en: app/lib/env.ts                             ║
║   → Usado en: components/GoogleAuthButton.tsx            ║
║                                                           ║
║ Frontend URLs:                                            ║
║   .env: NEXT_PUBLIC_APP_URL                              ║
║   .env: NEXT_PUBLIC_AUTH_CALLBACK_URL                    ║
║   → Usado en: app/lib/env.ts                             ║
║                                                           ║
║ App Info:                                                 ║
║   .env: VITE_APP_NAME                                    ║
║   .env: VITE_APP_VERSION                                 ║
║   .env: VITE_PORT                                        ║
║   → Usado en: app/lib/env.ts                             ║
╚═══════════════════════════════════════════════════════════╝
`);
