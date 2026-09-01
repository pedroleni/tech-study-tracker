# Trunk-based development: integrar en el tronco varias veces al día

- **Módulo:** Un equipo grande, varias features
- **Slug:** `trunk-based-development-integrar-en-el-tronco-varias-veces-al-dia` (autogenerado del título)
- **Orden:** 510
- **Fuentes:** [Trunk Based Development](https://trunkbaseddevelopment.com/) — ver `contenido/git/TEMARIO.md` #51

---

## Llevar el Módulo 14 al extremo

La lección "Integrar main con frecuencia" (Módulo 14) argumentaba que esperar empeora el conflicto. Trunk-based development lleva esa idea hasta el final: nada de ramas de días o semanas — se integra directamente en una única rama compartida (el "tronco"), varias veces al día.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La definición, citada literalmente",
  "contenido": "\"A source-control branching model, where developers collaborate on code in a single branch called 'trunk' and resist any pressure to create other long-lived development branches by employing documented techniques.\" — el énfasis está en \"resist\": no es solo integrar rápido, es evitar activamente que se acumulen ramas de larga duración."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Las ramas, si existen, duran horas, no días.", "texto": "Un cambio pequeño, una rama corta, integrada casi de inmediato — el caso límite del argumento del Módulo 14: si la divergencia es mínima, el riesgo de conflicto grande prácticamente desaparece." },
    { "titulo": "Requiere disciplina que Git por sí solo no proporciona.", "texto": "Feature flags para desplegar código incompleto sin activarlo, tests que corren en cada integración — la propia definición habla de \"documented techniques\", no de un comando de Git concreto. La herramienta no basta; hace falta un proceso alrededor." }
  ]
}
```

## Las tres estrategias, una frente a otra

```laboratorio
{
  "tipo": "roles",
  "titulo": "Mismo objetivo, distinto punto en el espectro",
  "roles": [
    { "etiqueta": "Git Flow", "rol": "Ramas de larga duración, ciclo formal", "descripcion": "Pensado para releases numeradas, no despliegue continuo — el extremo más estructurado de los tres." },
    { "etiqueta": "GitHub Flow", "rol": "Ramas cortas, un PR a la vez", "descripcion": "Un punto intermedio — más simple que Git Flow, pero todavía con una rama real por cambio, revisada antes de fusionar." },
    { "etiqueta": "Trunk-based", "rol": "Integración casi constante", "descripcion": "El extremo opuesto a Git Flow — mínima divergencia posible, apoyado en disciplina de equipo más que en estructura de ramas." }
  ]
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Trunk Based Development",
      "descripcion": "La fuente de referencia del término, con su definición completa.",
      "url": "https://trunkbaseddevelopment.com/",
      "etiqueta": "trunkbaseddevelopment.com"
    }
  ]
}
```
