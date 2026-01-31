# ⚡ Quick Start - Google OAuth

## 5 minutos para tener Google OAuth funcionando

### Paso 1: Clonar/Verificar proyectos
```bash
# Asegúrate de tener ambos proyectos
ls -la ~/proyectos/klerk/
ls -la ~/proyectos/learnyos-x2/
```

### Paso 2: Instalar dependencias (2 min)
```bash
# Backend
cd ~/proyectos/klerk
npm install

# Frontend
cd ~/proyectos/learnyos-x2
npm install
```

### Paso 3: Configurar variables (1 min)
```bash
# Backend
cd ~/proyectos/klerk
cat > .env << 'EOF'
PORT=2300
NODE_ENV=development
DB_HOST=soledad-xenooxf-6a75.h.aivencloud.com
DB_PORT=27423
DB_USERNAME=avnadmin
DB_PASSWORD=AVNS_yyZ4ehizBqlMSfmMQO0
DB_NAME=defaultdb
JWT_SECRET=dghsfasiguyraserbaskldgitery0rweññlweñrlñwerñlwerlef
GOOGLE_CLIENT_ID=930272373086-o0ujcuvsabucod6rlc1ddguhe1211epr.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:2300/auth/google/callback
FRONTEND_URL=http://localhost:3000
FRONTEND_CALLBACK_URL=http://localhost:3000/auth/callback
GROQ_API_KEY=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
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=xenooxf@gmail.com
MAIL_PASS=plataoplomo
BACKEND_URL=http://localhost:2300
SSL=true
API_KEY=HFUIHFIQWERFBWEQPFXGUBdbejwbp8edh384r545fmsplpññhymffjodsp
EOF

# Frontend
cd ~/proyectos/learnyos-x2
cat > .env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:2300
NEXT_PUBLIC_GOOGLE_CLIENT_ID=930272373086-o0ujcuvsabucod6rlc1ddguhe1211epr.apps.googleusercontent.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
EOF
```

### Paso 4: Ejecutar en paralelo (2 min)
```bash
# Terminal 1: Backend
cd ~/proyectos/klerk
npm run start:dev

# Terminal 2: Frontend
cd ~/proyectos/learnyos-x2
npm run dev

# Terminal 3: Test (opcional)
curl http://localhost:2300/auth/google/url
```

### Paso 5: Probar
```
1. Abre http://localhost:3000/auth en navegador
2. Haz click en "Continuar con Google"
3. Se abre popup de Google
4. Inicia sesión con tu cuenta Google
5. ¡Deberías ver el dashboard! 🎉
```

---

## ✅ Verificación Rápida

```bash
# ¿Está backend corriendo?
curl http://localhost:2300/auth/google/url
# Debe retornar: {"url":"https://accounts.google.com/o/oauth2/v2/auth?..."}

# ¿Está frontend corriendo?
curl http://localhost:3000
# Debe retornar HTML del sitio

# ¿Está DB conectada?
# Verifica logs de backend - debe decir "Database connected"
```

---

## 🐛 Si algo no funciona

### Backend no inicia
```bash
# Verificar Node.js
node --version  # Debe ser v18+

# Verificar puerto 2300 no está en uso
lsof -i :2300
# Si hay algo, mata el proceso: kill -9 <PID>

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Frontend no inicia
```bash
# Verificar puerto 3000
lsof -i :3000

# Verificar .env.local existe
cat .env.local

# Reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Google Auth no funciona
```bash
# Verificar credenciales en .env
cat klerk/.env | grep GOOGLE

# Verificar que Google Cloud Console tiene:
# - Authorized redirect URIs: http://localhost:2300/auth/google/callback
# - Authorized JavaScript origins: http://localhost:3000

# Verificar navegador bloquea popups
# Settings -> Privacy -> Pop-ups -> Permitir localhost
```

### Error: "redirect_uri_mismatch"
```bash
# Verifica que coincide exactamente:
# .env GOOGLE_REDIRECT_URI=http://localhost:2300/auth/google/callback
# Google Cloud Console=http://localhost:2300/auth/google/callback
```

---

## 📚 Más Información

Para configuración avanzada y troubleshooting:
- `CONFIGURACION_FINAL.md` - Detalles completos
- `TEST_CHECKLIST.md` - Tests exhaustivos
- `IMPLEMENTACION_COMPLETA.md` - Documentación técnica

---

## 🎯 Success Criteria

Si ves esto, ✅ **Google OAuth funciona**:
1. Página de login con botón "Continuar con Google"
2. Click abre popup de Google
3. Después de login, eres redirigido a `/dashboard`
4. localStorage tiene `authToken`

¡Hecho! 🚀
