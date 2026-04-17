// Script para generar 4 distribuciones balanceadas de equipos
// Cada equipo debe tener un jugador de cada bombo y valores totales similares

const bombos = [
  { nombre: "pivots", jugadores: [
    { nombre: "Barbosa", valor: 2 },
    { nombre: "Tuto", valor: 1 },
    { nombre: "Lucho", valor: 1 },
    { nombre: "Sergio Ceballos", valor: 2 }
  ]},
  { nombre: "aleros", jugadores: [
    { nombre: "Sergio Romero", valor: 1 },
    { nombre: "Juancho H", valor: 2 },
    { nombre: "Daniel Cañón", valor: 1 },
    { nombre: "Chema", valor: 2 }
  ]},
  { nombre: "veteranos", jugadores: [
    { nombre: "Carlos Alberto", valor: 1 },
    { nombre: "Omar", valor: 2 },
    { nombre: "Joaco", valor: 1 },
    { nombre: "Hernan", valor: 1 }
  ]},
  { nombre: "mujeres jovenes", jugadores: [
    { nombre: "Camila", valor: 1 },
    { nombre: "Sara", valor: 1 },
    { nombre: "Natalia", valor: 2 },
    { nombre: "Yeimi", valor: 1 }
  ]},
  { nombre: "veteranas", jugadores: [
    { nombre: "Alexa", valor: 2 },
    { nombre: "Adis", valor: 2 },
    { nombre: "Cora", valor: 1 },
    { nombre: "Carlina", valor: 1 }
  ]},
  { nombre: "+40", jugadores: [
    { nombre: "Arturo", valor: 2 },
    { nombre: "John", valor: 1 },
    { nombre: "Wilson", valor: 1 },
    { nombre: "Carlos Gamboa", valor: 3 }
  ]},
  { nombre: "jovenes <20", jugadores: [
    { nombre: "Isaac", valor: 1 },
    { nombre: "Tomás", valor: 3 },
    { nombre: "Simón Castillo", valor: 3 },
    { nombre: "Pepe", valor: 2 }
  ]}
];

// Suma total de valores
const sumaTotal = bombos.reduce((sum, b) => sum + b.jugadores.reduce((s, j) => s + j.valor, 0), 0);
const promedioEquipo = sumaTotal / 4;
console.log(`Suma total de valores: ${sumaTotal}`);
console.log(`Promedio ideal por equipo: ${promedioEquipo}`);
console.log("");

// Generar todas las permutaciones de un array
function permutaciones(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutaciones(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

// Generar todas las posibles asignaciones para cada bombo (permutaciones de 4 jugadores a 4 equipos)
// Una asignación es: jugador[0] -> Equipo A, jugador[1] -> Equipo B, etc.
function generarDistribucionesBalanceadas() {
  const permsPerBombo = bombos.map(b => permutaciones([0, 1, 2, 3]));
  
  // Buscar combinaciones donde los equipos estén balanceados
  const distribuciones = [];
  const maxDesbalance = 2; // Diferencia máxima aceptable entre el equipo más fuerte y el más débil
  
  // Para no explorar todas las combinaciones (24^7 = ~4.5 billones), usamos un enfoque más inteligente
  // Fijamos el primer bombo y buscamos combinaciones para los demás
  
  const allPerms = permutaciones([0, 1, 2, 3]); // 24 permutaciones
  
  function buscar(bomboIdx, equipoValores, asignacion) {
    if (bomboIdx === bombos.length) {
      const maxVal = Math.max(...equipoValores);
      const minVal = Math.min(...equipoValores);
      if (maxVal - minVal <= maxDesbalance) {
        distribuciones.push({
          asignacion: asignacion.map(a => [...a]),
          valores: [...equipoValores],
          desbalance: maxVal - minVal
        });
      }
      return;
    }
    
    const bombo = bombos[bomboIdx];
    for (const perm of allPerms) {
      const nuevosValores = [...equipoValores];
      for (let equipo = 0; equipo < 4; equipo++) {
        nuevosValores[equipo] += bombo.jugadores[perm[equipo]].valor;
      }
      
      // Poda: si ya estamos muy desbalanceados, no seguir
      const bombosPendientes = bombos.length - bomboIdx - 1;
      const maxPosibleAdd = bombosPendientes * 3; // máximo valor posible por equipo en bombos restantes
      const maxActual = Math.max(...nuevosValores);
      const minActual = Math.min(...nuevosValores);
      if (maxActual - minActual > maxDesbalance + maxPosibleAdd) continue;
      
      asignacion.push(perm);
      buscar(bomboIdx + 1, nuevosValores, asignacion);
      asignacion.pop();
    }
  }
  
  buscar(0, [0, 0, 0, 0], []);
  return distribuciones;
}

console.log("Buscando distribuciones balanceadas...");
const todas = generarDistribucionesBalanceadas();
console.log(`Encontradas ${todas.length} distribuciones con desbalance <= 2`);

// Ordenar por menor desbalance
todas.sort((a, b) => a.desbalance - b.desbalance);

// Seleccionar 4 distribuciones diversas
function seleccionarDiversas(distribuciones, cantidad) {
  if (distribuciones.length <= cantidad) return distribuciones;
  
  // Filtrar las más balanceadas
  const mejorDesbalance = distribuciones[0].desbalance;
  const mejores = distribuciones.filter(d => d.desbalance <= mejorDesbalance + 1);
  
  console.log(`Distribuciones con desbalance óptimo (${mejorDesbalance} o ${mejorDesbalance + 1}): ${mejores.length}`);
  
  // Seleccionar distribuciones que sean lo más diferentes posibles entre sí
  const seleccionadas = [mejores[0]];
  
  function diferencia(d1, d2) {
    let diff = 0;
    for (let b = 0; b < bombos.length; b++) {
      for (let e = 0; e < 4; e++) {
        if (d1.asignacion[b][e] !== d2.asignacion[b][e]) diff++;
      }
    }
    return diff;
  }
  
  while (seleccionadas.length < cantidad && mejores.length > 0) {
    let mejorCandidato = null;
    let mejorDifMin = -1;
    
    for (const candidato of mejores) {
      if (seleccionadas.includes(candidato)) continue;
      const difMin = Math.min(...seleccionadas.map(s => diferencia(s, candidato)));
      if (difMin > mejorDifMin) {
        mejorDifMin = difMin;
        mejorCandidato = candidato;
      }
    }
    
    if (mejorCandidato) seleccionadas.push(mejorCandidato);
    else break;
  }
  
  return seleccionadas;
}

const seleccionadas = seleccionarDiversas(todas, 4);

// Generar CSVs
for (let i = 0; i < seleccionadas.length; i++) {
  const dist = seleccionadas[i];
  const equipos = [[], [], [], []]; // A, B, C, D
  
  for (let b = 0; b < bombos.length; b++) {
    for (let e = 0; e < 4; e++) {
      const jugadorIdx = dist.asignacion[b][e];
      equipos[e].push(bombos[b].jugadores[jugadorIdx].nombre);
    }
  }
  
  let csv = "Equipo A,Equipo B,Equipo C,Equipo D\n";
  for (let fila = 0; fila < bombos.length; fila++) {
    csv += `${equipos[0][fila]},${equipos[1][fila]},${equipos[2][fila]},${equipos[3][fila]}\n`;
  }
  
  const filename = `distribucion_${i + 1}.csv`;
  require('fs').writeFileSync(filename, csv);
  
  console.log(`\n=== Distribución ${i + 1} (${filename}) ===`);
  console.log(`Valores por equipo: A=${dist.valores[0]}, B=${dist.valores[1]}, C=${dist.valores[2]}, D=${dist.valores[3]}`);
  console.log(`Desbalance: ${dist.desbalance}`);
  console.log("Equipo A | Equipo B | Equipo C | Equipo D");
  console.log("-".repeat(60));
  for (let fila = 0; fila < bombos.length; fila++) {
    console.log(`${equipos[0][fila].padEnd(14)} | ${equipos[1][fila].padEnd(14)} | ${equipos[2][fila].padEnd(14)} | ${equipos[3][fila]}`);
  }
}
