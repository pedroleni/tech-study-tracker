# Bloques de laboratorio en lecciones

**Estado:** ✅ implementada. Ampliada varias veces desde la versión
original de 3 tipos: `notas-clave` (para los puntos clave de las
lecciones reales), `diagrama-etiqueta` (2026-08-22, descomposición
visual de una etiqueta en partes coloreadas — pedido explícito tras
feedback de que `codigo-anotado` no sirve para eso: solo resalta la
línea entera, no un fragmento dentro de ella), `callout` (2026-08-22,
promovido desde `referencia-contenido/Callout.tsx` — feedback directo
de que `notas-clave` se repetía 3 veces por lección y quitarlo sin más
tampoco valía, hacía falta un sustituto real), y `linea-de-tiempo` +
`roles` (2026-08-22, mismo día: pedido explícito de hacer "más gráfica"
la sección introductoria de la lección de HTML — la primera promovida
desde `referencia-contenido/`, el segundo construido desde cero para
la tríada HTML/CSS/JavaScript, que no encajaba en ningún tipo
existente). 8 tipos de bloque en total, el prop `permitirLaboratorios`,
y el temario real de HTML en progreso sobre este mecanismo.

## Por qué existe esta feature

Las lecciones de HTML ya escritas (`contenido/html/01-*.md`,
`02-*.md`) tienen ejercicios de "predice el resultado" y "encuentra el
error" como texto plano dentro de un `<details><summary>Solución
</summary>`: quien lee tiene que imaginar el resultado sin poder
comprobarlo. El diseño real (`resaltador.ts`, la lente de V1-V5 en
`/admin/laboratorio`) ya demostró que se puede hacer interactivo de
verdad — un iframe en vivo, un botón que revela el resultado real, un
antes/después que se puede tocar — sin salirse del modelo de seguridad
del proyecto (`iframe sandbox=""`, sin `eval`, sin `rehype-raw`).

Esta feature es el mecanismo **genérico** para eso: un autor escribe
un bloque de código con lenguaje `laboratorio` dentro del Markdown
normal de una lección, y se renderiza como un componente interactivo
en vez de código plano.

A diferencia de V1-V5 (`src/components/laboratorio/`, en
`/admin/laboratorio`): aquellos son 5 lecciones **hardcodeadas**,
construidas para explorar el diseño visual. Esto es el sistema real:
componentes genéricos que reciben sus datos por JSON, reutilizables en
cualquier lección.

## Alcance

Ocho tipos de bloque, cada uno con un ejemplo real ya escrito en
`contenido/html/`:

1. **`predice-el-resultado`** — código + opciones + botón "Revelar" que
   muestra la explicación y el resultado real en un iframe.
2. **`codigo-anotado`** — código con fragmentos marcados y numerados;
   pulsar un número resalta la **línea entera** que contiene el
   fragmento y muestra la nota. No resalta el fragmento en sí dentro de
   la línea — importante para el punto siguiente.
3. **`comparador-antes-despues`** — dos versiones del mismo HTML
   (antes/después) con su código y su vista en vivo.
4. **`notas-clave`** — lista de puntos clave (título + texto), cada uno
   numerado, dentro de una única tarjeta agrupada. Reservado a lo sumo
   una vez por lección (normalmente "Errores típicos") — ver la regla
   de variedad en `contenido/html/TEMARIO.md`.
5. **`diagrama-etiqueta`** (2026-08-22) — descompone una etiqueta HTML
   en sus partes (`apertura`, `atributo-nombre`, `atributo-valor`,
   `contenido`, `cierre`, `simbolo` para la puntuación sin rol
   pedagógico) y las pinta como una fila de chips coloreados con una
   etiqueta de rol encima de cada uno, más una leyenda de texto debajo
   (nunca solo color — un rol también se lee como texto, para
   daltonismo y lectores de pantalla). Se añadió porque `codigo-anotado`
   no sirve para "esta etiqueta de una sola línea tiene 5 partes
   distintas": todas las anotaciones acaban resaltando la misma única
   línea, sin diferenciar visualmente las partes entre sí.
6. **`callout`** (2026-08-22) — un único punto destacado: icono +
   título + texto, en una de 4 variantes (`info`, `aviso`, `error`,
   `exito`). Promovido desde `referencia-contenido/Callout.tsx` (ya
   existía como prototipo, ya tenía el reveal de entrada
   `animate-in`/`motion-reduce`) al registro real. Se usa en varias
   instancias sueltas — una por punto — en vez de agrupar todo en una
   tarjeta `notas-clave`: es lo que sustituye a `notas-clave` en
   "Cuándo lo usarías de verdad" y en "Lo que [X] no es", que antes
   repetían el mismo componente 3 veces por lección.
7. **`linea-de-tiempo`** (2026-08-22) — hitos ordenados (fecha opcional
   + título + texto) sobre un riel vertical, con reveal escalonado.
   Promovido desde `referencia-contenido/LineaDeTiempo.tsx` — el mismo
   patrón de "git mv, tipar sobre el esquema Zod, registrar" que
   `callout`. Pensado para contexto histórico o evolutivo (cómo llegó
   algo a ser como es hoy), no para pasos secuenciales de una tarea —
   eso sigue siendo prosa numerada en `## Ejercicios`.
8. **`roles`** (2026-08-22) — 2 a 4 tarjetas lado a lado (`etiqueta` +
   `rol` + `descripcion`), cada una con su propio color indexado (no
   hay un rol fijo como en `diagrama-etiqueta`, aquí el significado de
   cada tarjeta lo da el autor). Construido desde cero — a diferencia
   de `callout`/`linea-de-tiempo`, no existía nada parecido en
   `referencia-contenido/` que promover — para el caso concreto de "N
   piezas con responsabilidades distintas mostradas en paralelo", como
   HTML/CSS/JavaScript. No confundir con `notas-clave` (lista vertical
   agrupada) ni con `linea-de-tiempo` (orden cronológico): `roles` no
   implica ni agrupación en una sola tarjeta ni secuencia temporal.

**Fuera de alcance a propósito:** el ejercicio "Escríbelo tú" con
comprobaciones automáticas (`RetoConComprobaciones` en
`specs/catalogo-componentes.md`) — es el componente más caro del
catálogo (10-14h estimadas, frente a 3-4h de cada uno de los tres de
arriba) y no tiene nada que reutilizar de lo ya construido. Se queda
como texto descriptivo, igual que ahora. Se retoma como pieza aparte.

## El problema de seguridad que decide el diseño: `SafeMarkdown` es compartido

`src/components/content/SafeMarkdown.tsx` se usa en tres sitios con
modelos de autoría **distintos**:

| Uso | Quién escribe el contenido |
|---|---|
| `LeccionPage.tsx` → `leccion.contenido` | Solo admin (RLS) |
| `TechnologyPage.tsx` → `technology.notes` | Solo admin (RLS) |
| `CommentsSection.tsx` → `comment.body` | Cualquier usuario autenticado |

Si la intercepción de bloques `laboratorio` se activara para los tres
por igual, cualquier usuario registrado podría escribir un comentario
con un bloque ` ```laboratorio ` y conseguir que su JSON se renderice
como componente interactivo en la página de todo el mundo que lea ese
comentario — un vector de contenido controlado por un atacante mucho
más amplio que "admin edita una lección". El mecanismo en sí es
seguro (validación Zod, registro cerrado, iframe `sandbox=""`, nunca
`eval`), pero **quién puede activarlo** importa tanto como el propio
mecanismo.

**Decisión:** `SafeMarkdown` recibe un prop nuevo,
`permitirLaboratorios?: boolean` (por defecto `false`/sin pasar). Solo
`LeccionPage.tsx` lo pasa a `true`. `TechnologyPage.tsx` y
`CommentsSection.tsx` no cambian — con el prop desactivado, un bloque
` ```laboratorio ` se renderiza como código plano (inerte), exactamente
igual que cualquier otro lenguaje sin resaltado especial.

## Mecanismo

1. El autor escribe, dentro del Markdown normal de la lección:

   ````
   ```laboratorio
   {
     "tipo": "predice-el-resultado",
     "codigo": "<p>Hola      mundo</p>",
     "opciones": ["6 espacios", "1 espacio", "0 espacios"],
     "correcta": 1,
     "explicacion": "HTML colapsa los espacios en blanco en uno solo."
   }
   ```
   ````

2. `SafeMarkdown` sobrescribe el componente `code` de `react-markdown`.
   React Markdown v10 no expone la prop `inline` (se quitó en v9): un
   bloque de código con lenguaje trae `className="language-<lenguaje>"`;
   código inline no trae `className`. La detección es
   `className?.startsWith('language-')`.
3. Si `className === 'language-laboratorio'` **y** `permitirLaboratorios`
   es `true`: se intenta `JSON.parse` del contenido y validar con el
   esquema Zod correspondiente a `datos.tipo` (ver abajo). Si valida,
   se busca `tipo` en un registro cerrado
   (`Record<string, ComponenteBloque>`) y se renderiza ese componente
   con los datos ya validados como props.
4. Si el `JSON.parse` falla, la validación Zod falla, o `tipo` no está
   en el registro (o `permitirLaboratorios` es falso): **cae a código
   plano**, nunca a un error visible ni a una página rota. Un typo de
   autor no debe poder tumbar la lección para todo el mundo.
5. Los bloques de código normales (` ```html `, ` ```css `, etc., el
   grueso de las dos lecciones ya escritas) pasan a usar
   `CodigoResaltado` (ya en `src/components/codigo/`, con tests, sin
   dependencias nuevas) en vez del `<code>` plano actual — hoy
   `SafeMarkdown` no resalta sintaxis en absoluto. Es un cambio
   pequeño con impacto visual grande, y usa exactamente el
   tokenizador que ya se llevó a producción con el panel de admin.

## Esquemas (Zod)

Nuevo archivo `src/lib/laboratorio/schemas.ts`:

```ts
export const esquemaPrediceElResultado = z.object({
  tipo: z.literal('predice-el-resultado'),
  lenguaje: z.literal('html').default('html'),
  codigo: z.string().min(1).max(2000),
  opciones: z.array(z.string().min(1)).min(2).max(5),
  correcta: z.number().int().min(0),
  explicacion: z.string().min(1).max(500),
}).refine((d) => d.correcta < d.opciones.length, {
  message: 'correcta debe ser un índice válido de opciones',
})

export const esquemaCodigoAnotado = z.object({
  tipo: z.literal('codigo-anotado'),
  lenguaje: z.literal('html').default('html'),
  codigo: z.string().min(1).max(4000),
  anotaciones: z.array(z.object({
    fragmento: z.string().min(1),
    nota: z.string().min(1).max(500),
  })).min(1).max(8),
})

export const esquemaComparadorAntesDespues = z.object({
  tipo: z.literal('comparador-antes-despues'),
  antes: z.string().min(1).max(2000),
  despues: z.string().min(1).max(2000),
  nota: z.string().max(500).optional(),
})

export const esquemaNotasClave = z.object({
  tipo: z.literal('notas-clave'),
  items: z.array(z.object({
    titulo: z.string().min(1).max(140),
    texto: z.string().min(1).max(600),
  })).min(2).max(8),
})

export const esquemaDiagramaEtiqueta = z.object({
  tipo: z.literal('diagrama-etiqueta'),
  titulo: z.string().min(1).max(120).optional(),
  partes: z.array(z.object({
    texto: z.string().min(1).max(40),
    rol: z.enum([
      'apertura', 'atributo-nombre', 'atributo-valor',
      'contenido', 'cierre', 'simbolo',
    ]),
  })).min(3).max(20),
})

export const esquemaCallout = z.object({
  tipo: z.literal('callout'),
  variante: z.enum(['info', 'aviso', 'error', 'exito']),
  titulo: z.string().min(1).max(140),
  contenido: z.string().min(1).max(600),
})

export const esquemaLineaDeTiempo = z.object({
  tipo: z.literal('linea-de-tiempo'),
  titulo: z.string().min(1).max(120).optional(),
  items: z.array(z.object({
    fecha: z.string().min(1).max(40).optional(),
    titulo: z.string().min(1).max(140),
    texto: z.string().min(1).max(400),
  })).min(2).max(8),
})

export const esquemaRoles = z.object({
  tipo: z.literal('roles'),
  titulo: z.string().min(1).max(120).optional(),
  roles: z.array(z.object({
    etiqueta: z.string().min(1).max(40),
    rol: z.string().min(1).max(60),
    descripcion: z.string().min(1).max(200),
  })).min(2).max(4),
})

export const esquemaBloqueLaboratorio = z.discriminatedUnion('tipo', [
  esquemaPrediceElResultado,
  esquemaCodigoAnotado,
  esquemaComparadorAntesDespues,
  esquemaNotasClave,
  esquemaDiagramaEtiqueta,
  esquemaCallout,
  esquemaLineaDeTiempo,
  esquemaRoles,
])
```

`anotaciones[].fragmento` que no aparece literalmente en `codigo` no es
un error de esquema (Zod no puede saberlo) — el componente debe
manejarlo en runtime igual que ya resolvimos en la demo: filtrar las
anotaciones sin coincidencia (`codigo.indexOf(fragmento) !== -1`) en
vez de romper. Ver el bug real que esto evitó: `2026-08-18`, sesión de
demo, 28 de 35 bloques `codigo-anotado` sin ninguna anotación por este
motivo exacto.

## Componentes

Carpeta nueva `src/components/bloques-laboratorio/` — **no**
`src/components/laboratorio/`, que ya existe y son los 5 prototipos de
referencia (`V1Editor`, etc.), hardcodeados y sin relación con este
sistema genérico. Mezclar ambas carpetas confundiría "prototipo de
diseño" con "feature real".

- `PrediceElResultado.tsx` — recibe `z.infer<typeof esquemaPrediceElResultado>`.
- `CodigoAnotado.tsx` — recibe `z.infer<typeof esquemaCodigoAnotado>`.
- `ComparadorAntesDespues.tsx` — recibe `z.infer<typeof esquemaComparadorAntesDespues>`.
- `NotasClave.tsx` — recibe `z.infer<typeof esquemaNotasClave>`.
- `DiagramaEtiqueta.tsx` — recibe `z.infer<typeof esquemaDiagramaEtiqueta>`.
  No acepta `className` ni ningún prop de color externo — los 5 colores
  por rol están hardcodeados con su variante `dark:` explícita dentro
  del propio componente, a propósito: `tailwind-merge` no depara un
  color pasado por fuera y su contrapartida `dark:` interna (ver
  `specs/design-system.md`, el incidente de las badges de
  `TechnologyPage` que motivó esa regla).
- `Callout.tsx` — recibe `z.infer<typeof esquemaCallout>`. Movido desde
  `referencia-contenido/Callout.tsx` (`git mv`, mismo componente, sin
  cambios de diseño) el día que se promovió a tipo real — un
  componente no puede vivir a la vez en "prototipo, no forma parte del
  pipeline" y en el registro real, por la misma razón que V1-V5 no
  comparten carpeta con este sistema.
- `LineaDeTiempo.tsx` — recibe `z.infer<typeof esquemaLineaDeTiempo>`.
  Mismo `git mv` desde `referencia-contenido/`, pero además se envolvió
  en la tarjeta estándar (`<section>` + icono + eyebrow) que el
  prototipo original no tenía — todos los tipos reales comparten ese
  chrome, los prototipos de `referencia-contenido/` no.
- `Roles.tsx` — recibe `z.infer<typeof esquemaRoles>`. Construido desde
  cero, no promovido — no había nada parecido en `referencia-contenido/`.
  Acento fucsia; colores de cada tarjeta indexados por posición
  (`roles[i]`), no por un significado fijo, porque a diferencia de
  `diagrama-etiqueta` aquí el autor define libremente 2-4 roles
  cualesquiera.
- `registro.ts` — `Record<string, ComponentType<any>>` cerrado, una
  entrada por `tipo`.
- `BloqueLaboratorio.tsx` — el punto de entrada que usa `SafeMarkdown`:
  recibe el texto crudo del bloque de código, hace `JSON.parse` +
  `esquemaBloqueLaboratorio.safeParse`, y si falla devuelve `null`
  (el caller decide el fallback a código plano).

Reutilizan `CodigoResaltado`/`resaltador.ts` de `src/components/codigo/`
para pintar el código dentro de cada bloque — mismo tokenizador que ya
está en producción, no uno nuevo.

Cada componente que renderiza HTML en vivo usa
`<iframe sandbox="" srcDoc={...} title="..." />` — igual que
`EditorCodigo`/`CodigoResaltado` ya hacen. Nunca `allow-scripts`.

## Cambios en archivos existentes

- `src/components/content/SafeMarkdown.tsx`: prop `permitirLaboratorios`,
  override de `code`, override de `pre`/`code` normal para usar
  `CodigoResaltado`.
- `src/routes/LeccionPage.tsx`: `<SafeMarkdown permitirLaboratorios>`.
- `src/routes/TechnologyPage.tsx`, `src/components/comment/CommentsSection.tsx`:
  **sin cambios** — verificar explícitamente en tests que un bloque
  ` ```laboratorio ` en un comentario se renderiza como código plano,
  no como componente.
- `contenido/html/01-fundamentos-del-documento.md`,
  `02-estructura-semantica.md`: los ejercicios 1 y 2 de cada lección
  pasan de `<details>` estático a bloques `laboratorio`. El contenido
  pedagógico no cambia — se reescribe el mecanismo, no el texto.
- Las dos lecciones ya están publicadas en producción: además de
  actualizar los `.md` de referencia en el repo, hay que guardar el
  contenido nuevo desde `/admin/tecnologias/:id/lecciones/:id/editar`
  para que el cambio llegue a producción (no hay migración de datos,
  es edición de contenido).

## Checkpoints de seguridad

- **`permitirLaboratorios` debe seguir siendo `false` por defecto** en
  `SafeMarkdown` — cualquier nuevo uso del componente que no lo pase
  explícitamente queda seguro por defecto, no al revés.
- **Test explícito**: un `comment.body` con un bloque
  ` ```laboratorio ` válido (JSON bien formado, tipo real) se renderiza
  como texto de código, nunca como el componente interactivo. Esto es
  el hallazgo que más importa verificar — es la diferencia entre
  "cualquiera puede escribir un componente en tu página" y "solo el
  admin puede".
- Sin `rehype-raw` en ningún punto — sigue sin usarse en todo el
  proyecto.
- Ningún componente usa `eval`, `new Function`, ni interpola el JSON
  del autor directamente en `dangerouslySetInnerHTML`. El `codigo` de
  cada bloque se pasa a `CodigoResaltado` (que tokeniza y pinta como
  nodos de texto de React) o a `iframe srcDoc` con `sandbox=""` — nunca
  a un `dangerouslySetInnerHTML` sobre el documento principal.
- `JSON.parse` de contenido no confiable puede lanzar — debe estar en
  un `try/catch` explícito, no dejar que un bloque mal formado tumbe el
  render de toda la lección (`error boundary` local al bloque, o
  `safeParse` de Zod que ya no lanza).
- Límite de tamaño por bloque (`codigo` a 2000-4000 caracteres según
  el esquema) — evita que un bloque gigante deteriore el rendimiento
  del tokenizador o del iframe, independiente del límite global de
  `lecciones.contenido` (200.000, migración `0007`).

## Checklist de implementación

- [x] `src/lib/laboratorio/schemas.ts` (8 esquemas + unión discriminada)
- [x] `src/components/bloques-laboratorio/` (8 componentes + registro + punto de entrada)
- [x] `SafeMarkdown.tsx`: prop, override de `code`, `CodigoResaltado` para código normal
- [x] `LeccionPage.tsx`: pasar el prop
- [x] Tests: los 8 tipos renderizan con datos válidos; JSON inválido cae a código plano; `tipo` desconocido cae a código plano; comentario con bloque `laboratorio` NO se activa; 0 violaciones de accesibilidad (`axe`) con los 8 tipos a la vez
- [x] `contenido/html/01-*.md` y `02-*.md` reescritos con bloques reales (versión piloto; el temario real de 2026-08-21 los sustituye lección a lección)
- [x] Contenido actualizado en producción vía el formulario de admin
- [x] `npm run test`, `build`, `lint` en verde
- [x] Verificación visual real (Playwright) de las lecciones publicadas, incluido el toggle antes/después en ambos estados
- [x] Revisión de seguridad — foco en el checkpoint de comentarios de arriba, 0 hallazgos High/Medium
- [x] `diagrama-etiqueta` (2026-08-22): implementado por Codex sobre un
  prompt detallado de Claude, verificado archivo a archivo antes de
  aceptarlo (no solo confiando en su propio reporte) — `tsc`, `lint` y
  la suite completa (212/212) en verde tras la revisión.
- [x] `callout` (2026-08-22): `git mv` de `referencia-contenido/Callout.tsx`
  a `bloques-laboratorio/`, tipado sobre `DatosCallout` en vez de su
  interfaz suelta anterior, registrado, con test dedicado y sumado a la
  auditoría axe conjunta — `tsc`, `lint` y la suite completa (213/213)
  en verde.
- [x] `linea-de-tiempo` y `roles` (2026-08-22, mismo pedido: hacer más
  gráfica la introducción de la lección de HTML): el primero promovido
  desde `referencia-contenido/` igual que `callout`; el segundo
  construido desde cero por Codex sobre un prompt detallado (schema y
  registro ya preparados de antemano por Claude para acotar el trabajo),
  verificado archivo a archivo antes de aceptarlo — `tsc`, `lint` y la
  suite completa (215/215) en verde.
