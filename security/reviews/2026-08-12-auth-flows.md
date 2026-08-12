# Revisión de seguridad — flujos de autenticación — 2026-08-12

**Alcance:** registro en dos pasos con verificación por OTP, recuperación
y cambio de contraseña, `useAuth`, y la migración `0002_profiles.sql`
(feature `specs/features/auth.md`), **antes** de abrir el PR.

**Metodología:** tres pasadas independientes, en este orden:

1. Autorrevisión de Codex (el propio implementador) contra
   `.claude/agents/security-auth-crypto.md` y `security-code-vulns.md`.
   Resultado: 0 hallazgos.
2. Dos subagentes adversariales lanzados por Claude Code, con la consigna
   de **romper** el código, no de validarlo. Uno de ellos hizo *mutation
   testing* real: borró lógica de seguridad y volvió a correr la suite
   para ver si los tests la cazaban.
3. Verificación manual contra el proyecto Supabase real (curl a
   `/auth/v1/token`) para resolver una contradicción entre los dos
   subagentes.

**El paso 1 por sí solo habría dejado pasar los 7 hallazgos de abajo.**
Ese es el dato a recordar: la autorrevisión del implementador, aunque
esté bien escrita y sea honesta, no sustituye a una pasada adversarial
independiente.

## Resumen ejecutivo

- **Nivel de riesgo:** Medio antes de los fixes, Bajo después.
- **Risk score:** MEDIUM×3 = 15/100 antes; 0/100 después.
- **Top 3:**
  1. La migración no hacía backfill: las cuentas existentes se habrían
     quedado sin fila en `profiles` de forma permanente e irreparable
     desde el cliente.
  2. Cuatro comprobaciones de error sin ninguna cobertura de test —
     demostrado borrándolas y viendo la suite entera en verde.
  3. Un test de anti-enumeración que no comprobaba nada — demostrado
     metiendo una fuga explícita y viéndolo pasar.

---

## Hallazgo refutado (importante dejarlo escrito)

Uno de los subagentes reportó como **MEDIUM** que `/login` filtraba la
existencia de cuentas: al activar "Confirm email", Supabase distingue
`invalid_credentials` de `email_not_confirmed`, y `AuthForm.tsx:99`
mostraba el mensaje crudo. El razonamiento era plausible y venía con una
reproducción... de la mitad de la cadena: comprobó que **la UI** muestra
el mensaje, pero **asumió** que Supabase lo devuelve ante una contraseña
incorrecta.

El otro subagente lo contradijo. Se resolvió probando contra el proyecto
real:

```
email inexistente + password cualquiera   → invalid_credentials / "Invalid login credentials"
email EXISTENTE   + password incorrecta   → invalid_credentials / "Invalid login credentials"
```

Idénticos. `email_not_confirmed` solo se devuelve **después** de validar
la contraseña, y quien ya la conoce no necesita enumerar. **No es un
oráculo de enumeración.**

Se mantiene igualmente el fix de no mostrar `error.message` crudo, pero
por otros motivos y con severidad **Low**: filtra estado interno del
rate limiter (`"you can only request this after 51 seconds"`) y muestra
mensajes en inglés.

**Precedente para futuras revisiones:** un hallazgo que dependa del
comportamiento del servidor de Supabase no se da por bueno con una
prueba de la UI. Se comprueba contra la API real antes de aceptarlo.

---

## Hallazgos

### 1. Migración sin backfill: cuentas existentes sin perfil, irreparable — MEDIUM
- **Archivo:** `supabase/migrations/0002_profiles.sql`
- **Descripción:** el trigger `on_auth_user_created` solo dispara en
  inserts nuevos. Las cuentas creadas antes (PR #6) nunca tendrían fila
  en `profiles` — y como la tabla no tiene política de `INSERT`
  (deliberadamente, para impedir la escalada de `role`), **ningún
  cliente puede crearla nunca**. El primer código que haga
  `select role from profiles where id = auth.uid()` recibiría 0 filas, y
  ahí se decidiría por accidente si el sistema falla abierto o cerrado.
- **Fix:** `insert into public.profiles (id) select id from auth.users
  on conflict do nothing;` al final de la migración, y `on conflict (id)
  do nothing` dentro del trigger para hacerlo idempotente — sin eso, un
  fallo del insert revienta la transacción de signup de GoTrue y **corta
  el registro del proyecto entero**.
- **Nota:** el bug estaba en la especificación (`features/auth.md`), no
  en la implementación: Codex copió la migración tal cual se le pidió.

### 2. Cuatro comprobaciones de error sin cobertura — MEDIUM
- **Archivo:** `src/lib/hooks/useAuth.ts:51-75` /
  `src/lib/hooks/useAuth.test.ts`
- **Descripción:** los `if (error) throw error` de `verifyOtp`,
  `resendCode`, `requestPasswordReset` y `updatePassword` no los ejercita
  ningún test. **Demostrado:** borrando los cuatro a la vez, `9 test
  files / 42 tests` siguen en verde. El agujero está entre dos capas:
  los tests de página mockean el hook entero (asumen el throw), y el
  test del hook solo comprueba los argumentos, con todos los mocks
  devolviendo `error: null`.
- **Impacto de la regresión:** `verifyOtp` sin throw trataría **un OTP
  inválido o caducado como verificación correcta**; `updatePassword` sin
  throw navegaría a `/` como si la contraseña se hubiera cambiado
  cuando no.
- **Fix:** un test de `rejects.toThrow()` por método.

### 3. Test de anti-enumeración tautológico — MEDIUM
- **Archivo:** `src/routes/AuthPages.test.tsx:106-120`
- **Descripción:** el test comparaba el `textContent` de las dos ramas
  (email nuevo / email ya registrado). Como `AuthForm` hace *early
  return* al mismo `<VerifyCodeStep email={...} />` con la misma prop,
  ambos DOM son idénticos **por construcción**: el assert no puede
  fallar. **Demostrado:** inyectando `setAuthError('LEAK: esta cuenta ya
  existe')` en la rama de enumeración, los 10 tests siguen pasando.
- **Por qué importa:** es precisamente el test que protege la
  vulnerabilidad MEDIUM arreglada en el PR #6. Daba una falsa sensación
  de cobertura sobre el control más delicado de la feature.
- **Fix:** assertar la ausencia de cualquier nodo de error
  (`text-destructive` / `role=alert`) en el caso "ya registrado", de
  modo que el test falle si se filtra algo.

### 4. `/nueva-password` acepta cualquier sesión (CWE-620) — MEDIUM
- **Archivo:** `src/routes/ResetPasswordPage.tsx:66`
- **Descripción:** la comprobación es "hay sesión", no "la sesión viene
  de un enlace de recuperación" — la spec pedía lo segundo.
  `updateUser({ password })` viaja solo con el access token: no exige la
  contraseña actual. Ambos subagentes lo señalaron por separado.
- **Explotación:** cualquiera con acceso temporal a una sesión válida
  (portátil desbloqueado, navegador compartido) navega a
  `/nueva-password` y fija una contraseña nueva **sin conocer la
  anterior** — convierte un acceso pasajero en toma de control
  permanente, y deja fuera al dueño legítimo.
- **Fix (server-side, es donde está el control real):** activar
  **"Secure password change"** en el dashboard de Supabase, que exige
  reautenticación reciente. Añadido a la sección de configuración manual
  de `features/auth.md`.
- **Fix parcial en cliente:** tras un reset con éxito,
  `signOut({ scope: 'others' })` para expulsar a un atacante que ya
  estuviera dentro.
- **Riesgo residual aceptado:** distinguir en el cliente una sesión de
  recuperación de una normal es frágil (al recargar, el hash ya se
  consumió y el evento `PASSWORD_RECOVERY` no se repite; habría que
  persistir un marcador). No se implementa: la mitigación server-side
  cubre el caso, y el marcador persistido añadiría estado que puede
  desincronizarse.

### 5. El botón de reenvío informa al revés — MEDIUM (funcional)
- **Archivo:** `src/components/auth/VerifyCodeStep.tsx:59-62`
- **Descripción:** el mensaje estaba en el `finally`, así que
  *"Espera unos segundos antes de pedir otro código"* salía **también
  cuando el reenvío funcionaba**. Agravante: `onResend` limpiaba
  `verificationError`, de modo que metiendo un código incorrecto y
  pulsando "Reenviar", el error desaparecía y quedaba solo el aviso de
  espera — la lectura contraria a lo ocurrido.
- **Tensión resuelta:** un subagente lo marcó como bug; el otro defendió
  que ramas idénticas son correctas *en seguridad* y avisó de que
  diferenciarlas reintroduciría el oráculo. **Ambos tienen razón**: el
  fix es un mensaje **neutro, veraz e idéntico** en éxito y error, no
  dos mensajes distintos. Indistinguibilidad ≠ mentir.

### 6. `error.message` crudo en pantalla — LOW
Ver "Hallazgo refutado". Se arregla por higiene (fuga de estado del rate
limiter, idioma), no por enumeración.

### 7. Error fantasma al corregir la contraseña — LOW
- **Archivo:** `src/components/auth/AuthForm.tsx`,
  `src/routes/ResetPasswordPage.tsx`
- Tras un submit con contraseñas distintas, corregir el campo `password`
  no revalida `confirmPassword`: el error *"Las contraseñas no
  coinciden"* permanece aunque ya coincidan. Fix: `deps:
  ['confirmPassword']` en el `register('password', …)`.

---

## Verificado correcto (sin hallazgo)

- **Escalada de `role` a `'admin'`: imposible.** Verificado contra
  PostgREST, no solo contra la UI: una sola política y de `SELECT`, sin
  política de escritura → `PATCH` afecta 0 filas y `POST`/upsert devuelve
  42501. `role` nunca viene del cliente (`signUp` no pasa
  `options.data`), y la función del trigger no es invocable como RPC
  porque devuelve `trigger`.
- **Condición de carrera en `/nueva-password`: no existe.** Se sospechó
  que `loading=false` con `session=null` podría mostrar "Enlace no
  válido" a un usuario legítimo. Descartado leyendo el código de
  `@supabase/auth-js@2.110.9`: `getSession()` espera a `initializePromise`,
  y una cola interna difiere las notificaciones generadas durante el
  init. Estructural, no casualidad.
- `redirectTo` se construye desde `window.location.origin`, no de un
  parámetro controlable → sin open redirect.
- La coincidencia de contraseñas no se puede saltar: zod 4 ejecuta el
  `.refine()` aunque falle otro campo (en zod 3 **sí** habría sido un
  bug real), y `handleSubmit` revalida todos los campos registrados.
- Cero `console.*` en `src/`; el OTP viaja en el body, nunca en URL ni
  storage; toda la gestión de sesión es de `supabase-js`, sin
  criptografía propia.

## Observaciones bajo umbral (no se arreglan ahora)

- **Defensa en profundidad en `profiles`:** `revoke update (role) … from
  anon, authenticated` y `to authenticated` en la política. RLS ya
  deniega; esto solo limitaría el daño de un futuro `for update` mal
  puesto.
- **Doble submit:** `disabled={isSubmitting}` es solo visual; tres
  `submit` seguidos sobre el `<form>` llaman tres veces a `signUp`. Los
  precedentes del proyecto excluyen rate limiting, y Supabase ya limita
  del lado servidor.
- **Redirect URLs sin comodines:** al configurar el paso manual 3, usar
  URLs exactas y no patrones tipo `https://*.vercel.app/**`.

## Hallazgo de tooling descubierto por el camino

El CI de este PR falló con **5 hallazgos CRITICAL "Agent Directive"** en
código de auth perfectamente legítimo, después de que el scanner pasara
en verde varias veces en local. Dos bugs distintos, encadenados:

1. **Falsos positivos por falta de límites de palabra.** El patrón
   `(?:AI|assistant|agent|…).*(?:execute|run|…|send)` no usaba `\b`, así
   que `AI` casaba dentro de "aw**ai**t", "em**ai**l" y "f**ai**lure", y
   `send` dentro de "re**send**". Una línea tan inocua como
   `await resendCode(email)` se reportaba como CRITICAL. Arreglado con
   `\b`; verificado que sigue detectando 7/7 ataques reales de prueba y
   que baja de 5 a 0 los falsos positivos sobre `src/`.

2. **El scanner era ciego en macOS, y no lo decía.** Casi todos sus
   checks usan `grep -P` (PCRE), que el grep de BSD de macOS **no
   soporta**: no da error visible, simplemente devuelve 0 resultados. O
   sea, todas las pasadas locales de este scanner durante la sesión
   fueron un falso "sin hallazgos" — el CI (Ubuntu, GNU grep) era el
   único sitio donde de verdad se estaba escaneando. Arreglado: el script
   ahora detecta si `grep` soporta `-P`, cae a `ggrep` si está instalado,
   y **aborta con exit 2** si no hay ninguno, en vez de dar un verde
   falso. Verificado en macOS: antes detectaba 0 de 7 ataques de prueba,
   ahora detecta 7 de 7.

**Lección aplicable más allá de este scanner:** una herramienta de
seguridad que falla en silencio es peor que no tenerla, porque produce
confianza injustificada. Este es el segundo bug de esta clase en el mismo
fichero (ver `2026-08-11-tooling-bugs.md`): conviene que cualquier
scanner nuevo verifique sus propias dependencias antes de reportar
"limpio".

## Estado

- [x] Hallazgos 1-7 → corregidos antes de abrir el PR.
- [x] Hallazgo refutado → verificado contra la API real y documentado.
- [ ] Activar "Secure password change" en el dashboard (manual, usuario).
- [ ] `select * from pg_policies where tablename = 'profiles';` tras
      aplicar la migración: debe devolver **una sola** fila,
      `profiles_select_own`, comando `SELECT`.
