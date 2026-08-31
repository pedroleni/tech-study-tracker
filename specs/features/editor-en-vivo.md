# Editor en vivo + Proyectos

**Estado:** ✅ implementada — mecanismo diseñado y validado en un
prototipo interactivo (Claude Artifact,
`https://claude.ai/code/artifact/532213d8-6a7e-400c-a01f-11961ab923b0`)
antes de tocar el repo, siguiendo `superpowers:brainstorming`. Esquema Zod
y migración escritos por Claude; componente/formulario admin/ruta
construidos por Codex y revisados archivo a archivo; las 160 lecciones
existentes de HTML/CSS/JavaScript más 12 lecciones-proyecto nuevas
reescritas por Claude. Pendiente solo lo que ningún agente puede hacer
desde este entorno: aplicar la migración a producción (usuario) y una
verificación visual real en navegador (sin Playwright instalado ni
sesión admin disponible aquí).

**Configuración manual requerida:** aplicar `supabase/migrations/0010_proyectos.sql`
contra la base remota (`supabase db push` o el SQL editor del dashboard) —
este entorno no tiene `SUPABASE_ACCESS_TOKEN`/`supabase login`, así que
ningún agente puede aplicarla sin que el usuario lo haga a mano.

## Por qué existe esta feature

Las 160 lecciones de HTML (31), CSS (58) y JavaScript (71) tienen una
sección `## Ejercicios` de prosa plana: "Crea un archivo .html...", "Quita
el doctype y observa...". Quien lee tiene que imaginar el resultado o
abrir su propio editor aparte — ningún ejercicio se puede probar dentro de
la lección. Pedido explícito del usuario: "piensa como puedes hacer mas
practicas las lecciones... pROYECTOS O ALGO INVESTIGA Y VER QUE INVENTAS",
resuelto tras iterar un prototipo (ver historial de brainstorming) hacia
una mezcla de dos piezas:

1. **Un sandbox de código real dentro de la lección** — no una descripción
   de un ejercicio, el ejercicio mismo, editable y con vista previa en
   vivo.
2. **Una identidad "Proyectos" real y descubrible** — no la última lección
   de cada lista, sino una sección propia que cruza las tres tecnologías.

## Alcance

### 1. Nuevo tipo de bloque: `editor-en-vivo`

Un bloque `laboratorio` más (ver `specs/features/laboratorios.md` para el
mecanismo general — este es el tipo #15), con tres campos de código
(`html`/`css`/`js`, cualquiera puede ir vacío salvo que los tres lo estén)
y una vista previa real en un iframe.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Prueba el ejercicio",
  "consigna": "Quita el <!doctype html> y observa el resultado en la vista previa.",
  "html": "<p>Hola mundo</p>",
  "css": "",
  "js": "",
  "pestañaInicial": "html"
}
```

- **Editor real, no un `<textarea>`**: resaltado de sintaxis y
  autocompletado con CodeMirror 6 (`codemirror` + `@codemirror/lang-html` +
  `@codemirror/lang-css` + `@codemirror/lang-javascript`) — a diferencia
  del prototipo de Artifact, que usó CodeMirror 5 concatenado a mano por
  una restricción de esa plataforma (sin bundler para un HTML suelto) que
  no existe aquí: el pipeline real de Vite ya resuelve ESM/npm sin más.
- **Vista previa**: `<iframe sandbox="allow-scripts allow-forms" srcDoc={...} />`
  — nunca `allow-same-origin` junto a `allow-scripts`, para que el iframe
  reciba un origen opaco sin acceso a cookies/localStorage/sesión de la
  página que lo contiene (mismo patrón que CodePen/JSFiddle/StackBlitz).
  Distinto del resto de bloques de `bloques-laboratorio/`, que usan
  `sandbox=""` a secas — aquí el JS del propio ejercicio necesita
  ejecutarse, así que la superficie que sustituye a "sin scripts" es el
  origen opaco, no la ausencia de sandbox. `allow-forms` se añadió tras
  detectar (2026-09-01) que sin él Chrome bloquea la sumisión de
  cualquier `<form>` del ejercicio incluso cuando el JS del alumno llama
  a `event.preventDefault()` correctamente — el sandbox corta la
  sumisión nativa a un nivel que un script no puede anular, dejando
  "bloqueados" los proyectos con formulario (lista de tareas, buscador
  de Pokémon, etc.). `allow-forms` no toca el aislamiento de origen: sin
  `allow-same-origin`, un formulario dentro del iframe solo puede
  enviarse contra su propio documento opaco, nunca contra la página
  real.
- Reconstrucción de `srcDoc` debounced (~200ms) en cada `change` de
  cualquiera de los tres editores — no en cada tecla suelta.
- Solo tres pestañas para las que haya contenido no vacío en los datos del
  bloque (un ejercicio de solo-CSS no necesita pestaña JS vacía).
- Botón "Reiniciar" que vuelve el editor a los tres valores originales del
  bloque (útil tras experimentar con el ejercicio).
- El código no debe reordenarse en móvil: `lineWrapping: false` +
  scroll horizontal propio del editor, igual que se validó en el
  prototipo tras feedback directo de que el código "se desordenaba" en
  pantallas estrechas.
- Límite de 4000 caracteres por campo (mismo orden de magnitud que
  `codigo-anotado`), consistente con el límite global de
  `lecciones.contenido` (200 000, migración `0007`).

### 2. Proyectos: mismo modelo, un flag nuevo

**Decisión de diseño (elegida sobre crear una entidad `proyectos`
separada):** un proyecto es una lección normal con `es_proyecto = true`.
Cero tablas nuevas, cero políticas RLS nuevas, cero flujo de progreso
nuevo — reutiliza `lecciones`/`user_leccion_progress` tal cual. Se
descartó una entidad `proyectos` independiente (tabla propia + RLS propia
+ CRUD admin propio + `user_proyecto_progress` propio) porque no aporta
nada que el flag no dé ya, y multiplica por cuatro la superficie que una
auditoría de seguridad tiene que revisar para el mismo resultado visible.

- Migración `0010_proyectos.sql`: columna
  `es_proyecto boolean not null default false` en `lecciones`, más las
  listas de columnas de `grant insert`/`grant update` reescritas para
  incluirla (ver el comentario en la propia migración: son listas
  explícitas, no "todo menos lo gestionado por el servidor" — una columna
  nueva que no se añada ahí queda invisible para admin aunque RLS ya lo
  permitiera).
- Una lección-proyecto sigue las mismas reglas de visibilidad
  (`lecciones_select_public`, 0004) que cualquier otra: solo visible si
  `status = 'publicado'` y su tecnología está `completado`. Nada cambia
  en RLS, así que no hace falta re-auditar auth/RLS para esta parte —
  spot-check ligero basta.
- **Checkbox "Es un proyecto"** en `LeccionForm.tsx`/`AdminLeccionFormPage.tsx`,
  junto al resto de campos del formulario existente.
- **Ruta nueva `/proyectos`** (`ProyectosPage.tsx`): consulta lecciones con
  `es_proyecto = true` a través de las tres tecnologías (join a
  `technologies` para el nombre/badge/color de cada una), agrupadas o
  filtrables por tecnología. Reutiliza el patrón visual de listado ya
  existente (`CategoryPage.tsx`/tarjetas de `TechnologyCard`), no un
  diseño nuevo desde cero.
- Enlace "Proyectos" visible en la navegación de `AppShell` — a la altura
  de Categorías, no escondido dentro de cada tecnología.

## Esquema (Zod)

Ya añadido por Claude a `src/lib/laboratorio/schemas.ts` (tipo #15 del
discriminador, junto a `DatosEditorEnVivo` exportado):

```ts
export const esquemaEditorEnVivo = z
  .object({
    tipo: z.literal('editor-en-vivo'),
    titulo: z.string().min(1).max(140).optional(),
    consigna: z.string().min(1).max(600).optional(),
    html: z.string().max(4000).default(''),
    css: z.string().max(4000).default(''),
    js: z.string().max(4000).default(''),
    pestañaInicial: z.enum(['html', 'css', 'js']).default('html'),
  })
  .refine((datos) => datos.html.trim() || datos.css.trim() || datos.js.trim(), {
    message: 'editor-en-vivo necesita contenido inicial en html, css o js',
  })
```

Añadido a `esquemaBloqueLaboratorio` (la unión discriminada) y al final de
la lista de tipos exportados, mismo patrón que los 14 tipos anteriores.

## Componente

Carpeta `src/components/bloques-laboratorio/` (no
`src/components/laboratorio/`, los prototipos V1-V5 sin relación con este
sistema — ver `specs/features/laboratorios.md`):

- `EditorEnVivo.tsx` — recibe `z.infer<typeof esquemaEditorEnVivo>`.
  Envuelto en la misma tarjeta/cabecera estándar que el resto de bloques
  (icono + eyebrow + título), acento propio (sugerido: el mismo violeta/
  índigo que ya usa `AdminLaboratorioEjemplosPage` para "en vivo", si
  existe algo así en `design-system.md`; si no, elegir uno no usado por
  ningún otro bloque todavía).
- Registrado en `registro.ts`: `'editor-en-vivo': EditorEnVivo`.

## Cambios en archivos existentes

- `src/lib/laboratorio/schemas.ts` — ya hecho (ver arriba).
- `src/components/bloques-laboratorio/registro.ts` — añadir la entrada.
- `src/types/index.ts` — `Leccion.esProyecto: boolean`.
- `src/lib/queries/mappers.ts` — `LeccionRow.es_proyecto`, mapeo en
  `mapLeccion`, incluir `esProyecto` en `NewLeccionInput`/`LeccionPatch`.
- `src/lib/queries/lecciones.ts` — incluir `es_proyecto` en
  `toNewLeccionPayload`/`toLeccionPatch`; nueva función
  `listProyectos(): Promise<Leccion[]>` (o similar) que selecciona
  `es_proyecto = true` con join a `technologies`.
- `src/components/leccion/LeccionForm.tsx` — checkbox "Es un proyecto"
  (`esProyecto: z.boolean()` en `leccionSchema`, default `false`).
- `src/routes/AdminLeccionFormPage.tsx` — pasar el campo nuevo al
  crear/actualizar.
- `src/routes/ProyectosPage.tsx` — nueva página, patrón de
  `CategoryPage.tsx`.
- `src/App.tsx` — ruta pública `<Route path="/proyectos" element={<ProyectosPage />} />`.
- `src/components/layout/AppShell.tsx` — enlace de navegación.
- `package.json` — nuevas dependencias: `codemirror`,
  `@codemirror/lang-html`, `@codemirror/lang-css`,
  `@codemirror/lang-javascript`.

## Checkpoints de seguridad

- **`sandbox="allow-scripts"` sin `allow-same-origin`, siempre** — es la
  única razón por la que ejecutar JS de un bloque de lección (escrito solo
  por admin, pero aun así conviene no confiar ciegamente) es seguro: el
  iframe no tiene origen real, no puede leer cookies/localStorage/sesión
  del resto de la app ni hacer peticiones con credenciales del usuario.
  Revisar que ningún cambio futuro añada `allow-same-origin` "para que
  funcione algo" — sería el mismo tipo de regresión que un `eval`.
- **Dependencia nueva (`npm install`)** → aplica
  `security-code-vulns.md`/`security-supply-chain.md`: verificar que los
  cuatro paquetes son los oficiales de `codemirror.net` (mismo autor/org
  en npm), sin typosquatting, sin postinstall scripts sospechosos.
- **Sin RLS nueva** — el flag `es_proyecto` cae bajo las políticas ya
  existentes de `lecciones` (0004); no hace falta el subagente
  `security-auth-crypto.md` completo para esta parte, con spot-check del
  diff de la migración (columnas de grant correctas) basta, siguiendo el
  criterio de calibración de riesgo ya establecido para este proyecto.
- El JSON de entrada del bloque sigue sin llegar nunca a `eval`,
  `new Function` ni `dangerouslySetInnerHTML` sobre el documento
  principal — solo a `iframe.srcDoc`, igual que el resto de bloques con
  vista previa en vivo.
- Los mismos límites de tamaño (`html`/`css`/`js` a 4000) que ya usa
  `codigo-anotado`, para no degradar el rendimiento de CodeMirror con un
  bloque gigante.

## Checklist de implementación

- [x] Esquema Zod (`esquemaEditorEnVivo`, tipo #15) — Claude
- [x] Migración `0010_proyectos.sql` — Claude (pendiente de aplicar a
  remoto por el usuario, `supabase db push`)
- [x] `EditorEnVivo.tsx` (CodeMirror 6) + `registro.ts` — Codex
- [x] `Leccion.esProyecto`/`Proyecto` en tipos/mappers/queries — Codex
- [x] Checkbox "Es un proyecto" en `LeccionForm.tsx`/`AdminLeccionFormPage.tsx` — Codex
- [x] `ProyectosPage.tsx` + ruta `/proyectos` en `App.tsx` + enlace en `Navbar.tsx` — Codex
- [x] `npm install` de las 4 dependencias CodeMirror (el sandbox de Codex
  no tiene acceso al registro npm; lo ejecutó Claude después)
- [x] Tests: `editor-en-vivo` renderiza con datos válidos (sandbox
  `allow-scripts` verificado explícitamente); JSON sin html/css/js cae a
  código plano; el checkbox de proyecto persiste; `/proyectos` filtra
  correctamente por `es_proyecto` + `status`/tecnología `completado`
- [x] Fix de Claude tras la primera pasada de tests: jsdom no implementa
  `window.matchMedia` de verdad (falta `addEventListener`/`addListener`),
  y `EditorView` de CodeMirror lo necesita en su `DOMObserver` — añadido
  un stub completo en `src/test/setup.ts`, y ampliado el stub más
  estrecho ya existente en `AdminReferenciaContenidoPage.test.tsx`
  (pensado solo para modo oscuro) para incluirlos también
- [x] `npm run build`, `lint`, `test` en verde (250/250 tests, 0 errores
  de lint, build de producción correcto — bundle crece a ~1.87MB por
  CodeMirror, sin bloquear pero candidato a code-splitting más adelante)
- [x] Spot-check de seguridad — código revisado archivo a archivo: los 4
  paquetes npm son exactamente los oficiales de `codemirror.net`;
  `sandbox="allow-scripts"` sin `allow-same-origin` en el único iframe
  nuevo; el JS del bloque se interpola escapando `</script` antes de
  meterlo en el `srcDoc`; sin `eval`/`dangerouslySetInnerHTML`; ninguna
  política RLS tocada, solo una columna nueva bajo las políticas ya
  existentes de `lecciones` (0004) — no fue necesario el subagente
  completo de `security-auth-crypto.md`
- [ ] Verificación visual (Playwright) del bloque en ambos temas y de
  `/proyectos` — pendiente: no hay Playwright instalado en el proyecto ni
  una sesión admin autenticada disponible en este entorno para probarlo
  en `/admin/referencia-contenido`; la cobertura actual (axe automatizado
  sobre el catálogo completo, en verde) es real pero no sustituye a
  mirarlo de verdad en un navegador
- [x] Contenido HTML: ejercicios reescritos con `editor-en-vivo` en 21
  de las 31 lecciones (las que tienen algo genuinamente escribible y
  observable en un sandbox; el resto son inspección de sitios reales,
  lectores de pantalla o herramientas externas) + 4 lecciones-proyecto
  nuevas (`32`-`35`, módulo Proyectos) — ver `contenido/html/TEMARIO.md`
- [x] Contenido CSS: las 58 lecciones ganaron `editor-en-vivo` (en CSS
  casi todo ejercicio es sandboxeable, a diferencia de HTML) + 4
  lecciones-proyecto nuevas (`59`-`62`) — ver `contenido/css/TEMARIO.md`
- [x] Contenido JavaScript: 67 de las 71 lecciones ganaron
  `editor-en-vivo` (patrón `salida`/`mostrar()` + listener de `error`
  global para fundamentos del lenguaje; DOM real para eventos/Canvas/
  Drag&Drop; fetch real a PokeAPI/dog.ceo para promesas/async) + 4
  lecciones-proyecto nuevas (`72`-`75`). 4 lecciones sin bloque a
  propósito (Web Workers, módulos ES, audio/vídeo, JSDoc — ninguna se
  presta a un único iframe aislado o no cambia nada al "ejecutarse"), y
  `localStorage` (62) lleva el bloque pero como excepción: el origen
  opaco del iframe deshabilita esa API de verdad, así que el bloque
  envuelve las llamadas en `try/catch` y muestra el error real como
  parte de la lección, en vez de fingir que funciona — ver
  `contenido/javascript/TEMARIO.md`
- [x] Verificación automática de todo el contenido nuevo (no sustituye
  al Playwright pendiente, pero es real): cada bloque `editor-en-vivo`
  de las 160 lecciones + 12 proyectos se parseó como JSON válido contra
  el propio esquema (`refine` de no-vacío, límites de arrays de otros
  tipos usados), cada fragmento `js` se verificó con `node --check`
  (sintaxis válida), y cada `getElementById`/`querySelector('#...')`
  del `js` se cruzó contra los `id` reales del `html` del mismo bloque
  — así se detectó y corrigió un bloque real (lección 3 de JavaScript)
  al que le faltaba el `<pre id="salida">` que su propio JS esperaba
- [x] Balance de fences y ausencia de placeholders vacíos verificado en
  las 172 lecciones tocadas (160 existentes + 12 proyectos nuevos)
