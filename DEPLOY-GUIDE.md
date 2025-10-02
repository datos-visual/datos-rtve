# Guía de Despliegue por Entornos

## Resumen

Se ha configurado el proyecto para trabajar con múltiples entornos utilizando la variable `APP_ENV`. La configuración se gestiona desde la carpeta `props/` y permite desplegar la aplicación en:

- **Desarrollo**: `http://localhost:3000`
- **Preproducción**: `https://www-pre.rtve.es/noticias/fosas`
- **Producción**: `https://www.rtve.es/noticias/fosas`

## Cambios Realizados

### 1. Estructura de Configuración (`props/`)
- `common.js`: Configuración compartida entre entornos
- `development.js`: Configuración específica para desarrollo
- `preproduction.js`: Configuración específica para preproducción
- `production.js`: Configuración específica para producción
- `index.js`: Gestor principal que determina qué configuración usar
- `example-usage.js`: Ejemplos de uso
- `README.md`: Documentación detallada

### 2. Next.js Configuration (`next.config.js`)
- Configuración automática de `basePath` y `assetPrefix`
- URLs específicas por entorno
- Headers para embeds configurables

### 3. Package.json
- Scripts específicos por entorno
- Dependencia `cross-env` para compatibilidad multiplataforma
- Configuración como módulo ES6

### 4. Variables de Entorno
- `.env.local`: Desarrollo
- `.env.preproduction`: Preproducción
- `.env.production`: Producción

## Comandos de Despliegue

### Desarrollo Local
```bash
npm run dev                    # Entorno desarrollo
npm run dev:pre               # Desarrollo con config de preproducción
npm run dev:prod              # Desarrollo con config de producción
```

### Build por Entornos
```bash
npm run build                 # Build desarrollo
npm run build:pre             # Build preproducción
npm run build:prod            # Build producción
```

### Inicio por Entornos
```bash
npm start                     # Inicio desarrollo
npm start:pre                 # Inicio preproducción
npm start:prod                # Inicio producción
```

## Configuración en Contenedores

Para desplegar en contenedores Docker, asegúrate de establecer la variable `APP_ENV`:

### Dockerfile
```dockerfile
# Para preproducción
ENV APP_ENV=preproduction

# Para producción
ENV APP_ENV=production
```

### Docker Run
```bash
# Preproducción
docker run -e APP_ENV=preproduction mi-app

# Producción
docker run -e APP_ENV=production mi-app
```

## URLs Resultantes

### Desarrollo
- Home: `http://localhost:3000/`
- Mapa: `http://localhost:3000/mapa`
- Historias: `http://localhost:3000/historias`
- Embed: `http://localhost:3000/embed`

### Preproducción
- Home: `https://www-pre.rtve.es/noticias/fosas/`
- Mapa: `https://www-pre.rtve.es/noticias/fosas/mapa`
- Historias: `https://www-pre.rtve.es/noticias/fosas/historias`
- Embed: `https://www-pre.rtve.es/noticias/fosas/embed`

### Producción
- Home: `https://www.rtve.es/noticias/fosas/`
- Mapa: `https://www.rtve.es/noticias/fosas/mapa`
- Historias: `https://www.rtve.es/noticias/fosas/historias`
- Embed: `https://www.rtve.es/noticias/fosas/embed`

## Uso en Código

```javascript
import { config, getFullUrl, getAssetUrl, isProduction } from '../props/index.js';

// Obtener configuración actual
const currentEnv = config.environment;
const baseUrl = config.baseUrl;

// Generar URLs
const homeUrl = getFullUrl('/');
const logoUrl = getAssetUrl('/logo.png');

// Lógica condicional por entorno
if (isProduction()) {
  // Código específico de producción
}
```

## Verificación

Para verificar que la configuración está funcionando correctamente:

1. **Desarrollo**: `npm run dev` → http://localhost:3000
2. **Preproducción**: `npm run dev:pre` → Configuración de preproducción en desarrollo
3. **Producción**: `npm run dev:prod` → Configuración de producción en desarrollo

## Notas Importantes

- El sistema utiliza `APP_ENV` como variable principal para determinar el entorno
- Si `APP_ENV` no está definida, usa `NODE_ENV` como fallback
- Para entornos de preproducción y producción, el `basePath` se establece automáticamente en `/noticias/fosas`
- Los assets se sirven correctamente desde las URLs configuradas para cada entorno
- La configuración es compatible con embeds y permite CORS para sitios externos
