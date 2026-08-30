import { createContext, useContext, useState, type ReactNode } from 'react'

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
import { Acordeon } from '@/components/referencia-contenido/Acordeon'
import { AntesDespuesDeslizante } from '@/components/referencia-contenido/AntesDespuesDeslizante'
import { AparicionEscalonada } from '@/components/referencia-contenido/AparicionEscalonada'
import { ArbolExpandible } from '@/components/referencia-contenido/ArbolExpandible'
import { BannerAlerta } from '@/components/referencia-contenido/BannerAlerta'
import { BarraProgresoLectura } from '@/components/referencia-contenido/BarraProgresoLectura'
import { BotonMagnetico } from '@/components/referencia-contenido/BotonMagnetico'
import { CarruselAutoplay } from '@/components/referencia-contenido/CarruselAutoplay'
import { CarruselCoverflow } from '@/components/referencia-contenido/CarruselCoverflow'
import { CarruselTarjetas } from '@/components/referencia-contenido/CarruselTarjetas'
import { CarruselVertical } from '@/components/referencia-contenido/CarruselVertical'
import { CitaDestacada } from '@/components/referencia-contenido/CitaDestacada'
import { ComparacionCodigo } from '@/components/referencia-contenido/ComparacionCodigo'
import { ContadorEnScroll } from '@/components/referencia-contenido/ContadorEnScroll'
import { ContadorRegresivo } from '@/components/referencia-contenido/ContadorRegresivo'
import { CuboGirable } from '@/components/referencia-contenido/CuboGirable'
import { GaleriaMiniaturas } from '@/components/referencia-contenido/GaleriaMiniaturas'
import { GraficoBarras } from '@/components/referencia-contenido/GraficoBarras'
import { GrupoInsignias } from '@/components/referencia-contenido/GrupoInsignias'
import { IndicadorEscritura } from '@/components/referencia-contenido/IndicadorEscritura'
import { IndicadorScrollSecciones } from '@/components/referencia-contenido/IndicadorScrollSecciones'
import { InterruptorAnimado } from '@/components/referencia-contenido/InterruptorAnimado'
import { LibroPagina } from '@/components/referencia-contenido/LibroPagina'
import { LineaComparativaAnimada } from '@/components/referencia-contenido/LineaComparativaAnimada'
import { ListaComprobacion } from '@/components/referencia-contenido/ListaComprobacion'
import { MaquinaEscribir } from '@/components/referencia-contenido/MaquinaEscribir'
import { MapaCalor } from '@/components/referencia-contenido/MapaCalor'
import { MedidorDificultad } from '@/components/referencia-contenido/MedidorDificultad'
import { NubeEtiquetas } from '@/components/referencia-contenido/NubeEtiquetas'
import { ParallaxCapa } from '@/components/referencia-contenido/ParallaxCapa'
import { Pasos } from '@/components/referencia-contenido/Pasos'
import { Pestanas } from '@/components/referencia-contenido/Pestanas'
import { PilaTarjetas } from '@/components/referencia-contenido/PilaTarjetas'
import { RequisitosPrevios } from '@/components/referencia-contenido/RequisitosPrevios'
import { RevelarAlDesplazar } from '@/components/referencia-contenido/RevelarAlDesplazar'
import { ResumenTLDR } from '@/components/referencia-contenido/ResumenTLDR'
import { RuedaProgreso } from '@/components/referencia-contenido/RuedaProgreso'
import { TablaComparativa } from '@/components/referencia-contenido/TablaComparativa'
import { TarjetaConfeti } from '@/components/referencia-contenido/TarjetaConfeti'
import { TarjetaEstadistica } from '@/components/referencia-contenido/TarjetaEstadistica'
import { TarjetaExpandible } from '@/components/referencia-contenido/TarjetaExpandible'
import { TarjetaInclinacion } from '@/components/referencia-contenido/TarjetaInclinacion'
import { TarjetaRecursoExterno } from '@/components/referencia-contenido/TarjetaRecursoExterno'
import { TarjetaVolteable } from '@/components/referencia-contenido/TarjetaVolteable'
import { TerminoGlosario } from '@/components/referencia-contenido/TerminoGlosario'
import { TextoRotativo } from '@/components/referencia-contenido/TextoRotativo'
import { TickerHorizontal } from '@/components/referencia-contenido/TickerHorizontal'
import { cn } from '@/lib/utils'

interface PropiedadesReferencia {
  nombre: string
  children: ReactNode
}

interface PropiedadesGrupoCatalogo {
  titulo: string
  descripcion: string
  children: ReactNode
}

// Todas las categorías del catálogo, en el orden en que aparecen abajo — la
// lista para los chips de filtro se mantiene a mano porque los títulos de
// GrupoCatalogo también están escritos a mano, no generados desde aquí.
const CATEGORIAS = [
  'Bloques de laboratorio',
  'Avisos y alertas',
  'Navegación y contenido expandible',
  'Estructura secuencial',
  'Enriquecimiento de texto',
  'Metadatos y progreso',
  'Comparación y verificación',
  'Tarjetas de recursos',
  'Carruseles',
  'Efectos 3D',
  'Animaciones de scroll',
  'Texto dinámico',
  'Interactivos',
  'Datos animados',
]

function idDeCategoria(titulo: string) {
  return `grupo-${titulo.toLowerCase().replace(/\s+/g, '-')}`
}

// Cada GrupoCatalogo lee el filtro activo por contexto en vez de recibirlo
// como prop — así el filtro no obliga a tocar las 14 llamadas existentes.
const CategoriaActivaContext = createContext<string | null>(null)

function GrupoCatalogo({ titulo, descripcion, children }: PropiedadesGrupoCatalogo) {
  const categoriaActiva = useContext(CategoriaActivaContext)
  if (categoriaActiva !== null && categoriaActiva !== titulo) return null

  const tituloId = idDeCategoria(titulo)

  return (
    <section aria-labelledby={tituloId} className="scroll-mt-16 space-y-8">
      <header className="border-b pb-4">
        <h2 id={tituloId} className="text-2xl font-semibold tracking-tight text-balance">
          {titulo}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-pretty text-muted-foreground">{descripcion}</p>
      </header>
      <div className="space-y-12">{children}</div>
    </section>
  )
}

function FiltroCategorias({
  categoriaActiva,
  onCambiar,
}: {
  categoriaActiva: string | null
  onCambiar: (categoria: string | null) => void
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar componentes por categoría"
      className="sticky top-0 z-10 -mx-1 flex flex-wrap gap-2 border-b bg-background px-1 py-3"
    >
      <button
        type="button"
        aria-pressed={categoriaActiva === null}
        onClick={() => onCambiar(null)}
        className={cn(
          'min-h-9 touch-manipulation rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          categoriaActiva === null
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        Todas
      </button>
      {CATEGORIAS.map((categoria) => {
        const activa = categoriaActiva === categoria
        return (
          <button
            key={categoria}
            type="button"
            aria-pressed={activa}
            onClick={() => onCambiar(activa ? null : categoria)}
            className={cn(
              'min-h-9 touch-manipulation rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              activa
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {categoria}
          </button>
        )
      })}
    </div>
  )
}

function Referencia({ nombre, children }: PropiedadesReferencia) {
  const tituloId = `referencia-${nombre.toLowerCase()}`

  return (
    <section aria-labelledby={tituloId} className="scroll-mt-6 space-y-3">
      <h3 id={tituloId} className="font-mono text-xs font-semibold text-muted-foreground">
        {nombre}.tsx
      </h3>
      {children}
    </section>
  )
}

export function AdminReferenciaContenidoPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)

  return (
    <section aria-labelledby="admin-referencia-contenido-title" className="space-y-10">
      <BarraProgresoLectura etiqueta="Progreso por el catálogo de componentes" />

      <header>
        <p className="text-sm font-medium text-muted-foreground">Administración</p>
        <h1
          id="admin-referencia-contenido-title"
          className="mt-1 text-3xl font-semibold tracking-tight text-balance"
        >
          Componentes de contenido
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-pretty text-muted-foreground">
          Catálogo visual de componentes React organizado por tipo. El primer grupo, "Bloques de
          laboratorio", son los 15 componentes reales que ya renderiza cualquier lección a través
          de un bloque <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">```laboratorio</code>{' '}
          en su Markdown (ver <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">specs/features/laboratorios.md</code>).
          El resto de grupos son prototipos de diseño de <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">referencia-contenido/</code> —
          sirven para comparar patrones de presentación, pero todavía no forman parte del
          pipeline de Markdown ni del sistema de laboratorios.
        </p>
      </header>

      <FiltroCategorias categoriaActiva={categoriaActiva} onCambiar={setCategoriaActiva} />

      <CategoriaActivaContext.Provider value={categoriaActiva}>
      <GrupoCatalogo
        titulo="Bloques de laboratorio"
        descripcion="Los 15 tipos reales que un autor puede usar dentro de un bloque ```laboratorio en el Markdown de una lección (src/components/bloques-laboratorio/). Validados por Zod, registrados en un lookup cerrado — no prototipos."
      >
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
            ts=""
            pestañaInicial="html"
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Avisos y alertas"
        descripcion="Mensajes que interrumpen la lectura a propósito porque hay algo que el lector no debería pasar por alto."
      >
        <Referencia nombre="BannerAlerta">
          <BannerAlerta mensaje="Esta lección usa HTML5: no necesitas la barra final de XHTML en etiquetas vacías como br o img." />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Navegación y contenido expandible"
        descripcion="Contenido que se oculta o se reorganiza bajo demanda, en vez de ocupar espacio todo el tiempo."
      >
        <Referencia nombre="Acordeon">
          <Acordeon
            items={[
              {
                pregunta: '¿Por qué solo puede haber un main visible?',
                respuesta:
                  'Porque representa el contenido principal del documento. Dos regiones main harían ambiguo el destino del atajo que usan las tecnologías de asistencia.',
              },
              {
                pregunta: '¿Cuándo debo usar article en vez de section?',
                respuesta:
                  'Usa article cuando el contenido conserve su sentido fuera de la página, como una noticia, una receta o una entrada de blog.',
              },
              {
                pregunta: '¿Un div puede sustituir a una etiqueta semántica?',
                respuesta:
                  'Visualmente puede parecer igual, pero no comunica ninguna estructura al navegador, al buscador ni al lector de pantalla.',
              },
            ]}
          />
        </Referencia>

        <Referencia nombre="Pestanas">
          <Pestanas
            items={[
              {
                etiqueta: 'head',
                contenido:
                  'Contiene metadatos, el título de la pestaña y enlaces a recursos que el navegador necesita antes de pintar la página.',
              },
              {
                etiqueta: 'body',
                contenido:
                  'Contiene todo lo que forma parte de la página visible: encabezados, texto, imágenes, navegación y controles.',
              },
              {
                etiqueta: 'footer',
                contenido:
                  'Cierra una página o una sección con información complementaria, como autoría, licencia o enlaces relacionados.',
              },
            ]}
          />
        </Referencia>

        <Referencia nombre="TarjetaExpandible">
          <TarjetaExpandible
            titulo="¿Por qué el navegador corrige HTML mal anidado?"
            resumen="Los navegadores intentan mostrar páginas antiguas incluso cuando contienen errores."
            contenido="El parser aplica reglas de recuperación y reconstruye el árbol que considera más probable. Esa tolerancia evita una pantalla en blanco, pero distintos errores pueden producir una estructura inesperada: por eso conviene validar el documento en vez de confiar en la corrección automática."
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Estructura secuencial"
        descripcion="Contenido que solo tiene sentido en un orden concreto: un proceso, un progreso, o lo que hace falta saber antes de empezar."
      >
        <Referencia nombre="Pasos">
          <Pasos
            pasoActivo={2}
            pasos={[
              {
                titulo: 'Declara el documento',
                descripcion: 'Empieza con DOCTYPE para activar las reglas modernas de HTML.',
              },
              {
                titulo: 'Define idioma y metadatos',
                descripcion: 'Añade lang="es", charset, viewport y un título descriptivo.',
              },
              {
                titulo: 'Estructura el contenido',
                descripcion: 'Organiza body con header, main y footer según su significado.',
              },
            ]}
          />
        </Referencia>

        <Referencia nombre="RequisitosPrevios">
          <RequisitosPrevios
            titulo="Antes de empezar"
            requisitos={[
              'Un editor de texto para crear un archivo index.html.',
              'Un navegador moderno para abrir el documento.',
              'No necesitas conocer CSS ni JavaScript.',
            ]}
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Enriquecimiento de texto"
        descripcion="Anotaciones que se insertan dentro de un párrafo normal, sin romper el flujo de lectura."
      >
        <Referencia nombre="CitaDestacada">
          <CitaDestacada
            cita="Un h1 no es texto grande: es el título de la página."
            atribucion="Principio de HTML semántico"
            fuente="La estructura de una página"
          />
        </Referencia>

        <Referencia nombre="TerminoGlosario">
          <p className="rounded-xl border bg-card p-5 text-sm leading-relaxed shadow-sm">
            El{' '}
            <TerminoGlosario
              termino="DOM"
              definicion="Representación en forma de árbol que el navegador construye a partir de los elementos del documento HTML."
            />{' '}
            conserva las relaciones de anidamiento entre las etiquetas.
          </p>
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Metadatos y progreso"
        descripcion="Información sobre la lección misma — cuánto dura, qué la etiqueta, cuánto llevas leído — no sobre HTML."
      >
        <Referencia nombre="TarjetaEstadistica">
          <div className="max-w-sm">
            <TarjetaEstadistica valor={7} sufijo=" min" etiqueta="Lectura estimada de la lección" />
          </div>
        </Referencia>

        <Referencia nombre="GrupoInsignias">
          <GrupoInsignias
            etiquetas={['HTML', 'Semántica', 'Accesibilidad', 'Primeros pasos']}
            ariaLabel="Temas de la lección"
          />
        </Referencia>

        <Referencia nombre="MedidorDificultad">
          <MedidorDificultad nivel={1} etiqueta="Dificultad" />
        </Referencia>

        <Referencia nombre="ResumenTLDR">
          <ResumenTLDR
            titulo="El documento HTML mínimo en 3 ideas"
            puntos={[
              'DOCTYPE activa el modo estándar del navegador.',
              'head describe el documento y body contiene lo que se ve.',
              'Las etiquetas se cierran en el orden inverso al que se abren.',
            ]}
          />
        </Referencia>

        <Referencia nombre="BarraProgresoLectura">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-pretty text-muted-foreground">
              La línea fija en el borde superior de la ventana avanza a medida que recorres este
              catálogo.
            </p>
          </div>
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Comparación y verificación"
        descripcion="Dos alternativas o una serie de condiciones puestas una junto a otra para que la diferencia salte a la vista."
      >
        <Referencia nombre="ListaComprobacion">
          <ListaComprobacion
            titulo="Revisa el esqueleto del documento"
            items={[
              { id: 'doctype', texto: 'DOCTYPE aparece en la primera línea', completado: true },
              { id: 'idioma', texto: 'html declara el idioma con lang="es"' },
              { id: 'charset', texto: 'meta charset es el primer elemento de head' },
              { id: 'viewport', texto: 'viewport prepara la página para móviles' },
            ]}
          />
        </Referencia>

        <Referencia nombre="TablaComparativa">
          <TablaComparativa
            caption="Comparación entre div y etiquetas semánticas"
            columnas={['div', 'Etiqueta semántica']}
            filas={[
              { caracteristica: 'Crea una caja visual', valores: [true, true] },
              { caracteristica: 'Comunica su propósito', valores: [false, true] },
              { caracteristica: 'Crea una región accesible', valores: [false, true] },
              { caracteristica: 'Ejemplo', valores: ['<div>', '<main>'] },
            ]}
          />
        </Referencia>

        <Referencia nombre="ComparacionCodigo">
          <ComparacionCodigo
            evitar={{
              etiqueta: 'Evitar',
              codigo: '<div class="nav">\n  <a href="/">Inicio</a>\n</div>',
            }}
            preferir={{
              etiqueta: 'Preferir',
              codigo: '<nav aria-label="Principal">\n  <a href="/">Inicio</a>\n</nav>',
            }}
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Tarjetas de recursos"
        descripcion="Enlaces salientes presentados como una tarjeta, individual o en cuadrícula, en vez de un enlace suelto en el texto."
      >
        <Referencia nombre="TarjetaRecursoExterno">
          <TarjetaRecursoExterno
            titulo="Estándar HTML Living Standard"
            descripcion="Consulta la referencia normativa de los elementos, atributos y algoritmos que implementan los navegadores."
            url="https://html.spec.whatwg.org/"
            dominio="html.spec.whatwg.org"
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Carruseles"
        descripcion="Cinco formas de recorrer conceptos, fragmentos y pasos sin depender de una librería externa."
      >
        <Referencia nombre="CarruselTarjetas">
          <CarruselTarjetas
            items={[
              {
                etiqueta: 'Documento',
                titulo: 'La declaración DOCTYPE',
                descripcion: 'Indica al navegador que debe interpretar el documento con las reglas modernas de HTML.',
              },
              {
                etiqueta: 'Metadatos',
                titulo: 'El elemento head',
                descripcion: 'Agrupa el título, la codificación y otros datos que describen la página.',
              },
              {
                etiqueta: 'Contenido',
                titulo: 'El elemento body',
                descripcion: 'Contiene los encabezados, párrafos, enlaces y controles visibles.',
              },
            ]}
          />
        </Referencia>

        <Referencia nombre="CarruselCoverflow">
          <CarruselCoverflow
            items={[
              { codigo: '<header>', titulo: 'Cabecera', descripcion: 'Presenta el contexto de la página.' },
              { codigo: '<nav>', titulo: 'Navegación', descripcion: 'Agrupa los enlaces principales.' },
              { codigo: '<main>', titulo: 'Contenido principal', descripcion: 'Identifica la región central.' },
              { codigo: '<aside>', titulo: 'Contenido relacionado', descripcion: 'Añade información complementaria.' },
              { codigo: '<footer>', titulo: 'Pie', descripcion: 'Cierra la página o una sección.' },
            ]}
          />
        </Referencia>

        <Referencia nombre="CarruselAutoplay">
          <CarruselAutoplay
            intervaloMs={6000}
            items={[
              { titulo: 'HTML aporta estructura', descripcion: 'Las etiquetas describen qué representa cada parte del contenido.' },
              { titulo: 'CSS aporta presentación', descripcion: 'Las reglas visuales controlan color, espacio, tipografía y distribución.' },
              { titulo: 'JavaScript aporta comportamiento', descripcion: 'Los eventos y el estado permiten responder a la interacción.' },
            ]}
          />
        </Referencia>

        <Referencia nombre="GaleriaMiniaturas">
          <GaleriaMiniaturas
            items={[
              { titulo: 'Título', descripcion: 'Un h1 identifica el tema principal de la página.', codigo: '<h1>Curso de HTML</h1>' },
              { titulo: 'Párrafo', descripcion: 'Un p agrupa una unidad de texto relacionada.', codigo: '<p>HTML describe el contenido.</p>' },
              { titulo: 'Enlace', descripcion: 'Un a conecta el documento con otra dirección.', codigo: '<a href="/temario">Ver temario</a>' },
            ]}
          />
        </Referencia>

        <Referencia nombre="CarruselVertical">
          <CarruselVertical
            pasos={[
              { titulo: 'Crea index.html', descripcion: 'Guarda el archivo con extensión HTML para que el editor y el navegador reconozcan su formato.' },
              { titulo: 'Añade el esqueleto', descripcion: 'Escribe DOCTYPE, html, head y body respetando el anidamiento.' },
              { titulo: 'Abre el documento', descripcion: 'Carga el archivo en el navegador y revisa la consola si algo no aparece.' },
            ]}
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Efectos 3D"
        descripcion="Transformaciones con perspectiva, profundidad y caras construidas únicamente con CSS."
      >
        <Referencia nombre="TarjetaVolteable">
          <TarjetaVolteable
            tituloFrontal="¿Qué significa HTML?"
            contenidoFrontal="Intenta recordar el nombre completo antes de girar la tarjeta."
            tituloTrasero="HyperText Markup Language"
            contenidoTrasero="Lenguaje de marcado de hipertexto: conecta documentos y describe su estructura."
          />
        </Referencia>

        <Referencia nombre="TarjetaInclinacion">
          <TarjetaInclinacion
            titulo="Un elemento, tres piezas"
            descripcion="La etiqueta de apertura, el contenido y la etiqueta de cierre forman un elemento HTML completo."
          />
        </Referencia>

        <Referencia nombre="CuboGirable">
          <CuboGirable
            caras={[
              { titulo: 'article', contenido: 'Contenido autónomo y reutilizable.' },
              { titulo: 'section', contenido: 'Agrupación temática con encabezado.' },
              { titulo: 'nav', contenido: 'Conjunto principal de enlaces.' },
              { titulo: 'aside', contenido: 'Información relacionada, no central.' },
            ]}
          />
        </Referencia>

        <Referencia nombre="PilaTarjetas">
          <PilaTarjetas
            items={[
              { etiqueta: 'Atributo', titulo: 'lang="es"', descripcion: 'Declara el idioma principal y mejora pronunciación y traducción.' },
              { etiqueta: 'Atributo', titulo: 'charset="utf-8"', descripcion: 'Permite representar tildes, eñes y símbolos de forma consistente.' },
              { etiqueta: 'Atributo', titulo: 'name="viewport"', descripcion: 'Adapta el ancho lógico del documento a las pantallas móviles.' },
            ]}
          />
        </Referencia>

        <Referencia nombre="LibroPagina">
          <LibroPagina
            portada={{ titulo: 'Capítulo: enlaces', contenido: 'Abre la página para ver la regla esencial de navegación.' }}
            pagina={{ titulo: 'Describe el destino', contenido: 'El texto de un enlace debe tener sentido fuera de su párrafo; evita etiquetas vagas como “haz clic aquí”.' }}
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Animaciones de scroll"
        descripcion="Patrones que comienzan o actualizan su estado al entrar en el viewport y liberan sus observadores al desmontarse."
      >
        <Referencia nombre="RevelarAlDesplazar">
          <RevelarAlDesplazar
            items={[
              { titulo: 'Primero la estructura', descripcion: 'Escribe HTML que conserve su significado incluso sin estilos.' },
              { titulo: 'Después la presentación', descripcion: 'Añade CSS sin convertir elementos genéricos en sustitutos de la semántica.' },
              { titulo: 'Finalmente la interacción', descripcion: 'Usa JavaScript solo donde el contenido necesite responder al usuario.' },
            ]}
          />
        </Referencia>

        <Referencia nombre="ContadorEnScroll">
          <div className="max-w-sm">
            <ContadorEnScroll valor={142} sufijo=" elementos" etiqueta="Elementos definidos en HTML" />
          </div>
        </Referencia>

        <Referencia nombre="ParallaxCapa">
          <ParallaxCapa
            titulo="Capas que explican una página"
            descripcion="El fondo se desplaza a otro ritmo mientras el contenido mantiene su posición de lectura."
          />
        </Referencia>

        <Referencia nombre="IndicadorScrollSecciones">
          <IndicadorScrollSecciones
            secciones={[
              { titulo: 'Sintaxis', contenido: 'Aprende cómo se abren, anidan y cierran los elementos.' },
              { titulo: 'Semántica', contenido: 'Elige etiquetas por su significado, no por su aspecto inicial.' },
              { titulo: 'Accesibilidad', contenido: 'Comprueba nombres, orden de foco y jerarquía de encabezados.' },
              { titulo: 'Validación', contenido: 'Detecta atributos inválidos y errores de anidamiento antes de publicar.' },
            ]}
          />
        </Referencia>

        <Referencia nombre="AparicionEscalonada">
          <AparicionEscalonada
            items={[
              { titulo: 'Elemento', descripcion: 'Unidad formada por etiquetas y contenido.' },
              { titulo: 'Atributo', descripcion: 'Información adicional escrita en la apertura.' },
              { titulo: 'Anidamiento', descripcion: 'Relación de elementos padres e hijos.' },
              { titulo: 'DOM', descripcion: 'Árbol que construye el navegador.' },
              { titulo: 'Landmark', descripcion: 'Región que facilita la navegación asistida.' },
              { titulo: 'Validador', descripcion: 'Herramienta que contrasta el código con el estándar.' },
            ]}
          />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Texto dinámico"
        descripcion="Movimiento tipográfico y estados temporales construidos con CSS y temporizadores nativos."
      >
        <Referencia nombre="TickerHorizontal">
          <TickerHorizontal items={['doctype', 'html', 'head', 'meta', 'title', 'body', 'header', 'main', 'footer']} />
        </Referencia>

        <Referencia nombre="TextoRotativo">
          <TextoRotativo prefijo="HTML debe ser" palabras={['semántico', 'accesible', 'válido', 'resistente']} />
        </Referencia>

        <Referencia nombre="MaquinaEscribir">
          <MaquinaEscribir texto='<main aria-labelledby="titulo">Contenido principal</main>' />
        </Referencia>

        <Referencia nombre="ContadorRegresivo">
          <ContadorRegresivo duracionSegundos={3665} etiqueta="Tiempo para completar el reto" />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Interactivos"
        descripcion="Controles táctiles y de teclado con respuestas visuales más expresivas."
      >
        <Referencia nombre="AntesDespuesDeslizante">
          <AntesDespuesDeslizante
            antes={{ etiqueta: 'Antes', titulo: 'Estructura genérica', contenido: 'Varios div no explican qué región contiene la navegación o el contenido principal.' }}
            despues={{ etiqueta: 'Después', titulo: 'Estructura semántica', contenido: 'nav y main crean regiones reconocibles para navegador y tecnologías de asistencia.' }}
          />
        </Referencia>

        <Referencia nombre="RuedaProgreso">
          <RuedaProgreso porcentaje={72} etiqueta="Dominio de HTML básico" />
        </Referencia>

        <Referencia nombre="InterruptorAnimado">
          <InterruptorAnimado etiqueta="Mostrar ayudas de accesibilidad" textoActivo="Las ayudas están visibles" textoInactivo="Las ayudas están ocultas" />
        </Referencia>

        <Referencia nombre="TarjetaConfeti">
          <TarjetaConfeti titulo="¡Documento validado!" descripcion="El archivo no contiene errores de sintaxis y ya puede pasar a la revisión de accesibilidad." />
        </Referencia>

        <Referencia nombre="BotonMagnetico">
          <BotonMagnetico etiqueta="Validar mi HTML" />
        </Referencia>

        <Referencia nombre="IndicadorEscritura">
          <IndicadorEscritura etiqueta="El tutor está escribiendo…" />
        </Referencia>
      </GrupoCatalogo>

      <GrupoCatalogo
        titulo="Datos animados"
        descripcion="Representaciones compactas de métricas, jerarquías y comparaciones de una lección."
      >
        <Referencia nombre="GraficoBarras">
          <GraficoBarras
            titulo="Elementos usados por tipo"
            datos={[
              { etiqueta: 'Texto', valor: 18 },
              { etiqueta: 'Sección', valor: 9 },
              { etiqueta: 'Enlace', valor: 12 },
              { etiqueta: 'Imagen', valor: 4 },
              { etiqueta: 'Lista', valor: 7 },
            ]}
          />
        </Referencia>

        <Referencia nombre="MapaCalor">
          <MapaCalor
            titulo="Práctica de HTML durante 4 semanas"
            columnas={7}
            celdas={Array.from({ length: 28 }, (_, indice) => ({
              etiqueta: `Día ${indice + 1}`,
              intensidad: ((indice * 7) % 11) / 10,
            }))}
          />
        </Referencia>

        <Referencia nombre="ArbolExpandible">
          <ArbolExpandible
            nodos={[
              {
                id: 'html', etiqueta: 'html', descripcion: 'Raíz del documento', hijos: [
                  { id: 'head', etiqueta: 'head', hijos: [{ id: 'title', etiqueta: 'title', descripcion: 'Título de la pestaña' }, { id: 'meta', etiqueta: 'meta', descripcion: 'Codificación y viewport' }] },
                  { id: 'body', etiqueta: 'body', hijos: [{ id: 'header', etiqueta: 'header' }, { id: 'main', etiqueta: 'main', hijos: [{ id: 'article', etiqueta: 'article' }] }, { id: 'footer', etiqueta: 'footer' }] },
                ],
              },
            ]}
          />
        </Referencia>

        <Referencia nombre="NubeEtiquetas">
          <NubeEtiquetas
            etiquetas={[
              { texto: 'semántica', peso: 10 }, { texto: 'accesibilidad', peso: 9 },
              { texto: 'formularios', peso: 7 }, { texto: 'enlaces', peso: 6 },
              { texto: 'tablas', peso: 5 }, { texto: 'metadatos', peso: 4 },
              { texto: 'multimedia', peso: 3 }, { texto: 'validación', peso: 8 },
            ]}
          />
        </Referencia>

        <Referencia nombre="LineaComparativaAnimada">
          <LineaComparativaAnimada
            titulo="Estructura del tiempo de la lección"
            izquierda={{ etiqueta: 'Práctica', valor: 80 }}
            derecha={{ etiqueta: 'Teoría', valor: 20 }}
          />
        </Referencia>
      </GrupoCatalogo>
      </CategoriaActivaContext.Provider>
    </section>
  )
}
