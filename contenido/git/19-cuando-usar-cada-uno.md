# Cuándo usar cada uno (y el peligro real de rebasear algo ya compartido)

- **Módulo:** Reescribir historia: rebase, amend y cherry-pick
- **Slug:** `cuando-usar-cada-uno-y-el-peligro-real-de-rebasear-algo-ya-compartido` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [Pro Git — Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) — ver `contenido/git/TEMARIO.md` #19

---

## No es una cuestión de cuál es "mejor"

Merge y rebase resuelven el mismo problema con compromisos distintos: uno preserva la historia real (con sus divergencias), el otro la deja lineal y más legible a costa de reescribirla. Ninguno es objetivamente superior — la pregunta correcta es **de quién es esa historia**.

```laboratorio
{
  "tipo": "roles",
  "titulo": "La pregunta que decide cuál usar",
  "roles": [
    { "etiqueta": "Solo tú", "rol": "Rebase es seguro", "descripcion": "Si los commits solo existen en tu copia local — todavía no los has compartido con nadie — reescribirlos no afecta a nadie más. Perfecto para limpiar el historial antes de compartirlo." },
    { "etiqueta": "Ya compartido", "rol": "Rebase es peligroso", "descripcion": "En cuanto alguien más ha hecho pull de esos commits (o ha basado su propio trabajo en ellos), reescribirlos les deja con una historia que ya no coincide con la tuya — el tema exacto del Módulo 14." }
  ]
}
```

## La regla de oro, citada literalmente

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "\"Do not rebase commits that exist outside your repository\"",
  "contenido": "Cita textual de Pro Git: \"Do not rebase commits that exist outside your repository and that people may have based work on. If you follow that guideline, you'll be fine. If you don't, people will hate you.\" El propio libro añade la práctica segura: rebasea libremente tus commits locales para limpiarlos antes de compartirlos — pero nunca reescribas nada que ya hayas empujado a un remoto compartido."
}
```

## Qué pasa exactamente si lo haces igualmente

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No se sobrescribe la copia de los demás — se duplica la historia.", "texto": "Tus compañeros siguen teniendo los commits originales. Cuando hagan pull de tu versión rebasada, Git no sabe que son \"los mismos\" commits con distinto hash — los ve como commits nuevos, además de los que ya tenían." },
    { "titulo": "El resultado visible es un lío de commits duplicados.", "texto": "Mismo autor, misma fecha, mismo mensaje — pero como dos entradas distintas en el historial. Solucionarlo exige coordinación manual entre todo el equipo, no un comando mágico." }
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
      "titulo": "Pro Git — Rebasing (The Perils of Rebasing)",
      "descripcion": "La sección exacta donde Pro Git explica la regla de oro y por qué existe.",
      "url": "https://git-scm.com/book/en/v2/Git-Branching-Rebasing",
      "etiqueta": "Pro Git"
    }
  ]
}
```
