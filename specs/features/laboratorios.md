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
existente), `mitos` (2026-08-23, feedback directo de que "Lo que [X]
no es" —4 `callout` idénticos apilados— se veía repetitivo: pedido
explícito de "algo más visual estilo cartas 3D"), y `vista-previa-social`
(2026-08-26, pedido explícito de "un ejemplo gráfico de Open Graph que
se vea más real": mockup de la tarjeta de enlace que genera WhatsApp/
Twitter/Slack, sin cargar ninguna imagen externa real — un placeholder
con icono y etiqueta en el hueco de `og:image`, coherente con que
`SafeMarkdown` nunca carga imágenes remotas de contenido de autor),
`mapa-de-regiones` y `esquema-de-pagina` (2026-08-26, inspirados en la
idea visual — no el código — del prototipo interno "Radiografía"
de `/admin/laboratorio`), y `capas-de-caja` (2026-08-27, mismo origen:
pedido explícito de seguir usando esos prototipos como inspiración al
arrancar el temario de CSS — capas anidadas de color para el modelo de
caja, con la misma paleta que ya usan las DevTools de Chrome/Firefox
para su propio diagrama de box model).
14 tipos de bloque en total, el prop `permitirLaboratorios`, y el
temario real de HTML (completo, en revisión) y de CSS (en progreso)
sobre este mecanismo.

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

Trece tipos de bloque, cada uno con un ejemplo real ya escrito en
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
9. **`recursos`** (2026-08-22) — cuadrícula de tarjetas de enlace
   externo (título + descripción + URL + etiqueta de fuente opcional).
   Promovido desde `referencia-contenido/CuadriculaRecursos.tsx`
   (renombrado a `Recursos.tsx` en el proceso). Filtra en runtime
   cualquier URL que no sea `http:`/`https:` (`javascript:` incluida) —
   esa comprobación ya existía en el prototipo, se conservó tal cual, y
   se le añadió `z.url()` en el esquema como una capa extra, no como
   sustituto. Pedido explícito: darle a "Para profundizar" el mismo
   estilo que "Tarjetas de recursos" en el catálogo, en vez de una
   lista `- [texto](url)` plana.
10. **`mitos`** (2026-08-23) — cuadrícula de 2 a 6 tarjetas volteables en
    3D (`mito` + `realidad` por tarjeta): la cara frontal muestra el
    mito como titular; al pasar el cursor o pulsar (con estado propio
    por tarjeta y `aria-pressed`), gira sobre el eje Y y revela la
    realidad en la cara trasera. Construido desde cero por Codex
    reutilizando la técnica CSS 3D exacta de
    `referencia-contenido/TarjetaVolteable.tsx` (`perspective` +
    `preserve-3d` + `backface-visibility` + rotación por hover **y**
    por clic, para que funcione también en táctil) simplificada a dos
    campos y dimensionada para rejilla (`h-64` fija en vez de la
    tarjeta única centrada del prototipo). Acento naranja, icono
    `RotateCw` en la cabecera del bloque y `Rotate3D` en la cara
    frontal de cada tarjeta — deliberadamente distintos entre sí para
    no repetir el mismo icono en dos lugares del mismo componente.
    Sustituye a `callout` en "Lo que [X] no es", que antes apilaba 4
    avisos idénticos ahí.
11. **`vista-previa-social`** (2026-08-26) — mockup de la tarjeta de
    enlace que generan WhatsApp/Twitter/Slack a partir de las
    metaetiquetas Open Graph: dominio, título y descripción, con un
    placeholder (icono + etiqueta de texto) en el hueco de la imagen
    en vez de cargar una `og:image` real — coherente con que
    `SafeMarkdown` nunca renderiza imágenes remotas de contenido de
    autor, solo su `alt`. Construido desde cero por Codex sobre la
    convención de tarjeta cerrada dentro de otra tarjeta (acento
    esmeralda para el chrome del bloque, la tarjeta simulada con su
    propio fondo distinto por encima). Pedido explícito tras revisar
    el borrador de una lección: "hazme un ejemplo grafico de open
    graph que se vea mas gradico y real" — los bloques `diagrama-etiqueta`
    y `codigo-anotado` ya mostraban la sintaxis de las etiquetas
    `og:*`, pero no lo que producen visualmente.
12. **`mapa-de-regiones`** (2026-08-26) — wireframe estático de una
    página: 2 a 6 regiones apiladas, cada una con su propio color
    cíclico, mostrando la etiqueta HTML (`<header>`, `<nav>`...) y el
    landmark ARIA (`banner`, `navigation`...) que genera, más un
    resumen de qué hay dentro. Adaptación simplificada de una idea de
    `src/components/laboratorio/LaboratorioV4Radiografia.tsx` (el
    prototipo "Radiografía" de V1-V5, no productizado: un escáner
    interactivo completo con capas de regiones/foco/encabezados/
    nombres accesibles sobre una vista previa en vivo) — este bloque
    toma solo la idea visual de "regiones apiladas y etiquetadas con
    su landmark", sin nada interactivo ni HTML en vivo. Pedido
    explícito: "hazlo mas visual con componentes d los laboratorios
    del v1 al v4" tras revisar el borrador de una lección sobre
    header/nav/main/footer.
13. **`esquema-de-pagina`** (2026-08-26) — a diferencia de
    `mapa-de-regiones` (lista apilada), este dibuja la disposición
    espacial real de una página: header/nav/footer a ancho completo,
    y una fila central donde `main` (flexible) y `aside` (ancho fijo,
    `sm:w-40`) se colocan lado a lado, no apilados. `nav` y `aside`
    son opcionales — si faltan, esa fila desaparece o `main` ocupa
    todo el ancho, sin hueco vacío. Feedback directo tras ver
    `mapa-de-regiones` en la lección: "necesito mas visual donde se
    distribuirian cada uno de los bloqueas de la estrucutura" — la
    lista apilada no comunicaba DÓNDE se coloca cada región, solo
    cuáles existen. Colores fijos por hueco (no cíclicos, a diferencia
    de `mapa-de-regiones`), acento lima, icono `LayoutDashboard`
    (distinto de `LayoutTemplate` en `mapa-de-regiones` a propósito).
14. **`capas-de-caja`** (2026-08-27) — el modelo de caja de CSS
    (content, padding, border, margin) como capas anidadas de color,
    cajas dentro de cajas de fuera a dentro. Misma idea de "radiografía
    en capas" que `mapa-de-regiones`, aplicada esta vez al layout de
    una sola caja en vez de a las regiones de una página entera, y con
    la paleta ya estándar de las DevTools de Chrome/Firefox para su
    propio inspector de box model (margin=naranja/discontinuo —no hay
    relleno visual real que pintar—, border=amarillo, padding=verde,
    content=azul, la única capa con el valor centrado dentro en vez de
    en una esquina). Pedido explícito al arrancar el temario de CSS:
    "utiliza los componentes de los laboratorios de la v1 a v4 [...]
    la v4 radiografia me gusta mucho". Construido desde cero por Codex
    en un único intento, sin tocar ningún otro archivo.

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

export const esquemaRecursos = z.object({
  tipo: z.literal('recursos'),
  titulo: z.string().min(1).max(120).optional(),
  recursos: z.array(z.object({
    titulo: z.string().min(1).max(140),
    descripcion: z.string().min(1).max(300),
    url: z.url().max(500),
    etiqueta: z.string().min(1).max(60).optional(),
  })).min(1).max(8),
})

export const esquemaMitos = z.object({
  tipo: z.literal('mitos'),
  titulo: z.string().min(1).max(120).optional(),
  mitos: z.array(z.object({
    mito: z.string().min(1).max(140),
    realidad: z.string().min(1).max(400),
  })).min(2).max(6),
})

export const esquemaVistaPreviaSocial = z.object({
  tipo: z.literal('vista-previa-social'),
  titulo: z.string().min(1).max(120).optional(),
  dominio: z.string().min(1).max(80),
  ogTitulo: z.string().min(1).max(140),
  ogDescripcion: z.string().min(1).max(300),
  imagenEtiqueta: z.string().min(1).max(60),
})

export const esquemaMapaDeRegiones = z.object({
  tipo: z.literal('mapa-de-regiones'),
  titulo: z.string().min(1).max(120).optional(),
  regiones: z.array(z.object({
    etiqueta: z.string().min(1).max(40),
    elemento: z.string().min(1).max(30),
    landmark: z.string().min(1).max(30),
    contenido: z.string().min(1).max(200),
  })).min(2).max(6),
})

export const esquemaEsquemaDePagina = z.object({
  tipo: z.literal('esquema-de-pagina'),
  titulo: z.string().min(1).max(120).optional(),
  header: z.string().min(1).max(80),
  nav: z.string().min(1).max(80).optional(),
  main: z.string().min(1).max(80),
  aside: z.string().min(1).max(80).optional(),
  footer: z.string().min(1).max(80),
})

export const esquemaCapasDeCaja = z.object({
  tipo: z.literal('capas-de-caja'),
  titulo: z.string().min(1).max(120).optional(),
  margin: z.string().min(1).max(24),
  border: z.string().min(1).max(24),
  padding: z.string().min(1).max(24),
  content: z.string().min(1).max(40),
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
  esquemaRecursos,
  esquemaMitos,
  esquemaVistaPreviaSocial,
  esquemaMapaDeRegiones,
  esquemaEsquemaDePagina,
  esquemaCapasDeCaja,
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
- `Recursos.tsx` — recibe `z.infer<typeof esquemaRecursos>`. Promovido
  desde `referencia-contenido/CuadriculaRecursos.tsx` (`git mv` +
  renombrado, envuelto en la tarjeta estándar igual que
  `LineaDeTiempo.tsx`). Conserva su propio filtrado de URLs inseguras
  en runtime (`new URL(url).protocol` tiene que ser `http:` o `https:`,
  si no la tarjeta simplemente no se renderiza) — esa comprobación
  existía ya en el prototipo original y se mantuvo intacta; `z.url()`
  en el esquema es una capa adicional (valida forma de URL), no la
  sustituye (no filtra `javascript:`, que sí es una URL válida
  sintácticamente).
- `Mitos.tsx` — recibe `z.infer<typeof esquemaMitos>`. Construido desde
  cero por Codex, no promovido, pero reutilizando la técnica CSS 3D
  exacta de `referencia-contenido/TarjetaVolteable.tsx` (misma pila
  `[perspective:900px]` / `[transform-style:preserve-3d]` /
  `[backface-visibility:hidden]`, mismo doble disparador hover+clic con
  `aria-pressed`) en vez de reinventar el mecanismo de giro. A
  diferencia del prototipo, cada tarjeta tiene su propio estado de giro
  (array, no un único booleano) y una altura fija (`h-64`) para encajar
  en una rejilla en vez del ancho centrado y limitado del original.
  Acento naranja; icono `RotateCw` en la cabecera del bloque distinto
  de `Rotate3D` en cada tarjeta, a propósito, para no repetir el mismo
  icono en dos sitios del mismo componente.
- `VistaPreviaSocial.tsx` — recibe `z.infer<typeof esquemaVistaPreviaSocial>`.
  Construido desde cero por Codex. No renderiza ningún `<img>` ni carga
  ninguna URL de imagen real — el hueco de `og:image` es un
  placeholder (icono `Image` + el texto de `imagenEtiqueta`) dentro de
  un `aspect-[1.91/1]`, la misma proporción que recomienda Open Graph
  para la imagen real. La tarjeta simulada vive anidada dentro del
  chrome estándar del bloque, con su propio fondo (`bg-background`
  sobre el `bg-card` del contenedor) para que se lea como "una tarjeta
  dentro de otra tarjeta" — un objeto que se está examinando, no más
  contenido de la lección. Acento esmeralda, icono `Share2`.
- `MapaDeRegiones.tsx` — recibe `z.infer<typeof esquemaMapaDeRegiones>`.
  Construido desde cero por Codex, adaptando la idea visual (no el
  código) de `src/components/laboratorio/LaboratorioV4Radiografia.tsx`
  — regiones apiladas, cada una con su propio color de un ciclo fijo
  de 6 tonos, mostrando `<elemento>` y `role: landmark` como dos
  etiquetas visualmente distintas (una de tag, otra de rol ARIA) para
  no confundirlas. Estático, sin estado ni HTML en vivo — a diferencia
  del prototipo, que sí escanea una vista previa real. Acento sky,
  icono `LayoutTemplate`.
- `EsquemaDePagina.tsx` — recibe `z.infer<typeof esquemaEsquemaDePagina>`.
  Construido desde cero por Codex, complementario a `MapaDeRegiones.tsx`
  (no lo sustituye): header/nav/footer a ancho completo, main y aside
  lado a lado en `flex flex-row` desde `sm:`, con `main` en `flex-1` y
  `aside` en ancho fijo. `nav` y `aside` son opcionales — sin ellos, esa
  fila desaparece o `main` ocupa todo el ancho. Colores FIJOS por hueco
  (header/nav/main/aside/footer siempre el mismo tono, a diferencia del
  ciclo por índice de `MapaDeRegiones.tsx`), porque aquí los huecos son
  fijos, no una lista arbitraria. Acento lima, icono `LayoutDashboard`.
- `CapasDeCaja.tsx` — recibe `z.infer<typeof esquemaCapasDeCaja>`.
  Construido desde cero por Codex, mismo linaje visual que
  `MapaDeRegiones.tsx`/`EsquemaDePagina.tsx` (idea de la Radiografía,
  no su código): margin/border/padding/content como cajas anidadas de
  fuera a dentro, con la paleta ya estándar del inspector de box model
  de las DevTools (naranja/amarillo/verde/azul), no una paleta propia
  del proyecto — a propósito, para que se reconozca de un vistazo.
  `margin` lleva borde discontinuo (no hay relleno real que mostrar
  ahí en un navegador); `content`, al ser la única capa con contenido
  real, centra su valor en vez de ponerlo en una esquina como las
  otras tres. Acento naranja, icono `Box`.
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

- [x] `src/lib/laboratorio/schemas.ts` (13 esquemas + unión discriminada)
- [x] `src/components/bloques-laboratorio/` (13 componentes + registro + punto de entrada)
- [x] `SafeMarkdown.tsx`: prop, override de `code`, `CodigoResaltado` para código normal
- [x] `LeccionPage.tsx`: pasar el prop
- [x] Tests: los 14 tipos renderizan con datos válidos; JSON inválido cae a código plano; `tipo` desconocido cae a código plano; comentario con bloque `laboratorio` NO se activa; 0 violaciones de accesibilidad (`axe`) con los 14 tipos a la vez
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
- [x] `recursos` (2026-08-22): `git mv` + renombre de
  `CuadriculaRecursos.tsx`, envuelto en la tarjeta estándar, con test
  dedicado (incluye caso de URL insegura filtrada) y sumado a la
  auditoría axe conjunta. De paso se corrigió
  `AdminReferenciaContenidoPage.test.tsx`, que tenía una lista de
  nombres de componentes desactualizada desde antes de esta sesión
  (nunca incluía los tipos reales de `bloques-laboratorio/`) —
  completada con los 9. `tsc`, `lint` y la suite completa (216/216) en
  verde.
- [x] `mitos` (2026-08-23): construido desde cero por Codex sobre un
  prompt detallado (schema y registro ya preparados de antemano por
  Claude), reutilizando la técnica CSS 3D de `TarjetaVolteable.tsx` y
  las convenciones de tarjeta/rejilla de `Roles.tsx`/`Recursos.tsx`,
  verificado archivo a archivo antes de aceptarlo (build real, no
  `tsc --noEmit` suelto) — `npm run build`, `lint` y la suite completa
  (217/217) en verde. Catálogo (`AdminReferenciaContenidoPage.tsx`) y
  su lista de nombres de test actualizados a los 10 tipos. Verificación
  visual real (Playwright, ruta temporal sin auth revertida tras la
  captura) en claro y oscuro, en reposo y con la tarjeta volteada — 0
  errores de consola.
- [x] `vista-previa-social` (2026-08-26): construido desde cero por
  Codex sobre un prompt detallado (schema y registro ya preparados de
  antemano por Claude), reutilizando la convención de chrome de
  tarjeta de `Roles.tsx`/`Recursos.tsx` con una tarjeta simulada
  anidada dentro — sin cargar ninguna imagen externa real, solo un
  placeholder, coherente con que `SafeMarkdown` nunca renderiza
  `<img>` de contenido de autor. Verificado archivo a archivo antes de
  aceptarlo — `npm run build`, `lint` y la suite completa (242/242) en
  verde, escáner de seguridad sin hallazgos. Catálogo
  (`AdminReferenciaContenidoPage.tsx`) y su lista de nombres de test
  actualizados a los 11 tipos.
- [x] `mapa-de-regiones` (2026-08-26): construido desde cero por Codex
  sobre un prompt detallado (schema y registro ya preparados de
  antemano por Claude), adaptando la idea visual — no el código — de
  `LaboratorioV4Radiografia.tsx` (regiones apiladas y etiquetadas con
  su landmark), simplificada a estático sin escaneo en vivo. Verificado
  archivo a archivo antes de aceptarlo — `npm run build`, `lint` y la
  suite completa (243/243) en verde, escáner de seguridad sin
  hallazgos. Catálogo (`AdminReferenciaContenidoPage.tsx`) y su lista
  de nombres de test actualizados a los 12 tipos. El test del catálogo
  completo (`AdminReferenciaContenidoPage.test.tsx`) empezó a rozar el
  timeout por defecto de Vitest (5000ms) al crecer el catálogo — se le
  puso un timeout explícito de 20s, ya que el test en sí es legítimo
  (monta 60+ componentes reales más una auditoría axe completa), no un
  síntoma de regresión.
- [x] `esquema-de-pagina` (2026-08-26): construido desde cero por Codex
  sobre un prompt detallado (schema y registro ya preparados de
  antemano por Claude), complementario a `mapa-de-regiones` — feedback
  directo de que la lista apilada de ese bloque no mostraba DÓNDE se
  coloca cada región (main/aside lado a lado en una página real, no
  apilados). Verificado archivo a archivo antes de aceptarlo — `npm run
  build`, `lint` y la suite completa (245/245) en verde, escáner de
  seguridad sin hallazgos. Catálogo (`AdminReferenciaContenidoPage.tsx`)
  y su lista de nombres de test actualizados a los 13 tipos.
- [x] `capas-de-caja` (2026-08-27): construido desde cero por Codex
  sobre un prompt detallado (schema y registro ya preparados de
  antemano por Claude), al arrancar el temario de CSS — pedido
  explícito de seguir la línea visual de `mapa-de-regiones`/
  `esquema-de-pagina` ("utiliza los laboratorios de la v1 a v4 [...]
  la v4 radiografia me gusta mucho"), esta vez para el modelo de caja.
  Codex no tocó ningún archivo fuera de `CapasDeCaja.tsx` en un único
  intento. Verificado archivo a archivo antes de aceptarlo — `npm run
  build`, `lint` y la suite completa (246/246) en verde, escáner de
  seguridad sin hallazgos. Catálogo (`AdminReferenciaContenidoPage.tsx`)
  y su lista de nombres de test actualizados a los 14 tipos.
