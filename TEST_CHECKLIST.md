# 🧪 Test Checklist - Google OAuth

## Pre-requisitos
- [ ] Node.js 18+
- [ ] MongoDB Aiven accesible
- [ ] Variables de entorno configuradas
- [ ] Google Cloud Console configurado con tus credenciales

## Backend Tests

### 1. Servidor levantado correctamente
```bash
cd klerk
npm run start:dev
```
- [ ] Puerto 2300 escuchando
- [ ] BD conectada
- [ ] No hay errores en consola

### 2. Endpoint de Google Auth URL
```bash
curl http://localhost:2300/auth/google/url
```
- [ ] Retorna JSON con `url` property
- [ ] URL contiene `client_id`, `redirect_uri`, `scope`
- [ ] No hay 404 o 500 errors

### 3. Endpoint de Login
```bash
curl -X POST http://localhost:2300/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
- [ ] Retorna `token` y `user`
- [ ] No hay errores de BD

## Frontend Tests

### 1. Frontend levantado
```bash
cd learnyos-x2
npm run dev
```
- [ ] http://localhost:3000 accesible
- [ ] No hay errores en consola

### 2. Página de Auth
```
Ir a: http://localhost:3000/auth
```
- [ ] Página carga correctamente
- [ ] Botón "Continuar con Google" visible
- [ ] Formulario de login/registro visible

### 3. Click en "Continuar con Google"
```
1. Click en "Continuar con Google"
```
- [ ] Se abre popup de Google Sign-In
- [ ] NO hay error en consola
- [ ] Popup es completamente funcional

### 4. Login con Google
```
1. En el popup, inicia sesión con tu cuenta Google
2. Acepta permisos
```
- [ ] Popup se cierra
- [ ] Se redirige a `/dashboard` (o `/auth/callback`)
- [ ] Token se almacena en localStorage
- [ ] NO hay error "Unauthorized"

### 5. Verificar localStorage
```javascript
// En consola del navegador:
localStorage.getItem('authToken')
localStorage.getItem('user')
```
- [ ] `authToken` contiene un JWT válido
- [ ] `user` contiene objeto con email, name, etc.

## Errores Comunes y Soluciones

### Error: "redirect_uri_mismatch"
**Causa**: `GOOGLE_REDIRECT_URI` en .env no coincide con Google Cloud Console
**Solución**: 
```env
# BACKEND .env
GOOGLE_REDIRECT_URI=http://localhost:2300/auth/google/callback

# Google Cloud Console - Authorized redirect URIs:
http://localhost:2300/auth/google/callback
```

### Error: "Invalid client"
**Causa**: `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` incorrecto
**Solución**: Verifica en Google Cloud Console que sean exactos

### Error: "Popup bloqueado"
**Causa**: Navegador bloqueó popup (sin user interaction)
**Solución**: El click debe ser directo en el botón, no setTimeout

### Error: "NEXT_PUBLIC_BACKEND_URL no definido"
**Causa**: `.env.local` no existe o mal nombrado
**Solución**:
```bash
# En learnyos-x2/
cp .env.local.example .env.local
# Editar con valores reales
```

### Error: "Connection refused 2300"
**Causa**: Backend no está corriendo
**Solución**:
```bash
cd klerk
npm run start:dev
```

### Error: "Cannot POST /auth/google/callback"
**Causa**: Endpoint no existe en backend
**Solución**: Verifica `auth.controller.ts` tiene `@Post('google/callback')`

## Test Manual Paso a Paso

### Flujo Completo
1. [ ] Abre http://localhost:3000/auth
2. [ ] Click en "Continuar con Google"
3. [ ] Se abre popup
4. [ ] Inicia sesión con Google
5. [ ] Aceptas permisos
6. [ ] Popup se cierra
7. [ ] Ves pantalla de loading
8. [ ] Eres redirigido a `/dashboard`
9. [ ] localStorage tiene `authToken`

### Verificar JWT Token
```javascript
// En consola:
const token = localStorage.getItem('authToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
// Debe mostrar: { sub: <user_id>, email: <email>, name: <name>, iat: ..., exp: ... }
```

### Verificar BD
En MongoDB (Aiven):
```javascript
db.user.findOne({ email: "tu_email_google@gmail.com" })
// Debe retornar usuario con googleId, avatar, etc.
```

## Performance Tests

### Tiempo de respuesta
```bash
# Medir tiempo de /auth/google/url
time curl http://localhost:2300/auth/google/url

# Debe ser < 100ms
```

### Carga de DB
```
- Conecta con múltiples cuentas Google
- Verifica que se crean usuarios correctamente
- Verifica que no hay duplicados si re-logeas con mismo Google Account
```

## Seguridad Tests

- [ ] Token se almacena en localStorage (no en cookies)
- [ ] Token tiene expiración (24h)
- [ ] `GOOGLE_CLIENT_SECRET` NO está en frontend .env
- [ ] URLs HTTPS en producción (no HTTP)

## Post-Deploy Tests

### En producción (Render)
1. [ ] Frontend: https://learny0s.vercel.app/auth
2. [ ] Backend: https://klerk.onrender.com/auth/google/url
3. [ ] Google Cloud Console actualizado con URLs de producción
4. [ ] Credentials correctas en Render environment variables

---

## ✅ Si todos los tests pasan
**¡Google OAuth está completamente funcional y listo para producción!**
