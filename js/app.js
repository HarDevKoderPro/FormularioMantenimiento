const CLAVE_SESION = "mantenimiento.sesionActiva";
const NOMBRE_BD_EVIDENCIAS = "mantenimiento.evidencias";
const ALMACEN_EVIDENCIAS = "archivos";

const formulario = document.querySelector("#formulario-mantenimiento");
const pasoSesion = document.querySelector("#paso-sesion");
const pasoEquipo = document.querySelector("#paso-equipo");
const pasoCierreEquipo = document.querySelector("#paso-cierre-equipo");
const pasoEvidencias = document.querySelector("#paso-evidencias");
const pasoEquipoGuardado = document.querySelector("#paso-equipo-guardado");
const panelSesion = document.querySelector("#panel-sesion");
const botonVolverSesion = document.querySelector("[data-volver-sesion]");
const botonContinuarChequeo = document.querySelector("[data-continuar-chequeo]");
const botonVolverChequeo = document.querySelector("[data-volver-chequeo]");
const botonContinuarEvidencias = document.querySelector("[data-continuar-evidencias]");
const botonVolverCierre = document.querySelector("[data-volver-cierre]");
const botonGuardarEquipo = document.querySelector("[data-guardar-equipo]");
const botonNuevoEquipo = document.querySelector("[data-nuevo-equipo]");
const botonFinalizarSesion = document.querySelector("[data-finalizar-sesion]");
const botonRegistrarDesdePanel = document.querySelector("[data-registrar-desde-panel]");
const botonPrepararReportes = document.querySelector("[data-preparar-reportes]");
const entradaCamara = document.querySelector("#camara-evidencia");
const entradaGaleria = document.querySelector("#galeria-evidencias");
const vistaEvidencias = document.querySelector("#vista-evidencias");
const mensajeEvidencias = document.querySelector("#mensaje-evidencias");
const fechaMantenimiento = document.querySelector("#fecha-mantenimiento");
const textoFecha = document.querySelector("#texto-fecha");
const selectorFecha = document.querySelector("#selector-fecha");
const contadorEquipos = document.querySelector("#contador-equipos");
const mensajeEquipoGuardado = document.querySelector("#mensaje-equipo-guardado");
let evidencias = [];

fechaMantenimiento.addEventListener("change", () => {
  textoFecha.textContent = fechaMantenimiento.value ? formatearFecha(fechaMantenimiento.value) : "Seleccione la fecha";
});

selectorFecha.addEventListener("click", () => {
  if (typeof fechaMantenimiento.showPicker === "function") {
    fechaMantenimiento.showPicker();
    return;
  }

  fechaMantenimiento.focus();
  fechaMantenimiento.click();
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formulario.reportValidity()) {
    return;
  }

  if (!fechaMantenimiento.value) {
    alert("Seleccione la fecha de mantenimiento antes de crear la sesion.");
    fechaMantenimiento.focus();
    return;
  }

  const datos = new FormData(formulario);
  const sesion = {
    id: crypto.randomUUID(),
    responsable: datos.get("responsable").trim(),
    correoDestino: datos.get("correo").trim(),
    fechaMantenimiento: datos.get("fecha-mantenimiento"),
    creadaEn: new Date().toISOString(),
    estado: "activa",
    equipos: []
  };

  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  actualizarContadorEquipos(sesion);
  mostrarPasoEquipo();
});

botonVolverSesion.addEventListener("click", () => {
  pasoEquipo.hidden = true;
  pasoSesion.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

botonContinuarChequeo.addEventListener("click", () => {
  const serial = document.querySelector("#serial-equipo");
  const ubicacion = document.querySelector("#ubicacion-equipo");
  const componentes = ["encendido", "pantalla", "teclado", "touchpad", "cargador"];
  const faltaComponente = componentes.some((componente) => !formulario.querySelector(`input[name="${componente}"]:checked`));

  if (!serial.value.trim() || !ubicacion.value || faltaComponente) {
    alert("Complete el serial, la ubicacion y el estado de todos los componentes antes de continuar.");
    return;
  }

  pasoEquipo.hidden = true;
  pasoCierreEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

botonVolverChequeo.addEventListener("click", () => {
  pasoCierreEquipo.hidden = true;
  pasoEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

botonContinuarEvidencias.addEventListener("click", () => {
  const observacionesHardware = document.querySelector("#observaciones-hardware");
  const observacionesSoftware = document.querySelector("#observaciones-software");
  const conclusionTecnica = formulario.querySelector('input[name="conclusion-tecnica"]:checked');

  if (!observacionesHardware.value.trim() || !observacionesSoftware.value.trim() || !conclusionTecnica) {
    alert("Complete las observaciones y seleccione la conclusion tecnica antes de continuar.");
    return;
  }

  actualizarResumenEquipo();
  pasoCierreEquipo.hidden = true;
  pasoEvidencias.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

botonVolverCierre.addEventListener("click", () => {
  pasoEvidencias.hidden = true;
  pasoCierreEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

entradaCamara.addEventListener("change", () => agregarEvidencias(entradaCamara));
entradaGaleria.addEventListener("change", () => agregarEvidencias(entradaGaleria));

vistaEvidencias.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-eliminar-evidencia]");
  if (!boton) return;

  evidencias.splice(Number(boton.dataset.eliminarEvidencia), 1);
  renderizarEvidencias();
});

botonGuardarEquipo.addEventListener("click", async () => {
  const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
  if (!sesion) {
    alert("No se encontro una sesion activa. Cree una nueva sesion antes de guardar el equipo.");
    return;
  }

  const datos = new FormData(formulario);
  const diagnostico = Object.fromEntries(["encendido", "pantalla", "teclado", "touchpad", "cargador"].map((componente) => [componente, datos.get(componente)]));
  const equipo = {
    id: crypto.randomUUID(),
    serial: datos.get("serial-equipo").trim(),
    ubicacion: datos.get("ubicacion-equipo"),
    diagnostico,
    limpieza: datos.getAll("limpieza"),
    software: datos.getAll("software"),
    observacionesHardware: datos.get("observaciones-hardware").trim(),
    observacionesSoftware: datos.get("observaciones-software").trim(),
    evidencias: evidencias.map((archivo) => ({ id: crypto.randomUUID(), nombre: archivo.name, tipo: archivo.type })),
    estadoGeneral: datos.get("conclusion-tecnica"),
    registradoEn: new Date().toISOString()
  };

  await guardarEvidencias(equipo.evidencias, evidencias);
  sesion.equipos.push(equipo);
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  actualizarContadorEquipos(sesion);
  mensajeEquipoGuardado.textContent = `El equipo ${equipo.serial} fue registrado correctamente. La sesion tiene ${sesion.equipos.length} equipo(s) gestionado(s).`;
  pasoEvidencias.hidden = true;
  pasoEquipoGuardado.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

botonNuevoEquipo.addEventListener("click", () => {
  limpiarFormularioEquipo();
  pasoEquipoGuardado.hidden = true;
  pasoEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#serial-equipo").focus();
});

botonFinalizarSesion.addEventListener("click", () => {
  pasoEquipoGuardado.hidden = true;
  panelSesion.hidden = false;
  renderizarPanelSesion();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

botonRegistrarDesdePanel.addEventListener("click", () => {
  limpiarFormularioEquipo();
  panelSesion.hidden = true;
  pasoEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#serial-equipo").focus();
});

botonPrepararReportes.addEventListener("click", async () => {
  const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
  if (!sesion || !sesion.equipos.length) {
    alert("Registre al menos un equipo antes de generar los reportes.");
    return;
  }

  const ventanaReporte = window.open("", "_blank");
  if (!ventanaReporte) {
    alert("El navegador bloqueo la ventana del reporte. Permita las ventanas emergentes e intente nuevamente.");
    return;
  }

  const evidenciasPorEquipo = await obtenerEvidenciasSesion(sesion);
  ventanaReporte.document.write(crearReportes(sesion, evidenciasPorEquipo));
  ventanaReporte.document.close();
});

function mostrarPasoEquipo() {
  pasoSesion.hidden = true;
  pasoEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#serial-equipo").focus();
}

function calcularEstadoGeneral(diagnostico) {
  const estados = Object.values(diagnostico);
  if (estados.includes("Malo")) return "Critico";
  if (estados.includes("Regular")) return "Requiere seguimiento";
  return "Bueno";
}

function actualizarResumenEquipo() {
  const datos = new FormData(formulario);
  document.querySelector("#resumen-serial").textContent = datos.get("serial-equipo").trim();
  document.querySelector("#resumen-ubicacion").textContent = datos.get("ubicacion-equipo");
}

function renderizarEvidencias() {
  mensajeEvidencias.textContent = evidencias.length ? `${evidencias.length} fotografia(s) seleccionada(s).` : "Aun no ha seleccionado fotografias.";
  vistaEvidencias.innerHTML = "";
  evidencias.forEach((archivo, indice) => {
    const elemento = document.createElement("article");
    elemento.className = "evidencia-miniatura";
    const imagen = document.createElement("img");
    imagen.src = URL.createObjectURL(archivo);
    imagen.alt = `Evidencia ${indice + 1}: ${archivo.name}`;
    const boton = document.createElement("button");
    boton.type = "button";
    boton.dataset.eliminarEvidencia = indice;
    boton.setAttribute("aria-label", `Eliminar evidencia ${indice + 1}`);
    boton.textContent = "×";
    elemento.append(imagen, boton);
    vistaEvidencias.append(elemento);
  });
}

function agregarEvidencias(entrada) {
  const archivosValidos = [...entrada.files].filter((archivo) => archivo.type.startsWith("image/"));
  evidencias = [...evidencias, ...archivosValidos];
  entrada.value = "";
  renderizarEvidencias();
}

function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function actualizarContadorEquipos(sesion) {
  const total = sesion.equipos.length;
  contadorEquipos.textContent = `${total} equipo${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}`;
}

function limpiarFormularioEquipo() {
  ["serial-equipo", "ubicacion-equipo", "observaciones-hardware", "observaciones-software"].forEach((id) => {
    document.querySelector(`#${id}`).value = "";
  });
  formulario.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((entrada) => {
    entrada.checked = false;
  });
  evidencias = [];
  renderizarEvidencias();
}

function renderizarPanelSesion() {
  const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
  if (!sesion) return;

  const equipos = sesion.equipos;
  const buenos = equipos.filter((equipo) => equipo.estadoGeneral === "Bueno").length;
  const malos = equipos.filter((equipo) => equipo.estadoGeneral === "Malo").length;
  document.querySelector("#metrica-total").textContent = equipos.length;
  document.querySelector("#metrica-buenos").textContent = buenos;
  document.querySelector("#metrica-malos").textContent = malos;
  document.querySelector("#descripcion-panel-sesion").textContent = `${sesion.responsable} · ${formatearFecha(sesion.fechaMantenimiento)} · ${sesion.correoDestino}`;
  const contenedor = document.querySelector("#equipos-sesion");
  contenedor.innerHTML = "";
  equipos.forEach((equipo, indice) => {
    const fila = document.createElement("article");
    const claseEstado = equipo.estadoGeneral === "Bueno" ? "bueno" : "malo";
    fila.className = "fila-equipo-sesion";
    fila.innerHTML = `<span class="numero-equipo">${indice + 1}</span><strong>${equipo.serial}</strong><span class="estado-equipo ${claseEstado}">${equipo.estadoGeneral}</span>`;
    contenedor.append(fila);
  });
}

function crearReportes(sesion, evidenciasPorEquipo) {
  const equipos = sesion.equipos.map((equipo, indice) => {
    const diagnostico = Object.entries(equipo.diagnostico).map(([componente, estado]) => `
      <tr><th scope="row">${escaparHtml(nombreComponente(componente))}</th><td>${escaparHtml(estado)}</td></tr>`).join("");
    const evidencias = evidenciasPorEquipo[equipo.id] || [];
    const registroFotografico = evidencias.length
      ? `<div class="galeria-evidencias">${evidencias.map((evidencia) => `<figure><img src="${evidencia.url}" alt="Evidencia fotografica del mantenimiento"></figure>`).join("")}</div>`
      : "<p class=\"sin-evidencias\">No se adjuntaron evidencias fotograficas.</p>";

    return `
      <article class="acta${indice ? " salto-pagina" : ""}">
        <header class="cabecera-reporte">
          <div class="marca-institucional-reporte"><img src="assets/Logotipo.png" alt="Institucion Educativa Concejo Municipal El Porvenir"></div>
          <div class="estado-reporte"><span>Registro de mantenimiento</span><strong>Acta individual</strong></div>
        </header>

        <h2>Acta de mantenimiento individual</h2>

        <section>
          <h3>1. Informacion general</h3>
          <dl class="datos-generales">
            <div><dt>Fecha de mantenimiento</dt><dd>${escaparHtml(formatearFecha(sesion.fechaMantenimiento))}</dd></div>
            <div><dt>Tecnico responsable</dt><dd>${escaparHtml(sesion.responsable)}</dd></div>
            <div><dt>Identificacion del equipo</dt><dd>${escaparHtml(equipo.serial)}</dd></div>
            <div><dt>Ubicacion</dt><dd>${escaparHtml(equipo.ubicacion)}</dd></div>
            <div><dt>Conclusion tecnica</dt><dd class="estado ${equipo.estadoGeneral === "Bueno" ? "bueno" : "malo"}">${escaparHtml(equipo.estadoGeneral)}</dd></div>
          </dl>
        </section>

        <section>
          <h3>2. Diagnostico y tareas realizadas</h3>
          <h4>Diagnostico de hardware</h4>
          <table><thead><tr><th>Componente</th><th>Estado</th></tr></thead><tbody>${diagnostico}</tbody></table>
          <div class="dos-columnas">
            <div><h4>Tareas de limpieza</h4>${crearListaReporte(equipo.limpieza, "No se registraron tareas de limpieza.")}</div>
            <div><h4>Tareas de software</h4>${crearListaReporte(equipo.software, "No se registraron tareas de software.")}</div>
          </div>
          <div class="observacion"><h4>Detalle de hardware / observaciones</h4><p>${escaparHtml(equipo.observacionesHardware)}</p></div>
          <div class="observacion"><h4>Detalle de software / observaciones</h4><p>${escaparHtml(equipo.observacionesSoftware)}</p></div>
        </section>

        <section>
          <h3>3. Registro fotografico</h3>
          <p class="nota-evidencias">Las fotografias seleccionadas durante el registro se identifican a continuacion:</p>
          ${registroFotografico}
        </section>
      </article>`;
  }).join("");

  const totalBuenos = sesion.equipos.filter((equipo) => equipo.estadoGeneral === "Bueno").length;
  const totalMalos = sesion.equipos.filter((equipo) => equipo.estadoGeneral === "Malo").length;
  const consolidado = `
    <article class="acta consolidado salto-pagina">
      <header class="cabecera-reporte">
        <div class="marca-institucional-reporte"><img src="assets/Logotipo.png" alt="Institucion Educativa Concejo Municipal El Porvenir"></div>
        <div class="estado-reporte"><span>Registro de mantenimiento</span><strong>Reporte consolidado</strong></div>
      </header>
      <h2>Reporte consolidado de la sesion</h2>
      <section>
        <h3>Informacion de la jornada</h3>
        <dl class="datos-generales"><div><dt>Fecha de mantenimiento</dt><dd>${escaparHtml(formatearFecha(sesion.fechaMantenimiento))}</dd></div><div><dt>Tecnico responsable</dt><dd>${escaparHtml(sesion.responsable)}</dd></div><div><dt>Correo de envio</dt><dd>${escaparHtml(sesion.correoDestino)}</dd></div><div><dt>Total de equipos</dt><dd>${sesion.equipos.length}</dd></div></dl>
      </section>
      <section>
        <h3>Resultado general</h3>
        <div class="metricas-reporte"><div><strong>${sesion.equipos.length}</strong><span>Equipos registrados</span></div><div class="bueno"><strong>${totalBuenos}</strong><span>Equipos buenos</span></div><div class="malo"><strong>${totalMalos}</strong><span>Equipos malos</span></div></div>
        <table><thead><tr><th>#</th><th>Identificacion del equipo</th><th>Ubicacion</th><th>Conclusion</th></tr></thead><tbody>${sesion.equipos.map((equipo, indice) => `<tr><td>${indice + 1}</td><th scope="row">${escaparHtml(equipo.serial)}</th><td>${escaparHtml(equipo.ubicacion)}</td><td class="estado ${equipo.estadoGeneral === "Bueno" ? "bueno" : "malo"}">${escaparHtml(equipo.estadoGeneral)}</td></tr>`).join("")}</tbody></table>
      </section>
    </article>`;

  return `<!doctype html><html lang="es"><head><base href="${window.location.href}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reportes de mantenimiento</title><style>
    @page { size: letter; margin: 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #15131b; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; }
    .acta { max-width: 184mm; margin: 0 auto; }
    .cabecera-reporte { display: flex; align-items: center; justify-content: space-between; gap: 8mm; margin-bottom: 9mm; } .marca-institucional-reporte { width: 118mm; overflow: hidden; border: 1px solid #e8e6ee; border-radius: 4mm; background: #fff; box-shadow: 0 3mm 8mm rgb(44 35 88 / 7%); } .marca-institucional-reporte img { display: block; width: 100%; height: auto; } .estado-reporte { display: grid; gap: 1.5mm; flex: 0 0 auto; color: #686779; font-size: 10pt; text-align: right; } .estado-reporte strong { color: #392587; font-size: 11pt; }
    h2, h3, h4, p { margin-top: 0; } h2 { margin: 11mm 0 8mm; font-size: 16pt; text-align: center; text-transform: uppercase; } h3 { margin: 8mm 0 4mm; padding-bottom: 2mm; border-bottom: 1px solid #b9b4d1; font-size: 13pt; text-transform: uppercase; } h4 { margin-bottom: 3mm; color: #292244; font-size: 10.5pt; }
    .datos-generales { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm 10mm; margin: 0; } .datos-generales div { display: grid; grid-template-columns: 47mm 1fr; min-height: 8mm; border-bottom: 1px solid #dddbe5; } dt { font-weight: 700; } dd { margin: 0; } .estado { font-weight: 700; } .estado.bueno { color: #21643f; } .estado.malo { color: #a42f42; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6mm; } th, td { padding: 2.5mm 3mm; border: 1px solid #d5d2df; text-align: left; } thead { background: #eeecf7; } tbody th { width: 62%; background: #faf9fc; } .dos-columnas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7mm; } ul { margin: 0; padding-left: 5mm; } li { margin-bottom: 1.5mm; } .observacion { margin-top: 5mm; padding: 3.5mm 4mm; border-left: 3px solid #7065ad; background: #f8f7fb; } .observacion h4 { margin-bottom: 1mm; } .observacion p { margin: 0; white-space: pre-wrap; } .nota-evidencias { margin-bottom: 3mm; } .galeria-evidencias { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; } figure { margin: 0; break-inside: avoid; } figure img { display: block; width: 100%; height: 55mm; border: 1px solid #d5d2df; object-fit: cover; } .sin-evidencias { color: #595468; font-style: italic; } .metricas-reporte { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-bottom: 7mm; } .metricas-reporte div { display: grid; gap: 1mm; padding: 4mm; border: 1px solid #d5d2df; text-align: center; } .metricas-reporte strong { font-size: 19pt; } .metricas-reporte span { font-size: 9pt; font-weight: 700; } .metricas-reporte .bueno { color: #21643f; background: #eff9f2; } .metricas-reporte .malo { color: #a42f42; background: #fff2f4; }
    .accion-compartir-reporte { display: none; }
    @media print { .salto-pagina { break-before: page; } .accion-compartir-reporte { display: none !important; } } @media (max-width: 600px) { body { padding-bottom: 76px; } .cabecera-reporte { gap: 5mm; } .marca-institucional-reporte { width: 75%; } .estado-reporte { font-size: 8pt; } .datos-generales, .dos-columnas { grid-template-columns: 1fr; } .accion-compartir-reporte { display: block; position: fixed; z-index: 10; right: 12px; bottom: 12px; left: 12px; width: auto; padding: 14px; border: 0; border-radius: 10px; background: #392587; box-shadow: 0 4px 14px rgb(30 23 68 / 28%); color: #fff; font: 700 15px Arial, sans-serif; } }
  </style></head><body>${equipos}${consolidado}<button class="accion-compartir-reporte" type="button" onclick="window.print()">Compartir o guardar como PDF</button></body></html>`;
}

function abrirBaseEvidencias() {
  return new Promise((resolver, rechazar) => {
    const solicitud = indexedDB.open(NOMBRE_BD_EVIDENCIAS, 1);
    solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(ALMACEN_EVIDENCIAS, { keyPath: "id" });
    solicitud.onsuccess = () => resolver(solicitud.result);
    solicitud.onerror = () => rechazar(solicitud.error);
  });
}

async function guardarEvidencias(referencias, archivos) {
  if (!archivos.length) return;
  const base = await abrirBaseEvidencias();
  const transaccion = base.transaction(ALMACEN_EVIDENCIAS, "readwrite");
  referencias.forEach((referencia, indice) => transaccion.objectStore(ALMACEN_EVIDENCIAS).put({ ...referencia, archivo: archivos[indice] }));
  await completarTransaccion(transaccion);
  base.close();
}

async function obtenerEvidenciasSesion(sesion) {
  const referencias = sesion.equipos.flatMap((equipo) => equipo.evidencias.filter((evidencia) => evidencia.id).map((evidencia) => ({ ...evidencia, equipoId: equipo.id })));
  if (!referencias.length) return {};
  const base = await abrirBaseEvidencias();
  const transaccion = base.transaction(ALMACEN_EVIDENCIAS, "readonly");
  const almacen = transaccion.objectStore(ALMACEN_EVIDENCIAS);
  const archivos = await Promise.all(referencias.map(async (referencia) => {
    const evidencia = await solicitarIndexedDb(almacen.get(referencia.id));
    return evidencia ? { ...referencia, url: URL.createObjectURL(evidencia.archivo) } : null;
  }));
  base.close();
  return archivos.filter(Boolean).reduce((resultado, evidencia) => {
    (resultado[evidencia.equipoId] ||= []).push(evidencia);
    return resultado;
  }, {});
}

function completarTransaccion(transaccion) {
  return new Promise((resolver, rechazar) => { transaccion.oncomplete = resolver; transaccion.onerror = () => rechazar(transaccion.error); });
}

function solicitarIndexedDb(solicitud) {
  return new Promise((resolver, rechazar) => { solicitud.onsuccess = () => resolver(solicitud.result); solicitud.onerror = () => rechazar(solicitud.error); });
}

function crearListaReporte(elementos, mensajeVacio) {
  const contenido = elementos.length ? elementos.map((elemento) => `<li>${escaparHtml(elemento)}</li>`).join("") : `<li>${mensajeVacio}</li>`;
  return `<ul>${contenido}</ul>`;
}

function nombreComponente(componente) {
  return { encendido: "Encendido", pantalla: "Pantalla", teclado: "Teclado", touchpad: "Touchpad", cargador: "Cargador" }[componente];
}

function escaparHtml(valor) {
  const entidad = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(valor).replace(/[&<>"']/g, (caracter) => entidad[caracter]);
}
