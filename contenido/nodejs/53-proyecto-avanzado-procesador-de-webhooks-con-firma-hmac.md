# Proyecto avanzado: procesador de webhooks con firma HMAC

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-procesador-de-webhooks-con-firma-hmac` (autogenerado del título)
- **Orden:** 530
- **Repositorio:** [github.com/pedroleni/procesador-webhooks](https://github.com/pedroleni/procesador-webhooks)
- **Requiere:** Módulo 10 (Construir un servidor HTTP desde cero) y la
  lección 51 (Firmar y verificar datos con HMAC) de este mismo temario

---

## Qué vas a construir

Un receptor de webhooks real — el mismo mecanismo que usan Stripe,
GitHub o Slack para avisarte de un evento ("se completó un pago", "se
hizo push a un repo") — que solo procesa un evento si viene firmado con
un secreto compartido, y un cliente que envía esos webhooks con
reintentos y backoff exponencial, pero solo cuando el fallo es de
verdad transitorio.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/procesador-webhooks — rama main con servidor.js completo (el receptor real) y firma.js + cliente-reintentos.js con TODO; rama solucion con la implementación completa."
}
```

## El problema real: ¿cómo sabe el receptor que el webhook es legítimo?

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Cualquiera que conozca la URL puede mandar un POST y hacerse pasar por el emisor real\nservidor.on('POST /webhooks/pagos', (peticion) => {\n  const evento = JSON.parse(peticion.body);\n  registrarPago(evento); // se confía ciegamente en el contenido\n});\n</script>",
  "despues": "<script>\n// El emisor firma el cuerpo con un secreto que solo él y el receptor conocen\nservidor.on('POST /webhooks/pagos', (peticion) => {\n  const firmaRecibida = peticion.headers['x-signature'];\n  if (!esFirmaValida(peticion.cuerpoCrudo, SECRETO, firmaRecibida)) {\n    return responder(401);\n  }\n  const evento = JSON.parse(peticion.cuerpoCrudo);\n  registrarPago(evento);\n});\n</script>",
  "nota": "Sin firma, un endpoint de webhooks público es indistinguible de un formulario abierto a cualquiera en internet. La firma no cifra nada (el cuerpo sigue siendo legible) — demuestra que quien lo envió conoce el secreto compartido."
}
```

## Firmar y verificar: HMAC-SHA256 sobre el texto crudo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport function firmar(payloadCrudo, secreto) {\n  return createHmac('sha256', secreto).update(payloadCrudo).digest('hex');\n}\n\nexport function esFirmaValida(payloadCrudo, secreto, firmaRecibida) {\n  const firmaEsperada = firmar(payloadCrudo, secreto);\n  const bufferRecibido = Buffer.from(firmaRecibida ?? '', 'hex');\n  const bufferEsperado = Buffer.from(firmaEsperada, 'hex');\n  if (bufferRecibido.length !== bufferEsperado.length) return false;\n  return timingSafeEqual(bufferRecibido, bufferEsperado);\n}\n</script>",
  "anotaciones": [
    { "fragmento": "export function firmar(payloadCrudo, secreto) {", "nota": "payloadCrudo es el TEXTO tal cual llegó por la red — nunca el resultado de volver a hacer JSON.stringify() sobre el objeto ya parseado. El orden de las claves de un objeto no está garantizado al serializarlo dos veces por separado; una firma calculada sobre un texto reordenado no coincidiría nunca, aunque los datos sean 'los mismos'." },
    { "fragmento": "if (bufferRecibido.length !== bufferEsperado.length) return false;", "nota": "El mismo patrón exacto de la lección 51: comprobar la longitud antes de timingSafeEqual, porque esa función lanza una excepción si los dos buffers no miden igual." }
  ]
}
```

## El cliente: reintentar solo lo que tiene sentido reintentar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction esRetriable(respuestaOError) {\n  if (respuestaOError instanceof Error) return true; // fallo de red\n  return respuestaOError.status >= 500; // el servidor falló, no la petición\n}\n\nasync function enviarConReintentos(url, payload, secreto, { maxIntentos = 5, esperar } = {}) {\n  for (let intento = 1; intento <= maxIntentos; intento++) {\n    try {\n      const respuesta = await fetch(url, { method: 'POST', body: payload, headers: { 'X-Signature': firmar(payload, secreto) } });\n      if (respuesta.ok || !esRetriable(respuesta)) return respuesta;\n    } catch (error) {\n      if (intento === maxIntentos) throw error;\n    }\n    await esperar(100 * 2 ** (intento - 1)); // 100ms, 200ms, 400ms...\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "return respuestaOError.status >= 500; // el servidor falló, no la petición", "nota": "Un 401 (firma inválida) o un 400 (payload mal formado) son un 4xx: reintentar exactamente la misma petición produce exactamente el mismo error — no es un fallo transitorio, es un fallo real que reintentar no arregla." },
    { "fragmento": "await esperar(100 * 2 ** (intento - 1)); // 100ms, 200ms, 400ms...", "nota": "Backoff exponencial: cada reintento espera el doble que el anterior, para no bombardear un servidor que ya está teniendo problemas. `esperar` se recibe como parámetro (en vez de llamar a setTimeout directamente) precisamente para poder sustituirlo por una función instantánea en los tests, sin esperas reales de segundos." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Levanta el servidor y envía un webhook real.", "texto": "npm start en una terminal, npm run enviar en otra — comprueba que el evento aparece en eventos.jsonl con la hora real de recepción." },
    { "titulo": "Manda una firma incorrecta a propósito.", "texto": "Con curl, envía un POST a /webhooks/pagos con una cabecera X-Signature inventada — debe rechazarlo con 401, y NO debe aparecer nada nuevo en eventos.jsonl." },
    { "titulo": "Observa el backoff en los tests.", "texto": "Los tests de cliente-reintentos.test.js sustituyen 'esperar' por una función que no espera de verdad — así 6 tests con reintentos corren en milisegundos, no en varios segundos reales." }
  ]
}
```

## Un gotcha real de este proyecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El servidor lee el cuerpo crudo ANTES de nada más",
  "contenido": "servidor.js acumula los trozos de la petición con 'for await (const trozo of req)' y verifica la firma sobre ese texto crudo — recién entonces hace JSON.parse. Si se invirtiera el orden (parsear primero, firmar después sobre el objeto), la verificación de firma dejaría de tener sentido: ya se habría perdido el texto exacto que el emisor firmó."
}
```

## Retos para ampliarlo

1. Añade una cabecera `X-Webhook-Id` y guarda los IDs ya procesados, para descartar un evento duplicado si el emisor lo reenvía por un reintento suyo (idempotencia).
2. Añade un `timeout` real a `enviarConReintentos` con `AbortController`, para que una petición colgada no bloquee el reintento indefinidamente.
3. Combínalo con el proyecto del acortador de URLs (lección 54): limita cuántos webhooks por segundo acepta el servidor desde una misma IP.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "procesador-webhooks (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/procesador-webhooks/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "procesador-webhooks (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/procesador-webhooks/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Crypto — node:crypto",
      "descripcion": "Documentación oficial de createHmac y timingSafeEqual.",
      "url": "https://nodejs.org/api/crypto.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
