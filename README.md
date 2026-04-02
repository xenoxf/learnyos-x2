# 🚀 LearnyOS - Plataforma de Estudio con IA

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)]()
[![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)]()

LearnyOS es una plataforma educativa impulsada por inteligencia artificial que te ayuda a estudiar de forma más eficiente con herramientas como quizzes, flashcards, notas automáticas y chat inteligente.

---

## ✨ Características Principales

-  **Chat con IA** - Preguntas y respuestas inteligentes adaptadas a tu nivel
- 📝 **Quizzes Personalizados** - Genera cuestionarios sobre cualquier tema
- 🎴 **Flashcards Inteligentes** - Sistema de repaso espaciado para mejor retención
- 📚 **Notas Automáticas** - Convierte contenido en notas estructuradas
- 🌐 **Traductor Contextual** - Traduce manteniendo el significado
- 📊 **Seguimiento de Progreso** - Métricas y estadísticas de tu aprendizaje

---

## 🏗️ Arquitectura del Proyecto

```
kire/
├── learnyos-x2/          # Frontend (Next.js 14 + TypeScript)
│   ├── app/             # App Router (React Server Components)
│   ├── components/      # Componentes reutilizables
│   ├── hooks/          # Custom React Hooks
│   ├── services/       # Servicios de API
│   ├── styles/         # CSS Modules
│   └── types/          # Tipos TypeScript
│
└── klerk/              # Backend (NestJS + TypeORM)
    ├── src/
    │   ├── auth/       # Autenticación (JWT, Google OAuth)
    │   ├── exams/      # Módulo de Quizzes
    │   ├── flash-cards/ # Módulo de Flashcards
    │   ├── notes/      # Módulo de Notas
    │   ├── messages/   # Módulo de Chat
    │   └── groq/       # Servicio de IA (Groq API)
    └── test/           # Tests E2E
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - React Framework con App Router
- **TypeScript** - Tipado estático
- **CSS Modules** - Estilos encapsulados
- **Lucide React** - Iconos
- **Radix UI** - Componentes accesibles

### Backend
- **NestJS 10** - Framework de Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Groq SDK** - IA (Llama/Mixtral)
- **Google OAuth** - Login con Google

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn
- API Key de Groq (opcional para IA)

### Instalación

#### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd kire
```

#### 2. Instalar dependencias

```bash
# Frontend
cd learnyos-x2
npm install

# Backend
cd ../klerk
npm install
```

#### 3. Configurar variables de entorno

**Backend (`klerk/.env`):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/learnyos"
JWT_SECRET="tu-secreto-super-seguro"
GROQ_API_KEY="tu-api-key-de-groq"
GOOGLE_CLIENT_ID="tu-client-id-de-google"
GOOGLE_CLIENT_SECRET="tu-client-secret-de-google"
API_KEY="tu-api-key-interna"
PORT=3001
```

**Frontend (`learnyos-x2/.env.local`):**
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
NEXT_BACKEND_API_KEY="tu-api-key-interna"
```

#### 4. Iniciar bases de datos

```bash
# PostgreSQL (ejemplo con Docker)
docker run --name learnyos-db \
  -e POSTGRES_USER=learnyos \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=learnyos \
  -p 5432:5432 \
  -d postgres:14
```

#### 5. Ejecutar migraciones (Backend)

```bash
cd klerk
npm run typeorm migration:run
```

#### 6. Iniciar la aplicación

```bash
# Terminal 1 - Backend
cd klerk
npm run start:dev

# Terminal 2 - Frontend
cd learnyos-x2
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📁 Guía de Imágenes

Para que la Landing Page se vea completa, necesitas agregar imágenes en la carpeta `/public`. 

**Consulta:** [`IMAGENES_README.md`](./IMAGENES_README.md) para instrucciones detalladas.

### Estructura requerida:

```
/public
├── landing/
│   └── hero-study.svg       # Ilustración principal del hero
└── tools/
    ├── quiz-preview.png     # Vista previa de Quizzes
    ├── flashcards-preview.png  # Vista previa de Flashcards
    ├── notes-preview.png    # Vista previa de Notas
    └── progress-preview.png # Vista previa de Progreso
```

---

## 🔑 Características de Autenticación

### Registro e Inicio de Sesión
- ✅ Email/Password local
- ✅ Google OAuth
- ✅ Modo invitado (sin registro)
- ✅ JWT con refresh tokens

### Seguridad
- ✅ Hash de contraseñas con bcrypt
- ✅ Rate limiting
- ✅ Helmet (security headers)
- ✅ Validación con class-validator

---

## 📚 Módulos Principales

### 1. Exams (Quizzes)
- Generación con IA desde temas o referencias
- Preguntas estilo ICFES/Saber 11
- Retroalimentación inmediata
- Opción público/privado

### 2. Flashcards
- Generación automática con IA
- Sistema de repaso espaciado
- Modo estudio (klek)
- Búsqueda inteligente

### 3. Notes
- Notas estructuradas con IA
- Formato Markdown
- Secciones múltiples
- Colaborativo (público/privado)

### 4. Messages (Chat)
- Chat con IA contextual
- Historial de conversaciones
- Personalidad del asistente
- Global chat (comunidad)

---

## 🧪 Testing

```bash
# Backend tests
cd klerk
npm run test

# E2E tests
npm run test:e2e

# Frontend tests
cd learnyos-x2
npm run test
```

---

## 📦 Build de Producción

```bash
# Backend
cd klerk
npm run build
npm run start:prod

# Frontend
cd learnyos-x2
npm run build
npm run start
```

---

##  Temas y Personalización

La aplicación soporta múltiples temas definidos en `globals.css`:

- **Light** (por defecto)
- **Dark**
- **Sakura** (rosa)
- **Ocean** (azul)
- **Forest** (verde)
- **Sunset** (púrpura)
- **Coffee** (marrón)

Los usuarios pueden cambiar el tema desde la interfaz.

---

## ♿ Accesibilidad

La aplicación sigue las mejores prácticas de accesibilidad:

- ✅ HTML semántico (header, main, footer, nav, section, article)
- ✅ Atributos ARIA (aria-label, aria-labelledby, aria-expanded, role)
- ✅ Iconos con aria-hidden o aria-label según corresponda
- ✅ Imágenes con atributo alt descriptivo
- ✅ Navegación por teclado
- ✅ Focus visible
- ✅ Contraste de colores WCAG AA

---

## 📱 Responsive Design

- **Mobile First** - Diseñado primero para móviles
- **Breakpoints:**
  - 360px - Móviles muy pequeños
  - 480px - Móviles estándar
  - 640px - Tablets pequeñas
  - 768px - Tablets
  - 1024px - Desktop
  - 1920px - Desktop grande

---

## 🔧 Scripts Disponibles

### Frontend (`learnyos-x2/package.json`)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Backend (`klerk/package.json`)
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint --fix",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es propiedad intelectual de LearnyOS. Todos los derechos reservados.

---

## 👥 Equipo

- **Desarrollo Fullstack** - LearnyOS Team
- **Diseño UI/UX** - LearnyOS Team
- **Arquitectura IA** - LearnyOS Team

---

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@learnyos.com
- 💬 Issues: GitHub Issues
- 📖 Documentación: /docs

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [NestJS](https://nestjs.com/) - Framework backend
- [Groq](https://groq.com/) - API de IA
- [Lucide Icons](https://lucide.dev/) - Iconos
- [Radix UI](https://www.radix-ui.com/) - Componentes

---

**Hecho con ❤️ para mejorar la educación**

*Última actualización: 2026-04-02*
