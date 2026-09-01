# Un hook real: bloquear un commit que no cumple una regla

- **Módulo:** Worktrees y hooks
- **Slug:** `un-hook-real-bloquear-un-commit-que-no-cumple-una-regla` (autogenerado del título)
- **Orden:** 380
- **Fuentes:** [githooks](https://git-scm.com/docs/githooks) + [Pro Git — Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) — ver `contenido/git/TEMARIO.md` #38

---

## Un `commit-msg` que exige un formato concreto

Un hook real, de cuatro líneas: rechaza cualquier commit cuyo mensaje no empiece por `feat:`, `fix:`, `docs:` o `chore:` (el mismo espíritu de Conventional Commits que se ve en detalle en el Módulo 16).

```text
$ cat .git/hooks/commit-msg
#!/bin/sh
MENSAJE=$(cat "$1")
if ! echo "$MENSAJE" | grep -qE "^(feat|fix|docs|chore): "; then
  echo "Commit rechazado: el mensaje debe empezar por 'feat: ', 'fix: ', 'docs: ' o 'chore: '"
  exit 1
fi
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"$1\" es la ruta a un fichero temporal con el mensaje",
  "contenido": "Git no pasa el mensaje como texto directo — escribe lo que hayas tecleado en un fichero temporal, y ese es el único argumento que recibe el hook. Por eso el script empieza leyendo ese fichero con cat \"$1\"."
}
```

## Un commit que no cumple la regla

```text
$ echo "v1" > a.txt
$ git add a.txt
$ git commit -m "cambios varios"
Commit rechazado: el mensaje debe empezar por 'feat: ', 'fix: ', 'docs: ' o 'chore: '
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El commit no se creó — de verdad",
  "contenido": "exit 1 dentro del hook no es solo un mensaje de aviso: le dice a Git que aborte por completo. No queda ningún commit a medias ni nada que deshacer — es exactamente como si el comando nunca se hubiera ejecutado."
}
```

## Un commit que sí cumple

```text
$ git commit -m "feat: primera version"
[master (root-commit) 282b2f2] feat: primera version
 1 file changed, 1 insertion(+)
 create mode 100644 a.txt

$ git log --oneline
282b2f2 feat: primera version
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El hook no sabe nada de \"reglas de equipo\" — solo ejecuta el script que hay.", "texto": "Toda la lógica vive en esas cuatro líneas de shell. Cambiar la regla es tan simple como editar ese fichero — no hay ninguna configuración especial de Git aparte del propio script." },
    { "titulo": "Esto mismo, aplicado en el momento de hacer push (no de confirmar), es lo que usan muchos equipos reales.", "texto": "Herramientas como Husky automatizan exactamente esto: instalar hooks compartidos por todo el equipo al clonar el proyecto, en vez de dejar que cada persona los configure a mano." }
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
      "titulo": "Pro Git — Git Hooks",
      "descripcion": "El capítulo de Pro Git sobre hooks, con ejemplos reales de commit-msg y otros.",
      "url": "https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks",
      "etiqueta": "Pro Git"
    }
  ]
}
```
