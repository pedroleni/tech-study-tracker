import { AntesDespuesDeslizante } from '@/components/referencia-contenido/AntesDespuesDeslizante'
import { AparicionEscalonada } from '@/components/referencia-contenido/AparicionEscalonada'
import { ArbolExpandible } from '@/components/referencia-contenido/ArbolExpandible'
import { BotonMagnetico } from '@/components/referencia-contenido/BotonMagnetico'
import { CarruselAutoplay } from '@/components/referencia-contenido/CarruselAutoplay'
import { CarruselCoverflow } from '@/components/referencia-contenido/CarruselCoverflow'
import { CarruselTarjetas } from '@/components/referencia-contenido/CarruselTarjetas'
import { CarruselVertical } from '@/components/referencia-contenido/CarruselVertical'
import { ContadorEnScroll } from '@/components/referencia-contenido/ContadorEnScroll'
import { ContadorRegresivo } from '@/components/referencia-contenido/ContadorRegresivo'
import { CuboGirable } from '@/components/referencia-contenido/CuboGirable'
import { GaleriaMiniaturas } from '@/components/referencia-contenido/GaleriaMiniaturas'
import { GraficoBarras } from '@/components/referencia-contenido/GraficoBarras'
import { IndicadorEscritura } from '@/components/referencia-contenido/IndicadorEscritura'
import { IndicadorScrollSecciones } from '@/components/referencia-contenido/IndicadorScrollSecciones'
import { InterruptorAnimado } from '@/components/referencia-contenido/InterruptorAnimado'
import { LibroPagina } from '@/components/referencia-contenido/LibroPagina'
import { LineaComparativaAnimada } from '@/components/referencia-contenido/LineaComparativaAnimada'
import { MaquinaEscribir } from '@/components/referencia-contenido/MaquinaEscribir'
import { MapaCalor } from '@/components/referencia-contenido/MapaCalor'
import { NubeEtiquetas } from '@/components/referencia-contenido/NubeEtiquetas'
import { ParallaxCapa } from '@/components/referencia-contenido/ParallaxCapa'
import { PilaTarjetas } from '@/components/referencia-contenido/PilaTarjetas'
import { RevelarAlDesplazar } from '@/components/referencia-contenido/RevelarAlDesplazar'
import { RuedaProgreso } from '@/components/referencia-contenido/RuedaProgreso'
import { TarjetaConfeti } from '@/components/referencia-contenido/TarjetaConfeti'
import { TarjetaInclinacion } from '@/components/referencia-contenido/TarjetaInclinacion'
import { TarjetaVolteable } from '@/components/referencia-contenido/TarjetaVolteable'
import { TextoRotativo } from '@/components/referencia-contenido/TextoRotativo'
import { TickerHorizontal } from '@/components/referencia-contenido/TickerHorizontal'

import { GrupoCatalogo } from '@/routes/referencia-contenido/GrupoCatalogo'
import { Referencia } from '@/routes/referencia-contenido/Referencia'

export function GrupoCarruseles() {
  return (
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
  )
}

export function GrupoEfectos3D() {
  return (
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
  )
}

export function GrupoAnimacionesDeScroll() {
  return (
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
  )
}

export function GrupoTextoDinamico() {
  return (
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
  )
}

export function GrupoInteractivos() {
  return (
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
  )
}

export function GrupoDatosAnimados() {
  return (
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
  )
}
