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

		// map
			self.source_maps = [

				{
					name	: "OSM",
					url		: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					options	: {
						maxZoom	: 19
					}
				},
				{
					name	: 'Map Tiles',
					// url	: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb', // 512 ...
					url		: 'https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb', // 256 ok
					// url	: 'https://api.maptiler.com/maps/9512807c-ffd5-4ee0-9781-c354711d15e5/style.json?key=udlBrEEE2SPm1In5dCNb', // vector grey
					options	: {
						maxZoom	: 20
					},
					default	: true
				},
				{
					name	: "ARCGIS",
					url		: '//server.arcgisonline.com/ArcGIS/' + 'rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
					options	: {}
				}
			]

						let resultado = {
						hallazgos: {
							datos: null
						},
						cecas: {
							datos: null
						},
						complejo: {
							datos: null
						}
						};

async function cargarTodoYCrearMapa() {
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

		// ✅ Los tres datasets están listos, iniciamos el mapa
		self.map_factory_instance = new map_factory();
		self.map_factory_instance.init({
			map_container: self.map_container,
			map_position: [36.5297, -6.2924],
			source_maps: self.source_maps,
			result: resultado
		});

	} catch (error) {
		console.error("Error cargando datos:", error);
	}
}

cargarTodoYCrearMapa();


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
				eq				: "LIKE",
				eq_in			: "%",
				eq_out			: "%",
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
			self.form.item_factory({
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
			})

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
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
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
			self.map_container.classList.add("loading")

		return new Promise(function(resolve){

			const ar_fields = ["name","map","section_id"]

			// sql_filter

				const filter = self.form.build_filter()
				console.log(self.form.form_items) // -----IMPORTANTE-----
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
				console.log("El sql filter es" + sql_filter)
			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: 'mints',
					ar_fields		: ar_fields,
					sql_filter		: `( ${self.form.form_items.mint.q_column} LIKE '%${self.form.form_items.mint.q !== '' ? self.form.form_items.mint.q : self.form.form_items.mint.q_selected}%' AND name !='')`,
					limit			: 0,
					count			: false,
					offset			: 0,
					order			: 'section_id ASC',
					// group		: "type_data",
					process_result	: null
				}
			})
			.then(function(api_response){
				console.log("--------------- form_submit api_response:", api_response);
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
				}
				

				resolve(true)
			})
		})
	}//end form_submit



	

	



}//end coins


