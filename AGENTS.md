# Contexto del proyecto

## Objetivo
Construir un formulario de mantenimiento que replique, de la mejor forma posible, el formulario actual de recoleccion de datos y permita presentar un reporte final basado en el formato de referencia.

## Forma de trabajo
- Implementar un requisito a la vez.
- No avanzar al siguiente requisito hasta comprobar el actual.
- Antes de modificar codigo, revisar la estructura y el comportamiento existente.
- Mantener los cambios pequenos, claros y verificables.
- Ejecutar las pruebas correspondientes despues de cada requisito.
- No ejecutar `git add` ni `git commit` salvo que se solicite expresamente.
- Despues de cada implementacion, entregar los cambios para el mensaje de commit como una lista de lineas con el formato `- Descripcion breve del cambio`.

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
- Se implementaron las evidencias fotograficas y el guardado del registro individual en la sesion.
- Al guardar un equipo se permite iniciar otro registro independiente o finalizar la sesion.
- Se implemento el panel de sesion con indicadores y listado de equipos registrados.
- Se agrego una conclusion tecnica obligatoria por equipo: Bueno o Malo.
- El panel muestra los totales de equipos, buenos y malos, junto con una tabla compacta de seriales y estados.
- Se corrigieron ajustes de interfaz movil: matriz de hardware, campo de fecha, tabla de equipos y prevencion de zoom involuntario.
- Pendiente: crear los reportes individuales y el reporte consolidado de la sesion.
- Pendiente: evaluar IndexedDB para conservar el contenido de las evidencias fotograficas; por ahora solo se guardan sus metadatos en `localStorage`.
