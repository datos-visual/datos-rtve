# Configuración por Entornos

Este proyecto está configurado para funcionar en múltiples entornos utilizando el sistema de configuración basado en `APP_ENV`.

## Entornos Disponibles

### Local (Desarrollo Local)

- **URL**: `http://localhost:3000`
- **APP_ENV**: `local`
- **Características**: Debug habilitado, configuración local

### Development (Preproducción)

- **URL**: `https://www-pre.rtve.es/noticias/fosas`
- **APP_ENV**: `development`
- **Características**: Entorno de pruebas antes de producción

### Production (Producción)

- **URL**: `https://www.rtve.es/noticias/fosas`
- **APP_ENV**: `production`
- **Características**: Entorno final, analytics habilitado

## Estructura de Archivos

```
props/
├── index.js           # Gestor principal de configuración
├── common.js          # Configuración común a todos los entornos
├── local.js     # Configuración específica de desarrollo
├── development.js   # Configuración específica de preproducción
├── production.js      # Configuración específica de producción
└── example-usage.js   # Ejemplos de cómo usar la configuración
```

## Scripts NPM

### Desarrollo

```bash
npm run dev              # Desarrollo local (APP_ENV=local)
npm run dev:pre          # Desarrollo con config de development
npm run dev:prod         # Desarrollo con config de producción
```

### Build

```bash
npm run build            # Build para local
npm run build:pre        # Build para development
npm run build:prod       # Build para producción
```

### Start

```bash
npm start                # Inicio para local
npm start:pre            # Inicio para development
npm start:prod           # Inicio para producción
```

## Variables de Entorno

El sistema utiliza `APP_ENV` para determinar el entorno:

- **APP_ENV=local**: Configuración local
- **APP_ENV=development**: Configuración de development
- **APP_ENV=production**: Configuración de producción

Si no se especifica `APP_ENV`, el sistema utilizará `NODE_ENV` como fallback.

## Uso en Componentes

```javascript
import {
  config,
  getFullUrl,
  getAssetUrl,
  isProduction,
} from "../props/index.js";

// Acceder a la configuración
const currentConfig = config;
const homeUrl = getFullUrl("/");
const logoUrl = getAssetUrl("/logo.png");

// Verificar entorno
if (isProduction()) {
  // Lógica específica de producción
}
```

## Configuración de Next.js

El archivo `next.config.js` se configura automáticamente según el entorno:

- **basePath**: Se establece según el entorno (`/noticias/fosas` para pre y prod)
- **assetPrefix**: Se configura para servir assets correctamente
- **env**: Variables públicas disponibles en el cliente

## Despliegue

### Desarrollo Local

```bash
npm run dev
```

### Preproducción

```bash
export APP_ENV=development
npm run build:pre
npm run start:pre
```

### Producción

```bash
export APP_ENV=production
npm run build:prod
npm run start:prod
```

## Contenedores Docker

Para configurar en contenedores Docker, asegúrate de establecer la variable `APP_ENV`:

```dockerfile
ENV APP_ENV=production
```

O al ejecutar el contenedor:

```bash
docker run -e APP_ENV=production mi-app
```
