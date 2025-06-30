/*global tstring, page_globals, SHOW_DEBUG, common, page, $, type_row_fields_min, map_factory, Promise, data_manager, event_manager, form_factory, catalog_row_fields */
/*eslint no-undef: "error"*/

"use strict";



var map = {



	/**
	* VARS
	*/
		// DOM items ready from page html
		form_container			: null,
		rows_container			: null,
		map_container			: null,
		export_data_container	: null,

		map_factory_instance : null,

		// master_map_global_data. All records from table 'map_global'
		master_map_global_data : null,

		// current_map_global_data. Current filtered records from table 'map_global'
		current_map_global_data : null,

		// global_data (direct rows from ddbb)
		global_data : null,

		// map_global_data (ready for map parsed data)
		map_global_data : null,

		// form instance on form_factory
		form : null,

		forn_node : null,

		map_config : null,

		button_state : false,

	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {
		if(SHOW_DEBUG===true) {
			// console.log("--> map set_up options:",options);
		}

		const self = this

		// options
			self.form_container			= options.form_container
			self.map_container			= options.map_container
			self.rows_container			= options.rows_container
			self.export_data_container	= options.export_data_container

		// export_data_buttons added once
			const export_data_buttons = page.render_export_data_buttons()
			self.export_data_container.appendChild(export_data_buttons)
			self.export_data_container.classList.add('hide')


						let resultado = {
						hallazgos: {
							datos: []
						},
						cecas: {
							datos: []
						},
						complejo: {
							datos: []
						}
						};



		this.cargarTodoYCrearMapa(resultado);


		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			self.form_container.appendChild(form_node)

		// set config (from local storage)
			self.set_config()

		// show search button
			const show_search_button = document.getElementById("search_icon")
			show_search_button.addEventListener("mousedown", function(){

				let new_showing_search
				if (self.map_config.showing_search===true) {
					form_node.classList.add("hide")
					new_showing_search = false
				}else{
					form_node.classList.remove("hide")
					new_showing_search = true
				}
				self.set_config({
					showing_search : new_showing_search
				})
			})
			if (self.map_config.showing_search===true) {
				form_node.classList.remove("hide")
			}else{
				form_node.classList.add("hide")
			}

		// events
		


		return true
	},//end set_up


cargarTodoYCrearMapa : async function(resultado) {
	const self = this
	try {
		const hallazgos = await data_manager.request({
			body: {
				dedalo_get: 'records',
				table: 'findspots',
				ar_fields: ["*"],
				sql_filter: "",
				limit: 0,
				count: true,
				offset: 0,
				order: 'section_id ASC',
				process_result: null
			}
		});
		resultado.hallazgos.datos = hallazgos.result;

		const cecas = await data_manager.request({
			body: {
				dedalo_get: 'records',
				table: 'mints',
				ar_fields: ["*"],
				sql_filter: "",
				limit: 0,
				count: true,
				offset: 0,
				order: 'name',
				process_result: null
			}
		});
		resultado.cecas.datos = cecas.result;
		self.map_factory_instance = new map_factory();
		self.map_factory_instance.init({
			map_container: self.map_container,
			map_position: [36.5297, -6.2924],
			source_maps: page.maps_config.source_maps,
			result: resultado,
			map_node : this
		});

	} catch (error) {
		console.error("Error cargando datos:", error);
	}
},



	/**
	* SET_CONFIG
	* @param options object (optional)
	* @return
	*/
	set_config : function(options) {

		const self = this

		// cookie
		const map_config = localStorage.getItem('map_config');
		if (map_config) {
			// use existing one
			self.map_config = JSON.parse(map_config)
			// console.log("--> self.map_config 1 (already exists):", self.map_config);
		}else{
			// create a new one
			const map_config = {
				showing_search	: false
			}
			localStorage.setItem('map_config', JSON.stringify(map_config));
			self.map_config = map_config
			// console.log("--> self.map_config 2 (create new one):",self.map_config);
		}

		if (options) {
			for(const key in options) {
				self.map_config[key] = options[key]
			}
			localStorage.setItem('map_config', JSON.stringify(self.map_config));
		}
		// console.log("--> self.map_config [final]:", self.map_config);

		return self.map_config
	},//end set_config



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name		: "form-row fields",
			parent			: fragment
		})

		common.create_dom_element({
			element_type	: "div",
			class_name		: "golden-separator",
			parent			: form_row
		})

		// // section_id
		// 	self.form.item_factory({
		// 		id			: "section_id",
		// 		name		: "section_id",
		// 		label		: tstring.is || "ID",
		// 		q_column	: "section_id",
		// 		eq			: "=",
		// 		eq_in		: "",
		// 		eq_out		: "",
		// 		parent		: form_row
		// 	})

		// mint
			self.form.item_factory({
				id				: "mint",
				name			: "mint",
				label			: tstring.mint || "mint",
				q_column		: "name",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				sql_filter		: ` name LIKE '%%' AND name !='' `	, // FILTRO PARA HALLAZGOS ESTA BUGGED NO SE PORQUE?
				is_term			: true,
				q_selected_eq	: "LIKE",
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'mints'
					})
				}
			})

		// collection
		/* 	self.form.item_factory({
				id			: "collection",
				name		: "collection",
				label		: tstring.collection || "collection",
				q_column	: "collection",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			}) */

		// // ref_auction
		// 	self.form.item_factory({
		// 		id			: "ref_auction",
		// 		name		: "ref_auction",
		// 		label		: tstring.auction || "auction",
		// 		q_column	: "ref_auction",
		// 		eq			: "LIKE",
		// 		eq_in		: "%",
		// 		eq_out		: "%",
		// 		parent		: form_row,
		// 		callback	: function(form_item) {
		// 			self.form.activate_autocomplete({
		// 				form_item	: form_item,
		// 				table		: 'coins'
		// 			})
		// 		}
		// 	})



		// findspot
			self.form.item_factory({
				id			: "findspot",
				name		: "findspot",
				label		: tstring.findspot || "findspot",
				q_column	: "name",
				sql_filter	: ` name LIKE '%%' AND name !='' `, // FILTRO PARA CECAS AUNQUE SEA HALLAZGOS ESTA BUGGED NO SE PORQUE?
				q_selected_eq	: "LIKE",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'findspots'
					})
				}
			})


		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-group field button_submit",
				parent			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type			: "submit",
				id				: "submit",
				value			: tstring.search || "Search",
				class_name		: "btn btn-light btn-block primary",
				parent			: submit_group
			})
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
				self.form_submit()
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )


		// form_node
			self.form.node = common.create_dom_element({
				element_type	: "form",
				id				: "search_form",
				class_name		: "form-inline form_factory"
			})
			self.form.node.appendChild(fragment)


		return self.form.node
	},//end render_form



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

		// clean container
			while (self.rows_container.hasChildNodes()) {
				self.rows_container.removeChild(self.rows_container.lastChild);
			}

		// loading start
			// if (!self.pagination.total) {
			// 	page.add_spinner(rows_container)
			// }else{
			// 	rows_container.classList.add("loading")
			// }

		return new Promise(function(resolve){

			const ar_fields = ["*"]

			// sql_filter

				const filter = self.form.build_filter()
				//console.log(self.form.form_items) // -----IMPORTANTE-----
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group)
				const sql_filter	= parsed_filter
					? '(' + parsed_filter + ')'
					: null

				if(SHOW_DEBUG===true) {
					// console.log("-> coins form_submit filter:",filter);
					// console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }


				let table = null
				let q = null
				let q_selected = null
				let label = "name"
			if(self.form.form_items.mint.q !== "" || self.form.form_items.mint.q_selected.length > 0){

				table = "mints"
				q = self.form.form_items.mint.q
				q_selected = self.form.form_items.mint.q_selected

			}else{

				if(self.form.form_items.findspot.q !== "" || self.form.form_items.findspot.q_selected.length > 0){

				table = "findspots"
				q = self.form.form_items.findspot.q
				q_selected = self.form.form_items.findspot.q_selected


				
				}else{

					if(self.form.form_items.collection.q !== "" || self.form.form_items.collection.q_selected.length > 0){

						table = "coins"
						q = self.form.form_items.collection.q
						q_selected = self.form.form_items.collection.q_selected
						label = "collection"
					}

				}

			}


			let sql_filter_final = ` ${label} LIKE '%${q !== '' ? q : q_selected}%' AND ${label} !=''`

			console.log("El sql filter es " + sql_filter_final + " " + table)

			// HACER LLAMADA A API CON DATA_MANAGER.REQUEST CON EL CAMPO MINT DE LA TABLA COINS -> NOMBRE DE LA CECA PARA RECOGER MONEDA

			if(table){
			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: table,
					ar_fields		: ar_fields,
					sql_filter		: sql_filter_final,
					limit			: 0,
					count			: false,
					offset			: 0,
					order			: 'section_id ASC',
					// group		: "type_data",
					process_result	: null
				}
			})
			.then(async function(api_response){
				
				const location = {
					lon: null,
					lat: null
				};

				if (api_response.result) {
					
					self.map_container.classList.remove("loading")
					const datos_location= JSON.parse(api_response.result[0].map)
					location.lat = datos_location.lat;
					location.lon = datos_location.lon;
					self.map_factory_instance.move_map_to_point(location)
					self.render_rows(api_response.result[0])

				}
				
				resolve(true)
			})}
		})
	},//end form_submit

	cargarMonedasCecas : async function(ceca) {
		try {
			const monedas = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'coins',
					ar_fields: ["*"],
					sql_filter: `mint_name LIKE '%${ceca}%'`,
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
	generate_Tree : function(tree,node,node_parent,padding){

	
		const info_node = common.create_dom_element({
					element_type	: "div",
					class_name		: "container_prueba",
					text_content	: node.info_nodo.name,
					parent			: node_parent
		})
		info_node.style.paddingLeft = `${padding}em`
		if(node.info_nodo.children == null){


		}else{

			for (let index = 0; index < tree.length; index++) {
				if (tree[index].info_nodo.parent == '["'+node.info_nodo.section_id+'"]') {
					
					tree[index].padre = "'"+node.info_nodo.section_id+"'"
					this.generate_Tree(tree,tree[index],info_node,1.5)
				}
				
			}

		}

	},

	render_rows : async function(row){

		if(row.table === "mints"){
			const coins = await this.cargarMonedasCecas(row.name)
			await this.render_rows_cecas(row,coins.result)
		}else{
			await this.render_rows_hallazgo(row)
		}


	},

	render_rows_hallazgo : async function(row) {

		const self = this
		const fragment = new DocumentFragment()
		let text_content = null
		let separador = null

		text_content = "Hallazgo : " + row.name
		separador = "-"
		

		const container_titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_title",
			parent			: fragment
		})

		const titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle green-color",
			text_content	: text_content,
			parent			: container_titulo
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
			parent			: fragment
		})
		
		const road = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle mid",
			text_content	: row.place.split(separador)[0],
			parent			: fragment
		})


		const findspot_tree = await this.createfindspot_Tree(row)

		console.log(findspot_tree)

		this.generate_Tree(findspot_tree,findspot_tree[0],fragment,0)

		road.style.display = "none"

		imagen.addEventListener("mousedown", function(){

			if(self.button_state){
				imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
				road.style.display = "none"
				
			}else{
				imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
				road.style.display = "block"
			}
			self.button_state = !self.button_state
		})

		self.rows_container.appendChild(fragment)

	},

	render_rows_cecas : async function(row,coins) {

		const self = this
		const fragment = new DocumentFragment()
		let text_content = null
		let separador = null

		text_content = "Ceca : " + row.name
		separador = ","


		const container_titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_title",
			parent			: fragment
		})

		const titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle green-color",
			text_content	: text_content,
			parent			: container_titulo
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
			parent			: fragment
		})
		
		const road = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle mid",
			text_content	: row.place.split(separador)[0],
			parent			: fragment
		})

		const container_text_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_text_rows",
			parent			: fragment
		})

		const title_text_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "title_text_rows",
			text_content	: "Monedas("+coins.length+")",
			parent			: container_text_rows
		})


		const imagen_flecha_monedas = common.create_dom_element({
			element_type	: "img",
			class_name		: "imagen_text_rows",
			src				: "tpl/assets/images/arrow-right.svg",
			parent			: container_text_rows
		})

		const container_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_rows",
			parent			: fragment
		})

		for (let index = 0; index < coins.length; index++) {
			
			const info_coin = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_coin",
				parent			: container_rows
			})

			const container_images = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_images",
				parent			: info_coin
			})
			const parsedCoinData = coins[index];
			const image_obverse = "https://wondercoins.uca.es" + parsedCoinData.image_obverse
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_observe",
				src				: image_obverse,
				parent			: container_images
			})
			const image_reverse = "https://wondercoins.uca.es" + parsedCoinData.image_reverse
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_reserve",
				src				: image_reverse,
				parent			: container_images
			})
			const container_data = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_data",
				parent			: info_coin
			})
			
			let weight_text = null
			if(coins[index].weight != null){
				weight_text = "Peso: " + coins[index].weight +"g"
			}else{
				weight_text= "Peso: N/A"
			}

			const weight = common.create_dom_element({
				element_type	: "span",
				class_name		: "weight",
				text_content	: weight_text,
				parent			: container_data
			})
			const diameter = common.create_dom_element({
				element_type	: "span",
				class_name		: "diameter",
				text_content	: "Módulo: "+ coins[index].diameter +"mm" ,
				parent			: container_data
			})

			const catalogue_type = common.create_dom_element({
				element_type	: "span",
				class_name		: "catalogue_type",
				text_content	: "Colección: "+ coins[index].collection ,
				parent			: container_data
			})

			let findspot_text = coins[index].findspot.split(" | ")[0]
			const findspot = common.create_dom_element({
				element_type	: "span",
				class_name		: "findspot",
				text_content	:  "Hallazgo: "+ findspot_text,
				parent			: info_coin
			})

			const tipo = common.create_dom_element({
				element_type	: "span",
				class_name		: "type",
				text_content	:  "Tipo: "+ coins[index].type_full_value,
				parent			: info_coin
			})

			const container_links = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_links",
				parent			: info_coin
			})

			const type_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "type_link",
				href			: "/web_numisdata/type/"+ coins[index].type,
				text_content	: "TIPO",
				parent			: container_links
			})
			
		}


		road.style.display = "none"
		container_rows.style.display = "none"
		let container_rows_state = false
		imagen.addEventListener("mousedown", function(){

			if(self.button_state){
				imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
				road.style.display = "none"
				
			}else{
				imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
				road.style.display = "block"
			}
			self.button_state = !self.button_state
		})

		imagen_flecha_monedas.addEventListener("mousedown", function(){

			if(container_rows_state){
				imagen_flecha_monedas.style.transform  = "rotate(0deg) translateY(0.60vh)";
				container_rows.style.display = "none"
				
			}else{
				imagen_flecha_monedas.style.transform  = "rotate(90deg) translateX(0.60vh)";
				container_rows.style.display = "grid"
			}
			container_rows_state = !container_rows_state
		})


		self.rows_container.appendChild(fragment)

	}


	



}//end coins


