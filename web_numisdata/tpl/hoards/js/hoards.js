/*global tstring, hoards_row_fields, SHOW_DEBUG, common, page, event_manager, data_manager, list_factory, form_factory */
/*eslint no-undef: "error"*/

"use strict";



var hoards =  {



	/**
	* VARS
	*/
		form			: null,
		pagination		: null,
		list			: null,
		form_node		: null,
		// DOM items ready from page html
		form_container	: null,
		rows_container	: null,
		table			: null,
		button_atras	: null,
		button_adelante	: null,

	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container
			self.rows_container	= options.rows_container
			self.table			= options.table // hoards | findspots
		// form
			self.form		= new form_factory() // obtener operaciones para crear formulario
			const form_node	= self.render_form() // creacion del formulario para pasarlo a js
			self.form_container.appendChild(form_node)

		// pagination
			self.pagination = {
				total	: null,
				limit	: 15,
				offset	: 0,
				n_nodes	: 8
			}

		// events
			event_manager.subscribe('paginate', paginate)
			function paginate(offset) {
				// updates pagination.offset
				self.pagination.offset = offset
				// submit again
				self.form_submit()
			}

		// first list
			self.form_submit()

		return true
	},//end set_up



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this
		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-row fields",
			parent 			: fragment
		})

		/* // section_id
			self.form.item_factory({
				id			: "section_id",
				name		: "section_id",
				label		: tstring.id || "ID",
				q_column	: "section_id",
				eq			: "=",
				eq_in		: "",
				eq_out		: "",
				parent		: form_row
			})
 */


		 // global_search
			self.form.item_factory({
				id 			: "global_search",
				name 		: "global_search",
				label		: tstring.global_search || "global_search",
				q_column 	: "name",
				eq 			: "LIKE",
				eq_in 		: "%",
				eq_out 		: "%",
				// q_table 	: "mints",
				class_name	: 'global_search',
				parent		: form_row,
				callback	: function(form_item) {

					const node_input = form_item.node_input
					let autocomplete_initialized = false

					node_input.addEventListener("input", function() {
					const value = node_input.value.trim()

					if (value.length >= 3) {
						if (!autocomplete_initialized) {
							// activar autocomplete solo cuando hay 3+ letras
							self.form.activate_autocomplete({
								form_item	: form_item,
								table		: 'findspots',
								parent_in	: true,
								global_search : true
							})
							autocomplete_initialized = true
						}
						// refrescar resultados
						node_input.dispatchEvent(new Event("keyup"))
					} else {
						// menos de 3 letras → eliminar autocomplete
						if (autocomplete_initialized) {
							// destruir completamente el widget
							$(node_input).autocomplete("destroy")
							autocomplete_initialized = false
						}
					}
				})



					const button_info = common.create_dom_element({
						element_type	: "div",
						class_name		: "search_operators_info",
						parent			: node_input.parentNode
					})

					let operators_info
					button_info.addEventListener('click', function(event) {
						event.stopPropagation()
						if (operators_info) {
							operators_info.remove()
							operators_info = null
							return
						}
						operators_info = self.form.full_text_search_operators_info()
						node_input.parentNode.appendChild(operators_info)
					})

					window.addEventListener('click', function(e){
						if (operators_info && !node_input.contains(e.target)){
							// Clicked outside the box
							operators_info.remove()
							operators_info = null
						}
					})




				}
			}) 

		// name
			self.form.item_factory({
				id			: "name",
				name		: "name",
				label		: "Toponimia actual" || "Name",
				q_column	: "name",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='findspots' // hoards | findspots
						? 'findspots'
						: 'hoards'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table,
						parent_in	: true 
					})
				}
			})

		// place
			self.form.item_factory({
				id			: "place",
				name		: "place",
				label		: "Toponomia histórica" || "Place",
				q_column	: "place",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='findspots' // hoards | findspots
						? 'findspots'
						: 'hoards'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
					})
				}
			})
		// typology
			self.form.item_factory({
				id			: "typology",
				name		: "typology",
				label		: tstring.typology || "Typology",
				q_column	: "typology",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='publications' // hoards | findspots
						? 'publications'
						: 'publications'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
					})
				}
			})
		// indexation
			self.form.item_factory({
				id			: "indexation",
				name		: "indexation",
				label		: tstring.indexation || "Indexation",
				q_column	: "indexation",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='findspots' // hoards | findspots
						? 'findspots'
						: 'hoards'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
					})
				}
			})
		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name 		: "form-group field button_submit",
				parent 			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type 			: "submit",
				id 				: "submit",
				value 			: tstring.search || "Search",
				class_name 		: "btn btn-light btn-block primary",
				parent 			: submit_group
			})


			const buttons_move_group = common.create_dom_element({
				element_type	: "div",
				class_name 		: "buttons_move",
				parent 			: fragment
			})

			

			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.pagination = {
					total	: null,
					limit	: 15,
					offset	: 0,
					n_nodes	: 8
				}
				self.form_submit()
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )


		// form_node
			self.form.node = common.create_dom_element({
				element_type	: "form",
				id				: "search_form",
				class_name		: "form-inline form_factory"
			})
			self.form.node.appendChild(fragment)


		return self.form.node
	},//end render_form

	actualizarVista : async function (id_hallazgo, api_response,refs) {
		const self = this;
		const location = { lon: null, lat: null };

		// 🖼️ Imagen principal
		refs.contentDiv.innerHTML = `${api_response.result[id_hallazgo].name} | ${refs.caminos_hallazgo[id_hallazgo]}`;
		const img = document.createElement("img");
		img.src = `https://wondercoins.uca.es${api_response.result[id_hallazgo].identify_image}`;
		img.alt = "Imagen dinámica";
		refs.img_ident.innerHTML = ""; 
		refs.img_ident.appendChild(img);

		// 🌍 Mapa
		const datos_location = api_response.result[id_hallazgo].map;
		location.lat = datos_location.lat;
		location.lon = datos_location.lon;
		refs.map_fact.move_map_to_point(location);

		// 📑 Info principal
		const hallazgo = api_response.result[id_hallazgo];
		//refs.typology.querySelector('.grid-stack-item-content').innerHTML = hallazgo.typology;
		//refs.date.querySelector('.grid-stack-item-content').innerHTML = `<span style="font-size:2.5rem">${hallazgo.date_in} / ${hallazgo.date_out}</span>`;
		refs.indexation.querySelector('.grid-stack-item-content').innerHTML = hallazgo.indexation;
		refs.public_info.querySelector('.grid-stack-item-content').innerHTML = `
				<div style="font-size: 1.3rem; text-align:center; position:absolute; top:0; width:100%;">
					<h2 style="
					margin: 5px 0 10px; 
					font-size: 1.3rem; 
					font-weight: bold; 
					border-bottom: 3px solid transparent;
					border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
					display: inline-block;
					margin-top: 50px !important; 
					">
					Información pública
					</h2>
					<div style="text-align: left; margin-top: 6px; white-space: pre-line;">
					${hallazgo.public_info}
					</div>
				</div>
				`;

		// 📚 Bibliografía
		const bibliografia_array = hallazgo.bibliography_data.map(b => 
			`${b.ref_publications_title} / ${b.ref_publications_authors} / (${b.ref_publications_date})`
			);

			refs.bibliography.querySelector('.grid-stack-item-content').innerHTML = `
			<div style="white-space: pre-line; font-size: 1.3rem; text-align:center; position:absolute;top:0;width:100%;">
				<h2 style="
				margin: 0 0 10px; 
				font-size: 1.3rem; 
				font-weight: bold; 
				border-bottom: 3px solid transparent;
				border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
				display: inline-block;
				">
				Bibliografía
				</h2>
				<div style="text-align: left;">
				${bibliografia_array.join("<br>")}
				</div>
			</div>
			`;

		// ✍️ Autores
		const nombres_array = [];
		const total_autores = hallazgo.authorship_names ? hallazgo.authorship_names.split("|").length : 0;
		for (let index = 0; index < total_autores; index++) {
			const nombres = hallazgo.authorship_names.split("|")[index] || "";
			const apellidos = hallazgo.authorship_surnames.split("|")[index] || "";
			const rol = hallazgo.authorship_roles
				? hallazgo.authorship_roles.split("|")[index] || "No Definido"
				: "No Definido";
			nombres_array.push(`${nombres} ${apellidos} / ${rol}`);
		}
		refs.authors.querySelector('.grid-stack-item-content').innerHTML = `
			<div style="white-space: pre-line; font-size: 1.6rem; text-align:center; position:absolute; top:0;width:100%;padding-right:10px;">
				<h2 style="
				margin: 0 0 10px; 
				font-size: 1.3rem; 
				font-weight: bold; 
				border-bottom: 3px solid transparent;
				border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
				display: inline-block;
				">
				Autores
				</h2>
				<div style="text-align: left; margin-top: 6px;">
				${nombres_array.join("<br>")}
				</div>
			</div>`;

		// 🪙 Monedas
		const coin = await self.cargarMonedasHallazgos(hallazgo.name);
		let contentceca = `<div class="ceca-widget">`;
		coin.result.forEach(coin => {
			const image_obverse = "https://wondercoins.uca.es" + coin.image_obverse;
			const image_reverse = "https://wondercoins.uca.es" + coin.image_reverse;
			const name = coin.type_full_value || "";
			contentceca += `
				<div class="coin-card">
					<div class="coin-imagenes">
						<img src="${image_obverse}" alt="anverso" class="coin-img">
						<img src="${image_reverse}" alt="reverso" class="coin-img">
					</div>
					<p class="coin-name">${name}</p>
				</div>
			`;
		});
		contentceca += `</div>`;
		refs.coins.querySelector('.grid-stack-item-content').innerHTML = contentceca;

		// 🌳 Árbol (camino)
		let road_arbol = "";
		const road_arbol_json = JSON.parse(hallazgo.parents_text);
		if (road_arbol_json) {
			for (let index = 0; index < road_arbol_json.length-1; index++) {
				road_arbol += road_arbol_json[index] + (index == road_arbol_json.length-2 ? "" : " - ");
			}
		}
		refs.road.innerHTML = road_arbol;

		// 🌲 Árbol completo
		refs.arbol_completo.innerHTML = "";
		refs.arbol_completo.appendChild(await self.render_rows_hallazgo_completo(hallazgo));

	},


		actualizarVistaMobile : async function (id_hallazgo, api_response,refs) {
		const self = this;
		const location = { lon: null, lat: null };
		const hallazgo = api_response.result[id_hallazgo];
		
		refs.titulo_movil.innerHTML = `<a href="/web_numisdata/findspot/1186" class="title_mobile">${hallazgo.name} | ${refs.caminos_hallazgo[id_hallazgo]}</a>`;
		

		const datos_location = hallazgo.map;
		location.lat = datos_location.lat;
		location.lon = datos_location.lon;
		refs.map_fact.move_map_to_point(location);


		refs.info_mobile.innerHTML = hallazgo.public_info;
			
		let bibliografia_array = []

		for (let index = 0; index < hallazgo.bibliography_data.length; index++) {
							
			bibliografia_array.push(hallazgo.bibliography_data[index].ref_publications_title +" / "+hallazgo.bibliography_data[index].ref_publications_authors + " / (" + hallazgo.bibliography_data[index].ref_publications_date + ")")
		}

		let bibliografia = ""
		bibliografia = bibliografia_array.join("\n")

		refs.bibliografia_mobile.innerHTML = bibliografia;


// ✍️ Autores
		const nombres_array = [];
		const total_autores = hallazgo.authorship_names ? hallazgo.authorship_names.split("|").length : 0;
		for (let index = 0; index < total_autores; index++) {
			const nombres = hallazgo.authorship_names.split("|")[index] || "";
			const apellidos = hallazgo.authorship_surnames.split("|")[index] || "";
			const rol = hallazgo.authorship_roles
				? hallazgo.authorship_roles.split("|")[index] || "No Definido"
				: "No Definido";
			nombres_array.push(`${nombres} ${apellidos} / ${rol}`);
		}

		refs.autores_mobile.innerHTML = nombres_array.join("\n");

		let road_arbol = "";
		const road_arbol_json = JSON.parse(hallazgo.parents_text);
		if (road_arbol_json) {
			for (let index = 0; index < road_arbol_json.length-1; index++) {
				road_arbol += road_arbol_json[index] + (index == road_arbol_json.length-2 ? "" : " - ");
			}
		}
		refs.road.innerHTML = road_arbol;


		refs.arbol_completo.innerHTML = "";
		refs.arbol_completo.appendChild(await self.render_rows_hallazgo_completo(hallazgo));





	},

	/**
	* FORM_SUBMIT
	*/
	form_submit : function() {

		const self = this

		const form_node = self.form.node
		if (!form_node) {
			return new Promise(function(resolve){
				console.error("Error on submit. Invalid form_node.", form_node);
				resolve(false)
			})
		}

		const rows_container = self.rows_container
	
		// loading start
			if (!self.pagination.total) {
				page.add_spinner(rows_container)
			}else{
				rows_container.classList.add("loading")
			}
		
		return new Promise(function(resolve){

			const table = self.table==='findspots' // hoards | findspots
				? 'findspots'
				: 'hoards'
			const ar_fields	= ['*']
			const count		= true
			const order		= "name"
			const resolve_portals_custom = {
				"bibliography_data" : "bibliographic_references"
			}

			//sql_filter
			const filter = self.form.build_filter()
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group,true)
				const base_filter = "(name != '' AND map != '')"
				let final_filter = base_filter
				const sql_filter	= parsed_filter
					? '(' + parsed_filter + ')'
					: null
				if(SHOW_DEBUG===true) {
					console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				if (sql_filter) {
					final_filter = base_filter + ' AND ' + sql_filter
				}
				
				if(self.form.form_items.global_search.q !== "" || self.form.form_items.global_search.q_selected.length > 0){
					final_filter += " OR parents_text LIKE '%"+ (self.form.form_items.global_search.q !== "" ? self.form.form_items.global_search.q : self.form.form_items.global_search.q_selected)+"%'"
				}
			
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }
			const buttons_move_group = document.getElementsByClassName("buttons_move");

					while (buttons_move_group[0].hasChildNodes()) {
						buttons_move_group[0].removeChild(buttons_move_group[0].lastChild);
					}
				console.log(final_filter)

			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: table,
					ar_fields		: ar_fields,
					sql_filter		: final_filter ,
					limit			: 0,
					count			: count,
					offset			: 0,
					order			: order,
					process_result	: null,
					resolve_portals_custom : resolve_portals_custom,
				}
			})
			.then(async function(api_response){
				console.log("--------------- api_response:",api_response);
				// parse data
					const data	= page.parse_hoard_data(api_response.result)
					const total	= api_response.total;
					const hallazgo_resultado = final_filter == base_filter ? Math.floor(Math.random() * (total)) : 0;
					let camino_hallazgo = " "
					let id_hallazgo = 0;
					

					if(self.form.form_items.global_search.q !== ""){


						self.button_atras = common.create_dom_element({
							element_type	: "button",
							type			: "button",
							id 				: "atras",
							value 			: tstring.search || "Search",
							parent 			: buttons_move_group[0]
						})
						
						self.button_adelante = common.create_dom_element({
							element_type	: "button",
							type			: "button",
							id 				: "adelante",
							value 			: tstring.search || "Search",
							parent 			: buttons_move_group[0]
						})

						if (!data) {
							rows_container.classList.remove("loading")
							resolve(null)
						}

						let caminos_hallazgo = []

						for (let j = 0; j < total; j++) {
							const camino_hallazgo_json = JSON.parse(api_response.result[j].parents_text)

							if(camino_hallazgo_json){
								
								for (let index = 0; index < camino_hallazgo_json.length-1; index++) {
									
									camino_hallazgo += camino_hallazgo_json[index]  + (index == camino_hallazgo_json.length-2 ? "" : " | ");


								}
								caminos_hallazgo.push(camino_hallazgo)
								camino_hallazgo = " "
							}
							
						}
					

					// loading end
						(function(){
							while (rows_container.hasChildNodes()) {
								rows_container.removeChild(rows_container.lastChild);
							}
							rows_container.classList.remove("loading")
						})()

						const movil = common.create_dom_element({
							element_type	: "div",
							class_name 		: "findspot_mobile",
							parent 			: rows_container
						})

						const titulo_movil = common.create_dom_element({
							element_type	: "a",
							class_name 		: "title_mobile",
							text_content	: `${api_response.result[id_hallazgo].name} | ${caminos_hallazgo[id_hallazgo]}`,
							href			: `/web_numisdata/findspot/${api_response.result[id_hallazgo].section_id}`,
							parent 			: movil
						})

						const mapa_movil = common.create_dom_element({
							element_type	: "div",
							class_name 		: "mapa_mobile",
							parent 			: movil
						})

						let resultado = {
							hallazgos: {
								datos: []
							},
							cecas: {
								datos: []
							},
							complejos: {
								datos: []
							}
							};
					

						resultado.hallazgos.datos = api_response.result
						

						const map_fact = new map_factory() // creates / get existing instance of map

						const map = map_fact.init({
							map_container : mapa_movil,
							map_position  : api_response.result[id_hallazgo].map,
							source_maps   : page.maps_config.source_maps,
							result        : resultado,
							findspot	  : true
							});


						const title_info = common.create_dom_element({
							element_type	: "h2",
							class_name 		: "title_info",
							text_content	: "Información Pública",
							parent 			: movil
						})

						common.create_dom_element({
							element_type	: "div",
							class_name 		: "golden-separator",
							parent 			: title_info
						})

						const info_mobile = common.create_dom_element({
							element_type	: "p",
							class_name 		: "info_mobile",
							parent 			: movil
						})

						info_mobile.innerHTML = api_response.result[id_hallazgo].public_info;

						const title_bibliografia = common.create_dom_element({
							element_type	: "h2",
							class_name 		: "title_info",
							text_content	: "Bibliografía",
							parent 			: movil
						})

						common.create_dom_element({
							element_type	: "div",
							class_name 		: "golden-separator",
							parent 			: title_bibliografia
						})

						let bibliografia_array = []

						for (let index = 0; index < api_response.result[id_hallazgo].bibliography_data.length; index++) {
							
							bibliografia_array.push(api_response.result[id_hallazgo].bibliography_data[index].ref_publications_title +" / "+api_response.result[id_hallazgo].bibliography_data[index].ref_publications_authors + " / (" + api_response.result[id_hallazgo].bibliography_data[index].ref_publications_date + ")")
						}

						let bibliografia = ""
						bibliografia = bibliografia_array.join("\n")

						const bibliografia_mobile = common.create_dom_element({
							element_type	: "p",
							class_name 		: "bilbiografia_mobile",
							parent 			: movil,
							text_content	: bibliografia
						})

						const title_autores = common.create_dom_element({
							element_type	: "h2",
							class_name 		: "title_info",
							text_content	: "Autores",
							parent 			: movil
						})
						common.create_dom_element({
							element_type	: "div",
							class_name 		: "golden-separator",
							parent 			: title_autores
						})

						let nombres_array = [];

						const rawAutores = api_response.result[id_hallazgo].authorship_names || "";
						const rawRoles   = api_response.result[id_hallazgo].authorship_roles || "";

						const autores = rawAutores.split("|");
						const roles   = rawRoles.split("|");

						const total_autores = Math.max(autores.length, roles.length);

						for (let index = 0; index < total_autores; index++) {
						nombres_array.push(
							(autores[index] || "") + "/" + (roles[index] || "")
						);
						}

						let nombres_autores = nombres_array.join("\n");

						const autores_mobile = common.create_dom_element({
							element_type	: "p",
							class_name 		: "autores_mobile",
							parent 			: movil,
							text_content	: nombres_autores
						})


						const container_titulo = common.create_dom_element({
							element_type	: "div",
							class_name		: "container_title_mobile",
							parent			: rows_container
						})

						const titulo_arbol = common.create_dom_element({
							element_type	: "h1",
							class_name 		: "title",
							text_content	: "Hallazgo Jerarquizado",
							parent 			: container_titulo
						})


						const imagen = common.create_dom_element({
							element_type	: "img",
							class_name		: "imagen",
							src				: "tpl/assets/images/arrow-right.svg",
							parent			: container_titulo
						})

						const separator = common.create_dom_element({
							element_type	: "div",
							class_name		: "golden-separator mobile",
							parent			: rows_container
						})


						let road_arbol = ""
						const road_arbol_json = JSON.parse(api_response.result[id_hallazgo].parents_text)

						if(road_arbol_json){

							for (let index = 0; index < road_arbol_json.length-1; index++) {
													
								road_arbol += road_arbol_json[index]  + (index == road_arbol_json.length-2 ? "" : " - ");
													
							}

						}

						const road = common.create_dom_element({
							element_type	: "div",
							class_name		: "line-tittle_mid",
							text_content	:  road_arbol,
							parent			: rows_container
						})



						road.style.display = "none"
						let container_rows_state = false
						imagen.addEventListener("mousedown", function(){

							if(container_rows_state){
								imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
								road.style.display = "none"
								
							}else{
								imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
								road.style.display = "block"
							}
							container_rows_state = !container_rows_state
						})


						
						const arbol_completo = common.create_dom_element({
							element_type : "div",
							class_name	 : "arbol_moneda_mobile",
							parent		 : rows_container
						})

						arbol_completo.appendChild(await self.render_rows_hallazgo_completo(api_response.result[id_hallazgo]))


						const refs_mobile = {
							titulo_movil,
							map_fact,
							info_mobile,
							bibliografia_mobile,
							autores_mobile,
							caminos_hallazgo,
							arbol_completo,
							road
						};



						self.button_atras.addEventListener("click", async function(e) {

							if (id_hallazgo > 0) {
								id_hallazgo--;
								await self.actualizarVistaMobile(id_hallazgo, api_response, refs_mobile);
							}
						});

						self.button_adelante.addEventListener("click", async function(e) {
							if (id_hallazgo < total - 2) {
								id_hallazgo++;
								await self.actualizarVistaMobile(id_hallazgo, api_response, refs_mobile);
							}
						});








//-------------------------------------------------------------------------------------------------------




						if(window.innerWidth > 768){


							const estructura = common.create_dom_element({
							element_type	: "div",
							class_name		: "grid-stack",
							parent			: rows_container
						})

					

						const grid = GridStack.init(estructura);
						const titulo = grid.addWidget({w:12,h:2,content: `${api_response.result[id_hallazgo].name} | ${caminos_hallazgo[id_hallazgo]}`})
						const contentDiv = titulo.querySelector('.grid-stack-item-content');
						contentDiv.id = "titulo-ficha";

						const map_fact = new map_factory() // creates / get existing instance of map
				

						const imagen_ident = grid.addWidget({w:4,h:4,content: `<img src="https://wondercoins.uca.es${api_response.result[id_hallazgo].identify_image}" alt="Imagen dinámica" style="width:100%; height:100%; object-fit:cover; overflow: hidden;"`})
						const img_ident = imagen_ident.querySelector('.grid-stack-item-content');
						img_ident.id = "img_ident"

						const ubicacion = grid.addWidget({w:4,h:4,content: ``}) //ubicacion

						let resultado = {
							hallazgos: {
								datos: []
							},
							cecas: {
								datos: []
							},
							complejos: {
								datos: []
							}
							};
					
							resultado.hallazgos.datos = api_response.result


						map_fact.init({
										map_container		: ubicacion,
										map_position		: api_response.result[id_hallazgo].map,
										source_maps			: page.maps_config.source_maps,
										result				: resultado,
										findspot			: true
									})
		

									
						const coin = await self.cargarMonedasHallazgos(api_response.result[id_hallazgo].name);

						let contentceca = `<div class="ceca-widget">`;

						coin.result.forEach(coin => {
							const image_obverse = "https://wondercoins.uca.es" + coin.image_obverse;
							const image_reverse = "https://wondercoins.uca.es" + coin.image_reverse;
							const name = coin.type_full_value || "";

							contentceca += `
								<div class="coin-card">
									<div class = "coin-imagenes">
									<img src="${image_obverse}" alt="anverso" class="coin-img">
									<img src="${image_reverse}" alt="reverso" class="coin-img"> </div>
									<p class="coin-name">${name}</p>
								</div>
							`;
						});

						contentceca += `</div>`;

						// 4. Finalmente añadimos el widget al grid
						const coins = grid.addWidget({
							w: 4,
							h: 10,
							content: contentceca
						});


						//const typology = grid.addWidget({w:4,h:1,content: `${api_response.result[id_hallazgo].typology}`})
						//const date = grid.addWidget({w:4,h:1,content: `<span style="font-size:2.5rem">${api_response.result[id_hallazgo].date_in} /${api_response.result[id_hallazgo].date_out}</span>`})				
						const indexation = grid.addWidget({w:8,h:2,content: `${api_response.result[id_hallazgo].indexation}`})

						const indexation_ids = JSON.parse(api_response.result[id_hallazgo].indexation_data)
						let sql_filter_indexation = "";

						for (let index = 0; index < indexation_ids.length; index++) {
							
							sql_filter_indexation += (index < indexation_ids.length-1 ? "section_id = " + indexation_ids[index] + " OR ":"section_id = " + indexation_ids[index] )
							
						}

						const categorizacionhallazgo = await self.cargarCategorizacionHallazgo(sql_filter_indexation);

						const idsABorrar = [];
						
						for (let index = 0; index < categorizacionhallazgo.result.length; index++) {
							idsABorrar.push(categorizacionhallazgo.result[index].section_id)
						}

						const funcionalidadhallazgo = await self.cargarFuncionalidadHallazgo(sql_filter_indexation);
						funcionalidadhallazgo.result = funcionalidadhallazgo.result.filter(item => !idsABorrar.includes(item.section_id));

						console.log("categorizacion",categorizacionhallazgo.result)
						console.log("funcionalidad",funcionalidadhallazgo.result)
						
						const periodohallazgo = api_response.result[id_hallazgo].period;
						console.log("periodo",periodohallazgo);

						//-----------------------------------------------------------------------------------------

						const public_info = grid.addWidget({
							w: 8,
							h: 4,
							content: `
								<div style="font-size: 1.3rem; text-align:center; position:absolute;top:0;width:100%;padding-right:10px;">
								<h2 style="
									margin: 5px 0 10px; 
									font-size: 1.3rem;
									margin-top: 50px !important; 
									font-weight: bold; 
									border-bottom: 3px solid transparent;
									border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
									display: inline-block;
								">
									Información pública
								</h2>
								<div style="text-align: left; margin-top: 6px; white-space: pre-line;">
									${api_response.result[hallazgo_resultado].public_info}
								</div>
								</div>
							`
							});


						let bibliografia_array = []

						for (let index = 0; index < api_response.result[id_hallazgo].bibliography_data.length; index++) {
							
							bibliografia_array.push(api_response.result[id_hallazgo].bibliography_data[index].ref_publications_title +" / "+api_response.result[id_hallazgo].bibliography_data[index].ref_publications_authors + " / (" + api_response.result[id_hallazgo].bibliography_data[index].ref_publications_date + ")")
						}

						let bibliografia = ""
						bibliografia = bibliografia_array.join("\n")


						

						const bibliography = grid.addWidget({
								w: 8, h: 4, content: `<div style="white-space: pre-line; font-size: 1.3rem; text-align:center; position:absolute;top:0;width:100%;padding-right:10px;">
									<h2 style="
									margin: 0 0 10px; 
									font-size: 1.3rem; 
									font-weight: bold; 
									border-bottom: 3px solid transparent;
									border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
									display: inline-block;
									text-align: center;
									">
									Bibliografía
									</h2>
									<div style="text-align: left;">
									${bibliografia_array.join("<br>")}
									</div>
								</div>
								`
							});
						

						let nombres_array = []
						const rawAutores = api_response.result[id_hallazgo].authorship_names;
						let total_autores = rawAutores ? rawAutores.split("|").length : 0;

						for (let index = 0; index < total_autores; index++) {

								const hallazgo = api_response.result[id_hallazgo];

								const nombres = hallazgo.authorship_names 
								? hallazgo.authorship_names.split("|")[index] 
								: "";

								const apellidos = hallazgo.authorship_surnames 
								? hallazgo.authorship_surnames.split("|")[index] 
								: "";

								const rol = hallazgo.authorship_roles && hallazgo.authorship_roles.split("|")[index] 
								? hallazgo.authorship_roles.split("|")[index] 
								: "No Definido";
								nombres_array.push(`${nombres} ${apellidos} / ${rol}`);
					
						}

						let nombres_autores = ""
						nombres_autores = nombres_array.join("\n");

						

						const authors = grid.addWidget({w:4,h:4,content: 
							
							`<div style="white-space: pre-line; font-size: 1.3rem; text-align:center; position:absolute; top:0;width:100%;">

								<h2 style="
								margin: 0 0 10px; 
								font-size: 1.3rem; 
								font-weight: bold; 
								border-bottom: 3px solid transparent;
								border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
								display: inline-block;
								">
								Autores
								</h2>
								<div style="text-align: left; margin-top: 6px;">
								${nombres_array.join("<br>")}
								</div>
							</div>`})
					
						
					
						


						const container_titulo = common.create_dom_element({
							element_type	: "div",
							class_name		: "container_title",
							parent			: rows_container
						})

						const titulo_arbol = common.create_dom_element({
							element_type	: "h1",
							class_name 		: "title",
							text_content	: "Hallazgo Jerarquizado",
							parent 			: container_titulo
						})


						const imagen = common.create_dom_element({
							element_type	: "img",
							class_name		: "imagen",
							src				: "tpl/assets/images/arrow-right.svg",
							parent			: container_titulo
						})

						const separator = common.create_dom_element({
							element_type	: "div",
							class_name		: "golden-separator",
							parent			: rows_container
						})


						let road_arbol = ""
						const road_arbol_json = JSON.parse(api_response.result[id_hallazgo].parents_text)

						if(road_arbol_json){

							for (let index = 0; index < road_arbol_json.length-1; index++) {
													
								road_arbol += road_arbol_json[index]  + (index == road_arbol_json.length-2 ? "" : " - ");
													
							}

						}

						const road = common.create_dom_element({
							element_type	: "div",
							class_name		: "line-tittle_mid",
							text_content	:  road_arbol,
							parent			: rows_container
						})



						road.style.display = "none"
						let container_rows_state = false
						imagen.addEventListener("mousedown", function(){

							if(container_rows_state){
								imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
								road.style.display = "none"
								
							}else{
								imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
								road.style.display = "block"
							}
							container_rows_state = !container_rows_state
						})


					


						const arbol_completo = common.create_dom_element({
							element_type : "div",
							class_name	 : "arbol_moneda",
							parent		 : rows_container
						})

						arbol_completo.appendChild(await self.render_rows_hallazgo_completo(api_response.result[id_hallazgo]))

						const refs = {
							contentDiv,
							img_ident,
							//typology,
							//date,
							indexation,
							public_info,
							bibliography,
							authors,
							coins,
							road,
							arbol_completo,
							caminos_hallazgo,
							map_fact
						 // <--- incluido aquí
						};

						self.button_atras.addEventListener("click", async function(e) {
							if (id_hallazgo > 0) {
								id_hallazgo--;
								await self.actualizarVista(id_hallazgo, api_response, refs);
							}
						});

						self.button_adelante.addEventListener("click", async function(e) {
							if (id_hallazgo < total - 2) {
								id_hallazgo++;
								await self.actualizarVista(id_hallazgo, api_response, refs);
							}
						});

					}


					}else{

					let camino_hallazgo = " "


					if (!data) {
						rows_container.classList.remove("loading")
						resolve(null)
					}

				// loading end
					(function(){
						while (rows_container.hasChildNodes()) {
							rows_container.removeChild(rows_container.lastChild);
						}
						rows_container.classList.remove("loading")
					})()

					const movil = common.create_dom_element({
						element_type	: "div",
						class_name 		: "findspot_mobile",
						parent 			: rows_container
					})



					const camino_hallazgo_json = JSON.parse(api_response.result[hallazgo_resultado].parents_text)
					if(camino_hallazgo_json){

						for (let index = 0; index < camino_hallazgo_json.length-1; index++) {
							
							camino_hallazgo += camino_hallazgo_json[index]  + (index == camino_hallazgo_json.length-2 ? "" : " | ");
							
						}

					}




					const titulo_movil = common.create_dom_element({
						element_type	: "a",
						class_name 		: "title_mobile",
						text_content	: `${api_response.result[hallazgo_resultado].name} | ${camino_hallazgo}`,
						href			: `/web_numisdata/findspot/${api_response.result[hallazgo_resultado].section_id}`,
						parent 			: movil
					})

					const mapa_movil = common.create_dom_element({
						element_type	: "div",
						class_name 		: "mapa_mobile",
						parent 			: movil
					})

					let resultado = {
						hallazgos: {
							datos: []
						},
						cecas: {
							datos: []
						},
						complejos: {
							datos: []
						}
						};
				
					resultado.hallazgos.datos.push(api_response.result[hallazgo_resultado])

					const map_fact = new map_factory() // creates / get existing instance of map

					const map = map_fact.init({
						map_container : mapa_movil,
						map_position  : api_response.result[hallazgo_resultado].map,
						source_maps   : page.maps_config.source_maps,
						result        : resultado,
						findspot      : true
						});


					const title_info = common.create_dom_element({
						element_type	: "h2",
						class_name 		: "title_info",
						text_content	: "Información Pública",
						parent 			: movil
					})

					common.create_dom_element({
						element_type	: "div",
						class_name 		: "golden-separator",
						parent 			: title_info
					})

					const info_mobile = common.create_dom_element({
						element_type	: "p",
						class_name 		: "info_mobile",
						parent 			: movil
					})
					info_mobile.innerHTML = api_response.result[hallazgo_resultado].public_info;
					const title_bibliografia = common.create_dom_element({
						element_type	: "h2",
						class_name 		: "title_info",
						text_content	: "Bibliografía",
						parent 			: movil
					})

					common.create_dom_element({
						element_type	: "div",
						class_name 		: "golden-separator",
						parent 			: title_bibliografia
					})

					let bibliografia_array = []

					for (let index = 0; index < api_response.result[hallazgo_resultado].bibliography_data.length; index++) {
						
						bibliografia_array.push(api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_title +" / "+api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_authors + " / (" + api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_date + ")")
					}

					let bibliografia = ""
					bibliografia = bibliografia_array.join("\n")

					const bibliografia_mobile = common.create_dom_element({
						element_type	: "p",
						class_name 		: "bilbiografia_mobile",
						parent 			: movil,
						text_content	: bibliografia
					})

					const title_autores = common.create_dom_element({
						element_type	: "h2",
						class_name 		: "title_info",
						text_content	: "Autores",
						parent 			: movil
					})
					common.create_dom_element({
						element_type	: "div",
						class_name 		: "golden-separator",
						parent 			: title_autores
					})

					let nombres_array = [];

						const rawAutores = api_response.result[id_hallazgo].authorship_names || "";
						const rawRoles   = api_response.result[id_hallazgo].authorship_roles || "";

						const autores = rawAutores.split("|");
						const roles   = rawRoles.split("|");

						const total_autores = Math.max(autores.length, roles.length);

						for (let index = 0; index < total_autores; index++) {
						nombres_array.push(
							(autores[index] || "") + "/" + (roles[index] || "")
						);
						}

						let nombres_autores = nombres_array.join("\n");

					const autores_mobile = common.create_dom_element({
						element_type	: "p",
						class_name 		: "autores_mobile",
						parent 			: movil,
						text_content	: nombres_autores
					})

					if(window.innerWidth > 768){
						const estructura = common.create_dom_element({
						element_type	: "div",
						class_name		: "grid-stack",
						parent			: rows_container
					})

	



					const grid = GridStack.init(estructura);
					const titulo = grid.addWidget({w:12,h:2,content: `${api_response.result[hallazgo_resultado].name} | ${camino_hallazgo}`})
					const contentDiv = titulo.querySelector('.grid-stack-item-content');
					contentDiv.id = "titulo-ficha";

					

					const map_fact = new map_factory() // creates / get existing instance of map
								


					const imagen_ident = grid.addWidget({w:4,h:4,content: `<img src="https://wondercoins.uca.es${api_response.result[hallazgo_resultado].identify_image}" alt="Imagen dinámica" style="width:100%; height:100%; object-fit:cover; overflow: hidden;"`})
					const img_ident = imagen_ident.querySelector('.grid-stack-item-content');
					img_ident.id = "img_ident"
					const ubicacion = grid.addWidget({w:4,h:4,content: ``}) //ubicacion

					 let resultado = {
						hallazgos: {
							datos: []
						},
						cecas: {
							datos: []
						},
						complejos: {
							datos: []
						}
						};
				
						resultado.hallazgos.datos.push(api_response.result[hallazgo_resultado])


					map_fact.init({
									map_container		: ubicacion,
									map_position		: api_response.result[hallazgo_resultado].map,
									source_maps			: page.maps_config.source_maps,
									result				: resultado,
									findspot			: true
								})

								
					const coin = await self.cargarMonedasHallazgos(api_response.result[id_hallazgo].name);

						let contentceca = `<div class="ceca-widget">`;

						coin.result.forEach(coin => {
							const image_obverse = "https://wondercoins.uca.es" + coin.image_obverse;
							const image_reverse = "https://wondercoins.uca.es" + coin.image_reverse;
							const name = coin.type_full_value || "";

							contentceca += `
								<div class="coin-card">
									<div class = "coin-imagenes">
									<img src="${image_obverse}" alt="anverso" class="coin-img">
									<img src="${image_reverse}" alt="reverso" class="coin-img"> </div>
									<p class="coin-name">${name}</p>
								</div>
							`;
						});

						contentceca += `</div>`;

						// 4. Finalmente añadimos el widget al grid
						const coins = grid.addWidget({
							w: 4,
							h: 10,
							content: contentceca
						});
					
					//grid.addWidget({w:4,h:1,content: `${api_response.result[hallazgo_resultado].typology}`})
					//grid.addWidget({w: 4,h: 1,content: `<span style="font-size:2.5rem">${api_response.result[hallazgo_resultado].date_in} /${api_response.result[hallazgo_resultado].date_out}</span>`})		
					const indexation_ids = JSON.parse(api_response.result[hallazgo_resultado].indexation_data)
					let sql_filter_indexation = "";

					for (let index = 0; index < indexation_ids.length; index++) {
						
						sql_filter_indexation += (index < indexation_ids.length-1 ? "section_id = " + indexation_ids[index] + " OR ":"section_id = " + indexation_ids[index] )
						
					}

					const categorizacionhallazgo = await self.cargarCategorizacionHallazgo(sql_filter_indexation);

					const idsABorrar = [];
					
					for (let index = 0; index < categorizacionhallazgo.result.length; index++) {
						idsABorrar.push(categorizacionhallazgo.result[index].section_id)
					}

					const funcionalidadhallazgo = await self.cargarFuncionalidadHallazgo(sql_filter_indexation);
					funcionalidadhallazgo.result = funcionalidadhallazgo.result.filter(item => !idsABorrar.includes(item.section_id));


					console.log("categorizacion",categorizacionhallazgo.result)
					console.log("funcionalidad",funcionalidadhallazgo.result)

					const periodohallazgo = api_response.result[hallazgo_resultado].period;
					console.log("periodo",periodohallazgo);

					//-----------------------------------------------------------------------------------------------------


					grid.addWidget({w:8,h:2,content: `${api_response.result[hallazgo_resultado].indexation}`})

					grid.addWidget({
							w: 8,
							h: 4,
							content: `
								<div style="font-size: 1.3rem; text-align:center; position:absolute;top:0;width:100%;padding-right:10px;">
								<h2 style="
									margin: 5px 0 10px; 
									font-size: 1.3rem;
									margin-top: 50px !important; 
									font-weight: bold; 
									border-bottom: 3px solid transparent;
									border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
									display: inline-block;
								">
									Información pública
								</h2>
								<div style="text-align: left; margin-top: 6px; white-space: pre-line;">
									${api_response.result[hallazgo_resultado].public_info}
								</div>
								</div>
							`
							});

					

					let bibliografia_array = []

					for (let index = 0; index < api_response.result[hallazgo_resultado].bibliography_data.length; index++) {
						
						bibliografia_array.push(api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_title +" / "+api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_authors + " / (" + api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_date + ")")
					}

					let bibliografia = ""
					bibliografia = bibliografia_array.join("\n")

					grid.addWidget({
						w: 8, h: 4, content: `<div style="white-space: pre-line; font-size: 1.3rem; text-align:center; position:absolute;top:0;width:100%;padding-right:10px;">
							<h2 style="
							margin: 0 0 10px; 
							font-size: 1.3rem; 
							font-weight: bold; 
							border-bottom: 3px solid transparent;
							border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
							display: inline-block;
							text-align: center;
							">
							Bibliografía
							</h2>
							<div style="text-align: left;">
							${bibliografia_array.join("<br>")}
							</div>
						</div>
						`
					});

					let nombres_array = []
					const rawAutores = api_response.result[hallazgo_resultado].authorship_names;
					let total_autores = rawAutores ? rawAutores.split("|").length : 0;

					for (let index = 0; index < total_autores; index++) {

						nombres_array.push(api_response.result[hallazgo_resultado].authorship_names.split("|")[index] + " " + api_response.result[hallazgo_resultado].authorship_surnames.split("|")[index] + "/" + api_response.result[hallazgo_resultado].authorship_roles.split("|")[index])
				
					}

					let nombres_autores = ""

					nombres_autores = nombres_array.join("\n");


					grid.addWidget({w:4,h:4,content: `<div style="white-space: pre-line; font-size: 1.3rem; text-align:center; position:absolute; top:0;width:100%;">
							<h2 style="
							margin: 0 0 10px; 
							font-size: 1.3rem; 
							font-weight: bold; 
							border-bottom: 3px solid transparent;
							border-image: linear-gradient(to right, #d4af37, #ffd700, #d4af37) 1;
							display: inline-block;
							">
							Autores
							</h2>
							<div style="text-align: left; margin-top: 6px;">
							${nombres_array.join("<br>")}
							</div>
						</div>`})
					}
			


					const container_titulo = common.create_dom_element({
						element_type	: "div",
						class_name		: "container_title",
						parent			: rows_container
					})

					const titulo_arbol = common.create_dom_element({
						element_type	: "h1",
						class_name 		: "title",
						text_content	: "Hallazgo Jerarquizado",
						parent 			: container_titulo
					})


					const imagen = common.create_dom_element({
						element_type	: "img",
						class_name		: "imagen",
						src				: "tpl/assets/images/arrow-right.svg",
						parent			: container_titulo
					})

					const separator = common.create_dom_element({
						element_type	: "div",
						class_name		: "golden-separator",
						parent			: rows_container
					})


					let road_arbol = ""
					const road_arbol_json = JSON.parse(api_response.result[hallazgo_resultado].parents_text)

					if(road_arbol_json){

						for (let index = 0; index < road_arbol_json.length-1; index++) {
												
							road_arbol += road_arbol_json[index]  + (index == road_arbol_json.length-2 ? "" : " - ");
												
						}

					}

					const road = common.create_dom_element({
						element_type	: "div",
						class_name		: "line-tittle_mid",
						text_content	:  road_arbol,
						parent			: rows_container
					})




					road.style.display = "none"
					let container_rows_state = false
					imagen.addEventListener("mousedown", function(){

						if(container_rows_state){
							imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
							road.style.display = "none"
							
						}else{
							imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
							road.style.display = "block"
						}
						container_rows_state = !container_rows_state
					})




					const arbol_completo = common.create_dom_element({
						element_type : "div",
						class_name	 : "arbol_moneda",
						parent		 : rows_container
					})

					arbol_completo.appendChild(await self.render_rows_hallazgo_completo(api_response.result[hallazgo_resultado]))

				}
				

			})

			// scrool to head result
			const div_result = document.querySelector(".rows_container")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}
		})
	},//end form_submit



	render_rows_hallazgo : async function(row) {
		const fragment = new DocumentFragment()
		var findspot_tree = await this.createfindspot_Tree(row)
		this.generate_Tree(findspot_tree,findspot_tree[0],fragment,0)

		return fragment
	},

	render_rows_hallazgo_completo : async function(row){

		const fragment = new DocumentFragment()
		var findspot_tree = await this.createfindspot_Tree(row)
		this.generate_Tree_completo(findspot_tree,findspot_tree[0],fragment,0,0,2)

		return fragment

	},


	createfindspot_Tree : async function (findspot){

		const findspots_tree = []
		const findspot_sons = await this.cargarHijosHallazgos(findspot.section_id)
		findspots_tree.push({info_nodo: findspot, padre : null})

		for (let index = 0; index < findspot_sons.result.length; index++) {

			const parent_node = JSON.parse(findspot_sons.result[index].parents)
			findspots_tree.push({ info_nodo: findspot_sons.result[index], padre: parent_node[0]});
						
		}

		return findspots_tree

	},

	cargarCategorizacionHallazgo : async function(sql_filter) {
		try {
			const hijos = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'ts_find_category',
					ar_fields: ["*"],
					sql_filter: sql_filter,
					limit: 0,
					count: true,
					offset: 0,
					order: 'section_id ASC',
					process_result: null
				}
			});
			return hijos;

		} catch (error) {
			console.error("Error cargando datos:", error);
		}
	},
	cargarFuncionalidadHallazgo : async function(sql_filter) {
		try {
			const hijos = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'ts_find_context',
					ar_fields: ["*"],
					sql_filter: sql_filter,
					limit: 0,
					count: true,
					offset: 0,
					order: 'section_id ASC',
					process_result: null
				}
			});
			return hijos;

		} catch (error) {
			console.error("Error cargando datos:", error);
		}
	},
	cargarHijosHallazgos : async function(hallazgo) {
		try {
			const hijos = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'findspots',
					ar_fields: ["*"],
					sql_filter: `parents LIKE '%"${hallazgo}"%'`,
					limit: 0,
					count: true,
					offset: 0,
					order: 'section_id ASC',
					process_result: null
				}
			});
			return hijos;

		} catch (error) {
			console.error("Error cargando datos:", error);
		}
	},

	generate_Tree : function(tree,node,node_parent,padding){

	
		const info_node = common.create_dom_element({
					element_type	: "div",
					class_name		: "container_prueba",
					text_content	: node.info_nodo.name,
					parent			: node_parent
		})
		
		info_node.style.paddingLeft = `${padding}em`
		

		if(node.info_nodo.children != null){

				for (let index = 0; index < tree.length; index++) {
				if (tree[index].info_nodo.parent == '["'+node.info_nodo.section_id+'"]') {
					
					tree[index].padre = "'"+node.info_nodo.section_id+"'"
					this.generate_Tree(tree,tree[index],info_node,1.5)
				}
				
			}
		}

	},

	cargarMonedasHallazgos : async function(ceca) {
		try {
			const monedas = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'coins',
					ar_fields: ["*"],
					sql_filter: `findspot LIKE '%${ceca}%'`,
					limit: 15,
					count: true,
					offset: 0,
					order: 'section_id ASC',
					process_result: null
				}
			});
			return monedas;

		} catch (error) {
			console.error("Error cargando datos:", error);
		}
	},

	generate_Tree_completo : async function(tree,node,node_parent,padding,level,font_size){
			const Shades = [
			"#453000ff", // un poco más oscuro que antes para contraste
			"#5a3f00ff",
			"#6d4d00ff",
			"#7f5b00ff",
			"#916900ff",
			"#a37800ff",
			"#b48600ff",
			"#c49400ff",
			"#d5a200ff",
			"#e6b000ff",
			"#f7be00ff",
			"#f9cb15ff",
			"#f9d733ff",
			"#f9e152ff",
			"#f9eb70ff",
			"#faf58eff",
			"#fafaabff",
			"#fcfdc8ff",
			"#feffe5ff",
			"#ffffffcc"
			];

		const info_node = common.create_dom_element({
					element_type	: "div",
					class_name		: "container_prueba",
					parent			: node_parent
		})

		const link_node = common.create_dom_element({
					element_type: "a",
					class_name: "info_link",
					text_content: node.info_nodo.name,
					href: `/web_numisdata/findspot/${node.info_nodo.section_id}`,
					parent: info_node
		});

		info_node.style.paddingLeft = `${padding}em`;
		link_node.style.fontSize = `${font_size}rem`;
		link_node.style.textTransform = "uppercase";
		link_node.style.fontWeight = "bold";


		if(node.info_nodo.coins != null){
						const coins = await this.cargarMonedasHallazgos(node.info_nodo.name)
						console.log ("Nombre de ceca: "+node.info_nodo.name);

						const button_display = common.create_dom_element({
							element_type	: "button",
							class_name		: "button_display",
							parent			: info_node
						})

						// Agregar texto al botón
						button_display.textContent = "Ver monedas";

						button_display.classList.add(`button_display_${node.info_nodo.section_id}`)
						//button_display.style.transform = ` translateX(30%) translateY(18%)`
						const container_swiper = common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper swiper_${node.info_nodo.section_id}`,
							parent			: info_node
						})
						container_swiper.style.display = "none"
						const swiper = common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-wrapper`,
							parent			: container_swiper
						})

						for (let index = 0; index < coins.result.length; index++) {
							//console.log(coins.result[index])
							const slide1 = common.create_dom_element({
								element_type: "div",
								class_name: "swiper-slide",
								parent: swiper
							});

							// Flip card container
							const flipCard1 = common.create_dom_element({
								element_type: "div",
								class_name: `flip-card`,
								parent: slide1
							});

							flipCard1.classList.add(`flip-card_${coins.result[index].section_id}`)
							flipCard1.style.fontWeight = "normal"
							
							// Flip inner
							const flipInner1 = common.create_dom_element({
								element_type: "div",
								class_name: "flip-card-inner",
								parent: flipCard1
							});

							// Front
							const flipFront1 = common.create_dom_element({
								element_type: "div",
								class_name: "flip-card-front",
								parent: flipInner1
							});

							//imágenes del anverso y reverso de la moneda
							const image_obverse = "https://wondercoins.uca.es" + coins.result[index].image_obverse;
							const image_reverse = "https://wondercoins.uca.es" + coins.result[index].image_reverse;

							common.create_dom_element({
								element_type: "img",
								class_name: "img_obverse",
								parent: flipFront1,
								src: image_obverse
							});

							common.create_dom_element({
								element_type: "img",
								parent: flipFront1,
								src: image_reverse
							});

							// Back
							const flipBack1 = common.create_dom_element({
								element_type: "div",
								class_name: "flip-card-back",
								parent: flipInner1
							});

							// Información de la moneda
							let value = coins.result[index].type_data ? coins.result[index].type_data.replace('"',"").replace("[","").replace("]","").replace('"','') : 0;
							let coin_type = value

							// Coin Type
							const type_container = common.create_dom_element({
								element_type: "div",
								class_name: "type_container",
								parent: flipBack1
							});
							const type_full_val = coins.result[index].denomination ? coins.result[index].denomination + coins.result[index].type_full_value.split(`${coins.result[index].denomination}`)[1] : coins.result[index].type_full_value;
							const type_none = type_full_val ? type_full_val : "Tipo";
							common.create_dom_element({
								element_type: "a",
								class_name: "type_link",
								href: `/web_numisdata/type/${coin_type}`,
								text_content: type_none, 
								parent: type_container
							});

							// Findspot
							const findspot_container = common.create_dom_element({
								element_type: "div",
								class_name: "findspot_container",
								parent: flipBack1
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Lugar de Hallazgo:",
								parent: findspot_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "findspot_text",
								text_content: coins.result[index].findspot.split(" | ")[0],
								parent: findspot_container
							});

							//Date
							const date_container = common.create_dom_element({
								element_type: "div",
								class_name: "date_container",
								parent: flipBack1
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Datación de la moneda: ",
								parent: date_container
							});

								const dateInRaw = coins.result[index].date_in;
								const dateOutRaw = coins.result[index].date_out;

								const hasDateIn = !!dateInRaw;
								const hasDateOut = !!dateOutRaw;

								const dateIn = hasDateIn ? (dateInRaw.includes('-') ? Math.abs(parseInt(dateInRaw)) + " A.C." : dateInRaw + " D.C.") : "N/A";
								const dateOut = hasDateOut ? (dateOutRaw.includes('-') ? Math.abs(parseInt(dateOutRaw)) + " A.C." : dateOutRaw + " D.C.") : "N/A";

								const dateText = !hasDateIn && !hasDateOut
								? "N/A - N/A"
								: dateIn + " - " + dateOut;

							common.create_dom_element({
								element_type: "p",
								class_name: "date_text",
								text_content: dateText,
								parent: date_container
							});

							// Weight + Diameter

							const weidia_container = common.create_dom_element({
								element_type: "div",
								class_name: "weigdia_container",
								parent: flipBack1
							});

							// Weight

							const weight_container = common.create_dom_element({
								element_type: "div",
								class_name: "weight_container",
								parent: weidia_container
							});
							
							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Peso: ",
								parent: weight_container
							});

							const weightText = coins.result[index].weight ? coins.result[index].weight + " gramos" : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "weight_text",
								text_content: weightText,
								parent: weight_container
							});

							// Diameter
							const diameter_container = common.create_dom_element({
								element_type: "div",
								class_name: "diameter_container",
								parent: weidia_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Diametro: ",
								parent: diameter_container
							});

							const diameterText = coins.result[index].diameter ? coins.result[index].diameter + " mm" : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "diameter_text",
								text_content: diameterText,
								parent: diameter_container
							});

							//Dies + Collection

							const dico_container = common.create_dom_element({
								element_type: "div",
								class_name: "dico_container",
								parent: flipBack1
							});

							// Dies
							const dies_container = common.create_dom_element({
								element_type: "div",
								class_name: "dies_container",
								parent: dico_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Posición de cuños: ",
								parent: dies_container
							});

							const diesText = coins.result[index].dies ? coins.result[index].dies : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "dies_text",
								text_content: diesText,
								parent: dies_container
							});

							// Collection
							const collection_container = common.create_dom_element({
								element_type: "div",
								class_name: "collection_container",
								parent: dico_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Colección: ",
								parent: collection_container
							});

							const collectionText = coins.result[index].collection ? coins.result[index].collection : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "collection_text",
								text_content: collectionText,
								parent: collection_container
							});

							// Findspot type + section_id
							const finsec_container = common.create_dom_element({
								element_type: "div",
								class_name: "finsec_container",
								parent: flipBack1
							});

							// Findspot type
							const find_type_container = common.create_dom_element({
								element_type: "div",
								class_name: "fin_type_container",
								parent: finsec_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Tipo de hallazgo: ",
								parent: find_type_container
							});

							const findspotTypeText = coins.result[index].find_type ? coins.result[index].find_type : "N/A";
							common.create_dom_element({
								element_type: "p",
								class_name: "fin_type_text",
								text_content: findspotTypeText,
								parent: find_type_container
							});

							// Section ID
							const section_id_container = common.create_dom_element({
								element_type: "div",
								class_name: "section_id_container",
								parent: finsec_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Nº de inventario: ",
								parent: section_id_container
							});

							const sectionIdText = coins.result[index].section_id ? coins.result[index].section_id : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "section_id_text",
								text_content: sectionIdText,
								parent: section_id_container
							});

							

							document.addEventListener("click", (e) => {

								const card = e.target.closest(`.flip-card_${coins.result[index].section_id}`);
								if (card) {
									card.classList.toggle("flipped");
								}

							});

						}

	

						common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-button-prev swiper-prev-${node.info_nodo.section_id}`,
							parent			: container_swiper
						})

						common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-button-next swiper-next-${node.info_nodo.section_id}`,
							parent			: container_swiper
						})

						common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-pagination swiper-pagination-${node.info_nodo.section_id}`,
							parent			: container_swiper
						})



						container_swiper.style.paddingLeft = `${1}em`

						new Swiper(`.swiper_${node.info_nodo.section_id}`, {
										pagination: {
											el: `.swiper-pagination-${node.info_nodo.section_id}`,
											clickable: true,
										},
										navigation: {
											nextEl: `.swiper-next-${node.info_nodo.section_id}`,
											prevEl: `.swiper-prev-${node.info_nodo.section_id}`,
										}
										});



						let estado_mostrar_monedas = false

						document.addEventListener("mousedown", (e) => {
							const button = e.target.closest(`.button_display_${node.info_nodo.section_id}`);

							if (!button || !container_swiper) return;

							if (estado_mostrar_monedas) {
								//button.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
								button_display.textContent = "Ver monedas"; // texto cuando está oculto
								container_swiper.style.display = "none";
							} else {
								//button.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
								button_display.textContent = "Ocultar monedas"; // texto cuando está visible
								container_swiper.style.display = "block";
							}

							estado_mostrar_monedas = !estado_mostrar_monedas;
						});

						
		}


		if(node.info_nodo.children != null){

				for (let index = 0; index < tree.length; index++) {
				if (tree[index].info_nodo.parent == '["'+node.info_nodo.section_id+'"]') {
					
					tree[index].padre = "'"+node.info_nodo.section_id+"'"
					if(window.innerWidth > 768){
						this.generate_Tree_completo(tree,tree[index],info_node,2,level+1,font_size-0.1)
					}else{
						this.generate_Tree_completo(tree,tree[index],info_node,0.4,level+1,font_size-0.2)
					}
					
				}
				
			}
		}

	},

	





}//end hoards
