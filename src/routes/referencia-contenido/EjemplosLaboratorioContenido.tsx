import { Callout } from '@/components/bloques-laboratorio/Callout'
import { CapasDeCaja } from '@/components/bloques-laboratorio/CapasDeCaja'
import { CodigoAnotado } from '@/components/bloques-laboratorio/CodigoAnotado'
import { ComparadorAntesDespues } from '@/components/bloques-laboratorio/ComparadorAntesDespues'
import { DiagramaEtiqueta } from '@/components/bloques-laboratorio/DiagramaEtiqueta'
import { EsquemaDePagina } from '@/components/bloques-laboratorio/EsquemaDePagina'
import { EditorEnVivo } from '@/components/bloques-laboratorio/EditorEnVivo'
import { LineaDeTiempo } from '@/components/bloques-laboratorio/LineaDeTiempo'
import { MapaDeRegiones } from '@/components/bloques-laboratorio/MapaDeRegiones'
import { Mitos } from '@/components/bloques-laboratorio/Mitos'
import { NotasClave } from '@/components/bloques-laboratorio/NotasClave'
import { PrediceElResultado } from '@/components/bloques-laboratorio/PrediceElResultado'
import { Recursos } from '@/components/bloques-laboratorio/Recursos'
import { Roles } from '@/components/bloques-laboratorio/Roles'
import { VistaPreviaSocial } from '@/components/bloques-laboratorio/VistaPreviaSocial'

import { Referencia } from '@/routes/referencia-contenido/Referencia'

export function EjemplosPreguntasYCodigo() {
  return (
    <>
      <Referencia nombre="PrediceElResultado">
        <PrediceElResultado
          tipo="predice-el-resultado"
          lenguaje="html"
          codigo={'<html>\n<body>\n<p>Hola</p>\n</body>\n</html>'}
          opciones={[
            'El navegador rechaza la página y muestra un error',
            "Se ve exactamente igual, pero el navegador activa el 'modo quirks' por debajo",
            'No pasa nada, el doctype es solo para validadores automáticos',
          ]}
          correcta={1}
          explicacion="Un navegador nunca 'rompe' una página por falta de doctype — pero activa un modo de compatibilidad (quirks mode) donde el cálculo de tamaños y márgenes cambia de forma sutil y distinta según el navegador."
        />
      </Referencia>

      <Referencia nombre="CodigoAnotado">
        <CodigoAnotado
          tipo="codigo-anotado"
          lenguaje="html"
          codigo={'<p class="intro">\n  Bienvenido a <strong>mi web</strong>.\n</p>'}
          anotaciones={[
            {
              fragmento: '<p class="intro">',
              nota: 'Etiqueta de apertura con un atributo: nombre (class) igual, valor entre comillas.',
            },
            {
              fragmento: '<strong>mi web</strong>',
              nota: 'Un elemento completo dentro de otro: apertura, contenido, cierre.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="CodigoAnotado (JSX)">
        <CodigoAnotado
          tipo="codigo-anotado"
          lenguaje="jsx"
          etiquetaSeccion="Código anotado — JSX"
          codigo={'export default function Lista({ tareas }) {\n  return (\n    <ul>\n      {tareas.map((tarea) => (\n        <li key={tarea.id}>{tarea.texto}</li>\n      ))}\n    </ul>\n  )\n}'}
          anotaciones={[
            {
              fragmento: 'tareas.map',
              nota: 'map convierte cada dato en un elemento.',
            },
            {
              fragmento: 'key={tarea.id}',
              nota: 'La key le dice a React qué fila es cuál entre renders.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="ComparadorAntesDespues">
        <ComparadorAntesDespues
          tipo="comparador-antes-despues"
          antes="Instrucciones para la vida: Come. Duerme. Repite."
          despues={'<p>Instrucciones para la vida:</p>\n<ul>\n  <li>Come</li>\n  <li>Duerme</li>\n  <li>Repite</li>\n</ul>'}
          nota="Mismo contenido, con y sin HTML."
        />
      </Referencia>

      <Referencia nombre="NotasClave">
        <NotasClave
          tipo="notas-clave"
          items={[
            {
              titulo: 'Olvidar cerrar una etiqueta que sí lo necesita.',
              texto: 'Confundir un elemento normal con uno vacío, como <img> o <br>.',
            },
            {
              titulo: 'Cerrar en el orden equivocado.',
              texto: 'El cierre tiene que deshacer el anidamiento en orden inverso al de apertura, como una pila.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="DiagramaEtiqueta">
        <DiagramaEtiqueta
          tipo="diagrama-etiqueta"
          titulo="Un elemento completo, descompuesto"
          partes={[
            { texto: '<', rol: 'simbolo' },
            { texto: 'p', rol: 'apertura' },
            { texto: ' ', rol: 'simbolo' },
            { texto: 'class', rol: 'atributo-nombre' },
            { texto: '=', rol: 'simbolo' },
            { texto: '"intro"', rol: 'atributo-valor' },
            { texto: '>', rol: 'simbolo' },
            { texto: 'Hola', rol: 'contenido' },
            { texto: '</p>', rol: 'cierre' },
          ]}
        />
      </Referencia>

      <Referencia nombre="Callout">
        <Callout
          tipo="callout"
          variante="aviso"
          titulo="Orden importante"
          contenido="Coloca meta charset antes de cualquier texto con tildes: el navegador necesita conocer la codificación antes de interpretar el título."
        />
      </Referencia>
    </>
  )
}

export function EjemplosNarrativaYRecursos() {
  return (
    <>
      <Referencia nombre="LineaDeTiempo">
        <LineaDeTiempo
          tipo="linea-de-tiempo"
          titulo="Cómo llegó HTML hasta aquí"
          items={[
            {
              fecha: '1991',
              titulo: 'Tim Berners-Lee publica HTML',
              texto: 'Nace para conectar documentos entre sí — la H de HyperText.',
            },
            {
              fecha: 'Años 2000',
              titulo: 'Cada navegador improvisaba por su cuenta',
              texto: 'Sin una única especificación de referencia, una misma página podía verse rota en la mitad de los navegadores.',
            },
            {
              fecha: 'Hoy',
              titulo: 'Living standard del WHATWG',
              texto: 'Especificación viva, con los navegadores grandes implicados directamente en su evolución.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="Roles">
        <Roles
          tipo="roles"
          titulo="Quién hace qué en una página web"
          roles={[
            { etiqueta: 'HTML', rol: 'Estructura', descripcion: '"Esto es un botón".' },
            { etiqueta: 'CSS', rol: 'Presentación', descripcion: 'Decide de qué color y tamaño se ve.' },
            { etiqueta: 'JavaScript', rol: 'Comportamiento', descripcion: 'Decide qué pasa cuando alguien hace clic.' },
          ]}
        />
      </Referencia>

      <Referencia nombre="Recursos">
        <Recursos
          tipo="recursos"
          recursos={[
            {
              titulo: 'Sintaxis de HTML',
              descripcion: 'Reglas del estándar para escribir elementos, atributos y comentarios.',
              url: 'https://html.spec.whatwg.org/multipage/syntax.html',
              etiqueta: 'Estándar WHATWG',
            },
            {
              titulo: 'Regiones de una página',
              descripcion: 'Buenas prácticas para que los landmarks ayuden a navegar el contenido.',
              url: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
              etiqueta: 'Guía W3C',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="Mitos">
        <Mitos
          tipo="mitos"
          mitos={[
            {
              mito: 'HTML no es CSS',
              realidad: 'HTML dice qué es cada cosa; CSS decide cómo se ve.',
            },
            {
              mito: 'Un <div> sirve para cualquier cosa',
              realidad: 'Existen etiquetas con significado propio (nav, article, button) que ayudan a lectores de pantalla y buscadores — usar siempre div los deja sin esa información.',
            },
            {
              mito: 'Cerrar mal una etiqueta rompe la página',
              realidad: 'El navegador suele "adivinar" el cierre y seguir renderizando, pero de forma inconsistente entre navegadores — no es un error visible, es un riesgo silencioso.',
            },
            {
              mito: 'El orden de los atributos importa',
              realidad: 'A diferencia de las etiquetas anidadas, los atributos dentro de una etiqueta se pueden escribir en cualquier orden sin cambiar el resultado.',
            },
          ]}
        />
      </Referencia>
    </>
  )
}

export function EjemplosPaginaYEditor() {
  return (
    <>
      <Referencia nombre="VistaPreviaSocial">
        <VistaPreviaSocial
          tipo="vista-previa-social"
          dominio="tech-study-tracker.vercel.app"
          ogTitulo="Anatomía de una etiqueta — Tech Study Tracker"
          ogDescripcion="Qué es un elemento, qué son los atributos, y por qué unas pocas etiquetas se cierran solas y el resto no."
          imagenEtiqueta="og:image · 1200×630"
        />
      </Referencia>

      <Referencia nombre="MapaDeRegiones">
        <MapaDeRegiones
          tipo="mapa-de-regiones"
          regiones={[
            {
              etiqueta: 'Cabecera',
              elemento: 'header',
              landmark: 'banner',
              contenido: 'Logo y nombre del sitio',
            },
            {
              etiqueta: 'Navegación',
              elemento: 'nav',
              landmark: 'navigation',
              contenido: 'Inicio · Blog · Contacto',
            },
            {
              etiqueta: 'Contenido principal',
              elemento: 'main',
              landmark: 'main',
              contenido: 'El contenido único de esta página',
            },
            {
              etiqueta: 'Pie',
              elemento: 'footer',
              landmark: 'contentinfo',
              contenido: '© 2026 — todos los derechos reservados',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="EsquemaDePagina">
        <EsquemaDePagina
          tipo="esquema-de-pagina"
          header="Logo y nombre del sitio"
          nav="Inicio · Blog · Contacto"
          main="El contenido único de esta página"
          aside="Enlaces relacionados, no esenciales"
          footer="© 2026 — todos los derechos reservados"
        />
      </Referencia>

      <Referencia nombre="CapasDeCaja">
        <CapasDeCaja
          tipo="capas-de-caja"
          margin="16px"
          border="2px solid"
          padding="12px"
          content="320 × 180"
        />
      </Referencia>

      <Referencia nombre="EditorEnVivo">
        <EditorEnVivo
          tipo="editor-en-vivo"
          titulo="Prueba el ejercicio"
          consigna="Cambia el texto y observa la vista previa."
          html={'<button id="saludo">Saludar</button>\n<p id="resultado"></p>'}
          css={'button {\n  padding: 0.75rem 1rem;\n  font: inherit;\n}'}
          js={
            "document.querySelector('#saludo').addEventListener('click', () => {\n  document.querySelector('#resultado').textContent = '¡Hola!';\n});"
          }
          ts={'const x: number = "hola";'}
          pestañaInicial="ts"
        />
      </Referencia>
    </>
  )
}
