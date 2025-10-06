# PF FOSAS GUERRA CIVIL Y FRANQUISMO

Proyecto **Página Final de Fosas Comunes**, desarrollado en **Next.js v13**.

## Tech Stack
- **Node**: v18.17.1
- **Next.js**: v13.5.11

---

## 🚀 Ejecutar en local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Desarrollo local

#### Modo desarrollo estándar:
```bash
npm run dev
```
Acceder en: `http://localhost:3000/`

#### Modo preproducción:
```bash
npm run dev:pre
```
Acceder en: `http://localhost:3000/noticias/fosas-guerra-civil-franquismo/`

#### Modo producción:
```bash
npm run dev:prod
```
Acceder en: `http://localhost:3000/noticias/fosas-guerra-civil-franquismo/`

### 3. Build para despliegue

#### Build para preproducción:
```bash
npm run build:pre
```

#### Build para producción:
```bash
npm run build:prod
```

---

## 📦 Estructura del build

Después del build, los archivos estáticos se generan en:

```
.next/
├── static/
│   ├── css/
│   │   └── app/
│   │       └── layout.css          # CSS compilado desde main.scss
│   ├── chunks/
│   │   └── [name]-0.1.0.js         # JavaScript con versión
│   └── media/
│       └── [hash].woff2             # Fuentes y assets
```

---

## 🌐 Gestión de assets (CSS/JS/Imágenes)

### En desarrollo (`npm run dev`):
- **CSS/JS**: Se sirven desde `http://localhost:3000/_next/static/`
- **AssetPrefix**: Desactivado automáticamente
- **Imágenes**: Se sirven desde `http://localhost:3000/`

### En preproducción (`npm run build:pre`):
- **CSS/JS**: Se espera que estén en `https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/`
- **AssetPrefix**: Configurado automáticamente
- **Imágenes**: Se cargan desde `https://img-pre.rtve.es/` (ver `app/utils/imageLoader.js`)
- **BasePath**: `/noticias/fosas-guerra-civil-franquismo`

### En producción (`npm run build:prod`):
- **CSS/JS**: Se espera que estén en `https://js.rtve.es/pages/fosas-comunes/0.1.0/_next/static/`
- **AssetPrefix**: Configurado automáticamente
- **Imágenes**: Se cargan desde `https://img.rtve.es/` (ver `app/utils/imageLoader.js`)
- **BasePath**: `/noticias/fosas-guerra-civil-franquismo`

---

## 📋 Para el equipo de infraestructura

### Después del build, deben copiarse estos archivos al CDN:

```bash
# Contenido de .next/static/ debe copiarse a:
# PREPRODUCCIÓN:
https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/_next/static/

# PRODUCCIÓN:
https://js.rtve.es/pages/fosas-comunes/0.1.0/_next/static/
```

### Estructura esperada en el CDN:
```
https://js-pre.rtve.es/pages/fosas-comunes/0.1.0/
├── _next/
│   └── static/
│       ├── css/
│       │   └── app/
│       │       └── layout.css
│       ├── chunks/
│       │   ├── webpack-0.1.0.js
│       │   ├── main-app-0.1.0.js
│       │   └── ...
│       └── media/
│           └── [hash].woff2
```

### Versionado:
- La versión actual es `0.1.0` (definida en `package.json`)
- Los archivos JavaScript incluyen la versión en el nombre: `[name]-0.1.0.js`
- Al cambiar la versión, se genera una nueva ruta en el CDN automáticamente

---

## 🔧 Configuración de entornos

La configuración de cada entorno está en `props/config.json`:

```json
{
  "development": {
    "basePath": "",
    "domains": {
      "js": ""  // Vacío para desarrollo local
    }
  },
  "preproduction": {
    "basePath": "/noticias/fosas-guerra-civil-franquismo",
    "domains": {
      "js": "https://js-pre.rtve.es"
    }
  },
  "production": {
    "basePath": "/noticias/fosas-guerra-civil-franquismo",
    "domains": {
      "js": "https://js.rtve.es"
    }
  }
}
```

---

## 🌍 URLs de acceso

### Desarrollo local:
- **Home**: `http://localhost:3000/`
- **Historias**: `http://localhost:3000/historias/`
- **Mapa**: `http://localhost:3000/mapa/`

### Preproducción:
- **Home**: `https://www-pre.rtve.es/noticias/fosas-guerra-civil-franquismo/`
- **Historias**: `https://www-pre.rtve.es/noticias/fosas-guerra-civil-franquismo/historias/`
- **Mapa**: `https://www-pre.rtve.es/noticias/fosas-guerra-civil-franquismo/mapa/`

### Producción:
- **Home**: `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/`
- **Historias**: `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/historias/`
- **Mapa**: `https://www.rtve.es/noticias/fosas-guerra-civil-franquismo/mapa/`

---

## 📝 Notas importantes

1. **No modificar `next.config.mjs` para desarrollo**: El `assetPrefix` se activa/desactiva automáticamente según `APP_ENV`.
2. **CSS centralizado**: Todo el CSS está importado en `app/layout.js` → `app/styles/main.scss`.
3. **Imágenes optimizadas**: Las imágenes externas se cargan mediante loader personalizado (`app/utils/imageLoader.js`).
4. **CORS**: Puede ser necesario un plugin de CORS en el navegador para desarrollo local con APIs externas.

---

## 🐛 Troubleshooting

### CSS no se carga en preproducción/producción:
- Verificar que los archivos de `.next/static/css/` estén copiados al CDN
- Comprobar que la ruta incluya la versión correcta del `package.json`
- Revisar que el `basePath` esté configurado correctamente

### JavaScript no se carga:
- Verificar que los chunks de `.next/static/chunks/` estén en el CDN
- Comprobar que los nombres de archivo incluyan la versión (`-0.1.0.js`)

### Imágenes no se cargan:
- Verificar que `app/utils/imageLoader.js` esté configurado correctamente
- Comprobar que las imágenes estén en `img.rtve.es` o `img-pre.rtve.es`
