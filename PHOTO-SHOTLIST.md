# Lista de fotos (photo shot list)

Cada foto del sitio es por ahora un marcador de posición (`figure.ph`). Para
reemplazar uno, guarda la imagen en `src/assets/img/<archivo>.jpg` (también
sirve .png, .webp o .avif) con la ruta exacta de la columna **Archivo**. El
componente `Photo.astro` la detecta en el siguiente build, la optimiza y
quita el marcador. La descripción se usa como texto alternativo.

Recomendaciones: mínimo 1600 px de ancho para fotos grandes (cabeceras,
bloques de programas), 800 px para tarjetas y retratos; horizontal salvo los
retratos y la galería (cuadradas). Pide permiso por escrito a las personas
que aparezcan.

Este archivo se genera con `npm run shotlist`. Total: 28 fotos.

| # | Archivo | Página y sección | Descripción (data-photo) | Etiqueta en el marcador | Estado |
|---|---------|------------------|--------------------------|-------------------------|--------|
| 1 | `inicio/hero.jpg` | / (inicio), hero | Familias escuchando una charla en un salón comunitario, vista desde el fondo |  | Pendiente |
| 2 | `inicio/consulta-voluntaria.jpg` | / (inicio), Lo que hacemos | Voluntaria explicando un formulario a una pareja, plano medio | Foto: consulta con voluntaria | Pendiente |
| 3 | `inicio/mesa-registro.jpg` | / (inicio), Cómo funciona | Mesa de registro con guías impresas y una voluntaria recibiendo a una familia | Foto: mesa de registro | Pendiente |
| 4 | `inicio/familia-verde.jpg` | / (inicio), Una fundación familiar | La familia Verde en un evento, retrato grupal informal | Foto: la familia Verde | Pendiente |
| 5 | `mision/charla.jpg` | /mision, cabecera | Salón lleno durante una charla, con el logo de la Fundación en un banner al fondo | Foto: charla en curso | Pendiente |
| 6 | `mision/guia-impresa.jpg` | /mision, Por qué existimos | Detalle de manos sosteniendo la guía impresa de la Fundación | Foto: la guía impresa | Pendiente |
| 7 | `mision/rafael-verde.jpg` | /mision, Quiénes estamos detrás | Retrato de Rafael Verde, fondo neutro | Retrato | Pendiente |
| 8 | `mision/junta-vicepresidencia.jpg` | /mision, Quiénes estamos detrás | Retrato de miembro de la junta |  | Pendiente |
| 9 | `mision/junta-tesoreria.jpg` | /mision, Quiénes estamos detrás | Retrato de miembro de la junta |  | Pendiente |
| 10 | `mision/junta-coordinacion.jpg` | /mision, Quiénes estamos detrás | Retrato de miembro de la junta |  | Pendiente |
| 11 | `programas/orientacion-migratoria.jpg` | /programas, Orientación migratoria | Abogado voluntario frente a una pizarra explicando un diagrama de opciones | Foto: charla de orientación | Pendiente |
| 12 | `programas/navegar-el-sistema.jpg` | /programas, Navegar el sistema | Especialista bancaria conversando con una madre y su hijo en una mesa | Foto: sesión práctica | Pendiente |
| 13 | `programas/conoce-tus-derechos.jpg` | /programas, Conoce tus derechos | Grupo de asistentes levantando la mano para preguntar | Foto: ronda de preguntas | Pendiente |
| 14 | `programas/consultas.jpg` | /programas, Consultas con voluntarios | Fila ordenada de personas esperando su consulta, con voluntarios en mesas al fondo | Foto: consultas al cierre | Pendiente |
| 15 | `eventos/sede-aliada.jpg` | /eventos, Trae un evento a tu comunidad | Salón parroquial preparado con sillas y el banner de la Fundación | Foto: sede aliada | Pendiente |
| 16 | `contacto/mapa.jpg` | /contacto, junto a los datos de contacto | Mapa de Miami con la sede marcada | Mapa | Pendiente |
| 17 | `galeria/evento-1.jpg` | Pie de página, Galería (todas las páginas) | Evento 1 |  | Pendiente |
| 18 | `galeria/evento-2.jpg` | Pie de página, Galería (todas las páginas) | Evento 2 |  | Pendiente |
| 19 | `galeria/evento-3.jpg` | Pie de página, Galería (todas las páginas) | Evento 3 |  | Pendiente |
| 20 | `galeria/evento-4.jpg` | Pie de página, Galería (todas las páginas) | Evento 4 |  | Pendiente |
| 21 | `galeria/evento-5.jpg` | Pie de página, Galería (todas las páginas) | Evento 5 |  | Pendiente |
| 22 | `galeria/evento-6.jpg` | Pie de página, Galería (todas las páginas) | Evento 6 |  | Pendiente |
| 23 | `eventos/2027-01-23-hialeah.jpg` | /eventos, /eventos/2027-01-23-hialeah, tarjetas en / y /programas | Salón comunitario en Hialeah durante la charla | Evento: Cómo obtener tu estatus: opciones reales y primeros pasos | Pendiente |
| 24 | `eventos/2027-02-06-doral.jpg` | /eventos, /eventos/2027-02-06-doral, tarjetas en / y /programas | Especialista invitada explicando en una biblioteca | Evento: Tu primer año en Estados Unidos: banco, escuela, licencia e impuestos | Pendiente |
| 25 | `eventos/2027-02-20-homestead.jpg` | /eventos, /eventos/2027-02-20-homestead, tarjetas en / y /programas | Asistentes en un salón parroquial en Homestead | Evento: Conoce tus derechos: cómo actuar ante una autoridad y cómo evitar fraudes | Pendiente |
| 26 | `eventos/2027-03-13-orlando.jpg` | /eventos, /eventos/2027-03-13-orlando, tarjetas en / y /programas | Abogada voluntaria respondiendo preguntas en Orlando | Evento: Asilo, TPS y otras protecciones: qué son y a quién aplican | Pendiente |
| 27 | `eventos/2027-03-27-kendall.jpg` | /eventos, /eventos/2027-03-27-kendall, tarjetas en / y /programas | Grupo de emprendedores tomando notas | Evento: Emprender en Estados Unidos: permisos, ITIN e impuestos | Pendiente |
| 28 | `eventos/2027-04-10-tampa.jpg` | /eventos, /eventos/2027-04-10-tampa, tarjetas en / y /programas | Familia completa escuchando la charla en Tampa | Evento: Reunificación familiar: peticiones, requisitos y tiempos de espera | Pendiente |

Notas:

- Las fotos de eventos (`eventos/<slug>.jpg`) se usan en la tarjeta, la fila del calendario y la cabecera de la página del evento. Al crear un evento nuevo, su foto aparece aquí automáticamente.
- `contacto/mapa` es un mapa, no una foto: puede ser una captura estática del mapa con la sede marcada, o quedarse como marcador hasta tener dirección.
- Las seis fotos de la galería del pie de página son cuadradas y pequeñas (se muestran a unos 80 px).
