# Integrar `main` con frecuencia: por qué esperar empeora el conflicto

- **Módulo:** Trabajo en equipo: casos reales
- **Slug:** `integrar-main-con-frecuencia-por-que-esperar-empeora-el-conflicto` (autogenerado del título)
- **Orden:** 430
- **Fuentes:** [git-merge](https://git-scm.com/docs/git-merge) — ver `contenido/git/TEMARIO.md` #43

---

## La condición del fast-forward, otra vez

El Módulo 4 fue muy concreto: un merge es fast-forward (el más simple posible, sin ningún riesgo de conflicto) solo si la rama de destino no se ha movido desde que la tuya arrancó. En cuanto la otra rama avanza también, ya hace falta un three-way merge — y si además coincide en las mismas líneas, un conflicto real que resolver a mano (Módulo 4, última lección).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que cambia según cuánto esperes",
  "roles": [
    { "etiqueta": "Integras pronto y a menudo", "rol": "main casi no ha podido divergir", "descripcion": "Más probabilidad de un simple fast-forward, o un three-way trivial sin conflicto — porque hay menos tiempo para que alguien más haya tocado justo las mismas líneas que tú." },
    { "etiqueta": "Esperas semanas para integrar", "rol": "main ha divergido mucho más", "descripcion": "Más commits de por medio — mayor probabilidad de que dos cambios independientes toquen justo el mismo sitio, y un conflicto más grande y difícil de razonar de una vez." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El tamaño del conflicto no crece proporcionalmente al tiempo — crece con el número de cambios superpuestos.", "texto": "Una rama que vive dos semanas sin integrar no tiene el doble de riesgo que una de una semana: tiene un riesgo mucho mayor, porque el número de cambios ajenos que pueden llegar a chocar con los tuyos crece con cada commit nuevo en main." },
    { "titulo": "Un conflicto pequeño, resuelto al momento, es fácil de razonar.", "texto": "Acabas de escribir ese código — recuerdas exactamente por qué cada línea está ahí. Un conflicto de una rama vieja obliga a reconstruir ese contexto desde cero, semanas después." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por eso GitHub flow (Módulo 13) insiste en ramas de vida corta",
  "contenido": "No es una preferencia estética — es la consecuencia directa de esta mecánica. Cuanto antes se fusiona una rama, menos tiempo tiene main para divergir de ella, y menos probable es un conflicto grande. El Módulo 15 lleva esta misma idea al extremo con trunk-based development."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-merge",
      "descripcion": "Referencia oficial de git merge — la condición del fast-forward de la que se deriva esta lección.",
      "url": "https://git-scm.com/docs/git-merge",
      "etiqueta": "Git Reference"
    }
  ]
}
```
