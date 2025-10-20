/* global, page_globals, SHOW_DEBUG, event_manager, common, L */
/*eslint no-undef: "error"*/

"use strict";



function map_factory() {

	this.map_container  = [];
	this.map_position   = null;
	this.source_maps    = [];
	this.map = null
	this.map_node = null
	this.result = null
	this.findspot = false
	this.unique = false
	this.zoom = 8
	this.DEV_MODE = false;


	this.obtain_location = function(georef){

		for (let index = 0; index < georef.layer_data.length; index++) {
				
			if (georef.layer_data[index].type == "Point") {
				
				return [georef.layer_data[index].lat,georef.layer_data[index].lon,"Point"]
			}else{

				let lat = 0;
				let lon = 0;

				for (let j = 0; j < georef.layer_data[index].lon.length; j++) {
					lon += georef.layer_data[index].lon[j][0];
					lat += georef.layer_data[index].lon[j][1];
				}

				return [lat/georef.layer_data[index].lon.length,lon/georef.layer_data[index].lon.length,"Polygon"]
			}
			
		}


	}


	this.init = function(options) {

		const self = this;
		self.map_node  = options.map_node || null;
		self.map_container  = options.map_container  || null;
		self.map_position   = options.map_position   || [36.5297, -6.2924]; // Cádiz por defecto
		self.popup_options  = options.popup_options  || {};
		self.source_maps    = options.source_maps    || [];
		self.result = options.result || null;
		self.findspot = options.findspot || false;
		self.unique = options.unique || false;
		self.zoom = options.zoom || 8;
		self.DEV_MODE = options.DEV_MODE || false;
		// Asegurarte de obtener el elemento DOM
		const containerElement = typeof self.map_container === "string"
			? document.getElementById(self.map_container)
			: self.map_container;

		if (!containerElement) {
			console.error("Contenedor del mapa no válido.");
			return;
		}

		// Crear el mapa con Leaflet centrado en Cádiz
		self.map = L.map(containerElement, { preferCanvas: true }).setView(self.map_position, self.zoom);
		self.add_layer_control(self.map,self.source_maps)

		if(!self.findspot){

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(self.map);
			L.tileLayer("https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png", {}).addTo(self.map);		
		}else{

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(self.map);
			L.tileLayer("https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png").addTo(self.map);		
		}
		
			const clusters = self.add_markers(self.map,self.result,self.map_node)
			self.create_legend(self.map,clusters)
		

		setTimeout(() => {
		self.map.invalidateSize();
		}, 200);

		return self.map;

	},

	this.add_layer_control = function(map, source_maps) {


		if (source_maps.length > 0) {
			const baseLayers = {};
			source_maps.forEach(layer => {
				// Suponiendo que layer tiene 'name', 'url' y 'options'
				baseLayers[layer.name] = L.tileLayer(layer.url, layer.options);
			});

			L.control.layers(baseLayers).addTo(map);
		}
	};


		this.add_markers = function(map,data,map_node){

			// Clústeres separados por tipo
			const clusterHallazgos = L.markerClusterGroup({
				iconCreateFunction: function (cluster) {
					return L.divIcon({
					html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
					className: "marker-cluster", 
					iconSize: [40, 40]
					});
				}
				});
			const clusterCecas = L.markerClusterGroup({
				iconCreateFunction: function (cluster) {
					return L.divIcon({
					html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
					className: "marker-cluster", 
					iconSize: [40, 40]
					});
				}
				});
			const clusterComplejos = L.markerClusterGroup({
				iconCreateFunction: function (cluster) {
					return L.divIcon({
					html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
					className: "marker-cluster", 
					iconSize: [40, 40]
					});
				}
				});

			// --- Iconos ---

			const iconoCeca = L.icon({
				iconUrl: this.unique ? '../tpl/assets/images/map/IMG_8276.png': './tpl/assets/images/map/IMG_8276.png',
				iconSize: [32, 32], 
				iconAnchor: [16, 32], 
				popupAnchor: [0, -32] 
			});

			const iconoComplejo = L.icon({
				iconUrl: this.unique ? '../tpl/assets/images/map/IMG_5962.png': './tpl/assets/images/map/IMG_5962.png',
				iconSize: [32, 32], 
				iconAnchor: [16, 32], 
				popupAnchor: [0, -32] 
			});

			const iconoHallazgo = L.icon({
				iconUrl: this.unique ? '../tpl/assets/images/map/orange.png' : './tpl/assets/images/map/orange.png',
				iconSize: [32, 32], 
				iconAnchor: [16, 32], 
				popupAnchor: [0, -32] 
			});

			// --- Hallazgos ---
			for (let index = 0; index < data.hallazgos.datos.length; index++) {

				let data_hallazgo = {
					lat : "",
					lon : ""
				};

				
				const georef_hallazgo = JSON.parse(data.hallazgos.datos[index].georef)
				
				if(georef_hallazgo){

					
					const location = this.obtain_location(georef_hallazgo[0]);
					data_hallazgo.lat = location[0]
					data_hallazgo.lon = location[1]
				
				}else{

					try {

						data_hallazgo = JSON.parse(data.hallazgos.datos[index].map)

					} catch (error) {

						data_hallazgo = data.hallazgos.datos[index].map

					}

				}
				
				if (data_hallazgo != null) {
					const markerHallazgo = L.marker([data_hallazgo.lat, data_hallazgo.lon], { icon: iconoHallazgo })
						.bindPopup(`<b>Hallazgo</b><br>${data.hallazgos.datos[index].name}`)
						.on("click", async function () {
							const monedas = await map_node.cargarMonedasHallazgos(data.hallazgos.datos[index].name);
							while (map_node.rows_container.hasChildNodes()) {
								map_node.rows_container.removeChild(map_node.rows_container.lastChild);
							}
							map_node.render_rows(data.hallazgos.datos[index], monedas.result);
							this.openPopup();
						});
					clusterHallazgos.addLayer(markerHallazgo);
				}
			}

			// --- Cecas ---
			for (let index = 0; index < data.cecas.datos.length; index++) {

				let rawMap = data.cecas.datos[index].map;
				let data_ceca;

					// Comprobamos si map es string o ya es objeto
					if (typeof rawMap === "string") {
						try {
							data_ceca = JSON.parse(rawMap);
						} catch (e) {
							console.error("El valor no es un JSON válido:", rawMap, e);
							continue; // saltamos este índice si falla
						}
					} else {
						data_ceca = rawMap;
					}
				if (data_ceca != null && data_ceca.lat !== undefined && data_ceca.lon !== undefined) {
					const markerCeca = L.marker([data_ceca.lat, data_ceca.lon], { icon: iconoCeca })
						.bindPopup(`<b>Ceca</b><br>${data.cecas.datos[index].name}`)
						.on("click", async function () {
							const monedas = await map_node.cargarMonedasCecas(data.cecas.datos[index].name);
							while (map_node.rows_container.hasChildNodes()) {
								map_node.rows_container.removeChild(map_node.rows_container.lastChild);
							}
							map_node.render_rows(data.cecas.datos[index], monedas.result);
							this.openPopup();
						});
					clusterCecas.addLayer(markerCeca);
				}
			}

			// --- Complejos ---
			if (data.complejos.datos != null) {
				for (let index = 0; index < data.complejos.datos.length; index++) {
					let data_complejos = null;
					try {
						data_complejos = JSON.parse(data.complejos.datos[index].map);
					} catch (error) {
						data_complejos = data.complejos.datos[index].map;
					}

					if (data_complejos != null) {
						const markerComplejo = L.marker([data_complejos.lat, data_complejos.lon], { icon: iconoComplejo })
							.bindPopup(`<b>Complejo</b><br>${data.complejos.datos[index].name}`)
							.on("click", async function () {
								const monedas = await map_node.cargarMonedasComplejos(data.complejos.datos[index].name);
								while (map_node.rows_container.hasChildNodes()) {
									map_node.rows_container.removeChild(map_node.rows_container.lastChild);
								}
								map_node.render_rows(data.complejos.datos[index], monedas.result);
								this.openPopup();
							});
						clusterComplejos.addLayer(markerComplejo);
					}
				}
			}

			// --- Añadir clusters al mapa ---
			map.addLayer(clusterHallazgos);
			map.addLayer(clusterCecas);
			map.addLayer(clusterComplejos);

			const clusters = {clusterHallazgos ,clusterCecas ,clusterComplejos};
			return clusters;
		};

		this.create_legend = function(map,clusters){

			

			L.control.Legend({
			position: "bottomleft",
			collapsed: false,
			title: "Leyenda",
			columns:2,
			legends: [
				{
				label: "Ceca",
				type: "image",
				url: this.unique ? '../tpl/assets/images/map/IMG_8276.png' : './tpl/assets/images/map/IMG_8276.png',
				layers: clusters.clusterCecas
				},
				{
				label: "Hallazgo",
				type: "image",
				url: this.unique ? '../tpl/assets/images/map/orange.png' : './tpl/assets/images/map/orange.png',
				layers: clusters.clusterHallazgos
				},
				{
				label: "Complejo",
				type: "image",
				url: this.unique ? '../tpl/assets/images/map/IMG_5962.png' : './tpl/assets/images/map/IMG_5962.png',
				layers: clusters.clusterComplejos
				}
			]
			}).addTo(map);

// Grupo para guardar lo dibujado
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Función para cargar rutas desde cache
function cargarRutasCache() {
    const rutasCache = localStorage.getItem("rutas");
    if (rutasCache) {
		console.log("RUTAS CACHE", rutasCache)
        const data = JSON.parse(rutasCache);
        L.geoJSON(data, {
            style: function(feature) {
                return { color: feature.properties.color || "blue", weight: 6, dashArray: "5,5" };
            }
        }).eachLayer(layer => drawnItems.addLayer(layer));
    } else {
        console.log("No hay rutas en cache aún.");
    }
}

	// Llamar a la función al inicio
	cargarRutasCache();


	// Control de dibujo: todas las polilíneas verdes y grosor 6
	if (this.DEV_MODE) {

    const drawControl = new L.Control.Draw({
        draw: {
            polyline: {
                shapeOptions: { color: "green", weight: 2 }, // color y grosor
                repeatMode: false // dibuja una ruta a la vez
            },
            polygon: false,
            rectangle: false,
            circle: false,
            marker: false
        },
			edit: { featureGroup: drawnItems }
	});

		map.addControl(drawControl);

		map.on(L.Draw.Event.CREATED, function(e) {
			const layer = e.layer;
			// Guardar color en propiedades para luego exportar
			layer.feature = layer.feature || { type: "Feature", properties: {} };
			layer.feature.properties.color = "green";
			drawnItems.addLayer(layer);
		});

		// Botón “Guardar” dentro del mapa (ahora guarda en cache)
		const GuardarControl = L.Control.extend({
			options: { position: 'topleft' },
			onAdd: function(map) {
				const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
				container.style.backgroundColor = 'white';
				container.style.padding = '5px';
				container.style.cursor = 'pointer';
				container.innerHTML = '💾 Guardar';
				container.onclick = function() {
					// Tomamos todas las capas y creamos un solo FeatureCollection
					const geojsonData = drawnItems.toGeoJSON();
					localStorage.setItem("rutas", JSON.stringify(geojsonData));
					alert('Rutas guardadas en cache correctamente');
					};
				return container;
				}
			});
		map.addControl(new GuardarControl());
		}
			

	}





		this.move_map_to_point = function(location){
			this.map.setView([location.lat, location.lon], 14);

		};


}//end map_factory
