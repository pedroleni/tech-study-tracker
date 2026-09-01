# `commit --amend`: corregir el último commit sin crear uno nuevo

- **Módulo:** Reescribir historia: rebase, amend y cherry-pick
- **Slug:** `commit-amend-corregir-el-ultimo-commit-sin-crear-uno-nuevo` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [git-commit](https://git-scm.com/docs/git-commit) — ver `contenido/git/TEMARIO.md` #21

---

## Un caso tan habitual que merece su propio comando

Confirmar un commit y darte cuenta al segundo siguiente de que el mensaje tiene una errata, o de que se te olvidó un fichero, pasa constantemente. `git commit --amend` no crea un commit nuevo encima — **sustituye** el último commit por uno corregido.

## Corregir solo el mensaje

```text
$ git log --oneline
631002e Primer commit

$ git commit --amend -m "Primer commit (mensaje corregido)"

$ git log --oneline
93ee36e Primer commit (mensaje corregido)
```

## Añadir un fichero olvidado al mismo commit

```text
$ echo "olvidado" > olvidado.txt
$ git add olvidado.txt
$ git commit --amend --no-edit

$ git show --stat HEAD
commit 907f0e892aeef4840f39a166c9c9de32f0c41fc1
Author: Ana <ana@example.com>
Date:   Tue Sep 1 18:24:23 2026 +0200

    Primer commit (mensaje corregido)

 a.txt        | 1 +
 olvidado.txt | 1 +
 2 files changed, 2 insertions(+)
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de usar --amend",
  "roles": [
    { "etiqueta": "-m \"nuevo mensaje\"", "rol": "Cambiar solo el texto del commit", "descripcion": "El contenido del commit no cambia — solo su mensaje. Útil para arreglar una errata sin tocar nada del código." },
    { "etiqueta": "--no-edit", "rol": "Mantener el mensaje, cambiar el contenido", "descripcion": "Combinado con un git add previo, mete lo recién stageado dentro del último commit sin abrir el editor — el mensaje se queda tal cual estaba." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "También reescribe historia — misma regla que rebase",
  "contenido": "amend cambia el hash del commit (aunque el mensaje sea el único cambio) — técnicamente crea un commit nuevo que sustituye al anterior en la rama. La misma regla de oro de la lección anterior aplica exactamente igual: amend es seguro sobre un commit que todavía no has compartido, y peligroso sobre uno que ya empujaste a un remoto donde alguien más pudo haberlo visto."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-commit",
      "descripcion": "Referencia oficial de git commit, incluida la opción --amend.",
      "url": "https://git-scm.com/docs/git-commit",
      "etiqueta": "Git Reference"
    }
  ]
}
```
