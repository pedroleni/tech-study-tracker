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

Elegido **Cloudflare R2**, decisión inicial del usuario: el egress gratuito
es determinante — cada vista de una lección con imágenes las vuelve a
servir, y es justo el coste que R2 nunca cobra. (Ver más abajo "Hallazgo:
bloqueo de LaLiga" — esto cambió CÓMO se sirven las imágenes, pero no la
elección de R2 como almacén.)

### Dominio

Se compró `techstudytracker.com` en Cloudflare Registrar (al coste, sin
margen) como dominio real de la app en Vercel, sustituyendo al
`.vercel.app` — **ya configurado y verificado en producción**: registros
CNAME en Cloudflare DNS (`@` → valor único de Vercel para el proyecto,
`www` → `cname.vercel-dns.com`), ambos en modo "DNS only" (sin proxy
naranja, que bloquea la verificación SSL de Vercel). Certificado real
emitido por Let's Encrypt, confirmado con `openssl s_client` contra el
dominio en vivo.

No hace falta ningún subdominio adicional para las imágenes (ver siguiente
sección) — Vercel usa `www.techstudytracker.com` como dominio canónico
(el raíz redirige ahí con 308), así que las imágenes se sirven siempre
desde `www.techstudytracker.com/img/`, nunca desde ningún dominio de
Cloudflare/R2.

### Hallazgo: bloqueo judicial de LaLiga sobre IPs de Cloudflare

Al intentar conectar `img.techstudytracker.com` al bucket de R2 (el diseño
original: un dominio personalizado de Cloudflare sirviendo directamente el
bucket público), la URL resultó inaccesible en la propia red del usuario,
con un error de certificado autofirmado genérico y, al forzar el aviso,
la página de bloqueo real de un ISP español citando la Sentencia de 18 de
diciembre de 2024 del Juzgado de lo Mercantil nº 6 de Barcelona (LaLiga /
Telefónica Audiovisual Digital contra la piratería).

Verificado, no asumido: las IPs a las que resolvía el dominio
(`188.114.96.5` / `188.114.97.5`) están documentadas públicamente en varios
hilos de la comunidad de Cloudflare como parte del rango bloqueado — LaLiga
pide a los ISP españoles bloquear rangos de IP compartidas de Cloudflare
porque ahí se esconde streaming pirata, y como esas IPs las comparten miles
de webs legítimas (entre ellas, ahora, la nuestra), el bloqueo cae también
sobre ellas. Comprobado desde la misma red: otro dominio conocido detrás de
Cloudflare (`discord.com`, en un rango de IP distinto) cargaba con
normalidad — no es un bloqueo de Cloudflare en general, es específico de
ese rango.

Un dominio personalizado de R2 no admite "modo DNS only" como una zona
normal — su propio mecanismo de entrega depende de pasar por la red
proxied de Cloudflare, así que no hay forma de esquivarlo dentro del propio
R2. La solución: que el navegador del visitante **nunca** hable
directamente con ninguna IP de Cloudflare — solo con `techstudytracker.com`
(Vercel, ya confirmado fuera de cualquier rango bloqueado).

## Cómo se sube y se sirve, sin exponer credenciales y sin pasar por Cloudflare

R2 usa credenciales tipo AWS (Access Key + Secret) — no se pueden usar desde
el navegador sin exponerlas en el bundle JS. El proyecto es hoy una SPA pura
(Vite + React, sin backend propio, todo habla directo con Supabase desde el
navegador), así que hacen falta dos piezas de servidor nuevas, ambas
funciones serverless de Vercel (Vercel detecta `api/` automáticamente):

**Subida — `POST /api/imagenes`:**
1. El llamante (navegador o script) manda el archivo junto con su sesión de
   Supabase ya autenticada.
2. La función verifica **en el servidor** que esa sesión es de admin —
   nunca basta con un check solo en el navegador.
3. Si es admin, sube el archivo a R2 directamente desde el servidor
   (`PutObjectCommand`, usando las credenciales secretas que solo viven
   como variable de entorno en Vercel) y devuelve la URL pública final:
   `https://www.techstudytracker.com/img/<hash>.<ext>`.

**Lectura — `GET /img/[clave]`:**
1. Cualquier visitante pide esa URL como pediría cualquier imagen normal.
2. La función lee el objeto de R2 (`GetObjectCommand`) y lo devuelve con su
   `Content-Type` real y una cabecera de caché muy larga
   (`Cache-Control: public, max-age=31536000, immutable`) — como el nombre
   del archivo es un hash de su contenido, nunca cambia, así que cachearlo
   para siempre es seguro. Tras la primera visita, la CDN de Vercel sirve
   la imagen directamente sin volver a pedirla a R2.

Como ninguna de las dos rutas expone R2 directamente al navegador, ya no
hace falta una URL prefirmada ni un dominio personalizado de R2 — la
credencial nunca sale del servidor, y el navegador del visitante nunca
resuelve ninguna IP de Cloudflare, con lo que el bloqueo deja de ser
relevante sin más coste que el ancho de banda de Vercel al reenviar la
imagen (gratuito al volumen que maneja este proyecto, y R2 sigue sin cobrar
egress por servir a la función).

Ambas rutas las usan **los dos caminos de subida** (drag&drop del usuario
en el navegador, y el script de Claude) — no hay lógica duplicada.

### Variables de entorno necesarias

`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME` — como variables de entorno de Vercel (para las dos
funciones) y en un `.env` local gitignored (para el script de Claude). El
token de API de R2 se crea con permiso de escritura **solo sobre ese
bucket**, nunca uno con acceso a toda la cuenta de Cloudflare. Ya no hace
falta `R2_PUBLIC_URL_BASE` — la URL pública es siempre
`https://www.techstudytracker.com/img/<clave>`, un valor fijo, no configurable
por entorno.

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
  src: z.string().url().startsWith('https://www.techstudytracker.com/img/'),
  alt: z.string().min(1).max(200),
  titulo: z.string().min(1).max(160).optional(),
})
```

Decisiones:

- **`alt` obligatorio**, no opcional — coherente con lo que las propias
  lecciones de HTML enseñan sobre accesibilidad.
- **`src` restringido a `www.techstudytracker.com/img/`** (nuestro propio
  dominio, nunca el de R2 directamente) — evita el mismo problema ya vivido
  con dominios externos que pueden bloquear el framing o desaparecer (MDN,
  en la lección de iframes) y, ahora también, con el bloqueo de LaLiga: si
  un bloque `imagen` existe, pasó por nuestro pipeline de subida y se sirve
  desde nuestro propio dominio, nunca un enlace suelto a un sitio que no
  controlamos.
- **Sin campo de ancho/alineación por ahora** — YAGNI; se añade si aparece un
  caso real, no antes.

### Componente

`src/components/bloques-laboratorio/Imagen.tsx` — renderiza un `<figure>`
con `<img loading="lazy" src={src} alt={alt}>` dentro, y si hay `titulo`, un
`<figcaption>` — el mismo patrón `figure`/`figcaption` que las lecciones de
HTML ya enseñan como buena práctica.

## Los dos caminos de subida

1. **Usuario, en el navegador**: un manejador de drop/paste en el textarea
   `#leccion-contenido` de `LeccionForm` — al soltar o pegar una imagen, la
   manda a `POST /api/imagenes` usando la sesión ya autenticada, y en cuanto
   responde inserta el bloque ```laboratorio``` con la URL ya rellena en la
   posición del cursor.
2. **Claude, por script**: un script Node (mismo patrón que los ya
   existentes para sincronizar contenido) que manda un archivo local al
   mismo `POST /api/imagenes`, y devuelve la URL para escribir el bloque en
   el `.md` correspondiente.

## Autorevisión del spec

- **Placeholders**: ninguno — cada sección tiene valores concretos (nombres
  de archivo, variables de entorno, esquema Zod completo).
- **Consistencia interna**: el dominio (`www.techstudytracker.com/img/`), la
  restricción de `src` en el esquema, y la URL pública que devuelve
  `POST /api/imagenes` son la misma cadena en todas las secciones.
- **Alcance**: enfocado — cubre un único plan de implementación (subida +
  lectura + bloque + componente). La ampliación futura a subida de alumnos
  queda fuera a propósito, mencionada solo para no perderla de vista.
- **Ambigüedad**: el punto del `.md` como fuente de verdad frente a
  ediciones directas en el admin ya estaba señalado como matiz operativo,
  no como requisito a resolver con código en este diseño.
- **Revisión post-hallazgo (bloqueo de LaLiga)**: el pivote de "R2 sirve
  directamente vía dominio personalizado" a "Vercel hace de intermediario
  en subida y lectura" no cambia la elección de almacén (sigue siendo R2,
  sigue siendo prácticamente gratis a este volumen) ni el modelo de
  seguridad (la autorización de admin sigue apoyándose en la misma RLS de
  `profiles`) — solo cambia qué servidor habla con R2 y qué dominio ve el
  navegador.
