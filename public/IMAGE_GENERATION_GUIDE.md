# 🖼️ Instrucciones para Generar Imágenes

## Imágenes Requeridas para SEO y PWA

### 1. OpenGraph Image (og-image.png)
- **Ubicación**: `/public/og-image.png`
- **Dimensiones**: 1200 x 630 px
- **Formato**: PNG
- **Uso**: Meta tag OpenGraph para redes sociales
- **Contenido sugerido**:
  - Logo de LearnYos
  - Texto: "LearnYos - Aprende más rápido con IA"
  - Subtítulo: "Plataforma de estudio con IA"
  - Colores corporativos

### 2. Twitter Card Image (twitter-image.png)
- **Ubicación**: `/public/twitter-image.png`
- **Dimensiones**: 1200 x 628 px (o 1200 x 675 px)
- **Formato**: PNG
- **Uso**: Twitter Card (summary_large_image)
- **Contenido sugerido**: Similar a OG image

### 3. Iconos PWA

#### Icono 192x192
- **Ubicación**: `/public/icon-192x192.png`
- **Dimensiones**: 192 x 192 px
- **Formato**: PNG
- **Uso**: Android Chrome, PWA

#### Icono 512x512
- **Ubicación**: `/public/icon-512x512.png`
- **Dimensiones**: 512 x 512 px
- **Formato**: PNG
- **Uso**: Android Chrome, PWA

#### Apple Touch Icon
- **Ubicación**: `/public/apple-touch-icon.png`
- **Dimensiones**: 180 x 180 px (mínimo)
- **Formato**: PNG
- **Uso**: iOS Safari, iPad

#### Favicon 16x16
- **Ubicación**: `/public/favicon-16x16.png`
- **Dimensiones**: 16 x 16 px
- **Formato**: PNG
- **Uso**: Favicon navegador

#### Favicon 32x32
- **Ubicación**: `/public/favicon-32x32.png`
- **Dimensiones**: 32 x 32 px
- **Formato**: PNG
- **Uso**: Favicon navegador

### 4. Screenshots para PWA

#### Screenshot Wide
- **Ubicación**: `/public/screenshot-wide.png`
- **Dimensiones**: 1280 x 720 px (mínimo)
- **Formato**: PNG
- **Uso**: Manifest.json para desktop
- **Contenido**: Captura del dashboard en vista desktop

#### Screenshot Narrow
- **Ubicación**: `/public/screenshot-narrow.png`
- **Dimensiones**: 750 x 1334 px (mínimo)
- **Formato**: PNG
- **Uso**: Manifest.json para móvil
- **Contenido**: Captura de la app en vista móvil

---

## 🛠️ Herramientas Recomendadas

### Generar Iconos desde un Logo
1. **Figma/Canva**: Diseña el icono base en 512x512
2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Sube tu icono 512x512
   - Genera todos los tamaños automáticamente
   - Descarga el paquete completo

### Generar OpenGraph Images
1. **Canva**: Plantillas predefinidas para OG images
2. **Figma**: Diseño personalizado
3. **Vercel OG**: Generación programática (opcional)

### Optimizar Imágenes
1. **TinyPNG**: https://tinypng.com/
2. **Squoosh**: https://squoosh.app/
3. **ImageOptim**: Para macOS

---

## ✅ Checklist de Verificación

- [ ] `/public/og-image.png` (1200x630)
- [ ] `/public/twitter-image.png` (1200x628)
- [ ] `/public/icon-192x192.png` (192x192)
- [ ] `/public/icon-512x512.png` (512x512)
- [ ] `/public/apple-touch-icon.png` (180x180)
- [ ] `/public/favicon-16x16.png` (16x16)
- [ ] `/public/favicon-32x32.png` (32x32)
- [ ] `/public/screenshot-wide.png` (1280x720)
- [ ] `/public/screenshot-narrow.png` (750x1334)
- [ ] `/public/favicon.ico` (48x48)

---

## 🎨 Sugerencias de Diseño

### Paleta de Colores LearnYos
- **Primary**: Usar variable CSS `--primary`
- **Background**: Usar variable CSS `--background`
- **Foreground**: Usar variable CSS `--foreground`

### Elementos a Incluir
1. **Logo**: "L" estilizada o logo completo
2. **Texto**: "LearnYos"
3. **Tagline**: "Aprende más rápido con IA"
4. **Elementos visuales**: Iconos de estudio (libros, quiz, flashcards)

### Estilo
- **Moderno**: Gradientes sutiles
- **Limpio**: Espacio en blanco
- **Profesional**: Tipografía sans-serif
- **Accesible**: Alto contraste

---

## 📌 Nota Importante

Actualmente el archivo `manifest.json` y los meta tags de OpenGraph referencian estas imágenes. 
Hasta que no se generen, las redes sociales y PWA no mostrarán imágenes preview.

**Prioridad**:
1. OG Image (para compartir en redes)
2. Iconos PWA (para instalar la app)
3. Screenshots (opcional, mejora la presentación)
