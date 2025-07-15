let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];
let cotizacionesDolar = {};

// Mostrar historial
function mostrarHistorial() {
  const lista = document.getElementById("listaHistorial");
  lista.innerHTML = "";

  if (prestamos.length === 0) {
    lista.innerHTML = "<li>No hay simulaciones previas.</li>";
    return;
  }

  prestamos.forEach((prestamo, index) => {
    const item = document.createElement("li");
    const fecha = prestamo.fecha ? ` | ${prestamo.fecha}` : "";
    item.textContent = `#${index + 1} → Monto: $${prestamo.monto.toFixed(2)}, Cuotas: ${prestamo.cuotas}, Total: $${prestamo.total.toFixed(2)}, Cuota: $${prestamo.cuotaMensual.toFixed(2)}${fecha}`;

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

// Mostrar resultados
function mostrarResultado(resultado) {
  document.getElementById("montoTotal").textContent =
    `Monto total a devolver: $${resultado.total.toFixed(2)}`;
  document.getElementById("cuotaMensual").textContent =
    `Cuota mensual: $${resultado.cuotaMensual.toFixed(2)}`;

  const tipo = document.getElementById("tipoDolar").value;
  const valorDolar = cotizacionesDolar[tipo];

  if (!isNaN(valorDolar)) {
    const totalUSD = resultado.total / valorDolar;
    let montoDolares = document.getElementById("montoDolares");

    if (!montoDolares) {
      montoDolares = document.createElement("p");
      montoDolares.id = "montoDolares";
      document.getElementById("resultado").appendChild(montoDolares);
    }

    montoDolares.textContent = `Monto total en dólares (${tipo.toLowerCase()}): $${totalUSD.toFixed(2)} USD`;
  }
}

// Mostrar errores
function mostrarError(mensaje) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonColor: '#3498db'
  });
}

// Calcular préstamo
function calcularPrestamo(monto, cuotas, tasaAnual) {
  const interesMensual = tasaAnual / 12;
  const cuotaMensual = monto * interesMensual / (1 - Math.pow(1 + interesMensual, -cuotas));
  const total = cuotaMensual * cuotas;
  return { cuotaMensual, total };
}

// Mostrar cotización
function mostrarCotizacion(tipo) {
  const valor = cotizacionesDolar[tipo];
  const cotizacion = document.getElementById("cotizacionDolar");
  if (valor) {
    cotizacion.textContent = `Cotización del ${tipo.toLowerCase()}: $${valor.toFixed(2)}`;
  } else {
    cotizacion.textContent = `Cotización del ${tipo.toLowerCase()}: no disponible`;
  }
}

// Escuchar cambios en el selector
document.getElementById("tipoDolar").addEventListener("change", (e) => {
  mostrarCotizacion(e.target.value);
});

// Inicializar simulador
function iniciarSimulador(tasa) {
  document.getElementById("tasaInteres").textContent = `Tasa de interés anual: ${(tasa * 100).toFixed(2)}%`;
  document.getElementById("monto").focus();

  const formulario = document.getElementById("formularioPrestamo");

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

    const btn = formulario.querySelector("button[type='submit']");
    btn.disabled = true;

    const resultado = calcularPrestamo(monto, cuotas, tasa);
    mostrarResultado(resultado);
    document.getElementById("resultado").scrollIntoView({ behavior: "smooth" });

    const fecha = new Date().toLocaleString();
    prestamos.push({ monto, tasaAnual: tasa * 100, cuotas, ...resultado, fecha });
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    mostrarHistorial();
    formulario.reset();

    btn.disabled = false;
    document.getElementById("monto").focus();
  });

  mostrarHistorial();
}

// Borrar historial
document.getElementById("borrarHistorial").addEventListener("click", () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminará todo el historial.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#aaa",
    confirmButtonText: "Sí, borrar"
  }).then((result) => {
    if (result.isConfirmed) {
      prestamos = [];
      localStorage.removeItem("prestamos");
      mostrarHistorial();
      document.getElementById("montoTotal").textContent = "Monto total a devolver: $0.00";
      document.getElementById("cuotaMensual").textContent = "Cuota mensual: $0.00";
      const montoDolares = document.getElementById("montoDolares");
      if (montoDolares) montoDolares.textContent = "";
    }
  });
});

// Loader
document.getElementById("cargando").style.display = "block";

// API bluelytics 
fetch("https://api.bluelytics.com.ar/v2/latest")
  .then(response => response.json())
  .then(data => {
    cotizacionesDolar["Dolar Oficial"] = data.oficial.value_sell;
    cotizacionesDolar["Dolar Blue"] = data.blue.value_sell;

    const tipoInicial = document.getElementById("tipoDolar").value;
    mostrarCotizacion(tipoInicial);
  })
  .catch(() => {
    document.getElementById("cotizacionDolar").textContent =
      "Error al obtener las cotizaciones del dólar.";
  });

// Configuración desde JSON
fetch("data/config.json")
  .then(response => response.json())
  .then(config => {
    document.getElementById("cargando").style.display = "none";
    const tasa = config.tasaInteresAnual / 100;
    iniciarSimulador(tasa);
  })
  .catch(() => {
    document.getElementById("cargando").style.display = "none";
    mostrarError("No se pudo cargar la configuración. Se usará una tasa por defecto.");
    iniciarSimulador(0.45);
  });
