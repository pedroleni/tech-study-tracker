# `cherry-pick`: traer un commit concreto de otra rama, sin traerte la rama entera

- **Módulo:** Reescribir historia: rebase, amend y cherry-pick
- **Slug:** `cherry-pick-traer-un-commit-concreto-de-otra-rama-sin-traerte-la-rama-entera` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [git-cherry-pick](https://git-scm.com/docs/git-cherry-pick) — ver `contenido/git/TEMARIO.md` #22

---

## Un merge trae toda la rama; cherry-pick trae un commit suelto

`git merge` integra **todos** los commits nuevos de una rama. A veces solo quieres **uno** — un hotfix concreto que ya está confirmado en otra rama, sin arrastrar el resto de trabajo (todavía a medias) que hay junto a él.

## El commit existe en `feature`, pero no en `master`

```text
$ git log --oneline feature
cfb66fb fix: corrige un bug critico en produccion
ec5c25f base: primera version

$ git log --oneline master
363c877 master: sigue avanzando en paralelo
ec5c25f base: primera version
```

`master` ha seguido su propio camino — no tiene ningún antepasado directo con el commit del hotfix en `feature`.

## `git cherry-pick <hash>`, estando en `master`

```text
$ git cherry-pick cfb66fb
[master 60a1db4] fix: corrige un bug critico en produccion
 Date: Tue Sep 1 18:24:40 2026 +0200
 1 file changed, 1 insertion(+)
 create mode 100644 hotfix.txt

$ git log --oneline
60a1db4 fix: corrige un bug critico en produccion
363c877 master: sigue avanzando en paralelo
ec5c25f base: primera version
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "cfb66fb se convirtió en 60a1db4 — otro commit nuevo",
  "contenido": "Igual que rebase y amend, cherry-pick no mueve el commit original: crea una copia con el mismo cambio (el mismo diff) pero un padre distinto, así que su hash es distinto. El commit original sigue existiendo tal cual en feature — cherry-pick no lo toca ni lo borra."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Solo se trae el cambio de ESE commit — nada más.", "texto": "Si feature tuviera otros commits antes o después del hotfix, ninguno de ellos llega a master. Solo el contenido exacto del commit cuyo hash pasaste." },
    { "titulo": "Puede haber conflicto, exactamente igual que en un merge.", "texto": "Si el cambio que trae el cherry-pick toca líneas que master también modificó, Git deja el mismo tipo de marcadores del Módulo 4 — el flujo para resolverlo es idéntico: editar, git add, y aquí git cherry-pick --continue en vez de git commit." }
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
      "titulo": "git-cherry-pick",
      "descripcion": "Referencia oficial de git cherry-pick.",
      "url": "https://git-scm.com/docs/git-cherry-pick",
      "etiqueta": "Git Reference"
    }
  ]
}
```
