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
				eq 			: "MATCH",
				eq_in 		: "",
				eq_out 		: "",
				// q_table 	: "mints",
				class_name	: 'global_search',
				parent		: form_row,
				callback	: function(form_item) {
					const node_input = form_item.node_input

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
				label		: tstring.name || "Name",
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
						table		: table
					})
				}
			})

		// place
			self.form.item_factory({
				id			: "place",
				name		: "place",
				label		: tstring.place || "Place",
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
				const parsed_filter	= self.form.parse_sql_filter(filter, group)
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
			
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }
				console.log(sql_filter)
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
			.then(function(api_response){
				console.log("--------------- api_response:",api_response);
	

				// parse data
					const data	= page.parse_hoard_data(api_response.result)
					const total	= api_response.total
					const random = Math.floor(Math.random() * (total));

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
					const estructura = common.create_dom_element({
						element_type	: "div",
						class_name		: "grid-stack",
						parent			: rows_container
					})

					const grid = GridStack.init(estructura);
					const titulo = grid.addWidget({w:4,h:1,content: `${api_response.result[200].name}`})
					const contentDiv = titulo.querySelector('.grid-stack-item-content');
					contentDiv.id = "titulo-ficha";

					const imagen_ident = grid.addWidget({w:4,h:2,content: `<img src="https://wondercoins.uca.es${api_response.result[200].identify_image}" alt="Imagen dinámica" style="width:100%; height:100%; object-fit:cover; overflow: hidden;"`})
					const img_ident = imagen_ident.querySelector('.grid-stack-item-content');
					img_ident.id = "img_ident"


								const map = new map_factory() // creates / get existing instance of map
								

					grid.addWidget({w:4,h:10,content: ""})
					grid.addWidget({w:4,h:4,content: `${api_response.result[200].public_info}`})
					const ubicacion=grid.addWidget({w:2,h:2,content: ``}) //ubicacion

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
				
						resultado.hallazgos.datos.push(api_response.result[200])


					map.init({
									map_container		: ubicacion,
									map_position		: api_response.result[200].map,
									source_maps			: page.maps_config.source_maps,
									result				: resultado,
									findspot			: true
								})

					grid.addWidget({w:2,h:2,content: ``}) //imagenes
					grid.addWidget({w:2,h:1,content: ``})
					grid.addWidget({w:2,h:1,content: ``})
					grid.addWidget({w:2,h:1,content: ``})
					grid.addWidget({w:2,h:1,content: ``})
					grid.addWidget({w:4,h:1,content: ``})
					grid.addWidget({w:8,h:4,content: `${api_response.result[200].public_info}`})
					grid.addWidget({w:8,h:3,content: ``})
					grid.addWidget({w:4,h:3,content: ``})
			})

			// scrool to head result
			const div_result = document.querySelector(".rows_container")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}
		})
	}//end form_submit


}//end hoards
