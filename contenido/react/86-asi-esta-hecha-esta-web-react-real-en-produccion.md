# Así está hecha esta web: React real en producción

- **Módulo:** Calidad y producción
- **Slug:** `asi-esta-hecha-esta-web-react-real-en-produccion` (autogenerado del título)
- **Orden:** 860
- **Fuentes:** El código de Tech Study Tracker (la web que estás leyendo), leído el 21 de octubre de 2026 — ver `contenido/react/TEMARIO.md` #86

---

## Qué es y para qué sirve

La página que estás leyendo es una aplicación de React: hay rutas, una sesión, datos que vienen de una base de datos, comentarios de otros alumnos, un panel de administración y bloques interactivos que ejecutan código dentro de la propia lección. Esta lección la abre en canal. Va a mostrarte **fragmentos reales del código** (cada uno con su ruta en el repositorio), la lección del temario que ilustra cada uno, y también lo que no está bien resuelto.

Una advertencia antes de empezar. Un proyecto real no es un ejemplo de libro: tiene decisiones cuidadas, atajos razonables y cosas pendientes, y verlo así es parte de aprender. **Esto es una foto del 21 de octubre de 2026**: la web cambia, y alguna de las mejoras que propongo al final puede estar hecha cuando leas esto. No hay en ella ninguna clave ni valor de configuración, solo nombres de variables.

### El conjunto de herramientas, leído del `package.json`

- **React 19.2.4** y `react-dom`. Es React de la versión 19, pero no de la 19.3 que enseña el temario, y no usa lo más nuevo: según una búsqueda en el código, no hay ni un `use`, ni un `<Suspense>`, ni `useActionState`, ni `useOptimistic`, ni `useReducer`, ni `<ViewTransition>`. Es React «de siempre»: estado, efectos, contexto y hooks propios. Las vistas previas de las lecciones usan aparte su propia copia de React 19.3.1, dentro de un iframe.
- **Vite 7.3.6** y **TypeScript 5.9.3**, con **Tailwind 4.3.3** (plugin de Vite) y **shadcn/ui** (estilo `radix-nova`, sobre Radix).
- **React Router 7.18.2** en modo declarativo (`BrowserRouter`) y **TanStack Query 5.101.4** para los datos del servidor.
- **Supabase** (`@supabase/supabase-js` 2.110.9): autenticación y una base de datos Postgres protegida con *Row Level Security*. No hay servidor propio, salvo dos funciones de Vercel para las imágenes.
- **React Hook Form 7.65.0** y **Zod 4.3.6** en los formularios; **react-markdown 10.1.0** para pintar el texto de las lecciones y de los comentarios.
- **Vitest 3.2.7**, **Testing Library** y **vitest-axe** (75 archivos de pruebas), más ESLint con `react-hooks` y `jsx-a11y`.
- **Vercel** para publicar (lección 85).

Este es el árbol de componentes de arriba, simplificado, con lo que se lleva cada parte:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "De main.tsx a un bloque de una lección",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "← main.tsx la monta dentro de <StrictMode>"
    },
    {
      "nombre": "QueryClientProvider",
      "nivel": 1,
      "etiqueta": "proveedor",
      "nota": "← la caché de TanStack Query"
    },
    {
      "nombre": "BrowserRouter",
      "nivel": 2,
      "etiqueta": "proveedor",
      "nota": "← lección 76"
    },
    {
      "nombre": "Routes",
      "nivel": 3
    },
    {
      "nombre": "AppShell",
      "nivel": 4,
      "etiqueta": "diseño",
      "nota": "← Navbar y el <Outlet />"
    },
    {
      "nombre": "Páginas públicas",
      "nivel": 5,
      "nota": "← portada, categorías, tecnologías, inicio de sesión..."
    },
    {
      "nombre": "LeccionPage",
      "nivel": 5,
      "nota": "← useLeccion, useProfile, useTechnology..."
    },
    {
      "nombre": "SafeMarkdown",
      "nivel": 6,
      "nota": "← react-markdown, sin HTML crudo"
    },
    {
      "nombre": "BloqueLaboratorio",
      "nivel": 7,
      "nota": "← JSON, Zod y un registro cerrado"
    },
    {
      "nombre": "ReactEnVivo",
      "nivel": 8,
      "nota": "← y dentro, un iframe con sandbox"
    },
    {
      "nombre": "CommentsSection",
      "nivel": 6,
      "nota": "← también con SafeMarkdown"
    },
    {
      "nombre": "ProtectedRoute",
      "nivel": 5,
      "etiqueta": "guarda",
      "nota": "← sin sesión: Navigate a /login"
    },
    {
      "nombre": "FavoritesPage",
      "nivel": 6
    },
    {
      "nombre": "AdminRoute",
      "nivel": 6,
      "etiqueta": "guarda",
      "nota": "← no admin: Navigate a /"
    },
    {
      "nombre": "Páginas de administración",
      "nivel": 7,
      "nota": "← categorías, tecnologías, lecciones..."
    }
  ]
}
```

## El punto de entrada: `main.tsx`

Todo empieza como en la lección 3: un `createRoot` sobre el `<div id="root">` del `index.html`, y `<StrictMode>` alrededor de la aplicación (lecciones 12 y 63).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/main.tsx\nimport { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\n\nimport App from './App'\nimport './index.css'\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "createRoot(document.getElementById('root')!)",
      "nota": "El signo ! es de TypeScript (módulo 10): promete que el elemento existe. Si el index.html no tuviera #root, esto fallaría al arrancar."
    },
    {
      "fragmento": "<StrictMode>",
      "nota": "Doble render en desarrollo y efectos que se montan, se desmontan y se vuelven a montar (lección 63). En producción no hace nada: solo existe en desarrollo, para ayudarte a descubrir efectos mal limpiados."
    },
    {
      "fragmento": "createRoot(document.getElementById",
      "nota": "Sin segundo argumento. La lección 53 enseña onUncaughtError y onCaughtError para registrar los errores de producción; esta raíz no los tiene, ni hay ningún error boundary en todo el código. Lo retomo al final."
    }
  ]
}
```

## Rutas: lo que enseñan las lecciones 76 y 77

El `App.tsx` es una aplicación de React Router declarativa de las que has escrito tú, con tres capas de **rutas de diseño** (*layout routes*, lección 77): una sin ruta propia que pinta el `AppShell` con un `<Outlet />`, y dos más que sirven de guardas. Estas son sus partes principales (quito las páginas repetitivas):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/App.tsx (recortado)\nfunction App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <BrowserRouter>\n        <Routes>\n          <Route element={<AppShell />}>\n            <Route index element={<PublicHomePage />} />\n            <Route path=\"/tecnologias/:id/:leccionSlug\" element={<LeccionPage />} />\n            <Route path=\"/login\" element={<LoginPage />} />\n            {/* … el resto de páginas públicas … */}\n            <Route element={<ProtectedRoute />}>\n              <Route path=\"/favoritos\" element={<FavoritesPage />} />\n              <Route element={<AdminRoute />}>\n                <Route path=\"/admin\" element={<AdminDashboardPage />} />\n                {/* … el resto del panel … */}\n              </Route>\n            </Route>\n          </Route>\n        </Routes>\n      </BrowserRouter>\n    </QueryClientProvider>\n  )\n}\n\n// src/components/auth/AdminRoute.tsx\nexport function AdminRoute() {\n  const { isAdmin, loading } = useProfile()\n\n  if (loading) {\n    return <p role=\"status\">Comprobando permisos…</p>\n  }\n\n  return isAdmin ? <Outlet /> : <Navigate to=\"/\" replace />\n}",
  "anotaciones": [
    {
      "fragmento": "<Route element={<AppShell />}>",
      "nota": "Una ruta sin path: no añade nada a la URL, solo envuelve a sus hijas con el mismo diseño (cabecera y contenido). Es el patrón de la lección 77."
    },
    {
      "fragmento": "\"/tecnologias/:id/:leccionSlug\"",
      "nota": "Dos parámetros de URL, que LeccionPage lee con useParams. La URL identifica la lección: es un enlace que se puede compartir (lección 77)."
    },
    {
      "fragmento": "<Route element={<ProtectedRoute />}>",
      "nota": "Otra ruta sin path. ProtectedRoute pinta un Outlet si hay sesión y un Navigate a /login si no. AdminRoute, anidada dentro, añade la comprobación de rol."
    },
    {
      "fragmento": "if (loading) {",
      "nota": "Mientras no se sabe si hay sesión o perfil, ni se deja pasar ni se expulsa: se enseña un estado de carga con role status. Si se redirigiera antes de tiempo, un administrador que recarga /admin acabaría en la portada."
    },
    {
      "fragmento": "<Navigate to=\"/\" replace />",
      "nota": "replace sustituye la entrada del historial en lugar de añadir otra, para que el botón Atrás no devuelva al usuario a una página que lo vuelve a expulsar."
    }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres capas, y solo una es una barrera",
  "roles": [
    {
      "etiqueta": "La interfaz",
      "rol": "Comodidad, no seguridad",
      "descripcion": "AdminRoute decide qué pantalla ve cada persona. Cualquiera puede saltárselo desde las herramientas de desarrollo: el código del navegador es suyo."
    },
    {
      "etiqueta": "El contenido",
      "rol": "Que lo ajeno no se ejecute",
      "descripcion": "react-markdown sin HTML crudo, URL comprobadas, un registro cerrado de bloques y un iframe con sandbox para el código de las lecciones."
    },
    {
      "etiqueta": "Postgres (RLS)",
      "rol": "La barrera de verdad",
      "descripcion": "Cada tabla decide quién puede leer, crear, editar o borrar cada fila, haga lo que haga el navegador. Es lo que la lección 82 llama «tu servidor»."
    }
  ]
}
```

**Lo que dijo la lección 82 sobre el servidor se ve aquí en pequeño**: `AdminRoute` es solo comodidad. Lo que impide de verdad que un usuario cualquiera cree o borre lecciones está en la base de datos, en las políticas de *Row Level Security* de Postgres. Estas son las dos que gobiernan la tabla de lecciones (de las migraciones de `supabase/migrations/`; he quitado los comentarios):

```text
create policy "lecciones_select_public" on public.lecciones
  for select
  to anon, authenticated
  using (
    (
      status = 'publicado'
      and exists (
        select 1 from public.technologies t
        where t.id = lecciones.technology_id
          and t.status = 'completado'
          and private.is_admin(t.user_id)
      )
    )
    or exists (
      select 1 from public.technologies t
      where t.id = lecciones.technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );

create policy "lecciones_insert_admin" on public.lecciones
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.technologies t
      where t.id = technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );
```

En castellano: **cualquiera** (incluso sin cuenta) puede leer una lección si está publicada y su tecnología también; **solo el administrador dueño** de la tecnología puede ver los borradores, crear, editar o borrar. Y todo esto lo aplica Postgres a cada petición, vengan de esta web o de un `curl`.

Ahora se entiende el comentario de la lección 82 sobre la clave de Supabase del navegador: la web lleva en el código del cliente la dirección del proyecto y una clave pública (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; ver lección 85), y no pasa nada porque **esa clave no da ningún permiso por sí sola**: lo que se puede hacer con ella lo deciden las políticas de arriba. Lo contrario sería un desastre: la clave de administración de Supabase, que se salta todas esas reglas, no puede estar nunca en el navegador.

### Un hueco real: la ruta que no existe

Hay una cosa que `App.tsx` no tiene: **una ruta `path="*"`**. Y eso tiene un efecto que he comprobado con un navegador contra la web real. Con la reescritura de Vercel (lección 85), cualquier dirección devuelve el `index.html` con un `200`; después React Router no encuentra ninguna ruta para `/ruta/que/no/existe`. Resultado, en la web de producción:

```text
Aviso en la consola:  No routes matched location "/ruta/que/no/existe"
Contenido de #root:   (vacío)
```

Ni la cabecera, ni un mensaje, ni un enlace para volver: una pantalla completamente en blanco. Pasa porque `AppShell` es una ruta de diseño sin `path` y solo se pinta cuando alguna ruta hija casa. Es lo que cuenta la lección 85 y es un hallazgo sencillo de arreglar (lo propongo más abajo).

## Datos: TanStack Query dentro de hooks propios

Las páginas no llaman a Supabase. Lo hacen unos **hooks propios** que envuelven a `useQuery` (lección 43), y las funciones que hablan con la base de datos viven aparte, en `src/lib/queries/`. Fíjate en la forma de la clave de la caché:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/lib/queries/queryKeys.ts (recortado)\nexport const queryKeys = {\n  leccionBySlug: (viewerId: string | null, technologyId: string, slug: string) =>\n    ['lecciones', viewerId ?? 'public', 'slug', technologyId, slug] as const,\n  // …\n}\n\n// src/lib/hooks/useLeccion.ts\nexport function useLeccion(lookup: LeccionLookup) {\n  const { user, loading } = useAuth()\n  const viewerId = user?.id ?? null\n  const byId = 'id' in lookup && Boolean(lookup.id)\n\n  return useQuery({\n    queryKey: byId\n      ? queryKeys.leccionById(viewerId, lookup.id ?? '')\n      : queryKeys.leccionBySlug(viewerId, lookup.technologyId ?? '', lookup.slug ?? ''),\n    queryFn: () => getLeccion(lookup),\n    enabled:\n      !loading &&\n      (byId ? Boolean(lookup.id) : Boolean(lookup.technologyId && lookup.slug)),\n  })\n}\n\n// src/lib/queryClient.ts\nexport const queryClient = new QueryClient({\n  defaultOptions: {\n    queries: { retry: 1, staleTime: 30_000 },\n  },\n})",
  "anotaciones": [
    {
      "fragmento": "['lecciones', viewerId ?? 'public', 'slug', technologyId, slug] as const",
      "nota": "La clave incluye quién mira. No es un capricho: ver el siguiente ejercicio de predicción."
    },
    {
      "fragmento": "const { user, loading } = useAuth()",
      "nota": "Un hook que usa otro hook (lección 43). Aquí se pregunta por la sesión para construir la clave y para esperar a saberla."
    },
    {
      "fragmento": "queryFn: () => getLeccion(lookup)",
      "nota": "La función que habla con Supabase, en otro archivo. TanStack Query decide cuándo llamarla; el componente solo lee data, isLoading e isError (lección 78)."
    },
    {
      "fragmento": "!loading &&",
      "nota": "enabled en false significa «todavía no pidas nada»: si la petición saliera antes de saber si hay sesión, se haría como visitante anónimo y se guardaría en la caché con la clave equivocada."
    },
    {
      "fragmento": "staleTime: 30_000",
      "nota": "Durante 30 segundos un dato se considera fresco: si otro componente pide lo mismo, TanStack Query le da lo que ya tiene y no hace una petición. Es lo que hace útil la caché, y lo que hace importante la clave."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Imagina que la clave NO incluyera a quien mira:\n//   queryKey: ['lecciones', 'slug', 'react', 'hooks']\n// y que no se vaciara la caché al cerrar sesión.\n//\n// staleTime: 30_000 (30 segundos)\n//\n// 1. Ana, que es administradora, abre en esta pestaña\n//    la lección «hooks», que sigue en borrador. Ve el borrador.\n// 2. Ana cierra sesión. Entra Luis, que no es administrador.\n// 3. Diez segundos después, Luis abre la misma lección.\n//\n// ¿Qué recibe Luis?",
  "opciones": [
    "Un error: Supabase le niega la lección por las políticas de RLS",
    "La lección de Ana, el borrador, sacada de la caché sin pedir nada a Supabase",
    "«Lección no encontrada», porque su cuenta no tiene permisos",
    "La lección de Ana, pero solo después de volver a pedirla a Supabase"
  ],
  "correcta": 1,
  "explicacion": "La caché de TanStack Query se indexa por la clave: la misma clave es la misma entrada, sin importar quién la pidió. Y dentro de staleTime el dato está «fresco», así que ni siquiera se vuelve a pedir. Las políticas de RLS protegen la base de datos, no la memoria de esta pestaña. Se comprobó con el QueryClient: Luis recibe el dato de Ana con una sola petición hecha; con el id de usuario en la clave, hace una petición nueva."
}
```

Por eso la web se defiende por dos lados: **el usuario va en la clave** (arriba) y **se vacía la caché entera al cerrar la sesión**. Lo segundo está en `useAuth`, que es el hook más interesante de todo el proyecto, y también el que más me hace dudar.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/lib/hooks/useAuth.ts (recortado)\nexport function useAuth() {\n  const [session, setSession] = useState<Session | null>(null)\n  const [loading, setLoading] = useState(true)\n\n  useEffect(() => {\n    let active = true\n\n    const { data: { subscription } } = supabase.auth.onAuthStateChange(\n      (event, nextSession) => {\n        // Draft technologies are visible to admins. Remove every cached copy when\n        // Supabase ends the session, including expiry/revocation outside our button.\n        if (event === 'SIGNED_OUT') {\n          queryClient.clear()\n        }\n        if (active) {\n          setSession(nextSession)\n          setLoading(false)\n        }\n      },\n    )\n\n    void supabase.auth.getSession().then(({ data, error }) => {\n      if (!active) return\n      setSession(error ? null : data.session)\n      setLoading(false)\n    })\n\n    return () => {\n      active = false\n      subscription.unsubscribe()\n    }\n  }, [])\n\n  // … signIn, signUp, signOut… con useCallback\n  const user: User | null = session?.user ?? null\n  return { user, session, loading /* , … */ }\n}",
  "anotaciones": [
    {
      "fragmento": "const { data: { subscription } } = supabase.auth.onAuthStateChange(",
      "nota": "Suscribirse a algo de fuera de React: Supabase avisa cada vez que cambia la sesión. Es un efecto de la lección 38, y la lección 46 explica la herramienta pensada para esto, useSyncExternalStore."
    },
    {
      "fragmento": "if (event === 'SIGNED_OUT') {",
      "nota": "El comentario original, en inglés, lo explica: los borradores son visibles para administradores, así que al terminar la sesión hay que borrar toda la caché, también cuando la sesión caduca o se revoca fuera del botón."
    },
    {
      "fragmento": "let active = true",
      "nota": "La bandera para ignorar una respuesta que llega tarde, de las lecciones 40 y 42: si el componente ya se desmontó, no se actualiza su estado."
    },
    {
      "fragmento": "subscription.unsubscribe()",
      "nota": "La limpieza del efecto, que cancela la suscripción. Sin ella, cada montaje dejaría una suscripción viva; y con StrictMode, en desarrollo, se vería enseguida (lección 63)."
    }
  ]
}
```

**Lo que me hace dudar**: `useAuth` es un hook normal, con su propio `useState`. Cada componente que lo llama tiene **su propio estado y su propia suscripción a Supabase**, sin compartir nada. Y se llama desde muchos sitios: hay 36 llamadas a `useAuth()` en el código, y en la página de una lección participan al menos seis (`Navbar`, `useProfile`, `useTechnology`, `useLeccion`, `useLecciones` y `CommentsSection`, que usan `useAuth` por dentro). Es lo que dice el código; no lo he medido en el navegador. Funciona, porque la suscripción es barata, pero las lecciones 28, 29 y 46 enseñan lo que se haría hoy: un **proveedor de contexto** (`AuthProvider`) con la sesión leída una vez, o un almacén externo con `useSyncExternalStore`. Entre otras cosas, cada instancia empieza con `loading` en `true` y lo cambia a su ritmo.

## Contenido ajeno: lo que enseña la lección 82, aplicado

El texto de las lecciones y los comentarios son Markdown que escribe otra persona, y se pinta con `react-markdown`. **No hay ningún `dangerouslySetInnerHTML` en el código de la aplicación** (la búsqueda solo encuentra un comentario que dice «Nunca dangerouslySetInnerHTML», en `TablaResultado.tsx`), y tampoco se usa `rehype-raw`, el plugin que dejaría pasar HTML crudo dentro del Markdown. Estos son los dos componentes que reescriben los enlaces y las imágenes:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/components/content/SafeMarkdown.tsx (recortado)\n<ReactMarkdown\n  remarkPlugins={[remarkGfm]}\n  components={{\n    a: ({ href, children: linkChildren }) =>\n      href && validateResourceUrl(href) ? (\n        <a href={href} target=\"_blank\" rel=\"noreferrer\">\n          {linkChildren}\n        </a>\n      ) : (\n        <span>{linkChildren}</span>\n      ),\n    // Comments are public, user-authored Markdown. Do not let an author make\n    // every reader's browser contact an arbitrary tracking host.\n    img: ({ alt }) => (alt ? <span>{alt}</span> : null),\n    // …\n  }}\n>\n  {children}\n</ReactMarkdown>\n\n// src/lib/utils/validateResourceUrl.ts\nexport function validateResourceUrl(resourceUrl: string): boolean {\n  try {\n    const { protocol } = new URL(resourceUrl)\n\n    return protocol === 'http:' || protocol === 'https:'\n  } catch {\n    return false\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "validateResourceUrl(href)",
      "nota": "Solo http y https se convierten en enlace. Un javascript: o un data: se pintan como texto sin enlace. Es la comprobación con URL de la lección 82 (React 19 ya bloquea javascript:, pero esto va más allá)."
    },
    {
      "fragmento": "rel=\"noreferrer\"",
      "nota": "Los enlaces externos se abren en una pestaña nueva sin enviar de dónde vienes. En los navegadores modernos, noreferrer también implica noopener."
    },
    {
      "fragmento": "img: ({ alt }) => (alt ? <span>{alt}</span> : null),",
      "nota": "Una imagen escrita en Markdown no carga nada: se sustituye por su texto alternativo. Es una decisión de privacidad, con el motivo en el comentario: nadie puede hacer que el navegador de los demás pida a un servidor ajeno."
    },
    {
      "fragmento": "try {",
      "nota": "new URL lanza una excepción si el texto no es una URL. El try/catch evita que un enlace mal escrito tumbe el componente (lección 82)."
    }
  ]
}
```

### Un registro cerrado para los bloques

Los bloques interactivos de las lecciones (como los que estás usando) no son código: son **datos**. Cada uno es un bloque de código Markdown marcado como `laboratorio`, con un JSON dentro. Convertir ese texto en un componente es un recorrido de tres pasos, y cada paso cierra una puerta:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/components/bloques-laboratorio/BloqueLaboratorio.tsx\nexport function BloqueLaboratorio({ contenido }: { contenido: string }): ReactElement | null {\n  try {\n    const datosDesconocidos: unknown = JSON.parse(contenido)\n    const resultado = esquemaBloqueLaboratorio.safeParse(datosDesconocidos)\n\n    if (!resultado.success) return null\n\n    const Componente = registroBloquesLaboratorio[resultado.data.tipo]\n    if (!Componente) return null\n\n    return createElement(Componente, resultado.data)\n  } catch {\n    return null\n  }\n}\n\n// src/components/bloques-laboratorio/registro.ts (recortado)\n// El registro es deliberadamente cerrado: el JSON solo puede escoger uno de\n// estos componentes, nunca un nombre de elemento o módulo arbitrario.\nexport const registroBloquesLaboratorio: Record<string, ComponentType<any>> = {\n  'predice-el-resultado': PrediceElResultado,\n  'codigo-anotado': CodigoAnotado,\n  'react-en-vivo': ReactEnVivo,\n  // …\n}",
  "anotaciones": [
    {
      "fragmento": "const datosDesconocidos: unknown = JSON.parse(contenido)",
      "nota": "Primera puerta: el texto puede no ser JSON. Y aunque lo sea, JSON.parse devuelve cualquier cosa, por eso se tipa como unknown y no como lo que uno espera."
    },
    {
      "fragmento": "esquemaBloqueLaboratorio.safeParse(datosDesconocidos)",
      "nota": "Segunda puerta: un esquema de Zod con una unión discriminada por tipo (z.discriminatedUnion). Solo pasan los datos que tienen la forma exacta de un bloque conocido, con sus límites de tamaño. Lección 61 para Zod."
    },
    {
      "fragmento": "registroBloquesLaboratorio[resultado.data.tipo]",
      "nota": "Tercera puerta: la búsqueda en el registro se hace con un valor ya validado, uno de los tipos conocidos. Es el orden lo que importa; el ejercicio de abajo lo demuestra."
    },
    {
      "fragmento": "return createElement(Componente, resultado.data)",
      "nota": "createElement, de la lección 7, en lugar de JSX: el tipo del componente es una variable. Si no hay bloque válido, devuelve null y SafeMarkdown pinta el contenido como un bloque de código normal."
    },
    {
      "fragmento": "nunca un nombre de elemento o módulo arbitrario",
      "nota": "Si el JSON pudiera escoger el tipo como texto, createElement aceptaría hasta nombres de etiquetas HTML («script», «iframe»). El comentario original explica por qué el registro es una lista cerrada y no una búsqueda libre."
    }
  ]
}
```

Una nota sobre cómo se usa: en `SafeMarkdown`, la función se llama directamente (`BloqueLaboratorio({ contenido: codigo })`) y no como un componente (`<BloqueLaboratorio />`). Parece un atajo deliberado: así sabe enseguida si devuelve `null` y, en ese caso, cae al bloque de código normal. Funciona porque `BloqueLaboratorio` no usa ningún Hook. Las lecciones 12 y 44 explican por qué es una práctica de la que desconfiar: si un día esa función usara `useState`, sus Hooks pasarían a ser de quien la llama, y variarían según el contenido de cada bloque.

Y ahora una pregunta sobre el tercer paso, la que justifica que el orden sea ese:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const registro = { aviso: Aviso, cita: Cita }\n\n// Sin comprobar nada antes, con un tipo que llega en el JSON:\nconst tipo = 'constructor'\nconst Componente = registro[tipo]\n\nconsole.log(typeof Componente)",
  "opciones": [
    "undefined, porque registro no tiene ninguna clave «constructor»",
    "function",
    "object",
    "string"
  ],
  "correcta": 1,
  "explicacion": "Un objeto literal hereda de Object.prototype, y registro[\"constructor\"] es la función Object. Si tipo viniera de un JSON sin validar, «constructor», «toString» o «hasOwnProperty» se colarían como si fueran componentes. El ejercicio de abajo enseña qué error da React y cómo cerrar esa puerta con Object.hasOwn."
}
```

### El código de los alumnos corre en un iframe sin permisos

Las vistas previas de React de este temario ejecutan **código que escribes tú**, que puede hacer cualquier cosa. La defensa es un `<iframe>` con el atributo `sandbox`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/components/bloques-laboratorio/VistaPreviaReact.tsx (recortado)\n<iframe\n  ref={iframeRef}\n  className={cn(\n    'block w-full max-w-full rounded-lg border bg-white',\n    alto === null && 'h-40 sm:h-56',\n  )}\n  sandbox=\"allow-scripts allow-forms\"\n  srcDoc={srcDoc}\n  title=\"Vista previa de React\"\n/>",
  "anotaciones": [
    {
      "fragmento": "sandbox=\"allow-scripts allow-forms\"",
      "nota": "sandbox quita todos los permisos y solo devuelve los que nombras: ejecutar scripts y enviar formularios. No incluye allow-same-origin, así que el iframe tiene un origen opaco: su código no puede leer el almacenamiento local, las cookies ni la sesión de Supabase de la página que lo contiene."
    },
    {
      "fragmento": "srcDoc={srcDoc}",
      "nota": "El documento se construye en el navegador y se entrega como texto, sin pedir nada a ningún servidor. Dentro va otra copia de React (la 19.3.1 que usa el temario), no la de la web."
    },
    {
      "fragmento": "title=\"Vista previa de React\"",
      "nota": "Todo iframe necesita un título para los lectores de pantalla (lección 37). Es una de las cosas que jsx-a11y comprueba en el lint."
    }
  ]
}
```

### Una cosa más, ya en el servidor

Las imágenes de las lecciones pasan por una función de Vercel (`api/imagenes.ts`) que las guarda en un almacenamiento externo. Su cabecera es un buen ejemplo de **validar en el servidor, no en el cliente**, y de explicar el porqué en un comentario:

```text
// SVG queda fuera a propósito: puede llevar <script> embebido, y visitar
// /img/<hash>.svg directamente (documento de nivel superior, no <img>) lo
// ejecutaría en el origen de techstudytracker.com — un XSS evitable del
// todo simplemente no aceptando ese formato.
const EXTENSIONES_PERMITIDAS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}
```

Además de la lista de formatos, comprueba que los primeros bytes del archivo sean los de un PNG, un JPEG o un WebP de verdad (los «números mágicos»), y limita el tamaño a 4 MB. Todo esto repite la lección 82: el navegador puede mentir sobre el tipo de un archivo, el servidor no puede fiarse.

## Qué se carga y cuándo

Esta web pesa mucho, y se nota en el `dist/` (medido en una construcción local del 20 de octubre de 2026):

- **El JavaScript principal: 2,8 MB** (unos 780 KB comprimido). Lleva React, el router, Supabase, `react-markdown`, el editor de código... y **todas las páginas, incluido el panel de administración**.
- **El compilador de TypeScript: 3,6 MB** en su propio archivo, que solo se descarga cuando una lección de TypeScript lo necesita.
- **PostgreSQL en el navegador (PGlite): unos 10 MB** de WebAssembly más 6 MB de datos, igual: solo con una lección de PostgreSQL con un editor en vivo.
- **Sucrase**, el traductor de JSX, unos 207 KB, que se descarga al abrir la primera lección con una vista previa de React. Y `sql.js` (SQL), `wasm-git` (Git)...

Esos «solo cuando hacen falta» son la parte bien hecha: cada motor pesado se carga con un `import()` dinámico, como el de la lección 50, desde el módulo que lo necesita. Este es el de Sucrase, con un comentario que enlaza con la lección 85:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/lib/react-en-vivo/transformar.ts (recortado)\nlet promesaSucrase: Promise<typeof import('sucrase')> | undefined\n\nfunction cargarSucrase() {\n  promesaSucrase ??= import('sucrase').catch((error: unknown) => {\n    // Un chunk caducado tras un despliegue no se queda cacheado: el siguiente\n    // intento vuelve a pedirlo.\n    promesaSucrase = undefined\n    throw error\n  })\n  return promesaSucrase\n}",
  "anotaciones": [
    {
      "fragmento": "promesaSucrase ??= import('sucrase')",
      "nota": "Se guarda la promesa, no el módulo: si dos bloques lo piden a la vez, comparten la misma descarga. Es la misma idea de la caché de promesas de las lecciones 49 y 52."
    },
    {
      "fragmento": ".catch((error: unknown) => {",
      "nota": "Si la descarga falla, la promesa rechazada no se queda en la variable para siempre. Sin esto, un fallo de red dejaría el editor roto hasta recargar la página."
    },
    {
      "fragmento": "Un chunk caducado tras un despliegue",
      "nota": "El caso de la lección 85: una pestaña abierta antes de un despliegue pide un trozo con un nombre de hash que ya no existe, y recibe el index.html en su lugar. Este código lo anticipa."
    }
  ]
}
```

**Lo que no se carga bajo demanda son las propias páginas.** No hay ni un `React.lazy` en la web: el panel de administración, que solo usa una persona, viaja en el mismo archivo de 2,8 MB que la portada. Cuánto se ganaría separándolo no lo he medido, pero la lección 50 y la 85 muestran el camino (un `lazy` por ruta, con un `<Suspense>` y un error boundary alrededor).

## Formularios, efectos y estado derivado

Tres detalles pequeños de componentes concretos, para ver las lecciones en su sitio:

**Formularios (lecciones 22, 57 y 61).** El editor de lecciones usa React Hook Form para los campos, y Zod para validar al enviar, sin integrarlos con un *resolver*: la función `submit` llama a `leccionSchema.safeParse(values)` y traslada el primer error al campo con `setError`. Es la validación «en tu acción» de la lección 61, con el esquema como única fuente de verdad (títulos de hasta 120 caracteres, resúmenes de 300, contenido de 200 000).

**Estado que se ajusta al renderizar (lecciones 26 y 39).** La página de proyectos tiene un filtro por tecnología y una paginación. Cuando cambia el filtro hay que volver a la página 1. En lugar de un efecto, que pintaría con la página vieja un instante, ajusta el estado durante el render:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/routes/ProyectosPage.tsx (recortado)\nconst [technologyId, setTechnologyId] = useState<string | null>(null)\nconst [pagina, setPagina] = useState(1)\n// …\n\n// Ajuste de estado durante el render (patrón recomendado por React para\n// \"resetear estado cuando cambia otro valor\"), no un useEffect — evita un\n// ciclo de render de más: React ve el cambio de estado antes de pintar y\n// vuelve a renderizar en el mismo turno, en vez de pintar con la página\n// vieja y corregirla un instante después en un efecto separado.\nconst [technologyIdAlPaginar, setTechnologyIdAlPaginar] = useState(technologyId)\nif (technologyId !== technologyIdAlPaginar) {\n  setTechnologyIdAlPaginar(technologyId)\n  setPagina(1)\n}",
  "anotaciones": [
    {
      "fragmento": "const [technologyIdAlPaginar, setTechnologyIdAlPaginar] = useState(technologyId)",
      "nota": "Guarda el valor del filtro con el que se calculó la página actual. Es una «copia para comparar», el truco de la lección 39 para reaccionar a un cambio sin un efecto."
    },
    {
      "fragmento": "if (technologyId !== technologyIdAlPaginar) {",
      "nota": "Llamar a setState durante el render solo es legal para el estado del propio componente, y con una condición que lo corte. Aquí, tras el primer ajuste, las dos variables son iguales y no vuelve a entrar."
    },
    {
      "fragmento": "const [technologyId, setTechnologyId] = useState<string | null>(null)",
      "nota": "Un matiz: el filtro y la página son estado local, no están en la URL (lección 77). Si recargas o compartes el enlace, vuelves al principio. Es una de las mejoras posibles."
    }
  ]
}
```

**Todo carga con tres estados.** `LeccionPage` y casi todas las páginas siguen el mismo esquema (lecciones 23 y 52): `isLoading` pinta un `<p role="status">Cargando lección…</p>`, `isError` un `<p role="alert">` con un mensaje, y un dato ausente una tarjeta de «Lección no encontrada». Hay estados posibles explícitos en lugar de una pantalla en blanco.

## Calidad: lint y pruebas

El lint es el de las lecciones 44 y 70: `eslint-plugin-react-hooks` (7.1.1, con su configuración recomendada) para las reglas de los Hooks, `eslint-plugin-jsx-a11y` para la accesibilidad (lección 37), y `react-refresh` para que el recargado en caliente no se rompa. Las pruebas usan Vitest y Testing Library (lecciones 83 y 84), con `vitest-axe` en algunos componentes para pasar el auditor de accesibilidad. Este es el esqueleto de la prueba de las guardas de rutas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/components/auth/AdminRoute.test.tsx (recortado)\nvi.mock('@/lib/hooks/useProfile', () => ({\n  useProfile: () => ({ isAdmin: state.isAdmin, loading: state.profileLoading }),\n}))\n\nfunction renderRoutes() {\n  return render(\n    <MemoryRouter initialEntries={['/admin']}>\n      <Routes>\n        <Route path=\"/\" element={<h1>Inicio</h1>} />\n        <Route path=\"/login\" element={<h1>Iniciar sesión</h1>} />\n        <Route element={<ProtectedRoute />}>\n          <Route element={<AdminRoute />}>\n            <Route path=\"/admin\" element={<h1>Administración</h1>} />\n          </Route>\n        </Route>\n      </Routes>\n    </MemoryRouter>,\n  )\n}\n\nit('redirects an authenticated non-admin to the public home', async () => {\n  state.isAdmin = false\n  renderRoutes()\n  expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()\n})",
  "anotaciones": [
    {
      "fragmento": "vi.mock('@/lib/hooks/useProfile'",
      "nota": "Se sustituye el hook por una versión de mentira, para controlar si el usuario es administrador sin tocar Supabase. Es la técnica de las lecciones 83 y 84."
    },
    {
      "fragmento": "<MemoryRouter initialEntries={['/admin']}>",
      "nota": "El router en memoria de la lección 76: la prueba empieza en /admin sin navegador ni servidor."
    },
    {
      "fragmento": "findByRole('heading', { name: 'Inicio' })",
      "nota": "findBy espera a que aparezca (lección 84). El test comprueba lo que ve una persona, un encabezado «Inicio», no cómo está hecho por dentro."
    }
  ]
}
```

## Lo que mejoraría

La lista, ordenada por lo que más afecta a quien visita la web. **Ninguna de estas mejoras está hecha todavía**: las propongo yo a partir de lo que he leído, y las de abajo marcan lo que he comprobado y lo que solo he deducido del código.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "1. Una ruta path=\"*\" (comprobado en producción)",
      "texto": "Cualquier URL inventada deja la pantalla en blanco: ni cabecera, ni mensaje. Se arregla con una ruta comodín dentro de AppShell, con un enlace a la portada. Es lo más visible y lo más barato."
    },
    {
      "titulo": "2. Error boundaries y onUncaughtError (comprobado el efecto)",
      "texto": "No hay ninguno. Si un componente lanza un error al renderizar, React desmonta toda la aplicación: lo reproduje en un proyecto de prueba y #root se quedó vacío, con el aviso «An error occurred in the <Roto> component. Consider adding an error boundary...». En esta web el riesgo es bajo, porque los datos de los bloques se validan con Zod y el código de los alumnos corre en un iframe, pero un solo boundary alrededor de cada bloque y otro de último recurso lo cerraría."
    },
    {
      "titulo": "3. Un useAuth compartido (deducido del código)",
      "texto": "Hoy cada llamada abre su propia suscripción a Supabase. Un AuthProvider con contexto, o un almacén con useSyncExternalStore, leería la sesión una vez y la repartiría."
    },
    {
      "titulo": "4. lazy por ruta (no medido)",
      "texto": "El panel de administración, y quizá la página de lección con sus bloques, podrían ir en archivos aparte. Hay que medir antes: 2,8 MB es mucho, pero no sé qué parte es del panel."
    },
    {
      "titulo": "5. Un título por página",
      "texto": "Todo el sitio tiene el mismo título, el de index.html (lo comprobé: no hay ningún title en los componentes). Un title desde LeccionPage, con el nombre de la lección, mejora las pestañas, el historial y los favoritos del navegador (lección 81)."
    },
    {
      "titulo": "6. El filtro y la página de proyectos, en la URL",
      "texto": "Con useSearchParams, para que se pueda compartir y que Atrás funcione (lección 77)."
    },
    {
      "titulo": "7. Caché inmutable para /assets (observado)",
      "texto": "Los archivos de /assets llevan un hash en el nombre, y aun así llegan con cache-control: public, max-age=0, must-revalidate. Una cabecera immutable en vercel.json los dejaría en la caché del navegador. La web ya lo hace para /vendor/react-en-vivo."
    },
    {
      "titulo": "8. Llamar a BloqueLaboratorio como componente",
      "texto": "Separar la comprobación (¿es un bloque válido?) del pintado permitiría envolver cada bloque en un boundary sin perder la caída al bloque de código. Es un cambio pequeño con un beneficio pequeño."
    }
  ]
}
```

Las dos primeras, escritas como yo las haría. Primero la ruta comodín, dentro del mismo `AppShell`, y la raíz con los dos avisos de errores que ya conoces de la lección 53:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// PROPUESTA (no está en el repositorio)\n// src/main.tsx\ncreateRoot(document.getElementById('root')!, {\n  // Ningún boundary lo ha capturado: la aplicación ya se ha desmontado.\n  onUncaughtError: (error, errorInfo) => {\n    console.error('Error sin capturar', error, errorInfo.componentStack)\n  },\n  // Un boundary lo ha convertido en aviso: el usuario sigue, pero algo falla.\n  onCaughtError: (error, errorInfo) => {\n    console.warn('Error capturado', error, errorInfo.componentStack)\n  },\n}).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n\n// src/App.tsx, al final de las rutas hijas de AppShell\n<Route\n  path=\"*\"\n  element={\n    <section>\n      <h1>Página no encontrada</h1>\n      <Link to=\"/\">Volver al inicio</Link>\n    </section>\n  }\n/>",
  "anotaciones": [
    {
      "fragmento": "onUncaughtError: (error, errorInfo) => {",
      "nota": "Aquí iría el envío a un servicio de registro de errores en producción. Sin él, esta web se enteraría de un fallo solo si alguien se lo cuenta. Comprobado con TypeScript 5.9.3 y los tipos de React 19.3: compila con strict."
    },
    {
      "fragmento": "<Route\n  path=\"*\"",
      "nota": "Comprobado en un proyecto de Vite con React Router 7.18: con esta ruta, /ruta/inventada pinta la cabecera y el mensaje, y el aviso «No routes matched location» desaparece de la consola."
    },
    {
      "fragmento": "<Link to=\"/\">Volver al inicio</Link>",
      "nota": "Un enlace de React Router, sin recarga: la persona sale de la página rota con un clic."
    }
  ]
}
```

Y el boundary que pondría alrededor de los bloques, con la API de la lección 53 (`alternativa` recibe el error y una función para reintentar, y `onReintentar` avisa al padre):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// PROPUESTA (no está en el repositorio)\n// src/components/LimiteDeError.tsx\nexport class LimiteDeError extends Component<Props, Estado> {\n  state: Estado = { error: null }\n\n  static getDerivedStateFromError(error: Error): Estado {\n    return { error }\n  }\n\n  componentDidCatch(error: Error, info: ErrorInfo) {\n    console.error(error, info.componentStack)\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "export class LimiteDeError extends Component<Props, Estado> {",
      "nota": "Sigue siendo una clase (lección 53 y 91): getDerivedStateFromError y componentDidCatch no tienen equivalente con Hooks. Los tipos Props y Estado serían los de las lecciones 72 y 73. Comprobado: compila con strict de TypeScript."
    },
    {
      "fragmento": "componentDidCatch(error: Error, info: ErrorInfo) {",
      "nota": "El sitio donde mandar el error y la pila de componentes a un registro. Aquí, solo la consola."
    },
    {
      "fragmento": "reintentar = () => {",
      "nota": "Una función de flecha como propiedad, para que this siga apuntando al boundary cuando la alternativa la use como manejador de un botón."
    }
  ]
}
```

## Errores típicos

**Dar por buena una guarda de rutas.** `AdminRoute` esconde pantallas; no protege datos. Si la barrera de verdad no está en el servidor (en esta web, en las políticas de Postgres), cualquiera puede pedir esos datos sin pasar por tu interfaz. La pregunta que hay que hacer siempre es: «¿qué pasa si alguien salta mi componente y habla directamente con la API?».

**Una clave de caché que no sabe quién pregunta.** Es el ejercicio de predicción de arriba. Cuando el resultado de una petición depende del usuario (o del idioma, o de un filtro), tiene que ir en la clave. Y al cerrar la sesión, vaciar la caché.

**Crear un hook con estado y suponer que se comparte.** `useState` dentro de un hook propio es estado de cada componente que lo llama, no del hook (lección 43). Si necesitas que dos componentes vean lo mismo, hace falta contexto o un almacén externo. Es lo que le pasa a `useAuth` en esta web.

**Buscar en un objeto con una clave que viene de fuera.** `registro[tipo]` encuentra `constructor` y `toString`. El ejercicio siguiente lo enseña con el error real de React.

**Copiar la arquitectura sin el motivo.** Esta web tiene un registro cerrado de bloques, claves de caché con usuario y un iframe con `sandbox` porque su contenido lo escribe gente. Tu proyecto puede necesitar otras cosas. Cada decisión tiene un motivo, y un comentario que lo cuente (como los de `registro.ts` o `api/imagenes.ts`) vale tanto como el código.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un registro cerrado, sin explotar",
  "consigna": "Bloque.jsx convierte un texto JSON en el componente que pide su campo tipo, como hace BloqueLaboratorio. Pulsa «JSON roto», «Tipo desconocido» y «Tipo trampa» para ver tres errores distintos. Haz que, en esos tres casos, salga un aviso con role alert que diga «Bloque no válido» en lugar de romper la aplicación. «Aviso» y «Cita» deben seguir funcionando.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\nimport Bloque from './Bloque.jsx'\n\n// Lo que llegaría de la base de datos: texto JSON que escribió alguien.\nconst muestras = {\n  'Aviso': '{\"tipo\":\"aviso\",\"texto\":\"Mañana hay mantenimiento a las 8:00\"}',\n  'Cita': '{\"tipo\":\"cita\",\"texto\":\"Lo esencial es invisible a los ojos\",\"autor\":\"Saint-Exupéry\"}',\n  'JSON roto': '{\"tipo\":\"aviso\",',\n  'Tipo desconocido': '{\"tipo\":\"video\",\"url\":\"https://example.com/v.mp4\"}',\n  'Tipo trampa': '{\"tipo\":\"constructor\",\"texto\":\"hola\"}',\n}\n\nexport default function App() {\n  const [nombre, setNombre] = useState('Aviso')\n\n  return (\n    <main>\n      <h1>Bloques de una lección</h1>\n      <div role=\"group\" aria-label=\"Muestras\">\n        {Object.keys(muestras).map((clave) => (\n          <button\n            type=\"button\"\n            key={clave}\n            aria-pressed={clave === nombre}\n            onClick={() => setNombre(clave)}\n          >\n            {clave}\n          </button>\n        ))}\n      </div>\n      <Bloque json={muestras[nombre]} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Bloque.jsx",
      "codigo": "function Aviso({ texto }) {\n  return <p className=\"aviso\">{texto}</p>\n}\n\nfunction Cita({ texto, autor }) {\n  return (\n    <blockquote>\n      <p>{texto}</p>\n      <footer>— <cite>{autor}</cite></footer>\n    </blockquote>\n  )\n}\n\n// La lista cerrada de bloques que el JSON puede pedir.\nconst registro = { aviso: Aviso, cita: Cita }\n\nexport default function Bloque({ json }) {\n  // El texto viene de fuera: ni es siempre un JSON válido ni siempre pide\n  // un bloque que exista. Arregla aquí lo que pueda fallar.\n  const datos = JSON.parse(json)\n  const Componente = registro[datos.tipo]\n  return <Componente {...datos} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\n[role='group'] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e293b;\n  color: white;\n}\n\n.aviso {\n  padding: 0.6rem 0.8rem;\n  border-radius: 8px;\n  background: #fef9c3;\n}\n\nblockquote {\n  margin: 0;\n  padding: 0.4rem 1rem;\n  border-left: 4px solid #94a3b8;\n}\n\n[role='alert'] {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "Bloque.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Con «Aviso», sale el texto del aviso",
      "pasos": [],
      "espera": {
        "texto": "Mañana hay mantenimiento a las 8:00"
      }
    },
    {
      "descripcion": "Con «Cita», salen la frase y su autor",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cita"
          }
        }
      ],
      "espera": {
        "texto": "Saint-Exupéry"
      }
    },
    {
      "descripcion": "Con «JSON roto», sale el aviso «Bloque no válido»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "JSON roto"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Bloque no válido"
      }
    },
    {
      "descripcion": "Con «Tipo desconocido», sale el aviso «Bloque no válido»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Tipo desconocido"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Bloque no válido"
      }
    },
    {
      "descripcion": "Con «Tipo trampa» (constructor), sale el aviso «Bloque no válido»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Tipo trampa"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Bloque no válido"
      }
    }
  ]
}
```

Si pulsas los tres botones sin tocar nada, estos son los errores reales que da la vista previa de React 19.3.1, uno por caso. Con el JSON roto, el de `JSON.parse` (el mensaje es el del motor de JavaScript de Chromium):

```text
Expected double-quoted property name in JSON at position 16 (line 1 column 17)
```

Con un tipo que no existe, `registro["video"]` es `undefined` y React no sabe qué pintar:

```text
Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
Check the render method of `Bloque`.
```

Y con `constructor`, el caso más traicionero: `registro["constructor"]` es la función `Object`, que React llama como si fuera un componente. `Object(props)` devuelve las propias props, y eso no se puede pintar:

```text
Objects are not valid as a React child (found: object with keys {tipo, texto}). If you meant to render a collection of children, use an array instead.
```

En una aplicación real, cualquiera de los tres tumbaría la pantalla entera si no hubiera un error boundary. La solución buena es no llegar hasta ahí: validar antes de buscar. La web real lo hace con Zod (que solo deja pasar los `tipo` conocidos); el ejercicio, que no puede usar Zod, con `Object.hasOwn`.

**Retos para seguir practicando** (en un proyecto tuyo, p. ej. el de la lección 76):

1. Añade una ruta `path="*"` con una página de «no encontrada», y comprueba con `npm run preview` que una URL inventada la enseña. Después míralo en producción (lección 85).
2. Busca en tu proyecto todos los sitios donde un Hook propio tiene `useState` y se llama desde más de un componente. Para cada uno, ¿quieres estado de cada componente o uno compartido? Si es compartido, conviértelo en un contexto (lección 28).
3. Envuelve en un error boundary una parte de tu interfaz que pueda fallar y añade `onUncaughtError` y `onCaughtError` a `createRoot`. Provoca un error a propósito y comprueba qué ves en la consola de cada caso.
4. Haz una auditoría de seguridad de media hora en tu proyecto, con las preguntas de la lección 82: busca `dangerouslySetInnerHTML`, enlaces que salgan de un dato, variables `VITE_` con secretos. Después, pregunta de cada pantalla protegida: ¿quién lo impediría en el servidor?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "createRoot: Error logging in production",
      "descripcion": "Cómo se usan onCaughtError y onUncaughtError para mandar los errores de producción a un servicio de registro.",
      "url": "https://react.dev/reference/react-dom/client/createRoot",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Row Level Security (Supabase)",
      "descripcion": "Qué son las políticas de RLS en Postgres y cómo se escriben con auth.uid(); la base de la seguridad de esta web.",
      "url": "https://supabase.com/docs/guides/database/postgres/row-level-security",
      "etiqueta": "Supabase"
    },
    {
      "titulo": "Query Keys (TanStack Query)",
      "descripcion": "Cómo se identifican las consultas en la caché, y por qué todo lo que cambia el resultado debe ir en la clave.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/query-keys",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "Routing (React Router, modo declarativo)",
      "descripcion": "Rutas de diseño, rutas sin path y rutas comodín como la que le falta a esta web.",
      "url": "https://reactrouter.com/start/declarative/routing",
      "etiqueta": "React Router"
    },
    {
      "titulo": "shadcn/ui",
      "descripcion": "La colección de componentes que se copian al proyecto, sobre Radix y Tailwind: la que usa esta web (lección 80).",
      "url": "https://ui.shadcn.com/docs",
      "etiqueta": "shadcn/ui"
    },
    {
      "titulo": "Deploying a Static Site",
      "descripcion": "La guía de Vite que complementa la lección 85: build, preview y despliegue.",
      "url": "https://vite.dev/guide/static-deploy",
      "etiqueta": "Vite"
    }
  ]
}
```
