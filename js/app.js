const CLAVE_SESION = "mantenimiento.sesionActiva";

const formulario = document.querySelector("#formulario-mantenimiento");
const pasoSesion = document.querySelector("#paso-sesion");
const pasoEquipo = document.querySelector("#paso-equipo");
const pasoCierreEquipo = document.querySelector("#paso-cierre-equipo");
const pasoEvidencias = document.querySelector("#paso-evidencias");
const botonVolverSesion = document.querySelector("[data-volver-sesion]");
const botonContinuarChequeo = document.querySelector("[data-continuar-chequeo]");
const botonVolverChequeo = document.querySelector("[data-volver-chequeo]");
const botonContinuarEvidencias = document.querySelector("[data-continuar-evidencias]");
const botonVolverCierre = document.querySelector("[data-volver-cierre]");
const botonGuardarEquipo = document.querySelector("[data-guardar-equipo]");
const entradaCamara = document.querySelector("#camara-evidencia");
const entradaGaleria = document.querySelector("#galeria-evidencias");
const vistaEvidencias = document.querySelector("#vista-evidencias");
const mensajeEvidencias = document.querySelector("#mensaje-evidencias");
const selectorFecha = document.querySelector("#selector-fecha");
const fechaMantenimiento = document.querySelector("#fecha-mantenimiento");
const textoFecha = document.querySelector("#texto-fecha");
let evidencias = [];

selectorFecha.addEventListener("click", () => {
  if (typeof fechaMantenimiento.showPicker === "function") {
    fechaMantenimiento.showPicker();
    return;
  }

  fechaMantenimiento.click();
});

fechaMantenimiento.addEventListener("change", () => {
  textoFecha.textContent = fechaMantenimiento.value ? formatearFecha(fechaMantenimiento.value) : "Seleccione la fecha";
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formulario.reportValidity()) {
    return;
  }

  if (!fechaMantenimiento.value) {
    alert("Seleccione la fecha de mantenimiento antes de crear la sesion.");
    selectorFecha.focus();
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

  if (!observacionesHardware.value.trim() || !observacionesSoftware.value.trim()) {
    alert("Complete las observaciones de hardware y software antes de continuar.");
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
    estadoGeneral: calcularEstadoGeneral(diagnostico),
    registradoEn: new Date().toISOString()
  };

  sesion.equipos.push(equipo);
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  alert(`Equipo ${equipo.serial} guardado en la sesion. Equipos registrados: ${sesion.equipos.length}.`);
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
  const diagnostico = Object.fromEntries(["encendido", "pantalla", "teclado", "touchpad", "cargador"].map((componente) => [componente, datos.get(componente)]));
  document.querySelector("#resumen-serial").textContent = datos.get("serial-equipo").trim();
  document.querySelector("#resumen-ubicacion").textContent = datos.get("ubicacion-equipo");
  document.querySelector("#resumen-estado").textContent = calcularEstadoGeneral(diagnostico);
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
