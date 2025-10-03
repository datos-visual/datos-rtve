# 📦 GUÍA DE DESPLIEGUE - FOSAS COMUNES

Guía para el equipo de infraestructura sobre cómo desplegar esta aplicación en los entornos de RTVE.

---

## ⚠️ IMPORTANTE: Gestión de assets

A diferencia de otros proyectos RTVE que usan `rtve-module-layout` (donde el CSS/JS viene del módulo), **este proyecto gestiona su propio CSS/JS**.

### ¿Qué significa esto?

Después del build, **es necesario copiar manualmente** los archivos estáticos generados por Next.js al CDN correspondiente.

---

## 📋 Pasos para desplegar

### 1. Build del proyecto

#### Para PREPRODUCCIÓN:
```bash
npm run build:pre
```

#### Para PRODUCCIÓN:
```bash
npm run build:prod
```

### 2. Copiar archivos al CDN

Después del build, se genera la carpeta `.next/` con los siguientes archivos:

```
.next/
├── static/
│   ├── css/
│   │   └── app/
│   │       └── layout.css          # ⚠️ COPIAR AL CDN
│   ├── chunks/
│   │   ├── webpack-0.1.0.js        # ⚠️ COPIAR AL CDN
│   │   ├── main-app-0.1.0.js       # ⚠️ COPIAR AL CDN
│   │   ├── app-layout-0.1.0.js     # ⚠️ COPIAR AL CDN
│   │   └── ...                     # ⚠️ COPIAR TODOS
│   └── media/
│       └── *.woff2                  # ⚠️ COPIAR AL CDN (fuentes)
```

#### Destino de los archivos:

**PREPRODUCCIÓN:**
```bash
# Copiar TODO el contenido de .next/static/ a:
https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/
```

**PRODUCCIÓN:**
```bash
# Copiar TODO el contenido de .next/static/ a:
https://js.rtve.es/pages/fosas-comunes/0.1.0/_next/static/
```

---

## 🔍 Verificar el despliegue

### 1. Verificar que los archivos CSS están accesibles

**PREPRODUCCIÓN:**
```bash
curl -I https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/css/app/layout.css
# Debe devolver: HTTP/1.1 200 OK
```

**PRODUCCIÓN:**
```bash
curl -I https://js.rtve.es/pages/fosas-comunes/0.1.0/_next/static/css/app/layout.css
# Debe devolver: HTTP/1.1 200 OK
```

### 2. Verificar que los archivos JS están accesibles

**PREPRODUCCIÓN:**
```bash
curl -I https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/chunks/webpack-0.1.0.js
# Debe devolver: HTTP/1.1 200 OK
```

**PRODUCCIÓN:**
```bash
curl -I https://js.rtve.es/pages/fosas-comunes/0.1.0/_next/static/chunks/webpack-0.1.0.js
# Debe devolver: HTTP/1.1 200 OK
```

### 3. Probar la aplicación en el navegador

**PREPRODUCCIÓN:**
- Abrir: `https://www-pre.rtve.es/noticias/fosas-guerra-civil-franquismo/`
- Abrir DevTools → Network
- Verificar que los archivos CSS/JS se cargan desde `js-pre.rtve.es`
- Verificar que NO hay errores 404

**PRODUCCIÓN:**
- Abrir: `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/`
- Abrir DevTools → Network
- Verificar que los archivos CSS/JS se cargan desde `js.rtve.es`
- Verificar que NO hay errores 404

---

## 🔄 Actualizar versión

Cuando se actualiza la versión en `package.json`:

```json
{
  "version": "0.2.0"  // ← Nueva versión
}
```

**Se debe:**
1. Hacer build con la nueva versión
2. Copiar los archivos a la **nueva ruta** del CDN:
   ```bash
   # Nueva ruta:
   https://js-pre.rtve.es/pages/fosas-comunes/0.2.0/_next/static/
   ```
3. **Mantener** la versión anterior en el CDN (para rollback)

---

## 🗂️ Estructura completa esperada en el CDN

```
https://js-pre.rtve.es/pages/fosas-comunes/
├── 0.1.0/
│   └── _next/
│       └── static/
│           ├── css/
│           │   └── app/
│           │       └── layout.css
│           ├── chunks/
│           │   ├── webpack-0.1.0.js
│           │   ├── main-app-0.1.0.js
│           │   ├── app-layout-0.1.0.js
│           │   ├── [hash]-0.1.0.js
│           │   └── ...
│           └── media/
│               ├── [hash].woff2
│               └── ...
└── 0.2.0/                            # Nueva versión
    └── _next/
        └── static/
            └── ...
```

---

## 🚨 Problemas comunes

### ❌ CSS no se carga (página sin estilos)

**Síntoma:**
- La página se ve sin estilos
- En DevTools → Network aparece error 404 para `layout.css`

**Solución:**
1. Verificar que el archivo existe en el CDN:
   ```bash
   curl -I https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/css/app/layout.css
   ```
2. Si devuelve 404, copiar el archivo al CDN

---

### ❌ JavaScript no funciona

**Síntoma:**
- La página se carga pero no hay interactividad
- En DevTools → Console aparecen errores de JS
- En DevTools → Network aparecen errores 404 para archivos `.js`

**Solución:**
1. Verificar que TODOS los chunks están en el CDN:
   ```bash
   # Listar archivos en .next/static/chunks/
   ls -la .next/static/chunks/
   
   # Verificar que cada uno está en el CDN
   curl -I https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/chunks/[NOMBRE].js
   ```
2. Copiar los archivos faltantes al CDN

---

### ❌ Fuentes no se cargan

**Síntoma:**
- La tipografía se ve diferente a la esperada
- En DevTools → Network aparecen errores 404 para archivos `.woff2`

**Solución:**
1. Verificar que los archivos de fuentes están en el CDN:
   ```bash
   # Listar archivos en .next/static/media/
   ls -la .next/static/media/
   
   # Copiar todos al CDN
   ```

---

## 📊 Checklist de despliegue

- [ ] Build ejecutado correctamente (`npm run build:pre` o `npm run build:prod`)
- [ ] Carpeta `.next/static/css/` copiada al CDN
- [ ] Carpeta `.next/static/chunks/` copiada al CDN
- [ ] Carpeta `.next/static/media/` copiada al CDN
- [ ] Verificado acceso a CSS: `curl -I https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/css/app/layout.css`
- [ ] Verificado acceso a JS: `curl -I https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/chunks/webpack-0.1.0.js`
- [ ] Probado en navegador: `https://www-pre.rtve.es/noticias/fosas-guerra-civil-franquismo/`
- [ ] No hay errores 404 en DevTools → Network
- [ ] CSS se carga correctamente (página con estilos)
- [ ] JavaScript funciona correctamente (interactividad)

---

## 📞 Contacto

Si hay problemas con el despliegue, contactar con el equipo de desarrollo del proyecto.

**Archivos clave para revisar:**
- `next.config.mjs` → Configuración de `assetPrefix` y `basePath`
- `props/config.json` → Configuración de dominios por entorno
- `package.json` → Versión actual del proyecto

