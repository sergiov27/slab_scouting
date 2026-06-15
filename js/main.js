let dataPercentiles = [];
let radarChart;
let radarDefensivo;
let radarCreacion;

let dataOriginal = [];
let dataFiltrada = [];

let ordenActual = {
    columna: null,
    asc: true
};

const escudoClub = document.querySelector(".escudoClub");
const rutaDatabase = "liga1_database.json";
const rutaPercentiles = "liga1_percentiles.json";

const columnasDatabase = [
    "jugador",
    "equipo_periodo",
    "posicion_1",
    "edad",
    "pie",
    "altura",
    "partidos_jugados",
    "minutos_jugados",
    "goles",
    "asistencias",
    "x_g",
    "x_a"
];

const nombresColumnas = {
    jugador: "Jugador",
    equipo_periodo: "Club",
    posicion_1: "Posición",
    edad: "Edad",
    pie: "Pie",
    altura: "Altura",
    partidos_jugados: "PJ",
    minutos_jugados: "Minutos",
    goles: "Goles",
    asistencias: "Asistencias",
    x_g: "xG",
    x_a: "xA"
};

	const escudosPeruPorClub = {
		"ADT": "adt.png",
		"Alianza Atletico": "alianza_atletico.PNG",
		"Alianza Atlético": "alianza_atletico.PNG",
		"Alianza AtlÃ©tico": "alianza_atletico.PNG",
		"Alianza Lima": "alianza_lima.png",
		"Atletico Grau": "atletico_grau.png",
		"Atlético Grau": "atletico_grau.png",
		"AtlÃ©tico Grau": "atletico_grau.png",
		"FC Cajamarca": "cajamarca.png",
		"Los Chankas": "chankas.png",
		"Cienciano": "cienciano.png",
		"Comerciantes Unidos": "comerciantes.png",
		"Cusco": "cusco.png",
		"Deportivo Garcilaso": "garcilaso.png",
		"Sport Huancayo": "huancayo.png",
		"Juan Pablo II College": "juanpablo.png",
		"Melgar": "melgar.png",
		"CD Moquegua": "moquegua.png",
		"Sport Boys": "sport_boys.png",
		"Sporting Cristal": "sporting_cristal.png",
		"Universitario": "universitario.png",
		"UTC Cajamarca": "utc.png"
	};

function obtenerIniciales(nombre){

    if(!nombre) return "";

    return nombre
        .split(" ")
        .slice(0,2)
        .map(p => p[0])
        .join("")
        .toUpperCase();

}

function renderTabla(data, tableId, columnas) {

    const tabla = document.getElementById(tableId);
    tabla.innerHTML = "";

    if (!data || data.length === 0) return;

    let headerRow = tabla.insertRow();

    columnas.forEach(col => {

        let th = document.createElement("th");
        th.textContent = nombresColumnas[col] || col;

        th.addEventListener("click", () => ordenarTabla(col));

        headerRow.appendChild(th);
    });

    data.forEach(fila => {

        let row = tabla.insertRow();

        columnas.forEach(col => {

    let cell = row.insertCell();

    // JUGADOR
    if(col === "jugador"){

        cell.innerHTML = `
            <div class="player-cell">

                <div class="player-avatar">
                    ${obtenerIniciales(fila.jugador)}
                </div>

                <div class="player-info">

                    <div class="player-name">
                        ${fila.jugador}
                    </div>

                    <div class="player-team">
                        ${fila.equipo_periodo}
                    </div>

                </div>

            </div>
        `;
    }

    // POSICION
    else if(col === "posicion_1"){

        cell.innerHTML = `
            <span class="badge-posicion">
                ${fila[col]}
            </span>
        `;
    }

    // EDAD
    else if(col === "edad"){

        cell.style.textAlign = "center";

        let clase = "";

        if(fila.edad <= 23){
            clase = "edad-joven";
        }
        else if(fila.edad <= 29){
            clase = "edad-prime";
        }
        else{
            clase = "edad-veterano";
        }

        cell.innerHTML = `
            <span class="${clase}">
                ${fila.edad}
            </span>
        `;
    }

    // GOLES
    else if(col === "goles"){

        cell.textContent = fila.goles ?? "";

    }


    /* xG */

    else if(col === "x_g"){

        const xg = Number(fila.x_g) || 0;

            const maxXG = Math.max(
        ...dataOriginal.map(j => Number(j.x_g) || 0)
        );

        const porcentaje = (xg / maxXG) * 100;

        cell.innerHTML = `
            <div class="metrica">

                <span>${xg.toFixed(2)}</span>

                <div class="barra">

                    <div
                        class="relleno"
                        style="width:${Math.min(xg * 10,100)}%">
                    </div>

                </div>

            </div>
        `;
    }

    /* xA */
else if(col === "x_a"){

    const xa = Number(fila.x_a) || 0;

        const maxXA = Math.max(
        ...dataOriginal.map(j => Number(j.x_a) || 0)
    );

    const porcentaje = (xa / maxXA) * 100;


    cell.innerHTML = `
        <div class="metrica">

            <span>${xa.toFixed(2)}</span>

            <div class="barra">

                <div
                    class="relleno"
                    style="width:${Math.min(xa * 20,100)}%">
                </div>

            </div>

        </div>
    `;
}

    else if(col === "equipo_periodo"){

    const nombreClub = fila[col];
    const archivoEscudo = escudosPeruPorClub[nombreClub];

    if(archivoEscudo){

        cell.innerHTML = `
            <img
                src="Imagenes/Escudos/peru/${archivoEscudo}"
                class="escudo-club"
                alt="${nombreClub}"
                title="${nombreClub}"
            >
        `;

    }else{

        cell.textContent = nombreClub ?? "";

    }

}

else{

    cell.textContent = fila[col] ?? "";

}

});

    });

}

function ordenarTabla(columna) {

    if (ordenActual.columna === columna) {
        ordenActual.asc = !ordenActual.asc;
    } else {
        ordenActual.columna = columna;
        ordenActual.asc = true;
    }

    dataFiltrada.sort((a, b) => {

        let valorA = a[columna];
        let valorB = b[columna];

        let numA = parseFloat(valorA);
        let numB = parseFloat(valorB);

        if (!isNaN(numA) && !isNaN(numB)) {

            return ordenActual.asc ? numA - numB : numB - numA;

        } else {

            return ordenActual.asc
                ? String(valorA).localeCompare(String(valorB))
                : String(valorB).localeCompare(String(valorA));

        }

    });

    renderTabla(dataFiltrada, "tabla_database", columnasDatabase);

}


function configurarSlider() {

    const minutos = dataOriginal.map(j => parseInt(j.minutos_jugados) || 0);

    const minGlobal = Math.min(...minutos);
    const maxGlobal = Math.max(...minutos);

    const slider = document.getElementById('sliderMinutos');

    if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
    }

    noUiSlider.create(slider, {

        start: [minGlobal, maxGlobal],
        connect: true,
        step: 1,
        range: {
            'min': minGlobal,
            'max': maxGlobal
        }

    });

    function configurarSliderEdad(){

    const edades =
        dataOriginal.map(j => parseInt(j.edad) || 0);

    const minEdadGlobal = Math.min(...edades);
    const maxEdadGlobal = Math.max(...edades);

    const sliderEdad =
        document.getElementById("sliderEdad");

    if(sliderEdad.noUiSlider){
        sliderEdad.noUiSlider.destroy();
    }

    noUiSlider.create(sliderEdad,{

        start:[minEdadGlobal,maxEdadGlobal],
        connect:true,
        step:1,

        range:{
            min:minEdadGlobal,
            max:maxEdadGlobal
        }

    });

    document.getElementById("minEdad").textContent =
        minEdadGlobal;

    document.getElementById("maxEdad").textContent =
        maxEdadGlobal;

    sliderEdad.noUiSlider.on("update",function(values){

        document.getElementById("minEdad").textContent =
            Math.round(values[0]);

        document.getElementById("maxEdad").textContent =
            Math.round(values[1]);

    });

}

    document.getElementById("minValor").textContent = minGlobal;
    document.getElementById("maxValor").textContent = maxGlobal;

    slider.noUiSlider.on('update', function(values) {

        const minSeleccionado = Math.round(values[0]);
        const maxSeleccionado = Math.round(values[1]);

        document.getElementById("minValor").textContent = minSeleccionado;
        document.getElementById("maxValor").textContent = maxSeleccionado;

        dataFiltrada = dataOriginal.filter(j => {

            const minutos = parseInt(j.minutos_jugados) || 0;

            return minutos >= minSeleccionado && minutos <= maxSeleccionado;

        });

        renderTabla(dataFiltrada, "tabla_database", columnasDatabase);

    });

}

document.getElementById("selectorPosicion")
.addEventListener("change", function(){

    const posicion = this.value.toLowerCase();

    dataFiltrada = dataOriginal.filter(j => {

        const minutos = parseInt(j.minutos_jugados) || 0;

        const cumpleMinutos =
            minutos >= parseInt(document.getElementById("minValor").textContent)
            &&
            minutos <= parseInt(document.getElementById("maxValor").textContent);

        const posicionJugador = (j.posicion_1 ?? "").toLowerCase();

        const cumplePosicion =
            posicion === "todos" || posicionJugador.includes(posicion);

        return cumpleMinutos && cumplePosicion;

    });

    renderTabla(dataFiltrada, "tabla_database", columnasDatabase);

});

function cargarSelectores() {

    const select1 = document.getElementById("jugador1");
    const select2 = document.getElementById("jugador2");

    dataPercentiles.forEach(jugador => {

        let option1 = document.createElement("option");

        option1.value = jugador.jugador;
        option1.textContent = jugador.jugador;

        let option2 = option1.cloneNode(true);

        select1.appendChild(option1);
        select2.appendChild(option2);

    });

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

}

const metricasRadar = [
{key:"percentil_duelos_aereos_ganados_90",label:"Duelos Aéreos"},
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
{key:"percentil_pases_ultimo_tercio_precisos_90",label:"Pases Último Tercio"},
{key:"percentil_centros_precisos_90",label:"Centros Precisos"},
{key:"percentil_jugadas_claves_90",label:"Jugadas Claves"}
];


Chart.register(ChartDataLabels);
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

function crearRadarInicial(){

const ctx=document.getElementById("radarChart");
if(!ctx)return;

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
},
plugins:[ChartDataLabels]
});

}

function crearRadarDefensivo(){

const ctx=document.getElementById("radarDefensivo");
if(!ctx)return;

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
},
plugins:[ChartDataLabels]
});

}

function crearRadarCreacion(){

const ctx=document.getElementById("radarCreacion");
if(!ctx)return;

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
},
plugins:[ChartDataLabels]
});

}

function actualizarRadar(){

const el1=document.getElementById("jugador1");
const el2=document.getElementById("jugador2");
if(!el1||!el2)return;
const jugador1=el1.value;
const jugador2=el2.value;

const datos1=dataPercentiles.find(j=>j.jugador===jugador1);
const datos2=dataPercentiles.find(j=>j.jugador===jugador2);

if(!datos1||!datos2)return;

if(radarChart)radarChart.data.datasets=[
{
label:jugador1,
data:metricasRadar.map(m=>datos1[m.key]??0),
borderColor:"#ffd50d",
backgroundColor:"rgba(255,213,13,0.2)"
},
{
label:jugador2,
data:metricasRadar.map(m=>datos2[m.key]??0),
borderColor:"#3b82f6",
backgroundColor:"rgba(59,130,246,0.2)"
}
];

if(radarDefensivo)radarDefensivo.data.datasets=[
{
label:jugador1,
data:metricasDefensivas.map(m=>datos1[m.key]??0),
borderColor:"#ffd50d",
backgroundColor:"rgba(255,213,13,0.2)"
},
{
label:jugador2,
data:metricasDefensivas.map(m=>datos2[m.key]??0),
borderColor:"#3b82f6",
backgroundColor:"rgba(59,130,246,0.2)"
}
];

if(radarCreacion)radarCreacion.data.datasets=[
{
label:jugador1,
data:metricasCreacion.map(m=>datos1[m.key]??0),
borderColor:"#ffd50d",
backgroundColor:"rgba(255,213,13,0.2)"
},
{
label:jugador2,
data:metricasCreacion.map(m=>datos2[m.key]??0),
borderColor:"#3b82f6",
backgroundColor:"rgba(59,130,246,0.2)"
}
];

if(radarChart)radarChart.update();
if(radarDefensivo)radarDefensivo.update();
if(radarCreacion)radarCreacion.update();

}

function cargarDatos(){

Promise.all([
fetch(rutaDatabase).then(r=>r.json()),
fetch(rutaPercentiles).then(r=>r.json())
])

.then(([database,percentiles])=>{

dataOriginal=database;
dataFiltrada=[...database];
dataPercentiles=percentiles;

renderTabla(dataFiltrada,"tabla_database",columnasDatabase);

configurarSlider();
configurarSliderEdad();

const select1=document.getElementById("jugador1");
const select2=document.getElementById("jugador2");

if(select1.tomselect)select1.tomselect.destroy();
if(select2.tomselect)select2.tomselect.destroy();

select1.innerHTML="";
select2.innerHTML="";

cargarSelectores();

if(radarChart){radarChart.data.datasets=[];radarChart.update();}
if(radarDefensivo){radarDefensivo.data.datasets=[];radarDefensivo.update();}
if(radarCreacion){radarCreacion.data.datasets=[];radarCreacion.update();}

})
.catch(function(err){
console.error("Error cargando datos:", err);
});

}

crearRadarInicial();
crearRadarDefensivo();
crearRadarCreacion();

cargarDatos();
