# 📐 Guía de Layout y CSS del Dashboard

## Estructura Visual

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR        │  HEADER                      │
│  (240px / 80px) │  (64px altura)               │
│                 │  ────────────────────────    │
│  Logo           │  Content Area (scrollable)   │
│  Menu Items     │  - Padding: 1.5rem           │
│  User Info      │  - Bg: hsl(--background)     │
│                 │                              │
│                 │  ────────────────────────    │
│                 │  [Contenido dinámico]        │
└─────────────────────────────────────────────────┘
```

## Archivos de Estilos Principales

### 1. **app/styles/layout.module.css** ✅
- Layout base con Flexbox (flex-direction: row)
- Sidebar: 240px (colapsable a 80px)
- MainContent: flex: 1 (toma espacio restante)
- Responsive para móvil (< 768px)

**Características:**
- `display: flex` - Sidebar y MainContent lado a lado
- `height: 100vh` - Usa toda la altura del viewport
- `overflow: hidden` - Evita scrollbars no deseados
- Transiciones suaves (0.3s cubic-bezier)

### 2. **app/styles/Settings.module.css** ✅
- Modal overlay con backdrop blur
- Formulario de configuración con temas
- Selector de notificaciones, idioma, meta diaria

**Variables CSS usadas:**
- `var(--background)` - Color de fondo
- `var(--foreground)` - Color de texto
- `var(--border)` - Color de bordes
- `var(--primary)` - Color principal

### 3. **app/styles/sidebar.module.css** ✅
- Sidebar con menu items
- Logo y sección de usuario
- Responsive collapse/expand

## Componentes Principales

### 1. **DashboardLayout** (app/study/layaut.tsx)
```tsx
<div className={styles.dashboardLayout}>
  {/* Sidebar - Oculto en móvil */}
  <div className={styles.sidebarWrapper}>
    <AppSidebar />
  </div>

  {/* Main Content */}
  <div className={styles.mainContent}>
    <DashboardHeader />
    <div className={styles.contentArea}>
      <div className={styles.contentWrapper}>
        {children}
      </div>
    </div>
  </div>
</div>
```

### 2. **SettingsModal** (app/components/SettingsModal.tsx)
- Modal flotante con fondo oscuro
- Selectores de tema, idioma, notificaciones
- Almacenamiento en localStorage
- Cierre con ESC o click fuera

## Responsividad

### 📱 Móvil (< 768px)
```css
.sidebarWrapper {
    display: none !important;
}
```
- Sidebar oculto
- MobileNavbar visible
- MainContent a full width

### 💻 Tablet (769px - 1023px)
- Sidebar: 220px
- Mismo layout que desktop

### 🖥️ Desktop (> 1024px)
- Sidebar: 240px (expanded) o 80px (collapsed)
- Transiciones suaves

### 🖥️ Extra Large (> 1440px)
- ContentWrapper: max-width 1600px
- Centrado automático

## Variables CSS Globales (globals.css)

### Temas Disponibles
- **light** (default)
- **dark**
- **sakura** (rosa - #ec4899)
- **ocean** (azul - #0ea5e9)
- **forest** (verde - #10b981)
- **sunset** (naranja - #f97316)

### Variables Base
```css
:root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --border: 0 0% 89.8%;
    --primary: 0 0% 9%;
    --card: 0 0% 100%;
    --muted: 0 0% 96.1%;
}
```

## Debugging

### ✅ El layout no se alinea bien
1. Verificar que `.dashboardLayout` tiene `display: flex`
2. Verificar que `.sidebarWrapper` tiene `flex-shrink: 0`
3. Verificar altura: `height: 100vh`

### ✅ Sidebar no ocupa altura completa
1. Verificar `height: 100vh` en `.sidebarWrapper`
2. Verificar `overflow-y: auto; overflow-x: hidden`

### ✅ Contenido se desborda
1. Verificar `overflow: hidden` en `.mainContent`
2. Verificar `overflow-y: auto` en `.contentWrapper`
3. Verificar padding: no debe hacer el contenedor más grande

### ✅ Modal no aparece
1. Verificar `z-index: 9999` en `.modalFondo`
2. Verificar `position: fixed`
3. Verificar backdrop blur aplicado

## Performance

✅ **CSS Modules** - No hay conflictos de nombres
✅ **Flexbox** - Más eficiente que Grid para este layout
✅ **Transiciones** - Usa `cubic-bezier(0.4, 0, 0.2, 1)` estándar
✅ **Scrollbar nativo** - Mejor performance en móvil

## Checklist de Implementación

- [ ] Layout muestra correctamente en desktop
- [ ] Sidebar colapsable a 80px
- [ ] Contenido scrollable sin sidebar
- [ ] Responsive en tablet (sidebar visible)
- [ ] Responsive en móvil (sidebar oculto)
- [ ] SettingsModal abre/cierra correctamente
- [ ] Variables CSS aplicadas correctamente
- [ ] Sin horizontal scroll en ningún breakpoint
- [ ] Transiciones suaves (sin saltos)
- [ ] Accesibilidad (tab navigation funciona)

## Comandos Útiles

```bash
# Compilar CSS modules
npm run build

# Ver cambios en vivo
npm run dev

# Lint CSS (si está configurado)
npm run lint
```

---

**Última actualización:** 2024
**Estado:** ✅ Reparado y funcional
