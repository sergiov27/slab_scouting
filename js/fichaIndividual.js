document.addEventListener("DOMContentLoaded", () => {

	const rutaPercentiles = "liga1_percentiles.json";
	const rutaDatabase = "liga1_database.json";

	const selectorLiga = document.getElementById("selectorLigaFicha");
	const selectorJugador = document.getElementById("selectorJugadorFicha");
	const nombreJugador = document.querySelector(".nombreJugador");
	const nacionalidadJugador = document.querySelector(".nacionalidad");
	const banderaNacionalidad = document.querySelector(".banderaNacionalidad");
	const escudoClub = document.querySelector(".escudoClub");
	const clubJugador = document.querySelector(".club");
	const posicionJugador = document.querySelector(".posicionJugador");
	const edadJugador = document.querySelector(".edadJugador");
	const minutosJugador = document.querySelector(".minutosJugador");
	const valorMercadoValor = document.querySelector(".valorMercadoValor");
	const scoreFinalValor = document.querySelector(".scoreFinalValor");
	const ofensivaMetricas = document.querySelector(".ofensivaMetricas");
	const creacionMetricas = document.querySelector(".creacionMetricas");
	const defensivaMetricas = document.querySelector(".defensivaMetricas");
	const listaSimilares = document.getElementById("listaSimilares");
	const btnExportarFicha = document.getElementById("btnExportarFicha");
	const bloqueExportableFicha = document.getElementById("bloqueExportableFicha");
	const radarCanvas = document.getElementById("radarChartFicha");
	let radarChartFicha = null;

	const radarPorPosicion = {
	defensa_central: [
		{ nombre: "Padj Entradas", clave: "percentil_padj_entradas" },
		{ nombre: "Padj Interceptaciones", clave: "percentil_padj_interceptaciones" },
		{ nombre: "Duelos Aéreos", clave: "percentil_duelos_aereos_ganados_90" },
		{ nombre: "Acciones Defensivas", clave: "percentil_acciones_defensivas_realizadas_90" },
		{ nombre: "Duelos Defensivos", clave: "percentil_duelos_defensivos_ganados_90" },
		{ nombre: "Pases Progresivos", clave: "percentil_pases_progresivos_precisos_90" },
		{ nombre: "Pases Largos", clave: "percentil_pases_largos_precisos_90" }
	],

	lateral: [
		{ nombre: "Regates Exitosos", clave: "percentil_regates_exitosos_90" },
		{ nombre: "Centros", clave: "percentil_centros_90" },
		{ nombre: "Duelos Defensivos", clave: "percentil_duelos_defensivos_ganados_90" },
		{ nombre: "Acciones Defensivas", clave: "percentil_acciones_defensivas_realizadas_90" },
		{ nombre: "Pases Progresivos", clave: "percentil_pases_progresivos_precisos_90" },
		{ nombre: "Conducciones", clave: "percentil_carreras_en_progresion_90" }
	],

	mediocentro: [
		{ nombre: "Pases Progresivos", clave: "percentil_pases_progresivos_precisos_90" },
		{ nombre: "Pases Largos", clave: "percentil_pases_largos_precisos_90" },
		{ nombre: "Acciones Ofensivas", clave: "percentil_acciones_de_ataque_exitosas_90" },
		{ nombre: "Duelos Ofensivos", clave: "percentil_duelos_ofensivos_ganados_90" },
		{ nombre: "Intercepciones", clave: "percentil_padj_interceptacion_90" }
	],

	extremo: [
		{ nombre: "Regates Exitosos", clave: "percentil_regates_exitosos_90" },
		{ nombre: "xG", clave: "percentil_x_g_90" },
		{ nombre: "Remates", clave: "percentil_remates_90" },
		{ nombre: "Acciones Ofensivas", clave: "percentil_acciones_de_ataque_exitosas_90" },
		{ nombre: "Desmarques", clave: "percentil_desmarques_90" }
	],

	delantero: [
		{ nombre: "xG", clave: "percentil_x_g_90" },
		{ nombre: "Goles s/p", clave: "percentil_goles_excepto_los_penaltis_90" },
		{ nombre: "Remates", clave: "percentil_remates_90" },
		{ nombre: "Duelos Aéreos", clave: "percentil_duelos_aereos_ganados_90" },
		{ nombre: "Toques en área", clave: "percentil_toques_en_el_area_de_penalti_90" }
	]
};

	const metricasOfensiva = [
	{ nombre: "xG p90", clave: "percentil_x_g_90" },
	{ nombre: "Remates p90", clave: "percentil_remates_90" },
	{ nombre: "Toques en el área p90", clave: "percentil_toques_en_el_area_de_penalti_90" },
	{ nombre: "Goles excepto penales p90", clave: "percentil_goles_excepto_los_penaltis_90" },
	{ nombre: "Regates exitosos p90", clave: "percentil_regates_exitosos_90" },
	{ nombre: "Duelos ofensivos p90", clave: "percentil_duelos_ofensivos_ganados_90" },
	{ nombre: "Acciones ofensivas p90", clave: "percentil_acciones_de_ataque_exitosas_90" },
	{ nombre: "Desmarques p90", clave: "percentil_desmarques_90" },
		{ nombre: "xA p90", clave: "percentil_x_a_90" },
	{ nombre: "Asistencias p90", claves: ["percentil_asistencias_tiro_90", "percentil_asistencias_90"] }
];

	const metricasCreacion = [
	{ nombre: "Construcción de Juego", claves: ["percentil_second_assists_90", "percentil_third_assists_90"] },
	{ nombre: "Jugadas Claves p90", clave: "percentil_jugadas_claves_90" },
	{ nombre: "Centros p90", clave: "percentil_centros_90" },
	{ nombre: "Pases ultimo tercio p90", clave: "percentil_pases_ultimo_tercio_precisos_90" },
	{ nombre: "Pases Progresivos p90", clave: "percentil_pases_progresivos_precisos_90" },
	{ nombre: "Conducciones Progresivas", clave: "percentil_carreras_en_progresion_90" },
	{ nombre: "Pases Largos p90", clave: "percentil_pases_largos_precisos_90" },
	{ nombre: "Pases en Profundidad p90", clave: "percentil_pases_en_profundidad_exitosos_90" }
];

	const metricasFinalizacion = metricasOfensiva.filter(m => [
	"xG p90",
	"Remates p90",
	"Toques en el área p90",
	"Goles excepto penales p90"
].includes(m.nombre));

	const metricasProgresion = metricasCreacion.filter(m => [
	"Pases Progresivos p90",
	"Conducciones Progresivas",
	"Pases Largos p90",
	"Pases en Profundidad p90"
].includes(m.nombre));

	const metricasDefensiva = [

	{ nombre: "Padj entradas p90", clave: "percentil_padj_entradas" },
	{ nombre: "Padj interceptaciones p90", clave: "percentil_padj_interceptaciones" },
	{ nombre: "Duelos Aereos p90", clave: "percentil_duelos_aereos_ganados_90" },
	{ nombre: "Acciones Defensivas realizadas p90", clave: "percentil_acciones_defensivas_realizadas_90" },
	{ nombre: "Tiros bloqueados p90", clave: "percentil_tiros_interceptados_90" },
	{ nombre: "Duelos Defensivos p90", clave: "percentil_duelos_defensivos_ganados_90" }

];

	// Pesos de métricas dentro de cada bloque
	const pesosMetricas = {
		Finalizacion: {
			"xG p90": 0.30,
			"Remates p90": 0.15,
			"Goles excepto penales p90": 0.30,
			"Toques en el área p90": 0.10,
			"Duelos Aereos p90": 0.15
		},
		Creacion: {
			"xA p90": 0.25,
			"Asistencias p90": 0.30,
			"Jugadas Claves p90": 0.20,
			"Pases ultimo tercio p90": 0.15,
			"Construcción de Juego": 0.10
		},
		Ofensiva: {
			"Regates exitosos p90": 0.30,
			"Duelos ofensivos p90": 0.40,
			"Acciones ofensivas p90": 0.10,
			"Desmarques p90": 0.20
		},
		Progresion: {
			"Pases Progresivos p90": 0.40,
			"Conducciones Progresivas": 0.30,
			"Pases Largos p90": 0.20,
			"Pases en Profundidad p90": 0.10
		},
		Defensivo: {
			"Padj entradas p90": 0.15,
			"Padj interceptaciones p90": 0.15,
			"Duelos Aereos p90": 0.20,
			"Duelos Defensivos p90": 0.30,
			"Tiros bloqueados p90": 0.10,
			"Acciones Defensivas realizadas p90": 0.10
		}
	};

	// Ponderaciones de bloques por posición
	const ponderacionesPorPosicion = {
		"defensa_central": {
			Defensivo: 0.60,
			Progresion: 0.25,
			Creacion: 0.15
		},
		"lateral": {
			Defensivo: 0.45,
			Progresion: 0.25,
			Creacion: 0.15,
			Ofensiva: 0.15
		},
		"mediocentro_defensivo": {
			Defensivo: 0.40,
			Progresion: 0.30,
			Creacion: 0.20,
			Ofensiva: 0.10
		},
		"mediocentro": {
			Progresion: 0.25,
			Creacion: 0.30,
			Finalizacion: 0.15,
			Ofensiva: 0.20,
			Defensivo: 0.10
		},
		"mediocentro_ofensivo": {
			Creacion: 0.35,
			Progresion: 0.20,
			Finalizacion: 0.20,
			Ofensiva: 0.25
		},
		"extremo": {
			Ofensiva: 0.40,
			Creacion: 0.25,
			Finalizacion: 0.20,
			Progresion: 0.15
		},
		"delantero": {
			Finalizacion: 0.45,
			Ofensiva: 0.30,
			Creacion: 0.15,
			Progresion: 0.10
		}
	};

	const banderasPorPais = {
		Albania: "al",
		"Antigua and Barbuda": "ag",
		Argentina: "ar",
		Australia: "au",
		Austria: "at",
		Belgium: "be",
		Bolivia: "bo",
		"Burkina Faso": "bf",
		Brazil: "br",
		Brasil: "br",
		Canada: "ca",
		Chile: "cl",
		Colombia: "co",
		"Congo DR": "cd",
		Croatia: "hr",
		Cuba: "cu",
		"Curacao": "cw",
		"Curaçao": "cw",
		"CuraÃ§ao": "cw",
		Cyprus: "cy",
		Ecuador: "ec",
		Estonia: "ee",
		England: "gb-eng",
		Finland: "fi",
		France: "fr",
		Gambia: "gm",
		Germany: "de",
		Ghana: "gh",
		Greece: "gr",
		"Guinea-Bissau": "gw",
		Hungary: "hu",
		Iceland: "is",
		"Isle of Man": "im",
		Italy: "it",
		Jamaica: "jm",
		Japan: "jp",
		Kazakhstan: "kz",
		Kenya: "ke",
		"Korea Republic": "kr",
		Latvia: "lv",
		Mauritania: "mr",
		Mexico: "mx",
		Moldova: "md",
		Netherlands: "nl",
		"New Zealand": "nz",
		Nigeria: "ng",
		"North Macedonia": "mk",
		"Northern Ireland": "gb-nir",
		Norway: "no",
		Panama: "pa",
		Paraguay: "py",
		Peru: "pe",
		Portugal: "pt",
		"Republic of Ireland": "ie",
		Scotland: "gb-sct",
		Serbia: "rs",
		Slovenia: "si",
		"South Africa": "za",
		Spain: "es",
		Sweden: "se",
		Switzerland: "ch",
		Togo: "tg",
		Uganda: "ug",
		"United States": "us",
		Uruguay: "uy",
		Venezuela: "ve",
		Wales: "gb-wls",
		Zambia: "zm",
		Zimbabwe: "zw",
		"Cote d'Ivoire": "ci",
		"Côte d'Ivoire": "ci",
		"CÃ´te d'Ivoire": "ci",
		Denmark: "dk",
		"Czech Republic": "cz"
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

	const imagenPosicionEl = document.getElementById("imagenPosicion");

	const mapaPosicionImagen = [
		{ patron: p => p.includes("extremo") && (p.includes("der") || p.includes("right")),  archivo: "extremo_derecho.png" },
		{ patron: p => p.includes("extremo") && (p.includes("izq") || p.includes("left")),   archivo: "extremo_izquierdo.png" },
		{ patron: p => p.includes("extremo"),                                                 archivo: "extremo_derecho.png" },
		{ patron: p => p.includes("lateral") && (p.includes("der") || p.includes("right")),  archivo: "lateral_derecho.png" },
		{ patron: p => p.includes("lateral") && (p.includes("izq") || p.includes("left")),   archivo: "lateral_izquierdo.png" },
		{ patron: p => p.includes("lateral"),                                                 archivo: "lateral_derecho.png" },
		{ patron: p => p.includes("mediocentro") && (p.includes("def") || p.includes("mcd")), archivo: "mediocentro_defensivo.png" },
		{ patron: p => p.includes("mediocentro") && (p.includes("ofe") || p.includes("mco")), archivo: "mediocentro_ofensivo.png" },
		{ patron: p => p.includes("mediocentro"),                                             archivo: "mediocentro.png" },
		{ patron: p => p.includes("delantero") || p.includes("punta"),                        archivo: "delantero.png" },
		{ patron: p => p.includes("defensa") || p.includes("central"),                        archivo: "defensa.png" }
	];
	
	function obtenerImagenPosicion(posicion) {
		if (!posicion || posicion === "N/D") return "";
		const p = posicion.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
		const entrada = mapaPosicionImagen.find(e => e.patron(p));
		return entrada ? `Imagenes/Posiciones/${entrada.archivo}` : "";
	}

	function actualizarImagenPosicion(jugador) {
		if (!imagenPosicionEl) return;
		const posicion = jugador ? obtenerPosicion(jugador) : "";
		const url = obtenerImagenPosicion(posicion);
		if (!url) {
			imagenPosicionEl.hidden = true;
			imagenPosicionEl.removeAttribute("src");
			return;
		}
		imagenPosicionEl.src = url;
		imagenPosicionEl.alt = posicion;
		imagenPosicionEl.hidden = false;
	}

	function normalizarTexto(valor) {
		return String(valor || "")
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.trim();
	}

	function obtenerVectorPercentiles(registro, claves) {
		return claves
			.map(clave => Number(registro?.[clave]))
			.map(valor => (Number.isFinite(valor) ? valor : NaN));
	}

	function similitudCoseno(vectorA, vectorB) {
		let productoPunto = 0;
		let normaA = 0;
		let normaB = 0;
		let dimensionesValidas = 0;

		for (let i = 0; i < vectorA.length; i += 1) {
			const a = vectorA[i];
			const b = vectorB[i];
			if (!Number.isFinite(a) || !Number.isFinite(b)) continue;

			productoPunto += a * b;
			normaA += a * a;
			normaB += b * b;
			dimensionesValidas += 1;
		}

		if (dimensionesValidas < 3 || normaA === 0 || normaB === 0) return null;
		return productoPunto / (Math.sqrt(normaA) * Math.sqrt(normaB));
	}

	function mapearPosicionACategoria(posicion) {
		const pos = normalizarTexto(posicion);
		
		if (pos.includes("defensa") && pos.includes("central")) return "defensa_central";
		if (pos.includes("lateral")) return "lateral";
		if (pos.includes("mediocentro") && pos.includes("defensivo")) return "mediocentro_defensivo";
		if (pos.includes("mediocentro") && pos.includes("ofensivo")) return "mediocentro_ofensivo";
		if (pos.includes("mediocentro")) return "mediocentro";
		if (pos.includes("extremo")) return "extremo";
		if (pos.includes("delantero") || pos.includes("punta")) return "delantero";
		
		// Default a mediocentro si no coincide
		return "mediocentro";
	}

	function calcularScoreBloque(registro, bloque) {
		const pesos = pesosMetricas[bloque];
		if (!pesos) return 0;
		
		let scoreTotal = 0;
		let pesoTotal = 0;
		
		Object.entries(pesos).forEach(([nombreMetrica, peso]) => {
			const metricasBloque = bloque === "Finalizacion" ? metricasFinalizacion :
									bloque === "Creacion" ? metricasCreacion :
									bloque === "Ofensiva" ? metricasOfensiva :
									bloque === "Progresion" ? metricasProgresion :
									bloque === "Defensivo" ? metricasDefensiva : [];
			
			const metrica = metricasBloque.find(m => m.nombre === nombreMetrica);
			if (!metrica) return;
			
			const percentil = calcularPercentilMetrica(metrica, registro);
			if (Number.isFinite(percentil)) {
				scoreTotal += percentil * peso;
				pesoTotal += peso;
			}
		});
		
		return pesoTotal > 0 ? scoreTotal / pesoTotal : 0;
	}

	function calcularScoreFinal(registro, posicion) {
		const categoriaPosicion = mapearPosicionACategoria(posicion);
		const ponderaciones = ponderacionesPorPosicion[categoriaPosicion] || ponderacionesPorPosicion["mediocentro"];
		
		let scoreFinal = 0;
		
		const bloques = ["Finalizacion", "Creacion", "Ofensiva", "Progresion", "Defensivo"];
		bloques.forEach(bloque => {
			const scoreBloque = calcularScoreBloque(registro, bloque);
			const ponderacion = ponderaciones[bloque] || 0;
			scoreFinal += scoreBloque * ponderacion;
		});
		
		return scoreFinal;
	}

	function renderizarSimilares(items) {
		if (!listaSimilares) return;
		listaSimilares.innerHTML = "";

		if (!items.length) {
			const item = document.createElement("li");
			item.textContent = "Sin datos suficientes para calcular similitud.";
			listaSimilares.appendChild(item);
			return;
		}

		items.forEach((jugador, index) => {
			const li = document.createElement("li");

			const nombre = document.createElement("span");
			nombre.className = "similares-nombre";
			nombre.textContent = `${index + 1}. ${jugador.jugador}`;

			const score = document.createElement("span");
			score.className = "similares-score";
			score.textContent = `${(jugador.similitud * 100).toFixed(1)}%`;

			li.appendChild(nombre);
			li.appendChild(score);
			listaSimilares.appendChild(li);
		});
	}

	function actualizarSimilares(nombreSeleccionado, jugadorReferencia) {
		if (!listaSimilares) return;

		const target = jugadoresLiga.find(item => item.jugador === nombreSeleccionado);
		if (!target) {
			renderizarSimilares([]);
			return;
		}

		const posicionTarget = normalizarTexto(target.posicion_1 || jugadorReferencia?.posicion_1 || obtenerPosicion(jugadorReferencia));
		if (!posicionTarget) {
			renderizarSimilares([]);
			return;
		}

		const clavesPercentiles = Object.keys(target).filter(clave => clave.startsWith("percentil_"));
		if (!clavesPercentiles.length) {
			renderizarSimilares([]);
			return;
		}

		const vectorTarget = obtenerVectorPercentiles(target, clavesPercentiles);

		const similares = jugadoresLiga
			.filter(item => item.jugador && item.jugador !== nombreSeleccionado)
			.filter(item => normalizarTexto(item.posicion_1) === posicionTarget)
			.map(item => {
				const vectorItem = obtenerVectorPercentiles(item, clavesPercentiles);
				const score = similitudCoseno(vectorTarget, vectorItem);
				return { jugador: item.jugador, similitud: score };
			})
			.filter(item => Number.isFinite(item.similitud))
			.sort((a, b) => b.similitud - a.similitud)
			.slice(0, 10);

		renderizarSimilares(similares);
	}

	let jugadoresLiga = [];
	let jugadoresDatabase = [];

	function obtenerNacionalidad(jugador) {
		const pasaportePrincipal = jugador?.pasaporte?.split(",")[0]?.trim();

		return pasaportePrincipal || "N/D";
	}

	function obtenerBanderaUrl(jugador) {
		const nacionalidad = obtenerNacionalidad(jugador);
		const codigoBandera = banderasPorPais[nacionalidad];

		if (!codigoBandera) return "";

		return `https://flagcdn.com/w40/${codigoBandera}.png`;
	}

	function actualizarBandera(jugador) {
		if (!banderaNacionalidad) return;

		const urlBandera = jugador ? obtenerBanderaUrl(jugador) : "";
		const nacionalidad = jugador ? obtenerNacionalidad(jugador) : "Nacionalidad";

		if (!urlBandera) {
			banderaNacionalidad.hidden = true;
			banderaNacionalidad.removeAttribute("src");
			banderaNacionalidad.alt = "Bandera no disponible";
			return;
		}

		banderaNacionalidad.src = urlBandera;
		banderaNacionalidad.alt = `Bandera de ${nacionalidad}`;
		banderaNacionalidad.hidden = false;
	}

	function obtenerClub(jugador) {
		return (
			jugador?.equipo_periodo ||
			jugador?.equipo ||
			"N/D"
		);
	}

	function obtenerEscudoUrl(liga, jugador) {
		if (!jugador) return "";

		const club = obtenerClub(jugador);
		let archivoEscudo = "";
		let rutaBase = "";

		if (liga === "peru") {
			archivoEscudo = escudosPeruPorClub[club];
			rutaBase = "Imagenes/Escudos/peru";
		}

		if (!archivoEscudo) return "";

		return `${rutaBase}/${archivoEscudo}`;
	}

	function obtenerEscudoUrlsAlternativas(liga, jugador) {
		if (!jugador) return [];

		const club = obtenerClub(jugador);

		if (liga === "peru") {
			const archivo = escudosPeruPorClub[club];
			if (!archivo) return [];

			return [
				`Imagenes/Escudos/peru/${archivo}`,
				`Imagenes/Escudos/${archivo}`
			];
		}

		return [];
	}

	function obtenerPosicion(jugador) {
		return (
			jugador?.posicion_1 ||
			jugador?.posicion_2 ||
			"N/D"
		);
	}

	function obtenerEdad(jugador) {
		return jugador?.edad ?? "N/D";
	}

	function obtenerMinutos(jugador) {
		return jugador?.minutos_jugados ?? "N/D";
	}

	function obtenerValorMercado(jugador) {
		const valor = jugador?.valor_de_mercado_transfermarkt;
		
		if (!valor || valor === "N/D") return "N/D";
		
		const numeroValor = parseInt(valor, 10);
		
		if (isNaN(numeroValor) || numeroValor === 0) return "N/D";
		
		if (numeroValor >= 1000000) {
			return (numeroValor / 1000000).toFixed(1) + " M";
		} else if (numeroValor >= 1000) {
			return (numeroValor / 1000).toFixed(0) + " K";
		}
		
		return numeroValor.toString();
	}

	function normalizarPercentil(valor) {
		const numero = Number(valor);

		if (!Number.isFinite(numero)) return null;

		const porcentaje = numero <= 1 ? numero * 100 : numero;
		return Math.max(0, Math.min(100, porcentaje));
	}

	function calcularPercentilMetrica(metrica, jugador) {
		if (Array.isArray(metrica.claves) && metrica.claves.length > 0) {
			const valores = metrica.claves
				.map(clave => normalizarPercentil(jugador?.[clave]))
				.filter(valor => valor !== null);

			if (!valores.length) return null;
			const promedio = valores.reduce((acc, valor) => acc + valor, 0) / valores.length;
			return normalizarPercentil(promedio);
		}

		return normalizarPercentil(jugador?.[metrica.clave]);
	}

	function interpolarColor(colorInicio, colorFin, t) {
		const r = Math.round(colorInicio.r + (colorFin.r - colorInicio.r) * t);
		const g = Math.round(colorInicio.g + (colorFin.g - colorInicio.g) * t);
		const b = Math.round(colorInicio.b + (colorFin.b - colorInicio.b) * t);

		return `rgb(${r}, ${g}, ${b})`;
	}

	function obtenerColorBarraPercentil(percentil) {
		const rojoOscuro = { r: 122, g: 0, b: 0 };      // #7a0000
		const naranja = { r: 245, g: 158, b: 11 };      // #f59e0b
		const verdeClaro = { r: 52, g: 211, b: 153 };   // #34d399

		if (percentil === null) return "#7a0000";

		if (percentil <= 50) {
			return interpolarColor(rojoOscuro, naranja, percentil / 50);
		}

		return interpolarColor(naranja, verdeClaro, (percentil - 50) / 50);
	}

	function actualizarBloqueMetricas(contenedor, metricas, jugadorPercentiles) {
	if (!contenedor) return;

	contenedor.innerHTML = "";

	const tabla = document.createElement("table");
	tabla.className = "tablaMetricasFM";

	const tbody = document.createElement("tbody");

	metricas.forEach(metrica => {

		const percentil = calcularPercentilMetrica(metrica, jugadorPercentiles);

		const fila = document.createElement("tr");
		fila.className = "filaMetricaFM";

		const celdaNombre = document.createElement("td");
		celdaNombre.className = "metricaNombreFM";
		celdaNombre.textContent = metrica.nombre;

		const celdaValor = document.createElement("td");
		celdaValor.className = "metricaValorFM";

		if (percentil === null) {
			celdaValor.textContent = "N/D";
			celdaValor.style.backgroundColor = "#2b2b2b";
		} else {
			celdaValor.textContent = Math.round(percentil);
			celdaValor.style.color = obtenerColorBarraPercentil(percentil);
		}

		fila.appendChild(celdaNombre);
		fila.appendChild(celdaValor);

		tbody.appendChild(fila);
	});

	tabla.appendChild(tbody);
	contenedor.appendChild(tabla);
}

function obtenerMetricasRadarParaPosicion(posicion) {
	const categoria = mapearPosicionACategoria(posicion);
	const lista = radarPorPosicion[categoria];
	if (Array.isArray(lista) && lista.length) return lista;
	// fallback: usar mediocentro o la primera entrada disponible
	if (Array.isArray(radarPorPosicion.mediocentro) && radarPorPosicion.mediocentro.length) return radarPorPosicion.mediocentro;
	const primeras = Object.values(radarPorPosicion).find(v => Array.isArray(v) && v.length);
	return primeras || [];
}

function crearRadarFicha() {
	if (!radarCanvas || !window.Chart) return;
	if (window.ChartDataLabels) Chart.register(ChartDataLabels);

	radarChartFicha = new Chart(radarCanvas, {
		type: "radar",
		data: {
			labels: [],
			datasets: []
		},
		options: {
			responsive: true,
			scales: {
				r: {
					min: 0,
					max: 100,
					ticks: { display: false },
					pointLabels: { color: "white", font: { size: 12 } },
					grid: { color: "#334155" }
				}
			},
			plugins: {
				legend: { display: false },
				datalabels: {
					formatter: value => Math.round(value),
					color: "#000000",
					font: { weight: "bold", size: 10 },
					backgroundColor: "rgba(16,185,129,0.9)",
					borderRadius: 50,
					padding: 6
				}
			}
		}
	});
}

function actualizarRadarFicha(jugadorPercentiles) {
	if (!radarChartFicha) return;

	const posicion = obtenerPosicion(jugadorPercentiles) || "";
	const metricas = obtenerMetricasRadarParaPosicion(posicion);

	if (!metricas.length) {
		// limpiar
		radarChartFicha.data.labels = [];
		radarChartFicha.data.datasets = [];
		radarChartFicha.update();
		return;
	}

	const valores = metricas.map(m => normalizarPercentil(jugadorPercentiles?.[m.clave]) || 0);

	radarChartFicha.data.labels = metricas.map(m => m.nombre);
	radarChartFicha.data.datasets = [
		{
			label: jugadorPercentiles?.jugador || "Jugador",
			data: valores,
			borderColor: "#10b981",
			backgroundColor: "rgba(16,185,129,0.25)",
			pointBackgroundColor: "#10b981",
			pointBorderColor: "#0f172a",
			borderWidth: 2,
			fill: true
		}
	];

	radarChartFicha.update();
}

function actualizarOfensiva(jugadorPercentiles) {

	actualizarBloqueMetricas(
		ofensivaMetricas,
		metricasOfensiva,
		jugadorPercentiles
	);
}

function actualizarCreacion(jugadorPercentiles) {

	actualizarBloqueMetricas(
		creacionMetricas,
		metricasCreacion,
		jugadorPercentiles
	);
}

function actualizarDefensiva(jugadorPercentiles) {
	actualizarBloqueMetricas(defensivaMetricas, metricasDefensiva, jugadorPercentiles);
}

function actualizarFinalizacion(jugadorPercentiles) {
	// No se usa en la vista actual, pero se define para evitar errores si se invoca en rutas de código sin jugador.
}

function actualizarProgresion(jugadorPercentiles) {
	// No se usa en la vista actual, pero se define para evitar errores si se invoca en rutas de código sin jugador.
}

function actualizarEscudo(liga, jugador) {
		if (!escudoClub) return;

		const urlEscudo = obtenerEscudoUrl(liga, jugador);
		const urlsAlternativas = obtenerEscudoUrlsAlternativas(liga, jugador);
		const club = jugador ? obtenerClub(jugador) : "Club";

		if (!urlEscudo && !urlsAlternativas.length) {
			escudoClub.hidden = true;
			escudoClub.removeAttribute("src");
			escudoClub.alt = "Escudo no disponible";
			return;
		}

		const candidatos = urlsAlternativas.length ? urlsAlternativas : [urlEscudo];
		let indice = 0;

		escudoClub.onerror = () => {
			indice += 1;
			if (indice >= candidatos.length) {
				escudoClub.hidden = true;
				escudoClub.removeAttribute("src");
				escudoClub.alt = "Escudo no disponible";
				return;
			}
			escudoClub.src = candidatos[indice];
		};

		escudoClub.onload = () => {
			escudoClub.hidden = false;
		};

		escudoClub.src = candidatos[indice];
		escudoClub.alt = `Escudo de ${club}`;
	}

	function actualizarFichaJugador(nombre) {
		const ligaSeleccionada = "peru";
		const jugadorPercentiles = jugadoresLiga.find(item => item.jugador === nombre);
		const jugadorDatabase = jugadoresDatabase.find(item => item.jugador === nombre);
		const jugador = jugadorDatabase || jugadorPercentiles;

		if (!jugador) {
			if (nombreJugador) nombreJugador.textContent = "NombreJugador";
			if (nacionalidadJugador) nacionalidadJugador.textContent = "Nacionalidad";
			actualizarBandera(null);
			actualizarEscudo(ligaSeleccionada, null);
			if (clubJugador) clubJugador.textContent = "Club";
			if (posicionJugador) posicionJugador.textContent = "N/D";
			if (edadJugador) edadJugador.textContent = "N/D";
			if (minutosJugador) minutosJugador.textContent = "N/D";
			if (valorMercadoValor) valorMercadoValor.textContent = "N/D";
			if (scoreFinalValor) scoreFinalValor.textContent = "N/D";
			actualizarImagenPosicion(null);
			renderizarSimilares([]);
			actualizarFinalizacion(null);
			actualizarOfensiva(null);
			actualizarCreacion(null);
			actualizarProgresion(null);
			actualizarDefensiva(null);
			return;
		}

		if (nombreJugador) nombreJugador.textContent = jugador.jugador || "NombreJugador";
		if (nacionalidadJugador) nacionalidadJugador.textContent = obtenerNacionalidad(jugador);
		actualizarBandera(jugador);
		if (clubJugador) clubJugador.textContent = obtenerClub(jugador);
		actualizarEscudo(ligaSeleccionada, jugador);
		if (posicionJugador) posicionJugador.textContent = obtenerPosicion(jugador);
		if (edadJugador) edadJugador.textContent = obtenerEdad(jugador);
		if (minutosJugador) minutosJugador.textContent = obtenerMinutos(jugador);
		if (valorMercadoValor) valorMercadoValor.textContent = obtenerValorMercado(jugador);
		if (scoreFinalValor) scoreFinalValor.textContent = (calcularScoreFinal(jugadorPercentiles || jugador, obtenerPosicion(jugador)) / 10).toFixed(1);
		actualizarImagenPosicion(jugador);
		actualizarSimilares(nombre, jugador);
		actualizarOfensiva(jugadorPercentiles || jugador);
		actualizarCreacion(jugadorPercentiles || jugador);
		actualizarDefensiva(jugadorPercentiles || jugador);
		actualizarRadarFicha(jugadorPercentiles || jugador);
	}

	function poblarSelectorJugadores() {
		if (!selectorJugador) return;

		if (selectorJugador.tomselect) {
			selectorJugador.tomselect.destroy();
		}

		selectorJugador.innerHTML = "";

		if (!jugadoresLiga.length) {
			const vacio = document.createElement("option");
			vacio.value = "";
			vacio.textContent = "Sin jugadores disponibles";
			selectorJugador.appendChild(vacio);
			actualizarFichaJugador("");
		} else {
			const jugadoresOrdenados = [...jugadoresLiga]
				.filter(j => !!j.jugador)
				.sort((a, b) => String(a.jugador).localeCompare(String(b.jugador)));

			jugadoresOrdenados.forEach(jugador => {
				const opcion = document.createElement("option");
				opcion.value = jugador.jugador;
				opcion.textContent = jugador.jugador;
				selectorJugador.appendChild(opcion);
			});

			actualizarFichaJugador(selectorJugador.value);
		}

		new TomSelect("#selectorJugadorFicha", {
			create: false,
			maxItems: 1,
			maxOptions: null,
			sortField: { field: "text", direction: "asc" },
			dropdownParent: "body",
			placeholder: "Buscar jugador...",
			onChange: function(value) {
				actualizarFichaJugador(value);
			}
		});
	}

	function cargarJugadores() {
		Promise.all([
			fetch(rutaPercentiles).then(response => response.json()),
			fetch(rutaDatabase).then(response => response.json())
		])
			.then(([percentiles, database]) => {
				jugadoresLiga = Array.isArray(percentiles) ? percentiles : [];
				jugadoresDatabase = Array.isArray(database) ? database : [];
				poblarSelectorJugadores();
			})
			.catch(error => {
				console.error("Error cargando datos:", error);
				jugadoresLiga = [];
				jugadoresDatabase = [];
				poblarSelectorJugadores();
			});
	}

	async function exportarFichaPDF() {
		if (!bloqueExportableFicha || !window.html2canvas || !window.jspdf) {
			alert("No se pudo iniciar la exportacion PDF.");
			return;
		}

		const nombre = (nombreJugador?.textContent || "jugador").trim() || "jugador";
		const nombreArchivo = `ficha_${nombre.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

		btnExportarFicha.disabled = true;
		btnExportarFicha.textContent = "Generando...";

		try {
			const canvas = await window.html2canvas(bloqueExportableFicha, {
				scale: 2,
				useCORS: true,
				backgroundColor: "#000000"
			});

			const imgData = canvas.toDataURL("image/png");
			const { jsPDF } = window.jspdf;

			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4"
			});

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const margin = 8;
			const printableWidth = pageWidth - margin * 2;
			const printableHeight = pageHeight - margin * 2;

			// Escala para ajustar al ancho A4 y divide el contenido en varias paginas.
			const imgWidthMm = printableWidth;
			const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

			let heightLeft = imgHeightMm;
			let positionY = margin;

			pdf.addImage(imgData, "PNG", margin, positionY, imgWidthMm, imgHeightMm, undefined, "FAST");
			heightLeft -= printableHeight;

			while (heightLeft > 0) {
				pdf.addPage("a4", "portrait");
				positionY = margin - (imgHeightMm - heightLeft);
				pdf.addImage(imgData, "PNG", margin, positionY, imgWidthMm, imgHeightMm, undefined, "FAST");
				heightLeft -= printableHeight;
			}

			pdf.save(nombreArchivo);
		} catch (error) {
			console.error("Error al exportar PDF:", error);
			alert("Ocurrio un error al generar el PDF.");
		} finally {
			btnExportarFicha.disabled = false;
			btnExportarFicha.textContent = "Exportar PDF";
		}
	}

	btnExportarFicha?.addEventListener("click", exportarFichaPDF);

	crearRadarFicha();
	cargarJugadores();

});

