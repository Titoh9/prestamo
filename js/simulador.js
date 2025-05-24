// Declaración de variables y constantes
const tasaInteresAnual = 0.45;
let prestamos = [];

// Función para solicitar datos
function solicitarDatos() {
  let nombre = prompt("Ingrese su nombre:");
  let monto = parseFloat(prompt("Ingrese el monto del préstamo:"));
  let cuotas = parseInt(prompt("Ingrese la cantidad de cuotas:"));

  return { nombre, monto, cuotas };
}

// Función para procesar datos
function calcularPrestamo(monto, cuotas) {
  let interesMensual = tasaInteresAnual / 12;
  let cuotaMensual = monto * interesMensual / (1 - Math.pow(1 + interesMensual, -cuotas));
  let total = cuotaMensual * cuotas;
  return { cuotaMensual, total };
}

// Función para mostrar resultados
function mostrarResultado(nombre, monto, cuotas, resultado) {
  alert(
    `Resumen para ${nombre}\n` +
    `Monto solicitado: $${monto.toFixed(2)}\n` +
    `Cuotas: ${cuotas}\n` +
    `Cuota mensual: $${resultado.cuotaMensual.toFixed(2)}\n` +
    `Total a pagar: $${resultado.total.toFixed(2)}`
  );
  console.log(`Simulación para ${nombre}:`, resultado);
}

// Función principal
function simularPrestamo() {
  let continuar = true;

  while (continuar) {
    let datos = solicitarDatos();
    let resultado = calcularPrestamo(datos.monto, datos.cuotas);
    mostrarResultado(datos.nombre, datos.monto, datos.cuotas, resultado);

    prestamos.push({ ...datos, ...resultado });

    continuar = confirm("¿Desea simular otro préstamo?");
  }

  console.log("Historial de préstamos simulados:", prestamos);
}

// Llamada inicial
simularPrestamo();
