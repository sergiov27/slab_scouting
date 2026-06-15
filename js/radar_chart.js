document.addEventListener("DOMContentLoaded", () => {

    let dataPercentiles = [];
    let radarChart;
    let radarDefensivo;
    let radarCreacion;

    const rutaPercentiles = "liga1_percentiles.json";

    const metricasRadar = [
        { key: "percentil_duelos_aereos_ganados_90", label: "Duelos Aereos" },
        { key: "percentil_goles_excepto_los_penaltis_90", label: "Goles s/p" },
        { key: "percentil_acciones_de_ataque_exitosas_90", label: "Acciones Ofensivas" },
        { key: "percentil_x_g_90", label: "xG" },
        { key: "percentil_asistencias_90", label: "Asistencias" },
        { key: "percentil_duelos_ofensivos_ganados_90", label: "Duelos Ofensivos" },
        { key: "percentil_asistencias_tiro_90", label: "Asist. de Remate" },
        { key: "percentil_carreras_en_progresion_90", label: "Conducciones Progresivas" },
        { key: "percentil_regates_exitosos_90", label: "Regates Exitosos" },
        { key: "percentil_remates_90", label: "Remates" }
    ];

    const metricasDefensivas = [
        { key: "percentil_padj_interceptaciones", label: "Padj. Interceptaciones" },
        { key: "percentil_padj_entradas", label: "Padj. Entradas" },
        { key: "percentil_duelos_defensivos_ganados_90", label: "Duelos Defensivos" },
        { key: "percentil_tiros_interceptados_90", label: "Tiros Bloqueados" },
        { key: "percentil_duelos_aereos_ganados_90", label: "Duelos Aereos" }
    ];

    const metricasCreacion = [
        { key: "percentil_pases_progresivos_precisos_90", label: "Pases Progresivos" },
        { key: "percentil_pases_en_profundidad_exitosos_90", label: "Pases en Profundidad" },
        { key: "percentil_pases_largos_precisos_90", label: "Pases Largos" },
        { key: "percentil_pases_ultimo_tercio_precisos_90", label: "Pases Ultimo Tercio" },
        { key: "percentil_centros_precisos_90", label: "Centros Precisos" },
        { key: "percentil_jugadas_claves_90", label: "Jugadas Claves" }
    ];

    const radarDataLabels = {
        formatter: (value) => Math.round(value),
        textAlign: "center",
        borderRadius: 50,
        padding: 8,
        font: {
            weight: "bold",
            size: 10
        },
        color: function (context) {
            return context.dataset.borderColor === "#ffd50d" ? "#0f172a" : "black";
        },
        backgroundColor: function (context) {
            return context.dataset.borderColor;
        }
    };

    function normalizarPercentil(v) {
        if (v === null || v === undefined) return 0;
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return n <= 1 ? n * 100 : n;
    }

    // Registrar ChartDataLabels antes de crear los charts
    if (window.ChartDataLabels) {
        Chart.register(window.ChartDataLabels);
    }

    function crearRadarInicial() {
        const canvas = document.getElementById("radarChart");
        if (!canvas) return;

        radarChart = new Chart(canvas, {
            type: "radar",
            data: {
                labels: metricasRadar.map(m => m.label),
                datasets: []
            },
            options: {
                responsive: true,
                mantainAspectRatio: true,
                aspectRatio:1, 
                scales: {
                    r: {
                        suggedtedMin: 0,
                        suggestedMax: 100,
                        min: 0,
                        max: 100,
                        ticks: { display: false},
                        pointLabels: { color: "white" },
                        grid: { color: "#777977" }
                    }
                },
                plugins: {
                    legend: { labels: { color: "white" } },
                    datalabels: radarDataLabels
                }
            }
        });
    }

    function crearRadarDefensivo() {
        const canvas = document.getElementById("radarDefensivo");
        if (!canvas) return;

        radarDefensivo = new Chart(canvas, {
            type: "radar",
            data: {
                labels: metricasDefensivas.map(m => m.label),
                datasets: []
            },
            options: {
                responsive: true,
                mantainAspectRatio: true,
                aspectRatio:1, 
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false },
                        pointLabels: { color: "white" },
                        grid: { color: "#777977" }
                    }
                },
                plugins: {
                    legend: { labels: { color: "white" } },
                    datalabels: radarDataLabels
                }
            }
        });
    }

    function crearRadarCreacion() {
        const canvas = document.getElementById("radarCreacion");
        if (!canvas) return;

        radarCreacion = new Chart(canvas, {
            type: "radar",
            data: {
                labels: metricasCreacion.map(m => m.label),
                datasets: []
            },
            options: {
                responsive: true,
                mantainAspectRatio: true,
                aspectRatio:1, 
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false },
                        pointLabels: { color: "white" },
                        grid: { color: "#777977" }
                    }
                },
                plugins: {
                    legend: { labels: { color: "white" } },
                    datalabels: radarDataLabels
                }
            }
        });
    }

    function actualizarRadar() {
        if (!radarChart || !radarDefensivo || !radarCreacion) return;

        const select1 = document.getElementById("jugador1");
        const select2 = document.getElementById("jugador2");

        // Obtener valores directamente del select (HTML, no TomSelect)
        const jugador1 = select1?.value;
        const jugador2 = select2?.value;

        console.log("Actualizando con:", jugador1, jugador2);

        const datos1 = dataPercentiles.find(j => j.jugador === jugador1);
        const datos2 = dataPercentiles.find(j => j.jugador === jugador2);

        if (!datos1 || !datos2) {
            console.warn("No se encontraron datos:", jugador1, jugador2);
            return;
        }

        radarChart.data.datasets = [
            {
                label: jugador1,
                data: metricasRadar.map(m => normalizarPercentil(datos1[m.key]) || 0),
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.2)"
            },
            {
                label: jugador2,
                data: metricasRadar.map(m => normalizarPercentil(datos2[m.key]) || 0),
                borderColor: "#FFD50D",
                backgroundColor: "rgba(255, 213, 13, 0.2)"
            }
        ];

        radarDefensivo.data.datasets = [
            {
                label: jugador1,
                data: metricasDefensivas.map(m => normalizarPercentil(datos1[m.key]) || 0),
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.2)"
            },
            {
                label: jugador2,
                data: metricasDefensivas.map(m => normalizarPercentil(datos2[m.key]) || 0),
                borderColor: "#FFD50D",
                backgroundColor: "rgba(255, 213, 13, 0.2)"
            }
        ];

        radarCreacion.data.datasets = [
            {
                label: jugador1,
                data: metricasCreacion.map(m => normalizarPercentil(datos1[m.key]) || 0),
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.2)"
            },
            {
                label: jugador2,
                data: metricasCreacion.map(m => normalizarPercentil(datos2[m.key]) || 0),
                borderColor: "#FFD50D",
                backgroundColor: "rgba(255, 213, 13, 0.2)"
            }
        ];

        radarChart.update();
        radarDefensivo.update();
        radarCreacion.update();
    }

    function cargarSelectores() {
        const select1 = document.getElementById("jugador1");
        const select2 = document.getElementById("jugador2");

        if (!select1 || !select2) return;

        select1.innerHTML = "";
        select2.innerHTML = "";

        dataPercentiles.forEach(jugador => {
            const option1 = document.createElement("option");
            option1.value = jugador.jugador;
            option1.textContent = jugador.jugador;

            const option2 = option1.cloneNode(true);

            select1.appendChild(option1);
            select2.appendChild(option2);
        });

        // Preseleccionar primeros jugadores si existen
        if (select1.options.length > 0) select1.selectedIndex = 0;
        if (select2.options.length > 1) select2.selectedIndex = 1;

        select1.addEventListener("change", actualizarRadar);
        select2.addEventListener("change", actualizarRadar);

        // Inicializar TomSelect
        new TomSelect("#jugador1", {
            create: false,
            maxItems: 1,
            maxOptions: null,
            sortField: { field: "text", direction: "asc" },
            dropdownParent: "body",
            placeholder: "Buscar jugador..."
        });

        new TomSelect("#jugador2", {
            create: false,
            maxItems: 1,
            maxOptions: null,
            sortField: { field: "text", direction: "asc" },
            dropdownParent: "body",
            placeholder: "Buscar jugador..."
        });

        // Actualizar radares con selección por defecto
        actualizarRadar();
    }

    function cargarDatos() {
        fetch(rutaPercentiles)
            .then(r => r.json())
            .then(percentiles => {
                console.log("Datos cargados:", percentiles.length, "jugadores");
                dataPercentiles = percentiles;

                const select1 = document.getElementById("jugador1");
                const select2 = document.getElementById("jugador2");

                // Destruir TomSelect anterior si existe
                if (select1?.tomselect) select1.tomselect.destroy();
                if (select2?.tomselect) select2.tomselect.destroy();

                cargarSelectores();

                // Limpiar y actualizar radares
                if (radarChart && radarDefensivo && radarCreacion) {
                    radarChart.data.datasets = [];
                    radarDefensivo.data.datasets = [];
                    radarCreacion.data.datasets = [];

                    radarChart.update();
                    radarDefensivo.update();
                    radarCreacion.update();

                    // Rellenar radares con datos actuales
                    actualizarRadar();
                }
            })
            .catch(err => console.error("Error cargando JSON:", err));
    }

    crearRadarInicial();
    crearRadarDefensivo();
    crearRadarCreacion();
    cargarDatos();
});
