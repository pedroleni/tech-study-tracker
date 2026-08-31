# Firmar y verificar datos con HMAC

- **Módulo:** Depuración, configuración y seguridad
- **Slug:** `firmar-y-verificar-con-hmac` (autogenerado del título)
- **Orden:** 510
- **Fuentes:** [Crypto](https://nodejs.org/api/crypto.html) — ver `contenido/nodejs/TEMARIO.md` #51

---

## Qué es y para qué sirve

HMAC genera una firma a partir de un mensaje y una clave secreta compartida — quien recibe el mensaje puede recalcular la misma firma con la misma clave y comprobar que coincide. Es exactamente el mecanismo que usan servicios reales (Stripe, GitHub, Slack) para que quien recibe un webhook pueda confiar en que de verdad viene de ellos, y no de cualquiera que conozca la URL.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { createHmac, timingSafeEqual } from 'node:crypto';\n\nfunction firmar(payload, secreto) {\n  return createHmac('sha256', secreto).update(payload).digest('hex');\n}\n\nfunction esFirmaValida(payload, secreto, firmaRecibida) {\n  const firmaEsperada = firmar(payload, secreto);\n  return timingSafeEqual(Buffer.from(firmaRecibida), Buffer.from(firmaEsperada));\n}\n</script>",
  "anotaciones": [
    { "fragmento": "return createHmac('sha256', secreto).update(payload).digest('hex');", "nota": "createHmac necesita el ALGORITMO de hash (sha256, un estándar real y ampliamente usado) y el SECRETO compartido — sin conocer el secreto, es prácticamente imposible calcular la firma correcta para un payload cualquiera." },
    { "fragmento": "return timingSafeEqual(Buffer.from(firmaRecibida), Buffer.from(firmaEsperada));", "nota": "Igual que al verificar contraseñas (lección anterior), comparar firmas con === expondría el sistema a un ataque de temporización — timingSafeEqual es la comparación correcta también aquí." }
  ]
}
```

## Por qué esto importa de verdad: aceptar un webhook sin verificar es peligroso

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin verificar la firma, cualquiera puede simular un webhook",
  "contenido": "Una URL de webhook (https://miapp.com/webhooks/pagos) es, en sí misma, pública — cualquiera que la conozca puede enviarle una petición POST con el cuerpo que quiera. Sin comprobar la firma HMAC antes de procesar nada, un atacante podría simular un \"pago confirmado\" falso simplemente enviando una petición con la forma correcta, sin haber pagado nada de verdad."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Procesar el cuerpo de un webhook antes de verificar su firma.", "texto": "Cualquier lógica que se ejecute antes de la comprobación ya está confiando en datos no verificados — la verificación de firma debería ser el primer paso, siempre." },
    { "titulo": "Comparar la firma recibida con la calculada usando === en vez de timingSafeEqual.", "texto": "El mismo riesgo de ataque de temporización que al comparar hashes de contraseñas." }
  ]
}
```

## Ejercicios

1. Escribe una función que firme un mensaje con HMAC-SHA256 y una clave secreta.
2. Escribe una función que verifique esa firma de forma segura con `timingSafeEqual`.
3. Explica por qué una URL de webhook, aunque no sea pública ni fácil de adivinar, no es suficiente protección por sí sola.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Crypto",
      "descripcion": "Referencia oficial del módulo crypto, incluido createHmac.",
      "url": "https://nodejs.org/api/crypto.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
