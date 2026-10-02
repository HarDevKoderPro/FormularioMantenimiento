# Contexto del proyecto

## Objetivo
Construir un formulario de mantenimiento que replique, de la mejor forma posible, el formulario actual de recoleccion de datos y permita presentar un reporte final basado en el formato de referencia.

## Forma de trabajo
- Implementar un requisito a la vez.
- No avanzar al siguiente requisito hasta comprobar el actual.
- Antes de modificar codigo, revisar la estructura y el comportamiento existente.
- Mantener los cambios pequenos, claros y verificables.
- Ejecutar las pruebas correspondientes despues de cada requisito.

## Decisiones tecnicas
- La interfaz se construira con HTML, CSS y JavaScript puros.
- HTML, CSS y JavaScript se mantendran en archivos separados.
- La imagen o enlace de referencia definira la direccion visual y funcional del formulario.
- El reporte final se definira cuando se pueda revisar su formato de referencia.

## Estado actual
- Se creo el archivo de contexto del proyecto.
- Se creo la estructura inicial con `index.html`, `css/styles.css`, `js/app.js` y la carpeta `assets`.
- Se agrego el logotipo institucional en `assets/Logotipo.png`.
- Se recibieron capturas de las tres secciones del formulario actual.
- Se implemento la estructura semantica inicial de la cabecera institucional y la seccion 1.
- Se redisenaron la cabecera y la seccion 1 con una interfaz institucional propia, adaptable a pantallas pequenas.
- La primera seccion ahora crea y guarda una sesion de mantenimiento en `localStorage`.
- Los datos de sesion son responsable, fecha y correo destino; el serial y la ubicacion seran datos de cada equipo.
- Se implemento el registro inicial de cada equipo y su matriz de diagnostico de hardware.
- Pendiente: recibir capturas o imagenes del reporte de referencia, ya que el PDF no se puede leer directamente en este entorno.
- Se implementaron las tareas de limpieza y software, junto con las observaciones tecnicas del equipo.
- Pendiente: implementar las evidencias y el guardado del registro individual en la sesion.
