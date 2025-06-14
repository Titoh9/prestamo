// Declaración de variables y constantes
const tasaInteresAnual = 0.45;
let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

// Función para solicitar datos
function solicitarDatos() {
  let nombre = prompt("Ingrese su nombre:");
  if (nombre === null) return null;
  let monto = parseFloat(prompt("Ingrese el monto del préstamo:"));
  if (isNaN(monto) || monto <= 0) {
    alert("Monto inválido.");
    return null;
  }
  let cuotas = parseInt(prompt("Ingrese la cantidad de cuotas:"));
  if (isNaN(cuotas) || cuotas <= 0) {
    alert("Cantidad de cuotas inválida.");
    return null;
  }
  return { nombre, monto, cuotas };
}

// Mostrar historial de préstamos en el DOM
function mostrarHistorial() {
  const lista = document.getElementById("listaHistorial");
  lista.innerHTML = "";

  if (prestamos.length === 0) {
    lista.innerHTML = "<li>No hay simulaciones previas.</li>";
    return;
  }

  prestamos.forEach((prestamo, index) => {
    const item = document.createElement("li");
    // Agrega fecha y hora de simulación
    const fecha = prestamo.fecha ? ` | ${prestamo.fecha}` : "";
    item.textContent = `#${index + 1} → Monto: $${prestamo.monto.toFixed(2)}, Cuotas: ${prestamo.cuotas}, Total: $${prestamo.total.toFixed(2)}, Cuota: $${prestamo.cuotaMensual.toFixed(2)}${fecha}`;
    // Botón para eliminar simulación individual
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.style.marginLeft = "10px";
    btnEliminar.onclick = () => {
      prestamos.splice(index, 1);
      localStorage.setItem("prestamos", JSON.stringify(prestamos));
      mostrarHistorial();
    };
    item.appendChild(btnEliminar);
    lista.appendChild(item);
  });
}

// Mostrar resultados actuales
function mostrarResultado(resultado) {
  document.getElementById("montoTotal").textContent =
    `Monto total a devolver: $${resultado.total.toFixed(2)}`;
  document.getElementById("cuotaMensual").textContent =
    `Cuota mensual: $${resultado.cuotaMensual.toFixed(2)}`;
}

// Mostrar mensajes de error
function mostrarError(mensaje) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = mensaje;
  setTimeout(() => errorDiv.textContent = "", 3500);
}

// Calcular préstamo
function calcularPrestamo(monto, cuotas, tasaAnual) {
  const interesMensual = tasaAnual / 12;
  const cuotaMensual = monto * interesMensual / (1 - Math.pow(1 + interesMensual, -cuotas));
  const total = cuotaMensual * cuotas;
  return { cuotaMensual, total };
}

// Inicializar simulador después de obtener la tasa desde JSON
function iniciarSimulador(tasa) {
  document.getElementById("tasaInteres").textContent = `Tasa de interés anual: ${(tasa * 100).toFixed(2)}%`;

  const formulario = document.getElementById("formularioPrestamo");
  // Mejor UX: enfoca el primer campo al cargar
  document.getElementById("monto").focus();

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const monto = parseFloat(document.getElementById("monto").value);
    const cuotas = parseInt(document.getElementById("cuotas").value);

    if (isNaN(monto) || monto <= 0) {
      mostrarError("Ingrese un monto válido mayor a 0.");
      document.getElementById("monto").focus();
      return;
    }
    if (isNaN(cuotas) || cuotas <= 0) {
      mostrarError("Ingrese una cantidad de cuotas válida mayor a 0.");
      document.getElementById("cuotas").focus();
      return;
    }

    // Deshabilita el botón mientras procesa
    const btn = formulario.querySelector("button[type='submit']");
    btn.disabled = true;

    const resultado = calcularPrestamo(monto, cuotas, tasa);
    mostrarResultado(resultado);
    document.getElementById("resultado").scrollIntoView({ behavior: "smooth" });

    // Guarda fecha y hora de simulación
    const fecha = new Date().toLocaleString();
    prestamos.push({ monto, tasaAnual: tasa * 100, cuotas, ...resultado, fecha });
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    mostrarHistorial();
    formulario.reset(); // Limpiar formulario

    // Reactiva el botón después de procesar
    btn.disabled = false;
    document.getElementById("monto").focus();
  });

  mostrarHistorial();
}

// Borrar historial
document.getElementById("borrarHistorial").addEventListener("click", () => {
  prestamos = [];
  localStorage.removeItem("prestamos");
  mostrarHistorial();
  document.getElementById("montoTotal").textContent = "Monto total a devolver: $0.00";
  document.getElementById("cuotaMensual").textContent = "Cuota mensual: $0.00";
});

// Mostrar loader al iniciar la carga
document.getElementById("cargando").style.display = "block";

fetch("data/config.json")
  .then(response => response.json())
  .then(config => {
    document.getElementById("cargando").style.display = "none"; 
    const tasa = config.tasaInteresAnual / 100;
    iniciarSimulador(tasa);
  })
  .catch(error => {
    document.getElementById("cargando").style.display = "none"; 
    mostrarError("No se pudo cargar la configuración. Se usará una tasa por defecto.");
    iniciarSimulador(0.45);
  });