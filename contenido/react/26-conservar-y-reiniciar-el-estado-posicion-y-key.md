# Conservar y reiniciar el estado: posición y `key`

- **Módulo:** Gestionar el estado
- **Slug:** `conservar-y-reiniciar-el-estado-posicion-y-key` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) — ver `contenido/react/TEMARIO.md` #26

---

## Qué es y para qué sirve

En la lección 13 viste que el reproductor del podcast perdía su velocidad al cerrarlo y volver a abrirlo, y en la 16, que cada copia de un componente tiene su propio estado. Las dos cosas son consecuencia de una sola regla, que esta lección cuenta entera: **el estado no vive dentro del componente, sino en React, atado al sitio que ocupa el componente en el árbol**.

Saber dónde está ese sitio responde a preguntas que, si no, parecen caprichos de React:

- ¿Por qué este contador conserva su valor cuando cambio una condición, y aquel otro vuelve a cero?
- ¿Por qué, al pasar de un contacto a otro en un chat, el mensaje a medio escribir se queda en el campo?
- ¿Por qué un campo pierde lo que escribo cada vez que pulso un botón que no tiene nada que ver?

Y da el control: verás cómo **conservar** el estado cuando lo quieres y cómo **reiniciarlo** cuando no, con la posición o con una `key`.

## El estado va atado a la posición

En este entrenamiento solo hay una etiqueta `<ContadorVueltas />`, guardada en una variable, pero se pinta dos veces:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una variable, dos contadores",
  "consigna": "Pulsa varias veces «Sumar vuelta» en el segundo contador y mira el árbol. ¿Cuántos ContadorVueltas hay? ¿Cuál se vuelve a renderizar en cada clic?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction ContadorVueltas() {\n  const [vueltas, setVueltas] = useState(0)\n\n  return (\n    <section className=\"contador\">\n      <p>Vueltas: {vueltas}</p>\n      <button onClick={() => setVueltas(vueltas + 1)}>Sumar vuelta</button>\n    </section>\n  )\n}\n\nexport default function App() {\n  const contador = <ContadorVueltas />\n\n  return (\n    <main>\n      <h1>Entrenamiento en pista</h1>\n      {contador}\n      {contador}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  display: inline-block;\n  min-width: 10rem;\n  margin: 0 0.75rem 0.75rem 0;\n  padding: 0.75rem 1rem;\n  border: 2px solid #fdba74;\n  border-radius: 10px;\n  background: #fff7ed;\n  text-align: center;\n}\n\n.contador h2 {\n  margin: 0;\n  font-size: 1.1rem;\n}\n\n.contador p {\n  margin: 0.4rem 0;\n  font-size: 1.4rem;\n  font-weight: 700;\n}\n\n.grande p,\n.pantalla-grande p {\n  font-size: 2.6rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.7rem;\n}\n\nlabel {\n  display: block;\n  margin-top: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

El árbol tiene **dos** `ContadorVueltas`, y en cada clic solo el segundo sale como re-render, «cambió su estado»; el primero sigue «sin cambios» y en 0. Una etiqueta, una variable, y dos estados independientes. Así lo ve React:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Dos posiciones, dos estados",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0
    },
    {
      "nombre": "ContadorVueltas",
      "nivel": 1,
      "etiqueta": "estado: vueltas = 0",
      "nota": "← primer componente hijo de App"
    },
    {
      "nombre": "ContadorVueltas",
      "nivel": 1,
      "etiqueta": "estado: vueltas = 3",
      "nota": "← segundo componente hijo de App"
    }
  ]
}
```

React no guarda el estado en la función `ContadorVueltas`, ni en la etiqueta, ni en la variable `contador`. Lo guarda él mismo y lo asocia a **cada posición** del árbol de renderizado: «el `ContadorVueltas` que es el primer hijo de `App`» y «el que es el segundo». En cada render compara el árbol nuevo con el anterior, posición a posición, para saber qué estado le corresponde a quién.

De ahí sale la regla de toda la lección: **React conserva el estado de un componente mientras siga renderizándose en la misma posición del árbol. Si desaparece de ahí, o en su sitio aparece otro tipo de componente, su estado se destruye.** Lo de desaparecer ya lo conoces del reproductor de la lección 13: lo que sale del árbol pierde su estado, y si vuelve, empieza de cero. Ahora toca ver qué cuenta como «la misma posición».

## Mismo componente en la misma posición: el estado se conserva

En el contador de Nerea, una casilla pone los números en grande. Hay dos `<ContadorVueltas>` escritos en el código, uno en cada rama de un ternario:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  const [grande, setGrande] = useState(false)\n\n  return (\n    <main>\n      {grande ? (\n        <ContadorVueltas atleta=\"Nerea\" grande />\n      ) : (\n        <ContadorVueltas atleta=\"Nerea\" />\n      )}\n      <label>\n        <input type=\"checkbox\" checked={grande} onChange={(e) => setGrande(e.target.checked)} />\n        Letra grande\n      </label>\n    </main>\n  )\n}\n\n// ContadorVueltas guarda las vueltas en su estado.\n// Sumas 3 vueltas y marcas «Letra grande». ¿Qué marca el contador?",
  "opciones": [
    "Vueltas: 3, ahora en grande",
    "Vueltas: 0, en grande: es otro ContadorVueltas",
    "Vueltas: 3, pero la letra no cambia hasta la siguiente vuelta"
  ],
  "correcta": 0,
  "explicacion": "Con la casilla marcada o sin marcar, App devuelve un main cuyo primer hijo es un ContadorVueltas. Para React es el mismo componente en la misma posición al que le ha cambiado la prop grande: conserva sus 3 vueltas y se pinta en grande. React no ve tu ternario; solo ve el árbol que devuelves."
}
```

**Lo que cuenta es la posición en el árbol que devuelves, no dónde está escrita la etiqueta en tu código.** Ni siquiera dos `return` distintos cambian nada. Este `App` tiene un `if` con un `return` para cada caso, y aun así el contador sobrevive:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos return, el mismo contador",
  "consigna": "Suma unas vueltas y marca «Letra grande». Mira el árbol: ¿ContadorVueltas sale como montado o como re-render? Desmarca y vuelve a marcar, y fíjate en su contador de renders.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ContadorVueltas from './ContadorVueltas'\nimport './estilos.css'\n\nexport default function App() {\n  const [grande, setGrande] = useState(false)\n\n  const casilla = (\n    <label>\n      <input type=\"checkbox\" checked={grande} onChange={(e) => setGrande(e.target.checked)} />\n      Letra grande\n    </label>\n  )\n\n  if (grande) {\n    return (\n      <main>\n        <ContadorVueltas atleta=\"Nerea\" grande />\n        {casilla}\n      </main>\n    )\n  }\n\n  return (\n    <main>\n      <ContadorVueltas atleta=\"Nerea\" />\n      {casilla}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ContadorVueltas.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ContadorVueltas({ atleta, grande }) {\n  const [vueltas, setVueltas] = useState(0)\n\n  return (\n    <section className={grande ? 'contador grande' : 'contador'}>\n      <h2>{atleta}</h2>\n      <p>Vueltas: {vueltas}</p>\n      <button onClick={() => setVueltas(vueltas + 1)}>Sumar vuelta</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  display: inline-block;\n  min-width: 10rem;\n  margin: 0 0.75rem 0.75rem 0;\n  padding: 0.75rem 1rem;\n  border: 2px solid #fdba74;\n  border-radius: 10px;\n  background: #fff7ed;\n  text-align: center;\n}\n\n.contador h2 {\n  margin: 0;\n  font-size: 1.1rem;\n}\n\n.contador p {\n  margin: 0.4rem 0;\n  font-size: 1.4rem;\n  font-weight: 700;\n}\n\n.grande p,\n.pantalla-grande p {\n  font-size: 2.6rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.7rem;\n}\n\nlabel {\n  display: block;\n  margin-top: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Al marcar la casilla, `App` sale como re-render porque «cambió su estado», y `ContadorVueltas`, también como re-render, porque «cambió la prop «grande»». No como montado: **el número junto a su nombre sigue subiendo** con cada clic en vez de volver a `·1`, que es la señal de que es el mismo componente de antes. Recuerda la leyenda del panel: re-render significa «se ha vuelto a ejecutar, conserva su estado»; montado, «aparece ahora, su estado empieza de cero».

React compara los árboles de un render y el siguiente, y en ambos el primer hijo del `main` es un `ContadorVueltas`. Las condiciones que has escrito para llegar ahí no las ve.

## Distinto componente en la misma posición: el estado se reinicia

Ahora, durante el descanso, en el sitio del contador aparece otro componente:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un descanso que borra las vueltas",
  "consigna": "Suma tres vueltas, marca «Descanso» y desmárcala. ¿Cuántas vueltas quedan? Mira el árbol en cada paso: qué sale tachado, qué sale como montado y en qué número empieza el contador de renders.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ContadorVueltas from './ContadorVueltas'\nimport './estilos.css'\n\nfunction Descanso() {\n  return <p className=\"descanso\">Descanso: bebe agua y estira.</p>\n}\n\nexport default function App() {\n  const [descanso, setDescanso] = useState(false)\n\n  return (\n    <main>\n      {descanso ? <Descanso /> : <ContadorVueltas atleta=\"Nerea\" />}\n      <label>\n        <input type=\"checkbox\" checked={descanso} onChange={(e) => setDescanso(e.target.checked)} />\n        Descanso\n      </label>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ContadorVueltas.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ContadorVueltas({ atleta, grande }) {\n  const [vueltas, setVueltas] = useState(0)\n\n  return (\n    <section className={grande ? 'contador grande' : 'contador'}>\n      <h2>{atleta}</h2>\n      <p>Vueltas: {vueltas}</p>\n      <button onClick={() => setVueltas(vueltas + 1)}>Sumar vuelta</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  display: inline-block;\n  min-width: 10rem;\n  margin: 0 0.75rem 0.75rem 0;\n  padding: 0.75rem 1rem;\n  border: 2px solid #fdba74;\n  border-radius: 10px;\n  background: #fff7ed;\n  text-align: center;\n}\n\n.contador h2 {\n  margin: 0;\n  font-size: 1.1rem;\n}\n\n.contador p {\n  margin: 0.4rem 0;\n  font-size: 1.4rem;\n  font-weight: 700;\n}\n\n.grande p,\n.pantalla-grande p {\n  font-size: 2.6rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.7rem;\n}\n\nlabel {\n  display: block;\n  margin-top: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Al marcar «Descanso», el árbol enseña `ContadorVueltas` tachado, como desmontado, y `Descanso` como montado. En esa posición ahora hay **otro tipo de componente**, así que React quita el contador del árbol y destruye su estado. Al desmarcar pasa lo contrario: `Descanso` se va y entra un `ContadorVueltas` **nuevo**, montado, con el contador de renders en `·1` y `Vueltas: 0`.

Esto vale también para las etiquetas de HTML que envuelven a un componente. **Si cambia el tipo de un elemento, se reinicia todo lo que tiene debajo**, aunque lo de debajo sea idéntico:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cambiar la etiqueta de fuera",
  "consigna": "Suma unas vueltas y marca «Pantalla grande»: las vueltas vuelven a 0. Arréglalo para que la casilla solo cambie la clase del envoltorio: un único elemento, con className distinto según pantallaGrande.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ContadorVueltas from './ContadorVueltas'\nimport './estilos.css'\n\nexport default function App() {\n  const [pantallaGrande, setPantallaGrande] = useState(false)\n\n  return (\n    <main>\n      {pantallaGrande ? (\n        <div className=\"pantalla-grande\">\n          <ContadorVueltas atleta=\"Nerea\" />\n        </div>\n      ) : (\n        <section>\n          <ContadorVueltas atleta=\"Nerea\" />\n        </section>\n      )}\n      <label>\n        <input\n          type=\"checkbox\"\n          checked={pantallaGrande}\n          onChange={(e) => setPantallaGrande(e.target.checked)}\n        />\n        Pantalla grande\n      </label>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ContadorVueltas.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ContadorVueltas({ atleta, grande }) {\n  const [vueltas, setVueltas] = useState(0)\n\n  return (\n    <section className={grande ? 'contador grande' : 'contador'}>\n      <h2>{atleta}</h2>\n      <p>Vueltas: {vueltas}</p>\n      <button onClick={() => setVueltas(vueltas + 1)}>Sumar vuelta</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  display: inline-block;\n  min-width: 10rem;\n  margin: 0 0.75rem 0.75rem 0;\n  padding: 0.75rem 1rem;\n  border: 2px solid #fdba74;\n  border-radius: 10px;\n  background: #fff7ed;\n  text-align: center;\n}\n\n.contador h2 {\n  margin: 0;\n  font-size: 1.1rem;\n}\n\n.contador p {\n  margin: 0.4rem 0;\n  font-size: 1.4rem;\n  font-weight: 700;\n}\n\n.grande p,\n.pantalla-grande p {\n  font-size: 2.6rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.7rem;\n}\n\nlabel {\n  display: block;\n  margin-top: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

El panel dibuja solo componentes, no etiquetas de HTML, así que verás un `ContadorVueltas` tachado y otro `ContadorVueltas` montado con `·1`: el mismo componente, desmontado y montado de nuevo. Lo que ha cambiado está fuera del panel, en la etiqueta de encima. Esto es lo que ve React al marcar la casilla:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Al marcar «Pantalla grande», con las etiquetas a la vista",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "estado": "renderizado",
      "nota": "← cambió su estado"
    },
    {
      "nombre": "section",
      "nivel": 1,
      "estado": "desmontado",
      "nota": "← en esta posición ahora hay un div"
    },
    {
      "nombre": "ContadorVueltas",
      "nivel": 2,
      "estado": "desmontado",
      "nota": "← se va con su padre, y sus vueltas con él"
    },
    {
      "nombre": "div",
      "nivel": 1,
      "estado": "montado"
    },
    {
      "nombre": "ContadorVueltas",
      "nivel": 2,
      "estado": "montado",
      "nota": "← uno nuevo: Vueltas: 0"
    }
  ]
}
```

La solución es la de la consigna: dejar siempre la misma etiqueta y cambiar solo lo que la diferencia.

```jsx
<div className={pantallaGrande ? 'pantalla-grande' : ''}>
  <ContadorVueltas atleta="Nerea" />
</div>
```

Como regla práctica: **si quieres que el estado sobreviva entre un render y el siguiente, la estructura del árbol tiene que encajar**. Mismos tipos en las mismas posiciones, de arriba abajo hasta el componente que guarda el estado.

## Por qué no se definen componentes dentro de otros

En la lección 3 viste que un campo definido dentro de `App` se vaciaba al pulsar un botón, y quedó pendiente el porqué. Ya lo tienes todo para entenderlo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una nota que se borra al sumar una vuelta",
  "consigna": "Escribe una nota, por ejemplo «Buen ritmo», y mira el árbol mientras escribes. Después pulsa «Sumar vuelta» y vuelve a mirarlo. Arréglalo sacando NotaEntrenadora fuera de App.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [vueltas, setVueltas] = useState(0)\n\n  // Mal: un componente definido dentro de otro\n  function NotaEntrenadora() {\n    const [nota, setNota] = useState('')\n\n    return (\n      <label>\n        Nota de la entrenadora\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n    )\n  }\n\n  return (\n    <main>\n      <h1>Entrenamiento de Nerea</h1>\n      <p>Vueltas: {vueltas}</p>\n      <button onClick={() => setVueltas(vueltas + 1)}>Sumar vuelta</button>\n      <NotaEntrenadora />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.6rem;\n  justify-items: start;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\np {\n  margin: 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n  padding: 0.35rem 0.6rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Mientras escribes, todo va bien: cada tecla cambia el estado de `NotaEntrenadora` y solo ella se re-renderiza. El problema llega cuando se renderiza **`App`**. Al pulsar «Sumar vuelta», el árbol enseña una `NotaEntrenadora` tachada y otra montada con `·1`, y la nota ha desaparecido.

La razón es la regla de antes. `function NotaEntrenadora() {...}` está dentro del cuerpo de `App`, así que **cada render de `App` crea una función nueva**. Se llama igual y hace lo mismo, pero es otra función, y React distingue los tipos de componente por la función, no por el nombre. En la misma posición hay ahora un tipo de componente distinto: React desmonta el viejo, con su estado y sus nodos del DOM, y monta uno nuevo desde cero. En cada render de `App`.

Además de los fallos, es trabajo tirado: React vuelve a crear el `<label>` y el `<input>` en cada render. Y si la nota viviera en `App`, sería aún peor: cada tecla renderizaría `App`, que crearía otra `NotaEntrenadora`, y solo llegaría a escribirse la primera letra, porque el campo en el que escribías desaparece y el nuevo no tiene el foco. El arreglo es el de siempre: **todos los componentes, en el nivel superior del archivo**, y si un hijo necesita algo del padre, que lo reciba por props. Es tan común que el linter lo vigila con la regla `static-components`, que verás en la lección 70.

## Reiniciar el estado a propósito

Conservar el estado mientras un componente sigue en su sitio es casi siempre lo que quieres. Casi. En las series de 400 metros, la entrenadora apunta las vueltas de Nerea y, cuando le toca, las de Íker:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Íker hereda las vueltas de Nerea",
  "consigna": "Suma tres vueltas a Nerea y pulsa «Siguiente atleta»: Íker empieza con 3. Mira en el árbol el motivo del re-render. Arréglalo de las dos formas que se explican debajo y compara el árbol de cada una.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ContadorVueltas from './ContadorVueltas'\nimport './estilos.css'\n\nexport default function App() {\n  const [turnoDeNerea, setTurnoDeNerea] = useState(true)\n\n  return (\n    <main>\n      <h1>Series de 400 metros</h1>\n      {turnoDeNerea ? (\n        <ContadorVueltas atleta=\"Nerea\" />\n      ) : (\n        <ContadorVueltas atleta=\"Íker\" />\n      )}\n      <p>\n        <button onClick={() => setTurnoDeNerea(!turnoDeNerea)}>Siguiente atleta</button>\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ContadorVueltas.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ContadorVueltas({ atleta, grande }) {\n  const [vueltas, setVueltas] = useState(0)\n\n  return (\n    <section className={grande ? 'contador grande' : 'contador'}>\n      <h2>{atleta}</h2>\n      <p>Vueltas: {vueltas}</p>\n      <button onClick={() => setVueltas(vueltas + 1)}>Sumar vuelta</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  display: inline-block;\n  min-width: 10rem;\n  margin: 0 0.75rem 0.75rem 0;\n  padding: 0.75rem 1rem;\n  border: 2px solid #fdba74;\n  border-radius: 10px;\n  background: #fff7ed;\n  text-align: center;\n}\n\n.contador h2 {\n  margin: 0;\n  font-size: 1.1rem;\n}\n\n.contador p {\n  margin: 0.4rem 0;\n  font-size: 1.4rem;\n  font-weight: 700;\n}\n\n.grande p,\n.pantalla-grande p {\n  font-size: 2.6rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.7rem;\n}\n\nlabel {\n  display: block;\n  margin-top: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Para React, es el mismo `ContadorVueltas` al que le ha cambiado la prop `atleta`: el árbol lo dice con un re-render porque «cambió la prop «atleta»». Pero en la pista son dos contadores distintos que casualmente aparecen en el mismo sitio. Hay dos formas de decírselo a React.

### Opción 1: pintarlos en posiciones distintas

Con dos condiciones `&&` en lugar de un ternario, cada contador tiene su propio hueco en el árbol:

```jsx
{turnoDeNerea && <ContadorVueltas atleta="Nerea" />}
{!turnoDeNerea && <ContadorVueltas atleta="Íker" />}
```

Al principio, la primera posición tiene un contador y la segunda está vacía. Al pulsar «Siguiente atleta» se vacía la primera, con lo que el contador de Nerea se desmonta y pierde su estado, y en la segunda se monta uno nuevo para Íker. En el árbol verás uno tachado y otro montado con `·1`. Es cómodo cuando son pocos componentes, dos o tres, y se conocen de antemano.

### Opción 2: darles una `key` distinta

La `key` ya la conoces de las listas (lección 11), pero **no es solo para listas**. Por defecto, React distingue a los hijos de un componente por su orden: el primero, el segundo... Una `key` le da a un hijo un nombre propio que React usa como parte de su posición. Ya no es «el primer contador», sino «el contador de Nerea»:

```jsx
{turnoDeNerea ? (
  <ContadorVueltas key="nerea" atleta="Nerea" />
) : (
  <ContadorVueltas key="iker" atleta="Íker" />
)}
```

Aunque estén en el mismo sitio del JSX, con keys distintas nunca compartirán estado. En el árbol lo verás con nombre: `ContadorVueltas key=nerea` tachado y `ContadorVueltas key=iker` montado con `·1`. Si los alternas, cada vez que uno aparece empieza de cero, y cada vez que se va pierde lo que tenía.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las keys no son globales",
  "contenido": "Una key solo tiene que ser distinta de la de sus hermanos, dentro del mismo padre. Dos componentes en sitios diferentes de la app pueden tener la misma key sin ningún problema: React la usa para distinguir a los hijos de un padre, no para identificar algo en toda la app."
}
```

## Vaciar un formulario al cambiar de elemento

Donde más se usa una `key` fuera de una lista es en los formularios. En esta app de mensajería, `Chat` guarda en su estado el mensaje que estás escribiendo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un borrador que se va con quien no debe",
  "consigna": "Escríbele a Mamá «¿Vienes el domingo a comer?» y, sin enviarlo, elige a Paco. Lee el botón de enviar. Después añade key={contacto.id} al <Chat> de App.jsx, repite y mira el árbol al cambiar de contacto.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaContactos from './ListaContactos'\nimport Chat from './Chat'\nimport './estilos.css'\n\nconst CONTACTOS = [\n  { id: 'mama', nombre: 'Mamá' },\n  { id: 'lucia', nombre: 'Lucía, del trabajo' },\n  { id: 'paco', nombre: 'Paco, el fontanero' },\n]\n\nexport default function App() {\n  const [contactoId, setContactoId] = useState('mama')\n  const contacto = CONTACTOS.find((c) => c.id === contactoId)\n\n  return (\n    <main className=\"mensajeria\">\n      <ListaContactos\n        contactos={CONTACTOS}\n        elegidoId={contactoId}\n        onElegir={setContactoId}\n      />\n      <Chat contacto={contacto} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Chat.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Chat({ contacto }) {\n  const [borrador, setBorrador] = useState('')\n\n  return (\n    <section className=\"chat\">\n      <h2>Chat con {contacto.nombre}</h2>\n      <label>\n        Mensaje para {contacto.nombre}\n        <textarea value={borrador} onChange={(e) => setBorrador(e.target.value)} />\n      </label>\n      {/* En una app de verdad, aquí se enviaría el mensaje */}\n      <button onClick={() => setBorrador('')}>Enviar a {contacto.nombre}</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "ListaContactos.jsx",
      "codigo": "export default function ListaContactos({ contactos, elegidoId, onElegir }) {\n  return (\n    <nav aria-label=\"Contactos\">\n      <ul>\n        {contactos.map((contacto) => (\n          <li key={contacto.id}>\n            <button\n              aria-pressed={contacto.id === elegidoId}\n              onClick={() => onElegir(contacto.id)}\n            >\n              {contacto.nombre}\n            </button>\n          </li>\n        ))}\n      </ul>\n    </nav>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".mensajeria {\n  display: grid;\n  grid-template-columns: minmax(9rem, 12rem) 1fr;\n  gap: 1rem;\n  font-family: system-ui, sans-serif;\n}\n\n@media (max-width: 30rem) {\n  .mensajeria {\n    grid-template-columns: 1fr;\n  }\n}\n\nnav ul {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nnav button {\n  width: 100%;\n  padding: 0.45rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  background: white;\n  font: inherit;\n  text-align: left;\n}\n\nnav button[aria-pressed='true'] {\n  border-color: #0f766e;\n  background: #ccfbf1;\n  font-weight: 600;\n}\n\n.chat h2 {\n  margin-top: 0;\n  font-size: 1.1rem;\n}\n\n.chat label {\n  display: grid;\n  gap: 0.3rem;\n}\n\n.chat textarea {\n  min-height: 5rem;\n  padding: 0.5rem;\n  font: inherit;\n}\n\n.chat button {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Sin `key`, el mensaje para tu madre se queda en el campo y el botón dice «Enviar a Paco, el fontanero». `Chat` sigue en la misma posición, y el árbol lo explica: re-render porque «cambió la prop «contacto» (objeto nuevo)». En muchas apps conservar lo escrito sería lo correcto; en una de mensajería, un clic despistado le manda la invitación a comer al fontanero.

Con la `key`, al elegir a Paco el árbol enseña `Chat key=mama` tachado y `Chat key=paco` montado con `·1`, y el campo vacío:

```jsx
<Chat key={contacto.id} contacto={contacto} />
```

**Cuando cambia la `key`, React tira el componente y todo lo que tiene debajo, y lo crea de nuevo desde cero**: estado y elementos del DOM incluidos. Es justo lo que la lección 24 dejaba para aquí: si quieres que un hijo vuelva a empezar cuando cambia una prop, no copies la prop en el estado ni lo arregles a mano; dale una `key` que dependa de ella. Y cuando conozcas los efectos, recuerda que tampoco hace falta uno para esto: la lección 39 lo cuenta.

## Conservar el estado de lo que quitas

En una app de mensajería de verdad querrías algo más: que el borrador para tu madre siga ahí cuando vuelvas a su chat. Con la `key`, el `Chat` de Mamá se destruye al elegir a Paco, y su borrador con él. Hay varias formas de que un estado sobreviva a su componente:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Esconder en vez de quitar",
      "texto": "Pintar los tres chats y esconder con CSS (hidden, display: none) los que no se ven. Nadie sale del árbol, así que cada uno conserva su estado. Va bien con interfaces pequeñas; si lo escondido es grande, cada render del padre los vuelve a ejecutar todos."
    },
    {
      "titulo": "Levantar el estado",
      "texto": "Guardar los borradores de todos los contactos en el padre, que no se desmonta nunca, y pasarle a cada Chat el suyo (lección 25). Que un Chat desaparezca da igual: lo importante lo guarda otro. Es la solución más habitual."
    },
    {
      "titulo": "Guardarlo fuera de React",
      "texto": "Para que el borrador sobreviva incluso a cerrar la pestaña, se guarda en el localStorage del navegador y el componente lo lee al montarse. Lo harás con efectos (lección 38) o con useSyncExternalStore (lección 46)."
    },
    {
      "titulo": "Activity",
      "texto": "React tiene un componente pensado justo para esto: Activity, desde React 19.2, esconde una parte de la interfaz conservando su estado y deja en segundo plano el trabajo de lo escondido. Tiene su propia lección, la 54."
    }
  ]
}
```

La versión escondida es corta:

```jsx
{CONTACTOS.map((contacto) => (
  <div key={contacto.id} hidden={contacto.id !== contactoId}>
    <Chat contacto={contacto} />
  </div>
))}
```

Los tres `Chat` están siempre montados y cada uno guarda su borrador; al cambiar de contacto, los tres se vuelven a renderizar porque «se renderizó su padre». La solución más habitual, levantar los borradores, combina las dos lecciones:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Los borradores, levantados a App",
  "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst CONTACTOS = [\n  { id: 'mama', nombre: 'Mamá' },\n  { id: 'lucia', nombre: 'Lucía, del trabajo' },\n  { id: 'paco', nombre: 'Paco, el fontanero' },\n]\n\nfunction ListaContactos({ contactos, elegidoId, onElegir }) {\n  return (\n    <nav aria-label=\"Contactos\">\n      <ul>\n        {contactos.map((contacto) => (\n          <li key={contacto.id}>\n            <button aria-pressed={contacto.id === elegidoId} onClick={() => onElegir(contacto.id)}>\n              {contacto.nombre}\n            </button>\n          </li>\n        ))}\n      </ul>\n    </nav>\n  )\n}\n\nfunction Chat({ contacto, borrador, onCambiarBorrador }) {\n  return (\n    <section className=\"chat\">\n      <h2>Chat con {contacto.nombre}</h2>\n      <label>\n        Mensaje para {contacto.nombre}\n        <textarea value={borrador} onChange={(e) => onCambiarBorrador(e.target.value)} />\n      </label>\n      <button onClick={() => onCambiarBorrador('')}>Enviar a {contacto.nombre}</button>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [contactoId, setContactoId] = useState('mama')\n  const [borradores, setBorradores] = useState({ mama: '', lucia: '', paco: '' })\n  const contacto = CONTACTOS.find((c) => c.id === contactoId)\n\n  function cambiarBorrador(texto) {\n    setBorradores({ ...borradores, [contactoId]: texto })\n  }\n\n  return (\n    <main className=\"mensajeria\">\n      <ListaContactos contactos={CONTACTOS} elegidoId={contactoId} onElegir={setContactoId} />\n      <Chat\n        key={contacto.id}\n        contacto={contacto}\n        borrador={borradores[contactoId]}\n        onCambiarBorrador={cambiarBorrador}\n      />\n    </main>\n  )\n}",
  "css": ".mensajeria {\n  display: grid;\n  grid-template-columns: minmax(9rem, 12rem) 1fr;\n  gap: 1rem;\n  font-family: system-ui, sans-serif;\n}\n\n@media (max-width: 30rem) {\n  .mensajeria {\n    grid-template-columns: 1fr;\n  }\n}\n\nnav ul {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nnav button {\n  width: 100%;\n  padding: 0.45rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  background: white;\n  font: inherit;\n  text-align: left;\n}\n\nnav button[aria-pressed='true'] {\n  border-color: #0f766e;\n  background: #ccfbf1;\n  font-weight: 600;\n}\n\n.chat h2 {\n  margin-top: 0;\n  font-size: 1.1rem;\n}\n\n.chat label {\n  display: grid;\n  gap: 0.3rem;\n}\n\n.chat textarea {\n  min-height: 5rem;\n  padding: 0.5rem;\n  font: inherit;\n}\n\n.chat button {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "useState({ mama: '', lucia: '', paco: '' })",
      "nota": "Un borrador por contacto, indexado por su id, en el componente que nunca desaparece. Es la única fuente de verdad de los borradores."
    },
    {
      "fragmento": "setBorradores({ ...borradores, [contactoId]: texto })",
      "nota": "Al escribir, App copia el objeto y cambia solo el borrador del contacto abierto (lección 20)."
    },
    {
      "fragmento": "function Chat({ contacto, borrador, onCambiarBorrador })",
      "nota": "Chat ya no tiene estado: enseña el borrador que le pasan y avisa de cada cambio. Es un componente controlado."
    },
    {
      "fragmento": "key={contacto.id}",
      "nota": "La key sigue aquí aunque Chat ya no guarde nada: un chat con Mamá y uno con Paco son cosas distintas, y si mañana Chat vuelve a tener estado propio (un desplegable de emojis, por ejemplo), empezará de cero con cada contacto."
    },
    {
      "fragmento": "borrador={borradores[contactoId]}",
      "nota": "Cada Chat nuevo recibe el borrador que App tenía guardado para ese contacto."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Escríbele algo a Mamá, pasa a Paco, escríbele otra cosa y vuelve a Mamá: su mensaje sigue ahí. Pero mira el árbol al volver: **`Chat key=mama` sale como montado**, con `·1`. El componente es nuevo de verdad; lo que no es nuevo es el borrador, que nunca estuvo en él. Si pulsas el nodo `App`, en su estado verás los tres borradores.

## Cuándo lo usarías de verdad

- **Un formulario de edición junto a una lista**: al elegir otro elemento, `key={elemento.id}` en el formulario hace que empiece con los datos del nuevo y sin lo que dejaste a medias en el anterior. Lo practicarás en el ejercicio.
- **«Nueva partida» en un juego**: `<Partida key={numeroDePartida} />`, y el botón solo suma uno a `numeroDePartida`. Todo el estado de la partida, por profundo que esté, vuelve a empezar.
- **Pantallas que tienen que empezar limpias**: el perfil de otra persona, otra receta, otro producto. Si comparten componente y posición, sin `key` heredan el estado de la anterior.
- **Pestañas que conservan lo escrito**: el caso contrario, y aquí quieres que nada se desmonte. Escóndelas, levanta su estado o espera a `<Activity>` (lección 54).
- **Al revisar un fallo raro**: si algo se reinicia sin motivo, busca un componente definido dentro de otro, una etiqueta envoltorio que cambia o una `key` que no es estable. Si algo no se reinicia cuando debería, busca un componente que sigue en la misma posición.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El estado vive dentro del componente",
      "realidad": "Vive en React, que lo asocia a la posición del componente en el árbol. Por eso una misma función o una misma etiqueta, pintada en dos sitios, tiene dos estados."
    },
    {
      "mito": "Dos <ContadorVueltas /> escritos en sitios distintos del código son dos contadores",
      "realidad": "Si en el árbol que devuelves caen en la misma posición, para React son el mismo, aunque estén en ramas distintas de un ternario o en dos return."
    },
    {
      "mito": "La key solo sirve en las listas",
      "realidad": "Sirve en cualquier componente, y siempre para lo mismo: decirle a React qué es cada cosa. En una lista, para que el estado siga a su elemento aunque cambie de sitio; fuera de ella, sobre todo para reiniciar un componente cuando pasa a representar otra cosa."
    },
    {
      "mito": "Cambiar la key es una forma de volver a renderizar",
      "realidad": "Es una forma de desmontar y montar desde cero: se pierde el estado y se crean otra vez los nodos del DOM. Si lo que quieres es que el componente enseñe datos nuevos, basta con cambiar sus props o su estado."
    },
    {
      "mito": "Si no se ve, ha perdido su estado",
      "realidad": "Depende de cómo lo escondas. Si sale del árbol, lo pierde; si sigue montado pero oculto con CSS o dentro de un Activity oculto, lo conserva."
    }
  ]
}
```

## Errores típicos

**Generar la `key` en cada render.** Con `Math.random()`, `Date.now()` o un contador que sube solo, la `key` cambia cada vez que el padre se renderiza:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  const [grande, setGrande] = useState(false)\n\n  return (\n    <main>\n      <ContadorVueltas key={Math.random()} atleta=\"Nerea\" grande={grande} />\n      <label>\n        <input type=\"checkbox\" checked={grande} onChange={(e) => setGrande(e.target.checked)} />\n        Letra grande\n      </label>\n    </main>\n  )\n}\n\n// ContadorVueltas guarda las vueltas en su propio estado.\n// Sumas 2 vueltas y después marcas «Letra grande». ¿Qué marca?",
  "opciones": [
    "Vueltas: 2",
    "Vueltas: 0",
    "Nunca pasa de 0: cada clic en «Sumar vuelta» lo reinicia"
  ],
  "correcta": 1,
  "explicacion": "Sumar vuelta solo cambia el estado de ContadorVueltas: App no se vuelve a ejecutar y la key no cambia, así que las vueltas suben. Al marcar la casilla se renderiza App, Math.random() da otro número y React ve un componente distinto: desmonta el de las 2 vueltas y monta uno nuevo. Una key tiene que ser estable: la misma para la misma cosa en cada render, como un id."
}
```

Si lo pruebas en uno de los bloques de arriba, al marcar la casilla el árbol enseña un `ContadorVueltas` tachado y otro montado, cada uno con una `key` que es un número largo sin sentido. En un formulario es todavía peor: si el padre se renderiza en cada tecla, el campo se vuelve a montar en cada tecla y solo llega a escribirse la primera letra.

**Poner la `key` en el elemento equivocado.** La `key` reinicia lo que está **debajo** de ella. Si la pones dentro del componente que guarda el estado, el estado no se entera:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Chat({ contacto }) {\n  const [borrador, setBorrador] = useState('')\n\n  return (\n    <section className=\"chat\">\n      <h2>Chat con {contacto.nombre}</h2>\n      <label>\n        Mensaje para {contacto.nombre}\n        <textarea\n          key={contacto.id}\n          value={borrador}\n          onChange={(e) => setBorrador(e.target.value)}\n        />\n      </label>\n    </section>\n  )\n}\n\n// En App: <Chat contacto={contacto} />, sin key.\n// Le escribes «Hola» a Mamá y eliges a Paco. ¿Qué pone el campo?",
  "opciones": [
    "Nada: la key ha creado un textarea nuevo, vacío",
    "Hola: el textarea es nuevo, pero el borrador sigue en Chat",
    "Hola, y la consola avisa de que una key fuera de una lista no sirve"
  ],
  "correcta": 1,
  "explicacion": "La key sí hace su trabajo: React crea otro textarea en el DOM. Pero el borrador no vive en el textarea, sino en el estado de Chat, y Chat sigue en la misma posición sin key: es el mismo componente, con el mismo borrador. El textarea nuevo recibe value={borrador} y enseña «Hola». La key va en el componente dueño del estado: <Chat key={contacto.id} ... /> en App."
}
```

**Usar el índice como `key` en una lista de componentes con estado.** Es el fallo de las notas del club de lectura de la lección 11, visto ahora desde el estado: si cada elemento guarda algo (un desplegable abierto, un campo a medio escribir) y la lista se reordena o pierde uno, el estado se queda en la posición y acaba en otro elemento. Con el id de cada dato como `key`, el estado viaja con él.

**Esperar que un `if` o un ternario reinicien el estado.** Como has visto con «Letra grande», dos ramas que devuelven el mismo componente en la misma posición no reinician nada. Si quieres que sean dos componentes distintos, díselo a React con una `key`.

**Definir un componente dentro de otro**, también en su forma disimulada: una flecha creada durante el render que se usa como componente, como `const Etiqueta = () => <span>…</span>` dentro de `App`. Cada render es un tipo nuevo y todo su estado se pierde. Componentes, siempre en el nivel superior del archivo.

**Cambiar sin querer la etiqueta que envuelve a un componente con estado**, como el `section` y el `div` del contador. Si solo quieres otro aspecto, cambia la clase, no la etiqueta.

## Ejercicios

Frutas Pardo reparte fruta a bares, colegios y hoteles, y su app de reparto tiene una ficha para corregir el teléfono de cada cliente. `FichaCliente` guarda en su estado el teléfono que estás escribiendo hasta que pulsas «Guardar». Antes de tocar nada, provoca sus dos fallos: elige otro cliente y mira el campo; escribe algo, marca «Vista compacta» y vuelve a mirarlo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha de clientes del reparto",
  "consigna": "Arregla los dos fallos en App.jsx, sin tocar FichaCliente: que la ficha empiece de cero con los datos del cliente nuevo cada vez que eliges otro, y que lo que estás escribiendo sobreviva al marcar «Vista compacta». Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaCliente from './FichaCliente'\nimport './estilos.css'\n\nconst CLIENTES = [\n  { id: 'puerto', nombre: 'Bar El Puerto', telefono: '956 11 22 33' },\n  { id: 'colegio', nombre: 'Colegio San Blas', telefono: '956 44 55 66' },\n  { id: 'dunas', nombre: 'Hotel Las Dunas', telefono: '956 77 88 99' },\n]\n\nexport default function App() {\n  const [clientes, setClientes] = useState(CLIENTES)\n  const [elegidoId, setElegidoId] = useState('puerto')\n  const [compacta, setCompacta] = useState(false)\n  const elegido = clientes.find((cliente) => cliente.id === elegidoId)\n\n  function guardarTelefono(telefono) {\n    setClientes(\n      clientes.map((cliente) => (cliente.id === elegidoId ? { ...cliente, telefono } : cliente)),\n    )\n  }\n\n  return (\n    <main>\n      <h1>Frutas Pardo · Clientes del reparto</h1>\n      <ul className=\"clientes\">\n        {clientes.map((cliente) => (\n          <li key={cliente.id}>\n            <button\n              aria-pressed={cliente.id === elegidoId}\n              onClick={() => setElegidoId(cliente.id)}\n            >\n              {cliente.nombre}\n            </button>{' '}\n            {cliente.telefono}\n          </li>\n        ))}\n      </ul>\n      <label className=\"casilla\">\n        <input type=\"checkbox\" checked={compacta} onChange={(e) => setCompacta(e.target.checked)} />\n        Vista compacta\n      </label>\n      {compacta ? (\n        <div className=\"ficha compacta\">\n          <FichaCliente cliente={elegido} onGuardar={guardarTelefono} />\n        </div>\n      ) : (\n        <section className=\"ficha\">\n          <FichaCliente cliente={elegido} onGuardar={guardarTelefono} />\n        </section>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaCliente.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function FichaCliente({ cliente, onGuardar }) {\n  // El campo empieza con el teléfono guardado y se edita aquí hasta pulsar «Guardar»\n  const [telefono, setTelefono] = useState(cliente.telefono)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    onGuardar(telefono)\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <h2>{cliente.nombre}</h2>\n      <label>\n        Teléfono\n        <input type=\"tel\" value={telefono} onChange={(e) => setTelefono(e.target.value)} />\n      </label>\n      <button>Guardar</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\n.clientes {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.clientes button[aria-pressed='true'] {\n  font-weight: 700;\n}\n\nbutton,\ninput {\n  font: inherit;\n  padding: 0.3rem 0.6rem;\n}\n\n.ficha {\n  margin-top: 0.75rem;\n  padding: 1rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 10px;\n  background: #f0fdf4;\n}\n\n.ficha form {\n  display: grid;\n  gap: 0.6rem;\n  justify-items: start;\n}\n\n.ficha h2 {\n  margin: 0;\n}\n\n.ficha label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.compacta {\n  padding: 0.4rem 0.6rem;\n  font-size: 0.85rem;\n}\n\n.compacta h2 {\n  font-size: 1rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al elegir «Colegio San Blas», el campo «Teléfono» muestra el suyo, 956 44 55 66",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Colegio San Blas"
          }
        }
      ],
      "espera": {
        "etiqueta": "Teléfono",
        "valor": "956 44 55 66"
      }
    },
    {
      "descripcion": "Si escribes un teléfono sin guardarlo y cambias de cliente, el campo muestra el del cliente nuevo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "600 123 456"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Hotel Las Dunas"
          }
        }
      ],
      "espera": {
        "etiqueta": "Teléfono",
        "valor": "956 77 88 99"
      }
    },
    {
      "descripcion": "Lo que estás escribiendo se conserva al marcar «Vista compacta»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "600 123 456"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Vista compacta"
          }
        }
      ],
      "espera": {
        "etiqueta": "Teléfono",
        "valor": "600 123 456"
      }
    },
    {
      "descripcion": "Al pulsar «Guardar», la lista de clientes enseña el teléfono nuevo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "600 123 456"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "600 123 456"
      }
    }
  ]
}
```

Con la solución, el árbol cuenta la historia completa. Al elegir otro cliente, la `FichaCliente` con la `key` del anterior sale tachada y la del nuevo, montada. Al marcar «Vista compacta», la misma `FichaCliente` sale como re-render y no como montada, porque por encima de ella solo ha cambiado una clase. El motivo que verás es «cambió la prop «onGuardar» (función nueva)»: `guardarTelefono` se crea otra vez en cada render de `App`, como las flechas del acordeón de la lección 25. **Una `key` para reiniciar cuando cambia lo que representa, y una estructura estable para conservar cuando solo cambia el aspecto.**

**Retos para seguir practicando** (sin comprobación automática):

1. En el reparto, conserva lo que dejaste a medio escribir en cada cliente aunque cambies de uno a otro, como los borradores del chat: levanta los teléfonos en edición a `App`. ¿Sigue haciendo falta la `key`?
2. En la pista, añade un botón «Nueva sesión» que ponga a cero los contadores de Nerea e Íker a la vez. Pista: envuélvelos en un componente `Sesion` y dale una `key` que cambie al pulsar.
3. Un formulario con «Nombre» y «Apellidos» y una casilla «Apellidos primero» que cambia el orden de los dos campos. Haz que lo escrito viaje con su campo al cambiar el orden. ¿Qué tiene que llevar cada campo para que React no los confunda?
4. En el chat, prueba la versión que esconde con `hidden` y compárala con la de los borradores levantados: ¿cuántos componentes se renderizan en cada una al cambiar de contacto? ¿Y al escribir una letra?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "La página de react.dev en la que se basa esta lección, con los diagramas del árbol y cinco retos resueltos, entre ellos el de cambiar el orden de dos campos.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Understanding Your UI as a Tree",
      "descripcion": "El árbol de renderizado sobre el que se cuentan todas las posiciones de esta lección. Es la lección 13.",
      "url": "https://react.dev/learn/understanding-your-ui-as-a-tree",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rendering Lists",
      "descripcion": "La key dentro de las listas: de dónde sale y por qué el índice da problemas. Es la lección 11.",
      "url": "https://react.dev/learn/rendering-lists",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: Resetting state with a key",
      "descripcion": "La referencia de useState, con su apartado sobre reiniciar el estado cambiando la key.",
      "url": "https://react.dev/reference/react/useState#resetting-state-with-a-key",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "You Might Not Need an Effect",
      "descripcion": "Su apartado «Resetting all state when a prop changes» explica por qué una key es mejor que un efecto para reiniciar un componente. Es la lección 39.",
      "url": "https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "static-components",
      "descripcion": "La regla del linter que avisa cuando defines un componente dentro de otro. Es la lección 70.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Activity>",
      "descripcion": "Esconder una parte de la interfaz y recuperarla después con su estado intacto. Es la lección 54.",
      "url": "https://react.dev/reference/react/Activity",
      "etiqueta": "react.dev"
    }
  ]
}
```
