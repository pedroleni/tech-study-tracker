# Proyecto avanzado: API REST con autenticación JWT

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-api-rest-con-autenticacion-jwt` (autogenerado del título)
- **Orden:** 520
- **Repositorio:** [github.com/pedroleni/nodejs-proyectos-avanzados](https://github.com/pedroleni/nodejs-proyectos-avanzados) (carpeta `api-auth-jwt`)
- **Requiere:** Módulos 10 (Construir un servidor HTTP desde cero) y 12
  (TypeScript en Node), y las lecciones 50 (Hashing de contraseñas) y 51
  (Firmar y verificar datos con HMAC) de este mismo temario

---

## Qué vas a construir

Una API REST de autenticación real — `POST /registro`, `POST /login`,
`GET /perfil` — con dos piezas que hasta ahora casi siempre se importan
de una librería: el hashing de contraseñas y el propio **JWT**. Aquí no
se instala `jsonwebtoken`: se construye a mano con `node:crypto`,
reutilizando exactamente las técnicas de las lecciones 50 y 51. La
persistencia va contra una base de datos real con `node:sqlite`, no un
array en memoria.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/nodejs-proyectos-avanzados (carpeta api-auth-jwt) — rama main con tipos.ts, db.ts y servidor.ts completos (el diseño del proyecto) y contrasenas.ts + jwt.ts con TODO; rama solucion con la implementación completa."
}
```

## El problema real: dos formas de meter la pata con contraseñas

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\nfunction registrar(email, contrasena) {\n  usuarios.push({ email, contrasena }); // texto plano, en la base de datos\n}\n\nfunction login(email, contrasena) {\n  const usuario = usuarios.find((u) => u.email === email);\n  return usuario && usuario.contrasena === contrasena; // === sobre un secreto\n}\n</script>",
  "despues": "<script>\nfunction registrar(email, contrasena) {\n  const { hash, sal } = hashContrasena(contrasena); // scryptSync, lección 50\n  crearUsuario(db, email, hash, sal);\n}\n\nfunction login(email, contrasena) {\n  const usuario = buscarUsuarioPorEmail(db, email);\n  return usuario && verificarContrasena(contrasena, usuario.sal, usuario.hashContrasena); // timingSafeEqual\n}\n</script>",
  "nota": "Dos fallos reales en el 'antes': una fuga de la base de datos expone la contraseña de cada usuario tal cual, y comparar con === filtra, por temporización, cuántos caracteres iniciales coinciden. Ninguno de los dos se nota en desarrollo — ambos son un incidente real de seguridad en producción."
}
```

## La pieza central: qué es un JWT, de verdad

Un JWT no es magia: son tres trozos en base64url separados por puntos —
cabecera, payload, firma — donde la firma demuestra que el servidor
emitió ese token y que nadie lo ha tocado por el camino.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst CABECERA = { alg: 'HS256', typ: 'JWT' } as const;\n\nexport function crearToken(payload: PayloadJwt, secreto: string): string {\n  const encabezado = base64url(JSON.stringify(CABECERA));\n  const cuerpo = base64url(JSON.stringify(payload));\n  const firma = firmarEncabezadoYPayload(`${encabezado}.${cuerpo}`, secreto);\n  return `${encabezado}.${cuerpo}.${firma}`;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const firma = firmarEncabezadoYPayload(`${encabezado}.${cuerpo}`, secreto);", "nota": "La firma es un HMAC-SHA256 (lección 51) sobre el texto exacto 'encabezado.cuerpo' — createHmac('sha256', secreto).update(...).digest('base64url'). Cambiar un solo carácter del payload después de firmado invalida la firma." },
    { "fragmento": "return `${encabezado}.${cuerpo}.${firma}`;", "nota": "El resultado es texto plano, no cifrado — cualquiera puede leer el payload de un JWT decodificando el base64url de en medio. La firma garantiza integridad (nadie lo modificó), nunca confidencialidad (nunca metas un secreto dentro del payload)." }
  ]
}
```

Verificar es casi lo inverso — recalcular la firma esperada y compararla
con `timingSafeEqual`, exactamente como en la lección 51 — más una
comprobación que un HMAC normal no tiene: la caducidad.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport function verificarToken(token: string, secreto: string): PayloadJwt | null {\n  const partes = token.split('.');\n  if (partes.length !== 3) return null;\n  const [encabezado, cuerpo, firmaRecibida] = partes;\n\n  const firmaEsperada = firmarEncabezadoYPayload(`${encabezado}.${cuerpo}`, secreto);\n  const bufferRecibido = Buffer.from(firmaRecibida, 'base64url');\n  const bufferEsperado = Buffer.from(firmaEsperada, 'base64url');\n  if (bufferRecibido.length !== bufferEsperado.length) return null;\n  if (!timingSafeEqual(bufferRecibido, bufferEsperado)) return null;\n\n  const payload = JSON.parse(Buffer.from(cuerpo, 'base64url').toString()) as PayloadJwt;\n  if (payload.exp < Math.floor(Date.now() / 1000)) return null;\n  return payload;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if (bufferRecibido.length !== bufferEsperado.length) return null;", "nota": "Mismo gotcha que en la lección 51: timingSafeEqual lanza una excepción si los dos buffers no miden lo mismo, así que hay que comprobar la longitud ANTES de llamarla — no dentro de un try/catch genérico." },
    { "fragmento": "if (payload.exp < Math.floor(Date.now() / 1000)) return null;", "nota": "Un JWT con firma perfectamente válida pero con exp en el pasado debe rechazarse igual — la firma demuestra quién lo emitió, no que siga siendo vigente. Esta API emite tokens con 1 hora de caducidad." }
  ]
}
```

## Un detalle de diseño real: el mismo error para dos causas distintas

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "¿Por qué /login no dice \"ese email no existe\"?",
  "contenido": "Un email que no existe y una contraseña incorrecta devuelven exactamente el mismo 401 con el mismo mensaje. Si el servidor distinguiera los dos casos, cualquiera podría usar /login como oráculo para averiguar, email a email, cuáles están registrados de verdad — sin necesitar ninguna contraseña. El mismo principio de 'no reveles más de lo necesario' que ya viste en la lección 49 (buenas prácticas de seguridad)."
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Sigue el flujo completo con curl.", "texto": "Clona nodejs-proyectos-avanzados, entra en api-auth-jwt/ y ejecuta npm install, npm start. Registra un usuario, haz login y copia el token que devuelve, y pásalo como 'Authorization: Bearer <token>' a GET /perfil." },
    { "titulo": "Rompe la firma a propósito.", "texto": "Copia un token válido y cambia un solo carácter en medio (en la parte del payload). GET /perfil debe devolver 401 — la firma ya no coincide con ese payload modificado." },
    { "titulo": "Fuerza la caducidad.", "texto": "En jwt.ts, cambia temporalmente la expiración a unos segundos, arranca el servidor y espera antes de llamar a /perfil — verás el mismo 401, ahora por exp en el pasado, no por firma inválida." }
  ]
}
```

## Retos para ampliarlo

1. Añade un endpoint `POST /token/refrescar` que emita un nuevo token si el actual todavía no ha caducado hace más de X minutos, sin pedir la contraseña otra vez.
2. Añade un campo `rol` al payload del JWT (`'usuario' | 'admin'`) y un middleware que rechace con 403 las peticiones a una nueva ruta `GET /admin/usuarios` si el rol no es `admin`.
3. Combínalo con el proyecto del acortador de URLs (lección 54): limita los intentos de `/login` por IP con un token bucket, para frenar ataques de fuerza bruta contra contraseñas.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "nodejs-proyectos-avanzados/api-auth-jwt (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en api-auth-jwt/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/main/api-auth-jwt",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "nodejs-proyectos-avanzados/api-auth-jwt (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/solucion/api-auth-jwt",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Crypto — node:crypto",
      "descripcion": "Documentación oficial de scryptSync, timingSafeEqual y createHmac, el núcleo de todo este proyecto.",
      "url": "https://nodejs.org/api/crypto.html",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "SQLite — node:sqlite",
      "descripcion": "La API nativa de SQLite usada para persistir los usuarios (Release Candidate en esta versión de Node).",
      "url": "https://nodejs.org/api/sqlite.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
