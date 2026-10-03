const CLAVE_SESION = "mantenimiento.sesionActiva";

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

botonGuardarEquipo.addEventListener("click", () => {
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
    evidencias: evidencias.map((archivo) => ({ nombre: archivo.name, tipo: archivo.type })),
    estadoGeneral: datos.get("conclusion-tecnica"),
    registradoEn: new Date().toISOString()
  };

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

botonPrepararReportes.addEventListener("click", () => {
  alert("El siguiente requisito generara los reportes individuales y el reporte consolidado de esta sesion.");
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
