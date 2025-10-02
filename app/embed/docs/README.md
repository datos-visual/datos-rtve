# Instrucciones para Embeber el Mapa de Fosas

Este documento contiene instrucciones para embeber el mapa buscador de fosas en sitios web externos.

## Opciones de Embebido

Existen dos formas principales de embeber el mapa:

1. **Embebido simple**: Insertando un iframe con la URL del mapa
2. **Embebido personalizado**: Usando el generador de código para crear un iframe con opciones específicas

## Embebido Simple

Para insertar el mapa completo, agrega este código HTML a tu página:

```html
<iframe
  src="https://tu-dominio.com/embed/mapa"
  width="100%"
  height="600"
  style="border:0; max-width:100%;"
  title="Mapa de Fosas RTVE"
  allow="geolocation"
  loading="lazy"
>
</iframe>
```

## Embebido con Parámetros

Puedes personalizar el mapa pasando parámetros en la URL:

```html
<iframe
  src="https://tu-dominio.com/embed/mapa?ccaa=andalucia&provincia=sevilla"
  width="100%"
  height="600"
  style="border:0; max-width:100%;"
  title="Mapa de Fosas RTVE - Andalucía"
  allow="geolocation"
  loading="lazy"
>
</iframe>
```

### Parámetros disponibles

- `ccaa`: Nombre de la comunidad autónoma (slug)
- `provincia`: Nombre de la provincia (slug)
- `municipio`: Nombre del municipio (slug)
- `fosa`: ID de una fosa específica

## Generador de Código

Para facilitar la creación del código de embebido, hemos desarrollado un generador visual:

1. Visita https://tu-dominio.com/embed/generator
2. Selecciona las opciones que desees
3. Copia el código generado
4. Pégalo en tu sitio web

## Consideraciones Técnicas

- El mapa se adaptará al tamaño del contenedor
- Es recomendable usar un ancho del 100% para que sea responsive
- La altura mínima recomendada es de 500px para una buena experiencia de usuario
- El embebido permite la geolocalización si el usuario la autoriza
- El iframe utiliza `loading="lazy"` para optimizar el rendimiento

## Ejemplo Completo

Puedes ver un ejemplo funcional en la página: https://tu-dominio.com/public/ejemplo-embed.html
