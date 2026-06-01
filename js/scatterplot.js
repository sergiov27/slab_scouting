document.addEventListener("DOMContentLoaded", () => {

let scatterChart;
let dataOriginal = [];
let dataActual = [];
let dataPercentiles = [];
let radarChart;
let radarDefensivo;
let radarCreacion;



// rutas de datos
const rutaDatabase = "liga1_database.json";
const rutaPercentiles = "liga1_percentiles.json";

// métricas fijas
const metricasFijas = [
    "remates_90",
    "x_a",
    "x_g",
    "regates_exitosos_90",
    "asistencias_90",
    "goles_90",
    "x_g_90",
    "centros_90",
    "duelos_defensivos_90",
    "duelos_aereos_90",
    "interceptaciones_90",
    "acciones_de_ataque_exitosas_90",
    "toques_en_el_area_de_penalti_90",
    "carreras_en_progresion_90",
    "pases_90",
    "pases_hacia_adelante_90",
    "duelos_ofensivos_90",
    "aceleraciones_90",
    "regates_90",
    "entradas_90",
    "asistencias_tiro_90"
];

const nombresMetricas = {
    "remates_90": "Remates p/90",
    "x_a": "Asistencias Esperadas (xA)",
    "x_g": "Goles Esperados (xG)",
    "regates_exitosos_90": "Regates Exitosos p/90",
    "asistencias_90": "Asistencias p/90",
    "goles_90": "Goles p/90",
    "x_g_90": "xG p/90",
    "centros_90": "Centros p/90",
    "duelos_defensivos_90": "Duelos Defensivos p/90",
    "duelos_aereos_90": "Duelos Aéreos p/90",
    "interceptaciones_90": "Interceptaciones p/90",
    "acciones_de_ataque_exitosas_90": "Acciones Ofensivas p/90",
    "toques_en_el_area_de_penalti_90": "Toques en Área p/90",
    "carreras_en_progresion_90": "Conducciones Progresivas p/90",
    "pases_90": "Pases p/90",
    "pases_hacia_adelante_90": "Pases Adelante p/90",
    "duelos_ofensivos_90": "Duelos Ofensivos p/90",
    "aceleraciones_90": "Aceleraciones p/90",
    "regates_90": "Regates p/90",
    "entradas_90": "Entradas p/90",
    "asistencias_tiro_90": "Asistencia de Tiro p/90"
};

function compararTexto(a, b) {
    return a.localeCompare(b, "es", { sensitivity: "base" });
}

function ordenarOpcionesSelect(selector, mantenerPrimera = false) {
    const select = document.querySelector(selector);
    if (!select) return;

    const opciones = Array.from(select.options);
    if (opciones.length <= 1) return;

    const primera = mantenerPrimera ? opciones.shift() : null;
    opciones.sort((a, b) => compararTexto(a.textContent, b.textContent));

    select.innerHTML = "";

    if (primera) {
        select.appendChild(primera);
    }

    opciones.forEach(opcion => select.appendChild(opcion));
}

const metricasRadar = [
{key:"percentil_duelos_aereos_ganados_90",label:"Duelos Aereos"},
{key:"percentil_goles_excepto_los_penaltis_90",label:"Goles s/p"},
{key:"percentil_acciones_de_ataque_exitosas_90",label:"Acciones Ofensivas"},
{key:"percentil_x_g_90",label:"xG"},
{key:"percentil_asistencias_90",label:"Asistencias"},
{key:"percentil_duelos_ofensivos_ganados_90",label:"Duelos Ofensivos"},
{key:"percentil_asistencias_tiro_90",label:"Asist. de Remate"},
{key:"percentil_carreras_en_progresion_90",label:"Conducciones Progresivas"},
{key:"percentil_regates_exitosos_90",label:"Regates Exitosos"},
{key:"percentil_remates_90",label:"Remates"}
];

const metricasDefensivas = [
{key:"percentil_padj_interceptaciones",label:"Padj. Interceptaciones"},
{key:"percentil_padj_entradas",label:"Padj. Entradas"},
{key:"percentil_duelos_defensivos_ganados_90",label:"Duelos Defensivos"},
{key:"percentil_tiros_interceptados_90",label:"Tiros Bloqueados"},
{key:"percentil_duelos_aereos_ganados_90",label:"Duelos Aereos"}
];

const metricasCreacion = [
{key:"percentil_pases_progresivos_precisos_90",label:"Pases Progresivos"},
{key:"percentil_pases_en_profundidad_exitosos_90",label:"Pases en Profundidad"},
{key:"percentil_pases_largos_precisos_90",label:"Pases Largos"},
{key:"percentil_pases_ultimo_tercio_precisos_90",label:"Pases Ultimo Tercio"},
{key:"percentil_centros_precisos_90",label:"Centros Precisos"},
{key:"percentil_jugadas_claves_90",label:"Jugadas Claves"}
];

const radarDataLabels = {
formatter:(value)=>Math.round(value),
textAlign:"center",
borderRadius:50,
padding:8,
font:{
weight:"bold",
size:10
},
color:function(context){
return context.dataset.borderColor === "#ffd50d"
? "#0f172a"
: "#ffffff";
},
backgroundColor:function(context){
return context.dataset.borderColor;
}
};

// Normalizar percentiles: si vienen en 0-1, convertir a 0-100
function normalizarPercentil(v){
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return n <= 1 ? n * 100 : n;
}


// ====== CREAR GRÁFICO ======
const canvas = document.getElementById("scatterChart");


if (!canvas) {
    console.error("No se encontró el canvas");
    return;
}

const ctx = canvas.getContext("2d");

if (window.ChartDataLabels) {
    Chart.register(window.ChartDataLabels);
}

scatterChart = new Chart(ctx, {
    type: "scatter",
    data: {
        datasets: [{
            label: "Jugadores",
            data: [],
            backgroundColor: "rgba(255, 213, 13, 0.85)",
            pointRadius: 8,
            pointHoverRadius: 10
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3.5,
        layout: {
            padding: {
                top: 0
            }
        },
        plugins: {
    legend: {
        position: "bottom",
        align: "center",
        labels: {
            color: "#ffffff",
            padding: 18
        }
    },
    datalabels: {
        display: true,
        color: "#ffffff",
        formatter: (value) => value.jugador,
        align: "top",
        anchor: "end",
        offset: 6,
        clip: false,
        font: {
            size: 10,
            weight: "600"
        }
    },
    tooltip: {
        callbacks: {
            label: function(context) {
                return context.raw.jugador +
                    " (" + context.raw.x + ", " + context.raw.y + ")";
            }
        }
    }
},
        scales: {
    x: {
        title: { display: true, text: "Métrica X", color: "#ffffff" },
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(209, 213, 219, 0.5)"  }
    },
    y: {
        title: { display: true, text: "Métrica Y", color: "#ffffff" },
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(209, 213, 219, 0.5)" }
    }
}
    }
});



// ====== LLENAR SELECTS ======
function llenarSelectMetricas() {

    const selectX = document.getElementById("metricaX");
    const selectY = document.getElementById("metricaY");

    if (!selectX || !selectY) {
        console.error("No encuentra los selects");
        return;
    }

    selectX.innerHTML = "";
    selectY.innerHTML = "";

    const metricasOrdenadas = [...metricasFijas].sort((a, b) => {
        const nombreA = nombresMetricas[a] || a.replaceAll("_", " ");
        const nombreB = nombresMetricas[b] || b.replaceAll("_", " ");
        return compararTexto(nombreA, nombreB);
    });

    metricasOrdenadas.forEach(col => {

        let op1 = document.createElement("option");
        op1.value = col;
        op1.textContent = nombresMetricas[col] || col.replaceAll("_", " ");

        let op2 = op1.cloneNode(true);

        selectX.appendChild(op1);
        selectY.appendChild(op2);
    });

    selectX.selectedIndex = 0;
    selectY.selectedIndex = 1;
}

function actualizarTitulosSlidersMetricas() {
    const metricaX = document.getElementById("metricaX")?.value;
    const metricaY = document.getElementById("metricaY")?.value;
    const tituloX = document.getElementById("tituloSliderMetricaX");
    const tituloY = document.getElementById("tituloSliderMetricaY");
    const tituloComparacion = document.getElementById("tituloComparacionMetricas");

    if (tituloX && metricaX) {
        tituloX.textContent = nombresMetricas[metricaX] || metricaX;
    }

    if (tituloY && metricaY) {
        tituloY.textContent = nombresMetricas[metricaY] || metricaY;
    }

    if (tituloComparacion && metricaX && metricaY) {
        const nombreX = nombresMetricas[metricaX] || metricaX;
        const nombreY = nombresMetricas[metricaY] || metricaY;
        tituloComparacion.textContent = `${nombreX} vs ${nombreY}`;
    }
}

function formatearValorSlider(valor) {
    return Number.isInteger(valor) ? String(valor) : String(Number(valor.toFixed(2)));
}

function configurarSliderMetricaScatter(sliderId, minId, maxId, metrica) {

    const slider = document.getElementById(sliderId);
    const minEl = document.getElementById(minId);
    const maxEl = document.getElementById(maxId);

    if (!slider || !minEl || !maxEl || !metrica) {
        return;
    }

    const valores = dataOriginal
        .map(jugador => Number(jugador[metrica]))
        .filter(Number.isFinite);

    if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
    }

    if (valores.length === 0) {
        minEl.textContent = "0";
        maxEl.textContent = "0";
        return;
    }

    const minGlobal = Math.min(...valores);
    const maxGlobal = Math.max(...valores);
    const maxSeguro = maxGlobal === minGlobal ? minGlobal + 1 : maxGlobal;

    noUiSlider.create(slider, {
        start: [minGlobal, maxGlobal],
        connect: true,
        range: {
            min: minGlobal,
            max: maxSeguro
        }
    });

    minEl.textContent = formatearValorSlider(minGlobal);
    maxEl.textContent = formatearValorSlider(maxGlobal);

    slider.noUiSlider.on("update", values => {
        const minSeleccionado = Number(values[0]);
        const maxSeleccionado = Number(values[1]);

        minEl.textContent = formatearValorSlider(minSeleccionado);
        maxEl.textContent = formatearValorSlider(maxSeleccionado);

        aplicarFiltroMinutosScatter();
    });
}

function configurarSlidersMetricasScatter() {
    const metricaX = document.getElementById("metricaX")?.value;
    const metricaY = document.getElementById("metricaY")?.value;

    configurarSliderMetricaScatter(
        "sliderMetricaXScatter",
        "minValorXScatter",
        "maxValorXScatter",
        metricaX
    );

    configurarSliderMetricaScatter(
        "sliderMetricaYScatter",
        "minValorYScatter",
        "maxValorYScatter",
        metricaY
    );
}

function configurarSliderMinutosScatter() {

    const slider = document.getElementById("sliderMinutosScatter");

    if (!slider || dataOriginal.length === 0) {
        return;
    }

    const minutos = dataOriginal.map(jugador => parseInt(jugador.minutos_jugados, 10) || 0);
    const minGlobal = Math.min(...minutos);
    const maxGlobal = Math.max(...minutos);

    if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
    }

    noUiSlider.create(slider, {
        start: [minGlobal, maxGlobal],
        connect: true,
        step: 1,
        range: {
            min: minGlobal,
            max: maxGlobal
        }
    });

    document.getElementById("minValorScatter").textContent = minGlobal;
    document.getElementById("maxValorScatter").textContent = maxGlobal;

    slider.noUiSlider.on("update", values => {
        const minSeleccionado = Math.round(values[0]);
        const maxSeleccionado = Math.round(values[1]);

        document.getElementById("minValorScatter").textContent = minSeleccionado;
        document.getElementById("maxValorScatter").textContent = maxSeleccionado;

        aplicarFiltroMinutosScatter();
    });

    aplicarFiltroMinutosScatter();
}

function aplicarFiltroMinutosScatter() {

    const minSeleccionado = parseInt(document.getElementById("minValorScatter").textContent, 10);
    const maxSeleccionado = parseInt(document.getElementById("maxValorScatter").textContent, 10);
    const selectorPosicion = document.getElementById("selectorPosicion");
    const posicionSeleccionada = (selectorPosicion?.value || "todos").toLowerCase();
    const metricaX = document.getElementById("metricaX")?.value;
    const metricaY = document.getElementById("metricaY")?.value;
    const minX = parseFloat(document.getElementById("minValorXScatter")?.textContent || "NaN");
    const maxX = parseFloat(document.getElementById("maxValorXScatter")?.textContent || "NaN");
    const minY = parseFloat(document.getElementById("minValorYScatter")?.textContent || "NaN");
    const maxY = parseFloat(document.getElementById("maxValorYScatter")?.textContent || "NaN");

    dataActual = dataOriginal.filter(jugador => {
        const minutos = parseInt(jugador.minutos_jugados, 10) || 0;
        const posicionJugador = (jugador.posicion_1 || "").toLowerCase();
        const valorX = Number(jugador[metricaX]);
        const valorY = Number(jugador[metricaY]);
        const cumplePosicion =
            posicionSeleccionada === "todos" ||
            posicionJugador.includes(posicionSeleccionada);
        const cumpleMetricaX =
            !Number.isFinite(minX) || !Number.isFinite(maxX)
                ? true
                : (Number.isFinite(valorX) && valorX >= minX && valorX <= maxX);
        const cumpleMetricaY =
            !Number.isFinite(minY) || !Number.isFinite(maxY)
                ? true
                : (Number.isFinite(valorY) && valorY >= minY && valorY <= maxY);

        return minutos >= minSeleccionado
            && minutos <= maxSeleccionado
            && cumplePosicion
            && cumpleMetricaX
            && cumpleMetricaY;
    });

    actualizarScatter();
}

// ====== ACTUALIZAR SCATTER ====== 
function actualizarScatter() {

    const metricaX = document.getElementById("metricaX").value;
    const metricaY = document.getElementById("metricaY").value;

    if (!metricaX || !metricaY) return;

    const puntos = dataActual
        .map(j => ({
            x: Number(j[metricaX]),
            y: Number(j[metricaY]),
            jugador: j.jugador
        }))
        .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));

    scatterChart.data.datasets[0].data = puntos;

    scatterChart.options.scales.x.title.text = nombresMetricas[metricaX] || metricaX;
    scatterChart.options.scales.y.title.text = nombresMetricas[metricaY] || metricaY;

    scatterChart.update();
}

function crearRadarInicial(){

const ctx=document.getElementById("radarChart");
if (!ctx) return;

radarChart=new Chart(ctx,{
type:"radar",
data:{
labels:metricasRadar.map(m=>m.label),
datasets:[]
},
options:{
responsive:true,
scales:{
r:{
min:0,
max:100,
ticks:{display:false},
pointLabels:{color:"white"},
grid:{color:"#334155"}
}
},
plugins:{
legend:{
position:"top",
labels:{color:"white"}
},
datalabels: radarDataLabels
}
}
});

}

function crearRadarDefensivo(){

const ctx=document.getElementById("radarDefensivo");
if (!ctx) return;

radarDefensivo=new Chart(ctx,{
type:"radar",
data:{
labels:metricasDefensivas.map(m=>m.label),
datasets:[]
},
options:{
responsive:true,
scales:{
r:{
min:0,
max:100,
ticks:{display:false},
pointLabels:{color:"white"},
grid:{color:"#334155"}
}
},
plugins:{
legend:{labels:{color:"white"}},
datalabels: radarDataLabels
}
}
});

}

function crearRadarCreacion(){

const ctx=document.getElementById("radarCreacion");
if (!ctx) return;

radarCreacion=new Chart(ctx,{
type:"radar",
data:{
labels:metricasCreacion.map(m=>m.label),
datasets:[]
},
options:{
responsive:true,
scales:{
r:{
min:0,
max:100,
ticks:{display:false},
pointLabels:{color:"white"},
grid:{color:"#334155"}
}
},
plugins:{
legend:{labels:{color:"white"}},
datalabels: radarDataLabels
}
}
});

}

function actualizarRadar(){

if(!radarChart||!radarDefensivo||!radarCreacion)return;

const jugador1=document.getElementById("jugador1")?.value;
const jugador2=document.getElementById("jugador2")?.value;

const datos1=dataPercentiles.find(j=>j.jugador===jugador1);
const datos2=dataPercentiles.find(j=>j.jugador===jugador2);

if(!datos1||!datos2)return;

radarChart.data.datasets=[
{
label:jugador1,
data:metricasRadar.map(m=>normalizarPercentil(datos1?.[m.key])||0),
borderColor:"#10b981",
backgroundColor:"rgba(255,213,13,0.2)"
},
{
label:jugador2,
data:metricasRadar.map(m=>normalizarPercentil(datos2?.[m.key])||0),
borderColor:"#FFD50D",
backgroundColor:"rgba(59,130,246,0.2)"
}
];

radarDefensivo.data.datasets=[
{
label:jugador1,
data:metricasDefensivas.map(m=>normalizarPercentil(datos1?.[m.key])||0),
borderColor:"#10b981",
backgroundColor:"rgba(255,213,13,0.2)"
},
{
label:jugador2,
data:metricasDefensivas.map(m=>normalizarPercentil(datos2?.[m.key])||0),
borderColor:"#FFD50D",
backgroundColor:"rgba(59,130,246,0.2)"
}
];

radarCreacion.data.datasets=[
{
label:jugador1,
data:metricasCreacion.map(m=>normalizarPercentil(datos1?.[m.key])||0),
borderColor:"#10b981",
backgroundColor:"rgba(255,213,13,0.2)"
},
{
label:jugador2,
data:metricasCreacion.map(m=>normalizarPercentil(datos2?.[m.key])||0),
borderColor:"#FFD50D",
backgroundColor:"rgba(59,130,246,0.2)"
}
];

radarChart.update();
radarDefensivo.update();
radarCreacion.update();

}

function cargarSelectores() {

const select1 = document.getElementById("jugador1");
const select2 = document.getElementById("jugador2");

if(!select1||!select2)return;

select1.innerHTML = "";
select2.innerHTML = "";

dataPercentiles.forEach(jugador => {

    let option1 = document.createElement("option");

    option1.value = jugador.jugador;
    option1.textContent = jugador.jugador;

    let option2 = option1.cloneNode(true);

    select1.appendChild(option1);
    select2.appendChild(option2);

});
// preseleccionar primeros jugadores si existen
if (select1.options.length > 0) select1.selectedIndex = 0;
if (select2.options.length > 1) select2.selectedIndex = 1;

select1.addEventListener("change", actualizarRadar);
select2.addEventListener("change", actualizarRadar);

new TomSelect("#jugador1", {
    create:false,
    maxItems:1,
    maxOptions:null,
    sortField:{field:"text",direction:"asc"},
    dropdownParent:"body",
    placeholder:"Buscar jugador..."
});

new TomSelect("#jugador2", {
    create:false,
    maxItems:1,
    maxOptions:null,
    sortField:{field:"text",direction:"asc"},
    dropdownParent:"body",
    placeholder:"Buscar jugador..."
});

// actualizar radares con selección por defecto
actualizarRadar();

}

// ====== CARGAR DATOS ======
function cargarDatos() {

    Promise.all([
        fetch(rutaDatabase).then(r => r.json()),
        fetch(rutaPercentiles).then(r => r.json())
    ])
    .then(([database, percentiles]) => {

        console.log("Datos cargados:", database);

        dataOriginal = database;
        dataPercentiles = percentiles;
        configurarSlidersMetricasScatter();
        configurarSliderMinutosScatter();

        const select1 = document.getElementById("jugador1");
        const select2 = document.getElementById("jugador2");

        if (select1?.tomselect) select1.tomselect.destroy();
        if (select2?.tomselect) select2.tomselect.destroy();

        cargarSelectores();

        if (radarChart && radarDefensivo && radarCreacion) {
            radarChart.data.datasets=[];
            radarDefensivo.data.datasets=[];
            radarCreacion.data.datasets=[];

            radarChart.update();
            radarDefensivo.update();
            radarCreacion.update();
            // rellenar radares con datos actuales (si hay selecciones por defecto)
            actualizarRadar();
        }

    })
    .catch(err => {
        console.error("Error cargando JSON:", err);
    });
}

// ====== EVENTOS ======
document.getElementById("metricaX")
.addEventListener("change", () => {
    actualizarTitulosSlidersMetricas();
    configurarSlidersMetricasScatter();
    aplicarFiltroMinutosScatter();
});

document.getElementById("metricaY")
.addEventListener("change", () => {
    actualizarTitulosSlidersMetricas();
    configurarSlidersMetricasScatter();
    aplicarFiltroMinutosScatter();
});

document.getElementById("selectorPosicion")
.addEventListener("change", aplicarFiltroMinutosScatter);

// ====== INIT ======
llenarSelectMetricas();
ordenarOpcionesSelect("#selectorPosicion", true);
actualizarTitulosSlidersMetricas();
crearRadarInicial();
crearRadarDefensivo();
crearRadarCreacion();
configurarSlidersMetricasScatter();
cargarDatos();

// INICIALIZAR TOM-SELECT 
new TomSelect("#metricaX");
new TomSelect("#metricaY");

});

