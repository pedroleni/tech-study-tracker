# Buenas prácticas de seguridad básicas

- **Módulo:** Depuración, configuración y seguridad
- **Slug:** `buenas-practicas-de-seguridad` (autogenerado del título)
- **Orden:** 490
- **Fuentes:** [Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices) — ver `contenido/nodejs/TEMARIO.md` #49

---

## Qué es y para qué sirve

Un servidor de Node.js está expuesto directamente a tráfico real de internet, en muchos casos — un puñado de prácticas básicas evita los errores más comunes y más costosos, antes de entrar en detalles más avanzados como el hashing de contraseñas o las firmas HMAC (siguientes lecciones).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro prácticas básicas, con una razón real detrás de cada una",
  "roles": [
    { "etiqueta": "Dependencias siempre actualizadas", "rol": "Cerrar vulnerabilidades ya conocidas", "descripcion": "npm audit señala dependencias con vulnerabilidades públicamente conocidas — ignorarlo deja el proyecto expuesto a fallos que ya tienen solución disponible." },
    { "etiqueta": "Nunca confiar en la entrada sin validar", "rol": "Toda entrada externa es potencialmente hostil", "descripcion": "El cuerpo de una petición, un parámetro de URL, una cabecera — todo lo que llega de fuera hay que tratarlo como potencialmente malicioso hasta validarlo." },
    { "etiqueta": "No exponer errores internos al cliente", "rol": "Un stack trace completo es información valiosa para atacar", "descripcion": "Ya se vio en la lección 4: mostrar detalles internos en producción es un problema de seguridad, no solo de estética." },
    { "etiqueta": "Usar HTTPS en producción", "rol": "El tráfico sin cifrar se puede interceptar", "descripcion": "Cualquier dato sensible (contraseñas, tokens) viajando sobre HTTP plano es legible por cualquiera en el camino." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confiar en que los datos de un formulario o una API externa ya vienen validados.", "texto": "Cualquier dato que entra al sistema, sin importar de dónde venga, debería validarse de nuevo en el propio servidor — un cliente puede modificar peticiones antes de enviarlas." },
    { "titulo": "Ignorar los avisos de npm audit asumiendo que \"seguro que no afecta\".", "texto": "Una dependencia con una vulnerabilidad conocida y sin actualizar es una de las formas más comunes reales de comprometer una aplicación." }
  ]
}
```

## Ejercicios

1. Ejecuta `npm audit` en un proyecto real y revisa qué reporta.
2. Explica por qué mostrar el stack trace completo de un error a un usuario en producción es un problema de seguridad.
3. Da un ejemplo real de un dato que parece de confianza pero que debería validarse igualmente en el servidor.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Security Best Practices",
      "descripcion": "Guía oficial de buenas prácticas de seguridad en Node.js.",
      "url": "https://nodejs.org/en/learn/getting-started/security-best-practices",
      "etiqueta": "Node.js"
    }
  ]
}
```
