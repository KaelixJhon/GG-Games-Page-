# GG Games — Portal de Add-ons

Starter de una página estilo Minecraft/GG Games con:

- Página pública responsive.
- Tarjetas de add-ons.
- Botón DOWNLOAD.
- Panel privado de administración.
- Login con Supabase.
- Subida de imagen + archivo.
- Crear, editar y borrar publicaciones.
- Categorías New Content / Featured.
- Diseño oscuro con dorado inspirado en la referencia.

## Estructura

- `index.html` — página pública.
- `admin.html` — panel privado.
- `style.css` — diseño.
- `app.js` — carga pública.
- `admin.js` — administración y uploads.
- `config.js` — credenciales públicas de Supabase.
- `supabase.sql` — tabla + políticas.
- `assets/placeholder.svg` — imagen de prueba.

## Montaje

1. Crea un proyecto en Supabase.
2. En SQL Editor ejecuta `supabase.sql`.
3. En Storage crea un bucket público llamado `downloads`.
4. En Authentication crea tu usuario administrador.
5. Copia Project URL y anon/public key a `config.js`.
6. Sube estos archivos a un repositorio de GitHub.
7. Activa GitHub Pages desde Settings > Pages.

### Seguridad

La clave `anon/public` puede estar en el frontend. La `service_role` NO.
Para un sitio real conviene restringir las políticas de Storage a usuarios autenticados.

## Nota

El panel ya está preparado para el flujo real. GitHub Pages por sí solo no almacena uploads; Supabase hace de backend/base de datos/storage.
