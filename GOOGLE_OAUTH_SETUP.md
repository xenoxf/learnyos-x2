# 🔐 Guía de Configuración de Google OAuth

## 1. Crear Proyecto en Google Cloud Console

### Pasos:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto llamado "LearnYos"
3. Navega a **APIs & Services** > **Credentials**
4. Click en **Create Credentials** > **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Elige "External"
   - Completa la información de la app
   - Agrega los scopes: `profile` y `email`

## 2. Crear OAuth Client ID

1. En **Application type**, selecciona **Web application**
2. Nombre: "LearnYos Web"
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:3001
   https://tudominio.com (en producción)
   ```
4. Authorized redirect URIs:
   ```
   http://localhost:3001/api/auth/google/callback
   https://tudominio.com/api/auth/google/callback (en producción)
   ```
5. Click **Create**

## 3. Configurar Variables de Entorno

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_CALLBACK_URL=http://localhost:3000/auth/callback
```

## 4. Instalación de Dependencias

### Backend
```bash
npm install passport passport-google-oauth20 @nestjs/passport
npm install -D @types/passport-google-oauth20
```

### Frontend
```bash
# Ya incluido en el proyecto
# Script de Google Sign-In se carga automáticamente en providers.tsx
```

## 5. Flujo de Autenticación

### Frontend:
1. Usuario hace click en "Continuar con Google"
2. Se abre popup de Google Sign-In
3. Usuario inicia sesión
4. Google retorna un código de autorización
5. Frontend envía código al backend (`POST /api/auth/google/callback`)
6. Backend intercambia código por token y crea/obtiene usuario
7. Backend retorna JWT token y datos de usuario
8. Frontend almacena token y redirige al dashboard

### Backend:
1. Recibe código de autorización del frontend
2. Intercambia código con Google OAuth por ID token
3. Verifica y decodifica ID token
4. Busca o crea usuario en BD
5. Genera JWT token
6. Retorna token y datos de usuario

## 6. Testing

### Local:
```bash
# Terminal 1: Backend
cd klerk
npm run start:dev

# Terminal 2: Frontend
cd learnyos-x2
npm run dev
```

1. Abre http://localhost:3000/auth
2. Haz click en "Continuar con Google"
3. Inicia sesión con tu cuenta Google
4. Deberías ser redirigido al dashboard

## 7. Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URL en `GOOGLE_CALLBACK_URL` coincida exactamente con la del Google Cloud Console

### Error: "Invalid client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos

### El popup no abre
- Asegúrate de que el script de Google Sign-In está cargado
- Verifica la consola del navegador para errores

### Token inválido
- Verifica que `GOOGLE_CLIENT_ID` es correcto
- El token tiene un tiempo de expiración, intenta de nuevo

## 8. Variables de Entorno Necesarias

| Variable | Frontend | Backend | Descripción |
|----------|----------|---------|-------------|
| GOOGLE_CLIENT_ID | ✅ | ✅ | ID del cliente OAuth |
| GOOGLE_CLIENT_SECRET | ❌ | ✅ | Secreto del cliente (NUNCA en frontend) |
| GOOGLE_CALLBACK_URL | ❌ | ✅ | URL callback del backend |
| FRONTEND_CALLBACK_URL | ❌ | ✅ | URL callback del frontend |
| NEXT_PUBLIC_API_URL | ✅ | ❌ | URL del API backend |

## 9. Endpoints API

### GET `/api/auth/google/url`
Obtiene la URL de autorización de Google

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### POST `/api/auth/google/callback`
Procesa el callback de Google

**Body:**
```json
{
  "code": "authorization_code_from_google",
  "state": "optional_state_parameter"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "avatar_url",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST `/api/auth/google`
Autentica con ID token

**Body:**
```json
{
  "idToken": "google_id_token"
}
```

## 10. Seguridad

✅ Usar HTTPS en producción
✅ No exponer GOOGLE_CLIENT_SECRET en frontend
✅ Validar tokens en backend
✅ Usar CORS correctamente
✅ Implementar CSRF protection
✅ Usar sameSite cookies

## 11. Próximas Mejoras

- [ ] Refresh token rotation
- [ ] Social linking (conectar múltiples cuentas sociales)
- [ ] Provider-specific fields en BD
- [ ] Rate limiting en endpoints de auth
