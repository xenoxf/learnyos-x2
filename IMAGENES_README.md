# 📸 Guía de Imágenes para LearnyOS

Este archivo describe todas las imágenes que debes agregar a la carpeta `/public` del frontend para que la Landing Page y la aplicación se vean completas y profesionales.

---

## 🎨 Estructura de Carpetas

```
/public
├── landing/
│   └── hero-study.svg
├── tools/
│   ├── quiz-preview.png
│   ├── flashcards-preview.png
│   ├── notes-preview.png
│   └── progress-preview.png
└── features/
    ├── ai-chat.png
    ├── spaced-repetition.png
    └── smart-notes.png
```

---

## 📁 Carpetas y Archivos

### 1. `/public/landing/`

Imágenes principales de la página de inicio (Landing Page).

#### `hero-study.svg`
- **Dimensiones:** 500x400 px (mínimo)
- **Formato:** SVG (recomendado) o PNG con fondo transparente
- **Descripción:** Ilustración principal del hero section
- **Qué debe mostrar:**
  - Un/a estudiante usando laptop o dispositivo
  - Elementos flotantes relacionados con estudio (libros, lápices, gráficos)
  - Estilo moderno y amigable
  - Colores que combinen con la marca (puedes usar los colores del tema: primary, secondary)
  - Puede incluir iconos de las herramientas: quiz, flashcards, notas
- **Estilo recomendado:** Ilustración plana (flat design) o isométrica
- **Ejemplos de referencia:**
  - [undraw.co](https://undraw.co/) - Busca "study", "learning", "education"
  - [manyPixels](https://www.manypixels.co/gallery/) - Ilustraciones gratuitas

---

### 2. `/public/tools/`

Imágenes de vista previa de cada herramienta de estudio.

#### `quiz-preview.png`
- **Dimensiones:** 560x360 px (relación 16:9)
- **Formato:** PNG o WebP
- **Descripción:** Captura de pantalla del módulo de Quizzes
- **Qué debe mostrar:**
  - Una pregunta de quiz con 4 opciones de respuesta
  - Barra de progreso del quiz
  - Botones de navegación (anterior, siguiente)
  - Interfaz limpia y moderna
- **Sugerencia:** Usa una captura real de la app editada con un mockup de laptop/tablet

#### `flashcards-preview.png`
- **Dimensiones:** 560x360 px (relación 16:9)
- **Formato:** PNG o WebP
- **Descripción:** Captura de pantalla del módulo de Flashcards
- **Qué debe mostrar:**
  - Una tarjeta flashcard mostrando el frente
  - Indicación visual de que se puede voltear (flecha o ícono)
  - Contador de progreso (ej: "3/10")
  - Botones de "Lo sé" / "No lo sé" o similar
- **Sugerencia:** Muestra 2-3 tarjetas en perspectiva para dar profundidad

#### `notes-preview.png`
- **Dimensiones:** 560x360 px (relación 16:9)
- **Formato:** PNG o WebP
- **Descripción:** Captura de pantalla del módulo de Notas
- **Qué debe mostrar:**
  - Notas con formato markdown (títulos, listas, código)
  - Barra lateral con lista de notas/secciones
  - Editor de texto limpio
  - Posiblemente bloques de código resaltados
- **Sugerencia:** Incluye notas sobre un tema técnico (ej: "Machine Learning") para mostrar formato de código

#### `progress-preview.png`
- **Dimensiones:** 560x360 px (relación 16:9)
- **Formato:** PNG o WebP
- **Descripción:** Captura de pantalla del dashboard de progreso
- **Qué debe mostrar:**
  - Gráficos de barras o circulares con estadísticas
  - Métricas como: "Quizzes completados", "Tiempo de estudio", "Precisión"
  - Posiblemente un calendario de rachas (streaks)
  - Colores vibrantes para los gráficos
- **Sugerencia:** Usa gráficos reales de la app con datos de ejemplo

---

### 3. `/public/features/` (Opcional - para futura expansión)

Imágenes para la sección de características.

#### `ai-chat.png`
- **Dimensiones:** 400x300 px
- **Descripción:** Chat con IA respondiendo preguntas de estudio

#### `spaced-repetition.png`
- **Dimensiones:** 400x300 px
- **Descripción:** Calendario o gráfico mostrando repaso espaciado

#### `smart-notes.png`
- **Dimensiones:** 400x300 px
- **Descripción:** Notas generadas automáticamente con IA

---

## 🎨 Lineamientos de Diseño

### Colores
Usa los colores de la marca que están definidos en `globals.css`:
- **Primary:** `hsl(var(--primary))` - Color principal
- **Secondary:** `hsl(var(--secondary))` - Color secundario
- **Accent:** `hsl(var(--accent))` - Color de acento
- **Background:** `hsl(var(--background))` - Fondos

### Estilo Visual
- **Moderno y limpio:** Evita elementos sobrecargados
- **Accesible:** Buen contraste entre texto y fondo
- **Consistente:** Mismo estilo en todas las imágenes
- **Responsive:** Las imágenes deben verse bien en móvil y desktop

### Optimización
- **Comprime las imágenes:** Usa herramientas como [TinyPNG](https://tinypng.com/) o [Squoosh](https://squoosh.app/)
- **Formato recomendado:** WebP para mejor compresión, PNG para transparencia, SVG para ilustraciones
- **Peso máximo:** 200KB por imagen (idealmente < 100KB)

---

## 🛠️ Recursos Gratuitos

### Ilustraciones
- [unDraw](https://undraw.co/) - Ilustraciones SVG gratuitas
- [ManyPixels](https://www.manypixels.co/gallery/) - Ilustraciones gratuitas
- [Humaaans](https://www.humaaans.com/) - Personas ilustradas
- [Open Peeps](https://www.openpeeps.com/) - Ilustraciones de personas

### Mockups
- [Mockup World](https://www.mockupworld.co/) - Mockups gratuitos
- [Unsplash](https://unsplash.com/) - Fotos de stock gratuitas
- [Pexels](https://www.pexels.com/) - Fotos y videos gratuitos

### Herramientas de Edición
- [Figma](https://figma.com/) - Diseño de interfaces (gratis)
- [Canva](https://canva.com/) - Diseño gráfico fácil
- [Photopea](https://photopea.com/) - Photoshop online gratis

---

## 📝 Notas Importantes

1. **Todas las imágenes deben tener fondo transparente** (PNG o SVG) para integrarse bien con los temas claro/oscuro.

2. **Las capturas de pantalla** deben ser de la aplicación real, preferiblemente con datos de ejemplo en español.

3. **Los nombres de archivo** deben ser exactamente como se especifica (en minúsculas, con guiones).

4. **Después de agregar las imágenes**, ejecuta `npm run build` para verificar que todo compile correctamente.

5. **Si no tienes las imágenes inmediatamente**, el código usará placeholders (espacios vacíos) que no romperán la app.

---

## ✅ Checklist

- [ ] `/public/landing/hero-study.svg`
- [ ] `/public/tools/quiz-preview.png`
- [ ] `/public/tools/flashcards-preview.png`
- [ ] `/public/tools/notes-preview.png`
- [ ] `/public/tools/progress-preview.png`
- [ ] Todas las imágenes están optimizadas (< 200KB)
- [ ] Las imágenes tienen buen contraste en tema claro y oscuro
- [ ] El build de Next.js se ejecuta sin errores

---

## 🤝 Soporte

Si tienes dudas sobre las especificaciones o necesitas ayuda con las imágenes, consulta la documentación de Next.js Image:
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)

---

**Última actualización:** 2026-04-02
**Versión:** 1.0
