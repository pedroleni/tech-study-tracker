# Feature: Autenticación completa

**Estado:** ✅ implementada en PR #14 (más el fix de seguridad de tooling
en el mismo PR — ver `security/reviews/2026-08-12-auth-flows.md`)

Amplía la autenticación mínima ya existente (login/registro básicos, PR
#6) con: confirmación de contraseña, verificación de email por código de
6 dígitos, recuperación de contraseña, y una tabla `profiles` con rol
preparada para un futuro multiusuario.

**Prerrequisito de lectura:** `AGENTS.md` (reglas del repo) y
`specs/design-system.md` (esta feature toca `src/components/`).

---

## Configuración manual requerida (no la puede hacer un agente)

Codex no tiene red: estos tres pasos los hace **el usuario** en el
dashboard de Supabase, y sin ellos el flujo de código por email no
funciona aunque el código esté bien.

1. **Authentication → Email Templates → "Confirm signup"**: sustituir el
   cuerpo por uno que use `{{ .Token }}` en vez de
   `{{ .ConfirmationURL }}`. Ejemplo mínimo:
   ```html
   <h2>Confirma tu email</h2>
   <p>Tu código de verificación es: <strong>{{ .Token }}</strong></p>
   <p>Caduca en 1 hora. Si no has creado ninguna cuenta, ignora este correo.</p>
   ```
2. **Authentication → Providers → Email**: "Confirm email" activado.
3. **Authentication → URL Configuration → Redirect URLs**: añadir
   `http://localhost:5173/nueva-password` y la URL equivalente de
   producción en Vercel. Sin esto, el enlace de recuperación rebota.
   Usa **URLs exactas**, no comodines tipo `https://*.vercel.app/**`:
   `redirectTo` se construye desde `window.location.origin`, así que un
   patrón amplio es la única vía por la que el enlace de recuperación
   podría acabar en otro dominio.
4. **Authentication → Providers → Email → "Secure password change"**:
   activado. Sin esto, cualquiera con una sesión válida abierta (portátil
   desbloqueado, navegador compartido) puede entrar a `/nueva-password` y
   fijar una contraseña nueva **sin conocer la actual** — CWE-620,
   hallazgo 4 de `security/reviews/2026-08-12-auth-flows.md`. Es la
   mitigación real: distinguir en el cliente una sesión de recuperación
   de una normal es frágil y no se implementa.

---

## Decisiones de alcance (y por qué)

### Sin admin que gestione contraseñas — decisión deliberada

Se descartó tener un rol admin que atienda peticiones de cambio de
contraseña. Motivos, por orden de peso:

1. **Es el vector clásico de ingeniería social.** Un humano que puede
   resetear contraseñas ajenas es un humano al que se puede engañar
   ("soy Pedro, he perdido el acceso"). OWASP desaconseja el reset
   mediado por otra persona precisamente por esto.
2. **Exigiría la `service_role key`.** Cambiar la contraseña de otro
   usuario en Supabase requiere la Admin API, que solo funciona con esa
   clave — prohibida en el frontend por `spec.md` §9. Habría que montar
   una Edge Function solo para eso: superficie de ataque nueva para
   resolver un problema que Supabase ya resuelve sin código propio.
3. **Concentra poder sin necesidad.** El admin quedaría con capacidad de
   tomar control de cualquier cuenta.

La alternativa implementada es **self-service**: el usuario pide el
reset, recibe el código en su email, y cambia la contraseña él mismo.
Ningún tercero interviene. La doc oficial de Supabase confirma además
que `resetPasswordForEmail()` *"no revela si existe una cuenta para ese
email"*, así que el flujo es anti-enumeración por construcción.

### `profiles` con `role` desde ya, pero sin UI de admin

La app es de un solo usuario hoy (`spec.md` §2). Se crea igualmente la
tabla `profiles` con columna `role` (todos `'user'`) porque añadirla más
tarde obligaría a una migración con backfill sobre cuentas existentes,
mientras que ahora cuesta ~15 líneas de SQL. **No** se implementa
ninguna lógica que lea el rol, ni pantallas de admin: sería código
muerto y superficie de ataque sin usuario que lo justifique.

### Fuera de alcance de esta feature

- **2FA/TOTP real** (segundo factor en cada login). Es gratis en todos
  los planes de Supabase, así que se hará — pero como feature aparte,
  con su propio doc y PR, para no mezclarla con esto. **Ojo con la
  terminología:** el código por email de esta feature es *verificación
  de email* (probar que la dirección existe), no un segundo factor.
- **Protección contra contraseñas filtradas** (HaveIBeenPwned): es
  exclusiva del plan Pro de Supabase, ya documentado en
  `design-system.md`.
- Login social (Google/GitHub), cambio de email, borrado de cuenta.

---

## Modelo de datos: nueva migración

`supabase/migrations/0002_profiles.sql`:

```sql
-- Perfil por usuario. Existe sobre todo para colgar `role` de algo:
-- auth.users es una tabla gestionada por Supabase y no se le añaden
-- columnas propias.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- SOLO select, y solo del propio perfil.
--
-- Deliberadamente NO hay política de insert/update/delete: con RLS
-- activo, lo que no tiene política queda denegado. Si existiera un
-- `for update using (id = auth.uid())`, el usuario podría hacer
-- `update profiles set role = 'admin'` desde el frontend con la anon
-- key — escalada de privilegios directa. La fila la crea el trigger de
-- abajo, no el cliente.
create policy "profiles_select_own" on profiles
  for select using (id = (select auth.uid()));

-- Crea el perfil automáticamente al registrarse un usuario.
--
-- Este SÍ necesita `security definer`, al revés que
-- `category_belongs_to_user()` de 0001_init.sql (que es invoker a
-- propósito): el trigger corre durante el insert en `auth.users`, en un
-- contexto donde `auth.uid()` todavía no es el usuario nuevo, así que
-- sin definer la política de arriba bloquearía el insert.
--
-- `set search_path = ''` es obligatorio en funciones definer (guía
-- oficial de Supabase): sin ello, alguien que pueda crear objetos en un
-- esquema anterior en el search_path podría secuestrar la resolución de
-- nombres y ejecutar código con privilegios elevados. Por eso todas las
-- referencias van cualificadas (`public.profiles`).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Checkpoint:** tras aplicarla, verificar con
`select * from pg_policies where tablename = 'profiles';` que aparece
**una sola** política y es de `SELECT`.

---

## Flujos

### 1. Registro en dos pasos

```
[Paso 1: datos]                    [Paso 2: código]
email                              "Te hemos enviado un código a X"
contraseña (mín. 15)      ──────▶  [ 6 dígitos ]
confirmar contraseña               [Verificar]  [Reenviar código]
[Crear cuenta]
```

- Paso 1 → `signUp({ email, password })`.
- **Se pasa al paso 2 SIEMPRE**, incluso si el email ya estaba
  registrado y Supabase no ha enviado nada. Esto es lo que preserva la
  propiedad anti-enumeración que ya se arregló en PR #6 (ver
  `security/reviews/2026-08-12-supabase-auth.md`): si a un email
  existente le mostráramos "ya tienes cuenta" y a uno nuevo el paso del
  código, la diferencia entre ambas pantallas sería el oráculo. El
  atacante se queda esperando un código que nunca llega, sin aprender
  nada. La lógica de `isAccountEnumerationError()` ya existente se
  mantiene con este mismo fin.
- Paso 2 → `verifyOtp({ email, token, type: 'email' })`. Con éxito hay
  sesión: navegar a `/`.
- Error de código (incorrecto o caducado) → **mensaje genérico único**:
  `'El código no es válido o ha caducado.'` No distinguir entre "código
  incorrecto" y "no hay registro pendiente para ese email" — la
  diferencia sería otro oráculo de enumeración.
- "Reenviar código" → `supabase.auth.resend({ type: 'signup', email })`.
  Supabase aplica su propio rate limit; capturar el error y mostrarlo
  como "Espera unos segundos antes de pedir otro código."

### 2. Recuperación de contraseña

```
/recuperar-password          →  email enviado  →  /nueva-password
[email]                                            [nueva contraseña]
[Enviar código]                                    [confirmar]
```

- `resetPasswordForEmail(email, { redirectTo: ${window.location.origin}/nueva-password })`.
- **Mensaje genérico siempre**, exista o no la cuenta: `'Si ese email
  tiene una cuenta, te hemos enviado instrucciones para recuperarla.'`
  No mostrar error aunque la llamada falle por email inexistente.
- En `/nueva-password`: supabase-js detecta el token de la URL y abre
  una sesión de recuperación. **Si al montar no hay sesión**, no
  renderizar el formulario — mostrar "Este enlace no es válido o ha
  caducado" con enlace a `/recuperar-password`. Un formulario que no
  puede funcionar es peor que un error claro.
- Con sesión → `updateUser({ password })` → navegar a `/`.

### 3. Confirmar contraseña

En **registro** y en **nueva contraseña** (no en login). Validación con
`zod`:

```ts
const passwordSchema = z
  .string()
  .min(15, 'La contraseña debe tener al menos 15 caracteres — puedes usar una frase en vez de una palabra con símbolos.')
  .max(128, 'La contraseña no puede superar los 128 caracteres.')

const registerSchema = z
  .object({ email: emailSchema, password: passwordSchema, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })
```

⚠️ **Detalle de implementación que hará tropezar:** `AuthForm.tsx`
valida hoy campo a campo con `authSchema.shape.password.safeParse(...)`.
Un schema con `.refine()` ya no expone `.shape`. Solución: guardar el
`z.object({...})` base en una constante aparte (para `.shape` en los
campos individuales) y usar el refinado solo para la comprobación
cruzada de coincidencia, o validar `confirmPassword` con un `validate`
de react-hook-form que compare con `getValues('password')`. Cualquiera
de las dos vale; no reescribas el patrón de validación existente.

La política de 15 caracteres se mantiene (criterio OWASP para cuando
**no** hay MFA — razonada en `design-system.md` §"Política de
contraseña"). Sigue sin aplicarse en login: un mínimo nuevo ahí
bloquearía a quien tenga una contraseña antigua más corta que Supabase
sí aceptaría.

---

## Rutas

| Ruta | Página | Protegida |
|---|---|---|
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` (2 pasos) | No |
| `/recuperar-password` | `ForgotPasswordPage` | No |
| `/nueva-password` | `ResetPasswordPage` | No — pero exige sesión de recuperación para renderizar el form |

Enlace "¿Olvidaste tu contraseña?" en `LoginPage`, bajo el botón.

## Archivos

| Archivo | Qué hacer |
|---|---|
| `supabase/migrations/0002_profiles.sql` | crear (SQL de arriba, tal cual) |
| `src/components/auth/AuthForm.tsx` | modificar: confirmar contraseña + paso de código en registro |
| `src/components/auth/VerifyCodeStep.tsx` | crear: input de 6 dígitos, verificar, reenviar |
| `src/routes/ForgotPasswordPage.tsx` | crear |
| `src/routes/ResetPasswordPage.tsx` | crear |
| `src/lib/hooks/useAuth.ts` | añadir `verifyOtp`, `resendCode`, `requestPasswordReset`, `updatePassword` |
| `src/App.tsx` | registrar las dos rutas nuevas |

Reutilizar el toggle mostrar/ocultar contraseña ya existente en todos
los campos de contraseña nuevos, y `Input`/`Label`/`Button`/`Card` de
`components/ui/` — nada de HTML a mano.

---

## Tests requeridos

Todos con Supabase mockeado (`vi.mock`), ninguno toca la red.

1. Registro: contraseñas que no coinciden → error, no se llama a `signUp`.
2. Registro: `signUp` correcto → aparece el paso de código.
3. **Registro: email ya existente → aparece el paso de código igual, y
   la pantalla es indistinguible del caso nuevo** (regresión de la
   vulnerabilidad de enumeración del PR #6).
4. Código incorrecto → mensaje genérico, sin distinguir la causa.
5. Código correcto → navega a `/`.
6. Reenviar código → llama a `resend`; si falla por rate limit, mensaje amable.
7. Recuperación: mismo mensaje genérico exista o no la cuenta.
8. `/nueva-password` sin sesión → mensaje de enlace inválido, sin formulario.
9. `/nueva-password` con sesión → aplica mínimo de 15 caracteres y confirmación.
10. `axe()` sin violaciones en cada pantalla nueva.

## Checkpoints de seguridad

Antes de dar la feature por cerrada, verificar **específicamente**
(además del checklist genérico de `AGENTS.md`):

- [ ] `pg_policies` sobre `profiles` devuelve una sola política, de `SELECT`.
      Un `UPDATE` ahí = escalada a admin desde el frontend.
- [ ] `handle_new_user()` tiene `set search_path = ''` y referencias
      cualificadas con `public.`.
- [ ] Ninguna pantalla distingue "email existe" de "email no existe":
      registro, recuperación y verificación de código.
- [ ] Ningún `console.log` con `password`, `token` o el objeto de sesión.
- [ ] El código OTP no acaba en la URL ni en `localStorage`.
- [ ] Revisar contra `.claude/agents/security-auth-crypto.md` y guardar
      el informe en `security/reviews/YYYY-MM-DD-auth-flows.md` **antes**
      de abrir el PR, no después (ver la nota de proceso en
      `security/reviews/2026-08-12-codex-monitor.md`).
