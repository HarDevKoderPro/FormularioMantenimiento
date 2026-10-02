const CLAVE_SESION = "mantenimiento.sesionActiva";

const formulario = document.querySelector("#formulario-mantenimiento");
const pasoSesion = document.querySelector("#paso-sesion");
const pasoEquipo = document.querySelector("#paso-equipo");
const botonVolverSesion = document.querySelector("[data-volver-sesion]");
const botonContinuarChequeo = document.querySelector("[data-continuar-chequeo]");

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formulario.reportValidity()) {
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

  alert("El chequeo inicial esta completo. El siguiente paso agregara tareas, observaciones y evidencias antes de guardar el equipo.");
});

function mostrarPasoEquipo() {
  pasoSesion.hidden = true;
  pasoEquipo.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#serial-equipo").focus();
}
