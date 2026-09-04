# Imágenes en lecciones — Design

## Por qué

Al intentar documentar cómo inspeccionar peticiones en las herramientas de
desarrollador (lección `formularios-anatomia-completa`), se descubrió que
`esquemaBloqueLaboratorio` (`src/lib/laboratorio/schemas.ts`) no tiene ningún
bloque de tipo imagen — el pipeline de contenido no soporta incrustar una
captura de pantalla real en una lección. Este documento diseña cómo resolver
ese hueco: dónde alojar imágenes barato, cómo subirlas sin exponer
credenciales, y qué bloque/componente las renderiza.

## Alcance

- **Caso de uso único**: embeber imágenes ilustrativas (capturas, diagramas)
  en el contenido de las lecciones. Quien las sube es Claude (por script,
  cuando el usuario lo pide) o el usuario (arrastrando/pegando una imagen en
  el propio editor de la lección, en el admin real).
- **Fuera de alcance, explícitamente**: subida de imágenes por parte de
  alumnos (avatares, adjuntos en comentarios, etc.). Si algún día hace falta,
  es un diseño aparte con su propio modelo de seguridad (cualquier usuario
  autenticado subiendo archivos es una superficie de ataque distinta a "solo
  el admin sube").
- **Coherencia con el flujo de contenido existente**: los `.md` locales en
  `contenido/{tecnologia}/*.md` siguen siendo la fuente de verdad. Si el
  usuario añade una imagen arrastrándola en el admin (en el navegador, contra
  la base de datos real), esa lección queda temporalmente "adelantada"
  respecto a su `.md` local hasta que se recupere ese contenido de la base de
  datos y se actualice el archivo — el mismo matiz que ya existe con
  cualquier otro cambio manual en el admin, no algo nuevo que introduzca este
  diseño.

## Dónde se alojan: Cloudflare R2

Comparado en precio real contra Supabase Storage, Backblaze B2, Vercel Blob y
Cloudinary (cifras verificadas contra la documentación oficial de cada
proveedor, no de memoria):

| Servicio | Gratis incluido | Extra almacenamiento | Extra transferencia |
|---|---|---|---|
| Supabase Storage | 1 GB + 5 GB transferencia/mes | $0.0213/GB (plan Pro, $25/mes) | $0.03/GB |
| **Cloudflare R2** | **10 GB + 1M op. escritura + 10M op. lectura/mes** | **$0.015/GB** | **$0 — egress siempre gratis** |
| Backblaze B2 | 10 GB | ~$0.007/GB | 3× lo almacenado gratis, luego $0.01/GB |
| Vercel Blob | "dentro de límites de uso", sin cifra fija publicada | $0.023/GB (ejemplo Pro) | $0.05/GB |
| Cloudinary | 25 créditos = 25 GB combinados | primer plan de pago: $99/mes | incluido en créditos |

Elegido **Cloudflare R2**, decisión del usuario: el egress gratuito es
determinante — cada vista de una lección con imágenes las vuelve a servir, y
es justo el coste que R2 nunca cobra.

### Dominio

R2 exige un dominio personalizado para servir en producción — la URL de
desarrollo `r2.dev` está explícitamente desaconsejada por Cloudflare
("rate-limited and should only be used for development purposes").

Se compró `techstudytracker.com` en Cloudflare Registrar (al coste, sin
margen) — con doble uso:

- `img.techstudytracker.com` → bucket público de R2 (este diseño).
- `techstudytracker.com` / `www.techstudytracker.com` → dominio real de la
  app en Vercel, sustituyendo al `.vercel.app` — **ya configurado y
  verificado en producción** como parte de este trabajo: registros CNAME en
  Cloudflare DNS (`@` → valor único de Vercel para el proyecto, `www` →
  `cname.vercel-dns.com`), ambos en modo "DNS only" (sin proxy naranja, que
  bloquea la verificación SSL de Vercel). Certificado real emitido por Let's
  Encrypt, confirmado con `openssl s_client` contra el dominio en vivo.

Pendiente (parte de la implementación, no bloquea el resto del diseño):
conectar `img.techstudytracker.com` al bucket de R2 desde la pestaña "Custom
Domains" del bucket — Cloudflare crea el registro proxied necesario
automáticamente, sin pasos manuales de DNS.

## Cómo se sube sin exponer credenciales

R2 usa credenciales tipo AWS (Access Key + Secret) — no se pueden usar desde
el navegador sin exponerlas en el bundle JS. El proyecto es hoy una SPA pura
(Vite + React, sin backend propio, todo habla directo con Supabase desde el
navegador), así que hace falta una pieza de servidor nueva:

1. Una función serverless de Vercel, `api/imagenes-url-subida.ts` (Vercel
   detecta `api/` automáticamente, sin configuración extra).
2. El llamante (navegador o script) manda su sesión de Supabase ya
   autenticada.
3. La función verifica **en el servidor** que esa sesión es de admin — nunca
   basta con un check solo en el navegador, cualquiera podría llamar a la
   función directamente saltándose la UI.
4. Si es admin, genera una **URL prefirmada** de R2 (válida unos minutos,
   usando las credenciales secretas que solo viven como variable de entorno
   en Vercel) y la devuelve.
5. El llamante sube el archivo directamente a esa URL — los bytes van
   derechos a R2, sin pasar por la función ni acercarse a las credenciales
   reales.

Una única función sirve **los dos caminos de subida** (drag&drop del usuario
en el navegador, y el script de Claude) — no hay lógica de subida duplicada.

### Variables de entorno necesarias

`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`, `R2_PUBLIC_URL_BASE` (=`https://img.techstudytracker.com`)
— como variables de entorno de Vercel (para la función) y en un `.env` local
gitignored (para el script de Claude). El token de API de R2 se crea con
permiso de escritura **solo sobre ese bucket**, nunca uno con acceso a toda
la cuenta de Cloudflare.

### Nombrado de archivos

Hash corto del contenido del archivo (p. ej. SHA-256 truncado) + extensión —
evita colisiones, y subir el mismo archivo dos veces no duplica nada en el
bucket.

## El bloque `imagen`

Nuevo tipo en `esquemaBloqueLaboratorio` (`src/lib/laboratorio/schemas.ts`),
siguiendo el mismo patrón que los bloques existentes:

```typescript
export const esquemaImagen = z.object({
  tipo: z.literal('imagen'),
  src: z.string().url().startsWith('https://img.techstudytracker.com/'),
  alt: z.string().min(1).max(200),
  titulo: z.string().min(1).max(160).optional(),
})
```

Decisiones:

- **`alt` obligatorio**, no opcional — coherente con lo que las propias
  lecciones de HTML enseñan sobre accesibilidad.
- **`src` restringido a nuestro propio dominio de R2** — evita el mismo
  problema ya vivido con dominios externos que pueden bloquear el framing o
  desaparecer (MDN, en la lección de iframes): si un bloque `imagen` existe,
  pasó por nuestro pipeline de subida, nunca es un enlace suelto a un sitio
  que no controlamos.
- **Sin campo de ancho/alineación por ahora** — YAGNI; se añade si aparece un
  caso real, no antes.

### Componente

`src/components/bloques-laboratorio/Imagen.tsx` — renderiza un `<figure>`
con `<img loading="lazy" src={src} alt={alt}>` dentro, y si hay `titulo`, un
`<figcaption>` — el mismo patrón `figure`/`figcaption` que las lecciones de
HTML ya enseñan como buena práctica.

## Los dos caminos de subida

1. **Usuario, en el navegador**: un manejador de drop/paste en el textarea
   `#leccion-contenido` de `LessonForm` — al soltar o pegar una imagen, la
   sube usando la sesión ya autenticada, y en cuanto termina inserta el
   bloque ```laboratorio``` con la URL ya rellena en la posición del cursor.
2. **Claude, por script**: un script Node (mismo patrón que los ya
   existentes para sincronizar contenido) que sube un archivo local al mismo
   bucket vía la función serverless, y devuelve la URL para escribir el
   bloque en el `.md` correspondiente.

## Autorevisión del spec

- **Placeholders**: ninguno — cada sección tiene valores concretos (nombres
  de archivo, variables de entorno, esquema Zod completo).
- **Consistencia interna**: el dominio (`img.techstudytracker.com`), la
  restricción de `src` en el esquema, y la URL pública que genera la función
  de subida son la misma cadena en las tres secciones.
- **Alcance**: enfocado — cubre un único plan de implementación (subida +
  bloque + componente). La ampliación futura a subida de alumnos queda fuera
  a propósito, mencionada solo para no perderla de vista.
- **Ambigüedad**: el punto del `.md` como fuente de verdad frente a ediciones
  directas en el admin ya estaba señalado como matiz operativo, no como
  requisito a resolver con código en este diseño.
