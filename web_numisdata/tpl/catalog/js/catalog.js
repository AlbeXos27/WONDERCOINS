/*global tstring, page_globals, SHOW_DEBUG, Promise, event_manager, catalog_row_fields, psqo_factory, $, common, page, form_factory, data_manager */
/*eslint no-undef: "error"*/

"use strict";


var catalog = {

	trigger_url			: page_globals.__WEB_TEMPLATE_WEB__ + "/catalog/trigger.catalog.php",
	search_options		: {},
	selected_term_table : null, // Like 'mints'

	// global filters
	filters		: {},
	filter_op	: "AND",
	draw_delay	: 1, // ms 390

	// form_items
	// form_items : [],

	// form factory instance
	form : null,

	// DOM containers
	rows_list_container		: null,
	export_data_container	: null,



	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		// options
			// const global_search		= options.global_search
			const rows_list_container	= options.rows_list_container
			const export_data_container	= options.export_data_container
			const form_items_container	= options.form_items_container
			const psqo					= options.psqo
			
		// fix
			self.rows_list_container	= rows_list_container
			self.export_data_container	= export_data_container
			self.form_items_container	= form_items_container

		// mints selector
			// 		const select = self.draw_select({
			// 			data		: response.result,
			// 			term_table	: "mints",
			// 			filter_id 	: "mints",
			// 			default		: [{section_id:'0',name:"Select mint"}],
			// 			filter 		: function(item) {
			// 				// filter
			// 					const filter_value = {
			// 						"OR": []
			// 					}

			// 				// parents
			// 					const parents = item.parents ? JSON.parse(item.parents) : null
			// 					if (parents) {
			// 						for (let j = 0; j < parents.length; j++) {
			// 							filter_value["OR"].push({
			// 								'field' : 'section_id',
			// 								'value' : `${parents[j]}`,
			// 								'op' 	: '='
			// 							})
			// 						}
			// 					}

			// 				// self
			// 					filter_value["OR"].push({
			// 						'field' : 'section_id',
			// 						'value' : `${item.section_id}`,
			// 						'op' 	: '='
			// 					})

			// 				// childrens
			// 					filter_value["OR"].push({
			// 						'field' : 'parents',
			// 						'value' : `'%"${item.section_id}"%'`,
			// 						'op' 	: 'LIKE'
			// 					})

			// 				return filter_value
			// 			}
			// 		})

			// 	container.appendChild(select)
			// })

		// load periods list
			// self.load_period_list().then(function(response){

			// 	// periods selector
			// 		const select = self.draw_select({
			// 			data		: response.result,
			// 			term_table	: "ts_period",
			// 			filter_id 	: "period",
			// 			default		: [{section_id:'0',name:"Select period"}],
			// 			filter 		: function(item) {

			// 				// filter
			// 					const filter_value = {
			// 						"OR": []
			// 					}

			// 				// parents
			// 					const parents = item.parents ? JSON.parse(item.parents) : null
			// 					if (parents) {
			// 						for (let j = 0; j < parents.length; j++) {
			// 							filter_value["OR"].push({
			// 								'field' : 'section_id',
			// 								'value' : `${parents[j]}`,
			// 								'op' 	: '='
			// 							})
			// 						}
			// 					}

			// 				// self
			// 					filter_value["OR"].push({
			// 						'field' : 'section_id',
			// 						'value' : `${item.section_id}`,
			// 						'op' 	: '='
			// 					})

			// 				// childrens
			// 					filter_value["OR"].push({
			// 						'field' : 'parents',
			// 						'value' : `'%"${item.section_id}"%'`,
			// 						'op' 	: 'LIKE'
			// 					})

			// 				return filter_value
			// 			}
			// 		})

			// 	container.appendChild(select)
			// })

		// load material list
			// self.load_material_list().then(function(response){

			// 	// material selector
			// 		const select = self.draw_select({
			// 			data		: response.result,
			// 			term_table	: "type",
			// 			filter_id 	: "material",
			// 			default		: [{section_id:'0',name:"Select material"}],
			// 			filter 		: function(item) {

			// 					console.log("item:",item);

			// 				// filter
			// 					const filter_value = {
			// 						"OR": []
			// 					}

			// 				// parents
			// 					const parents = item.parents ? JSON.parse(item.parents) : null
			// 					if (parents) {
			// 						for (let j = 0; j < parents.length; j++) {
			// 							filter_value["OR"].push({
			// 								'field' : 'section_id',
			// 								'value' : `${parents[j]}`,
			// 								'op' 	: '='
			// 							})
			// 						}
			// 					}

			// 				// self
			// 					filter_value["OR"].push({
			// 						'field' : 'ref_type_material_data',
			// 						'value' : `${item.section_id}`,
			// 						'op' 	: '='
			// 					})

			// 				// // childrens
			// 				// 	filter_value["OR"].push({
			// 				// 		'field' : 'parents',
			// 				// 		'value' : `'%"${item.section_id}"%'`,
			// 				// 		'op' 	: 'LIKE'
			// 				// 	})

			// 				return filter_value
			// 			}
			// 		})

			// 	container.appendChild(select)
			// })

		// form
			const form_node = self.render_form()
			self.form_items_container.appendChild(form_node)

		// first search
			if(psqo && psqo.length>1){

				// if psqo is received, recreate the original search into the current form and submit
				const decoded_psqo = psqo_factory.decode_psqo(psqo)
				//console.log(decoded_psqo)
				if (decoded_psqo) {

					self.form.parse_psqo_to_form(decoded_psqo)
					self.form_submit(form_node, {
						scroll_result : true
					})
				}//end if (decoded_psqo)

			}else{

				// load mints list
					self.load_mint_list()
					.then(function(response){

						// pick random one value
						const mint = response.result[Math.floor(Math.random() * response.result.length)];

						// form_factory instance
						 const custom_form = new form_factory()
						 const mint_item = custom_form.item_factory({
							id			: "mint",
							name		: "mint",
							label		: tstring.mint || "mint",
							q_column	: "p_mint",
							eq			: "=",
							eq_in		: "",
							eq_out		: "",
							q  			: `["${mint.name}"]`,
							is_term		: true
						})
						
						// console.log("custom_form.form_items", [a]);
						self.form_submit(form_node, {
							form_items		: [mint_item],
							scroll_result	: true
						})
					})
			}


		return true
	},//end set_up



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		// form_factory instance
			self.form = self.form || new form_factory()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name 		: "form-row fields",
			parent 			: fragment
		})
		

		 // global_search
			self.form.item_factory({
				id 			: "global_search",
				name 		: "global_search",
				label		: tstring.global_search || "global_search",
				q_column 	: "global_search",
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

		// mint
			self.form.item_factory({
				id				: "mint",
				name			: "mint",
				label			: tstring.mint || "mint",
				q_column		: "p_mint",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				eq				: "LIKE",
				eq_in			: "%",
				eq_out			: "%",
				is_term			: true,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// number
			self.form.item_factory({
				id 			: "number",
				name 		: "number",
				q_column 	: "term",
				q_table 	: "types",
				label		: "Grupo Numismático",
				is_term 	: false,
				parent		: form_row,
				group_op 	: '$or',
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// Cargo
			self.form.item_factory({
				id				: "role",
				name			: "role",
				label			: tstring.role || "Role",
				q_column		: "ref_type_creators_roles", //"p_creator",
				//value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				//q_splittable 	: true,
				value_split : "|",
				q_selected_eq 	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false, //true
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						value_splittable : true
						
					})
				}
			})

		// creator (autoridad)
			self.form.item_factory({
				id				: "creator",
				name			: "creator",
				label			: tstring.creator || "creator",
				q_column		: "ref_type_creators_full_name", //"p_creator",
				// value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				// q_splittable 	: true,
				q_selected_eq 	: 'LIKE',
				value_split		: " | ",
				eq_in			: "%",
				eq_out			: "%",
				is_term			: false, //true
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						value_splittable : true
						
					})
				}
			})

		// design_obverse
			self.form.item_factory({
				id			: "design_obverse",
				name		: "design_obverse",
				label		: tstring.design_obverse || "design obverse",
				q_column	: "ref_type_design_obverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// design_reverse
			self.form.item_factory({
				id			: "design_reverse",
				name		: "design_reverse",
				label		: tstring.design_reverse || "design reverse",
				q_column	: "ref_type_design_reverse",
				eq_in		: "%",
				// q_table	: "ts_period",
				is_term		: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})


		// legend_obverse
			self.form.item_factory({
				id				: "legend_obverse",
				name			: "legend_obverse",
				label			: tstring.legend_obverse || "legend obverse",
				// q_column		: "ref_type_legend_obverse",
				q_column		: "CONCAT(ref_type_legend_obverse, ' | ', ref_type_legend_transcription_obverse)",
				q_column_filter	: "ref_type_legend_transcription_obverse",
				eq_in			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// legend_reverse
			self.form.item_factory({
				id				: "legend_reverse",
				name			: "legend_reverse",
				label			: tstring.legend_reverse || "legend reverse",
				// q_column		: "ref_type_legend_reverse",
				q_column		: "CONCAT(ref_type_legend_reverse, ' | ', ref_type_legend_transcription_reverse)",
				q_column_filter	: "ref_type_legend_transcription_reverse",
				eq_in			: "%",
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// territory
			self.form.item_factory({
				id				: "territory",
				name			: "territory",
				label			: tstring.territory || "territory",
				q_column		: "p_territory",
				q_selected_eq	: 'LIKE',
				eq_in			: "%",
				eq_out			: "%",
				is_term			: true,
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// group
			self.form.item_factory({
				id 			: "group",
				name 		: "group",
				label		: "Catálogo" || "group",
				q_column 	: "p_group",
				eq_in 		: "%",
				// q_table 	: "ts_period",
				is_term 	: true,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// material
			self.form.item_factory({
				id 			: "material",
				name 		: "material",
				q_column 	: "ref_type_material",
				q_table 	: "any",
				label		: tstring.material || "material",
				is_term 	: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// collection (disabled by keynote note 09-03-2021)
			// self.form.item_factory({
			// 	id 			: "collection",
			// 	name 		: "collection",
			// 	q_column 	: "ref_coins_collection",
			// 	q_table 	: "any",
			// 	label		: tstring.collection || "collection",
			// 	is_term 	: false,
			// 	parent		: form_row,
			// 	callback	: function(form_item) {
			// 		self.form.activate_autocomplete({
			//			form_item	: form_item,
			//			table		: 'catalog'
			//		})
			// 	}
			// })

		// denomination
			self.form.item_factory({
				id 			: "denomination",
				name 		: "denomination",
				q_column 	: "ref_type_denomination",
				q_table 	: "any",
				label		: tstring.denomination || "denomination",
				is_term 	: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						
					})
				}
			})

		// company (disabled by keynote note 09-03-2021)
			// self.form.item_factory({
			// 	id 			: "company",
			// 	name 		: "company",
			// 	q_column 	: "ref_coins_auction_company",
			// 	q_table 	: "types",
			// 	label		: tstring.company || "company",
			// 	is_term 	: false,
			// 	parent		: form_row,
			// 	callback	: function(form_item) {
			// 		self.form.activate_autocomplete({
			//			form_item	: form_item,
			//			table		: 'catalog'
			//		})
			// 	}
			// })

		// technique
/* 			self.form.item_factory({
				id 			: "technique",
				name 		: "technique",
				q_column 	: "ref_type_technique",
				q_table 	: "types",
				label		: tstring.technique || "technique",
				is_term 	: false,
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog'
					})
				}
			}) */

		// period
			// self.form.item_factory({
			// 	id				: "period",
			// 	name			: "period",
			// 	label			: tstring.period || "period",
			// 	q_column		: "p_period",
			// 	value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
			// 	eq_in			: "%",
			// 	// q_table		: "ts_period",
			// 	is_term			: true,
			// 	parent			: form_row,
			// 	callback		: function(form_item) {
			// 		self.form.activate_autocomplete({
			// 			form_item	: form_item,
			// 			table		: 'catalog'
			// 		})
			// 	}
			// })

		// range slider date (range_slider) (!) WORKING HERE
			self.form.item_factory({
				id			: "range_slider",
				name		: "range_slider",
				input_type	: 'range_slider',
				label		: tstring.period || "Period",
				class_name	: 'range_slider',
				q_column	: "ref_date_in,ref_date_end",
				// eq		: "LIKE",
				// eq_in	: "",
				// eq_out	: "%",
				// q_table	: "catalog",
				sql_filter	: null,
				parent		: form_row,
				callback	: function(form_item) {

					// const form_item				= this
					const node_input				= form_item.node_input
					const range_slider_value_in		= node_input.parentNode.querySelector('#range_slider_in')
					const range_slider_value_out	= node_input.parentNode.querySelector('#range_slider_out')

					function set_up_slider() {

						// compute range years
						self.get_catalog_range_years()
						.then(function(range_data){
							// console.log("range_data:",range_data);

							// destroy current slider instance if already exists
								if ($(node_input).slider("instance")) {
									$(node_input).slider("destroy")
								}

							// reset filter
								form_item.sql_filter = null

							// set inputs values from database
								range_slider_value_in.value	= range_data.min
								range_slider_value_in.addEventListener("change",function(e){
									const value = (e.target.value>=range_data.min)
										? e.target.value
										: range_data.min
									$(node_input).slider( "values", 0, value );
									e.target.value = value
								})
								range_slider_value_out.value = range_data.max
								range_slider_value_out.addEventListener("change",function(e){
									const value = (e.target.value<=range_data.max)
										? e.target.value
										: range_data.max
									$(node_input).slider( "values", 1, e.target.value );
									e.target.value = value
								})

							// active jquery slider
								$(node_input).slider({
									range	: true,
									min		: range_data.min,
									max		: range_data.max,
									step	: 1,
									values	: [ range_data.min, range_data.max ],
									slide	: function( event, ui ) {
										// update input values on user drag slide points
										range_slider_value_in.value	 = ui.values[0]
										range_slider_value_out.value = ui.values[1]
										// console.warn("-----> slide range form_item.sql_filter:",form_item.sql_filter);
									},
									change: function( event, ui ) {
										// update form_item sql_filter value on every slider change
										form_item.sql_filter = "(ref_date_in >= " + ui.values[0] + " AND ref_date_in <= "+ui.values[1]+")"; // AND (ref_date_end <= " + ui.values[1] + " OR ref_date_end IS NULL)
										form_item.q = ui.value
										// console.warn("-----> change range form_item.sql_filter:", form_item.sql_filter);
									}
								});
						})
					}

					// initial_map_loaded event (triggered on initial map data is ready)
					// event_manager.subscribe('initial_map_loaded', set_up_slider)
					set_up_slider()
				}
			})

		// ref_type_design_obverse_iconography_data
			self.form.item_factory({
				id				: "ref_type_design_obverse_iconography_data",
				name			: "ref_type_design_obverse_iconography_data",
				class_name		: 'hide',
				label			: tstring.ref_type_design_obverse_iconography_data || "Design obverse iconography ID",
				q_column		: "ref_type_design_obverse_iconography_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
				}
			})

		// ref_type_design_reverse_iconography_data
			self.form.item_factory({
				id				: "ref_type_design_reverse_iconography_data",
				name			: "ref_type_design_reverse_iconography_data",
				class_name		: 'hide',
				label			: tstring.ref_type_design_reverse_iconography_data || "Design reverse iconography ID",
				q_column		: "ref_type_design_reverse_iconography_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
				}
			})

		// ref_type_symbol_obverse_data
			self.form.item_factory({
				id				: "ref_type_symbol_obverse_data",
				name			: "ref_type_symbol_obverse_data",
				class_name		: 'hide',
				label			: tstring.ref_type_symbol_obverse_data || "Symbol obverse ID",
				q_column		: "ref_type_symbol_obverse_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
				}
			})

		// ref_type_symbol_reverse_data
			self.form.item_factory({
				id				: "ref_type_symbol_reverse_data",
				name			: "ref_type_symbol_reverse_data",
				class_name		: 'hide',
				label			: tstring.ref_type_symbol_reverse_data || "Symbol reverse ID",
				q_column		: "ref_type_symbol_reverse_data",
				q_selected_eq	: 'LIKE',
				eq_in			: '%"',
				eq_out			: '"%',
				is_term			: false,
				parent			: form_row,
				callback		: function(form_item) {
					event_manager.subscribe('form_submit', fn_check_value)
					function fn_check_value() {
						if (form_item.q && form_item.q.length>0) {
							form_item.node_input.parentNode.classList.remove('hide')
							form_item.node_input.parentNode.querySelector('input').classList.remove('hide')
						}else{
							form_item.node_input.parentNode.classList.add('hide')
						}
					}
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
				self.form_submit(form)
			})

		// reset_button
			const reset_button = common.create_dom_element({
				element_type	: "input",
				type 			: "button",
				id 				: "button_reset",
				value 			: tstring.reset || 'Reset',
				class_name 		: "btn btn-light btn-block secondary button_reset",
				parent 			: submit_group
			})
			reset_button.addEventListener("click",function(e){
				e.preventDefault()
				window.location.replace(window.location.pathname); // + window.location.search + window.location.hash
			})

		// operators
			// fragment.appendChild( forms.build_operators_node() )
			const operators_node = self.form.build_operators_node()
			fragment.appendChild( operators_node )

		// form
			const form = common.create_dom_element({
				element_type	: "form",
				id 				: "search_form",
				class_name 		: "form-inline"
			})
			form.appendChild(fragment)



		return form
	},//end render_form



	/**
	* LOAD_MINT_LIST
	* @return promise
	*/
	load_mint_list : function() {

		const js_promise = data_manager.request({
			body : {
				dedalo_get 	: 'records',
				table 		: 'catalog',
				ar_fields 	: ['section_id','term AS name','parents'],
				// sql_fullselect : 'DISTINCT term, '
				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
				limit 		: 0,
				count 		: false,
				order 		: 'term ASC',
				sql_filter  : 'term_table=\'mints\''
			}
		})

		return js_promise
	},//end load_mint_list



	/**
	* LOAD_PERIOD_LIST
	* @return promise
	*/
		// load_period_list : function() {

		// 	const js_promise = data_manager.request({
		// 		body : {
		// 			dedalo_get 	: 'records',
		// 			table 		: 'catalog',
		// 			ar_fields 	: ['section_id','term AS name','parents'],
		// 			// sql_fullselect : 'DISTINCT term, '
		// 			lang 		: page_globals.WEB_CURRENT_LANG_CODE,
		// 			limit 		: 0,
		// 			count 		: false,
		// 			order 		: 'term ASC',
		// 			sql_filter  : 'term_table=\'ts_period\''
		// 		}
		// 	})

		// 	return js_promise
		// },//end load_period_list



	/**
	* LOAD_MATERIAL_LIST
	* @return promise
	*/
		// load_material_list : async function() {

		// 	// search base . Gets list of values for real table like 'materials'
		// 		const search_base = await data_manager.request({
		// 			body : {
		// 				dedalo_get 	: 'records',
		// 				table 		: 'material',
		// 				ar_fields 	: ['section_id','CONCAT(term, " | ", symbol) AS name'],
		// 				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
		// 				limit 		: 0,
		// 				count 		: false,
		// 				order 		: 'name ASC',
		// 				sql_filter  : ''
		// 			}
		// 		})

		// 	// search secondary. Gets main table matches
		// 		const search_secondary = await data_manager.request({
		// 			body : {
		// 				dedalo_get 	: 'records',
		// 				table 		: 'catalog',
		// 				ar_fields 	: ['section_id', 'ref_type_material_data'],
		// 				lang 		: page_globals.WEB_CURRENT_LANG_CODE,
		// 				limit 		: 0,
		// 				count 		: false,
		// 				order 		: 'section_id ASC',
		// 				sql_filter  : search_base.result.map(item => "`ref_type_material_data` LIKE '%\"" + item.section_id + "\"%'").join(" OR ")
		// 			}
		// 		})

		// 	// add to search_base the secondary results
		// 		const ar_mix = search_base.result.map(item => {

		// 			const types = search_secondary.result.filter( el => el.ref_type_material_data==="[\"" + item.section_id +"\"]" )
		// 			item.types  = types.map(el => el.section_id)

		// 			return item
		// 		})

		// 	// final response object
		// 		const response = {
		// 			result : ar_mix
		// 		}

		// 	return response
		// },//end load_material_list



	/**
	* DRAW_SELECT
	* @return promise
	*/
		// draw_select : function(options) {

		// 	const self = this

		// 	const filter_id 		= options.filter_id
		// 	const data 			  	= options.data
		// 	const term_table		= options.term_table
		// 	const options_default	= options.default || [{section_id:'0',name:"Select option"}]

		// 	const fragment = new DocumentFragment()

		// 	// prepend empty option
		// 		const elements = options_default.concat(data)

		// 	// iterate option
		// 		const elements_length = elements.length
		// 		for (let i = 0; i < elements_length; i++) {

		// 			const item = elements[i]

		// 			const filter_value = options.filter(item)

		// 			common.create_dom_element({
		// 				element_type	: 'option',
		// 				value 			: JSON.stringify(filter_value),
		// 				text_content 	: item.name,
		// 				parent 			: fragment
		// 			})
		// 		}

		// 	// select node
		// 		const select = common.create_dom_element({
		// 			  element_type 	: "select",
		// 			  class_name 	: "select_" + term_table
		// 		})
		// 		select.addEventListener("change", function(e){

		// 			const value = e.target.value
		// 			if (!value) return false

		// 			// fix selected term_table (start point)
		// 				self.selected_term_table = term_table

		// 			// clean container and add_spinner
		// 				const container = document.querySelector("#rows_list")
		// 				while (container.hasChildNodes()) {
		// 					container.removeChild(container.lastChild);
		// 				}
		// 				page.add_spinner(container)

		// 			// search
		// 				const filter = JSON.parse(value)

		// 				// fix global_filter value (!)
		// 					self.filters[filter_id] = filter
		// 						console.log("self.filters:",self.filters);

		// 				const search_promise = self.search_rows({
		// 					limit	: 0
		// 				})

		// 			// draw response rows
		// 				search_promise.then(function(response){
		// 					setTimeout(()=>{
		// 						self.draw_rows({
		// 							target  : 'rows_list',
		// 							ar_rows : response.result
		// 						})
		// 					}, self.draw_delay)
		// 				})
		// 		})
		// 		select.appendChild(fragment)


		// 	return select
		// },//end draw_select



	/**
	* FORM_SUBMIT
	* Form submit launch search
	*/
	form_submit : function(form_obj, options={}) {

		const self = this

		// options
			const scroll_result	= typeof options.scroll_result==="boolean" ? options.scroll_result : true
			const form_items	= options.form_items || self.form.form_items

		// node containers
			const container_rows_list	= self.rows_list_container // div_result.querySelector("#rows_list")
			const div_result			= container_rows_list.parentNode // document.querySelector(".result")

		// spinner add
			const spinner = common.create_dom_element({
				element_type	: "div",
				class_name		: "spinner",
				parent			: div_result
			})

		// loading set css
			container_rows_list.classList.add("loading")


		// build filter
			const filter = self.form.build_filter({
				form_items : form_items
			})

		// empty filter case
			if (!filter || filter.length<1) {
				spinner.remove()
				container_rows_list.classList.remove("loading")
				return false;
			}

		// export_data_buttons added once
			if (!self.export_data_buttons) {
				self.export_data_buttons = page.render_export_data_buttons()
				self.export_data_container.appendChild(self.export_data_buttons)
				self.export_data_container.classList.add("hide")

				//suggestions_form_button
				const contact_form_button = page.create_suggestions_button()
				self.export_data_container.appendChild(contact_form_button)
			}

		// scrool to head result
			if (div_result && scroll_result===true) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}

		// search rows exec against API
			const js_promise = self.search_rows({
				filter			: filter,
				limit			: 300,
				process_result	: {
					fn		: 'process_result::add_parents_and_children_recursive',
					columns	: [{name : "parents"}]
				}
			})
			.then((parsed_data)=>{


				const types_parsed_data = parsed_data.filter( item => (item.term_table === "types" && item.p_group != null));
				const set_group_parsed_data = new Set();

				for (let index = 0; index < types_parsed_data.length; index++) {
					set_group_parsed_data.add(JSON.parse(types_parsed_data[index].p_group)[0]);
				}
				
				const keys_group = Array.from(set_group_parsed_data);
				const structure_tree = {};

				for (let index = 0; index < keys_group.length; index++) {
					
					const base_key = {
						people : {},
						no_people : {mints: {},
							no_mints : []
						}
					};
					structure_tree[keys_group[index]] = base_key;
				}

				const set_people_parsed_data = new Set();
				let types_without_people = 0;

				for (let index = 0; index < types_parsed_data.length; index++) {

					if(types_parsed_data[index].ref_type_creators_names == null || !types_parsed_data[index].ref_type_creators_roles || !types_parsed_data[index].ref_type_creators_roles.includes("Autoridad")){

						types_without_people +=1;

					}else{

						set_people_parsed_data.add(types_parsed_data[index]);

					}

				}
				
				const array_people_data =  Array.from(set_people_parsed_data);

				this.get_authors_from_find(array_people_data,structure_tree);
				this.get_mints_from_find(types_parsed_data,structure_tree);
				this.get_types_from_find(types_parsed_data,structure_tree);
				//console.log("macaco ",structure_tree)


				//event_manager.publish('form_submit', parsed_data)

				// draw
				// clean container_rows_list and add_spinner
					while (container_rows_list.hasChildNodes()) {
						container_rows_list.removeChild(container_rows_list.lastChild);
					}
					container_rows_list.classList.remove("loading")
					spinner.remove()

				// draw rows
					self.draw_rows({
						target  : self.rows_list_container,
						ar_rows : parsed_data,
						structure_tree : structure_tree
					})
					.then(function(){
						self.export_data_container.classList.remove("hide")
					})
			})


		return js_promise
	},//end form_submit



	/**
	* FORM_SUBMIT_OLD
	* Form submit launch search
	*/
		// form_submit_OLD : function(form_obj, options={}) {

		// 	const self = this

		// 	// options
		// 		const scroll_result	= typeof options.scroll_result==="boolean" ? options.scroll_result : true
		// 		const form_items	= options.form_items || self.form.form_items

		// 	const container_rows_list	= self.rows_list_container //	div_result.querySelector("#rows_list")
		// 	const div_result			= container_rows_list.parentNode // document.querySelector(".result")

		// 	// spinner add
		// 		// page.add_spinner(div_result)
		// 		const spinner = common.create_dom_element({
		// 			element_type	: "div",
		// 			class_name		: "spinner",
		// 			parent			: div_result
		// 		})

		// 	// ar_is_term
		// 		const ar_is_term = []
		// 		for (let [id, form_item] of Object.entries(form_items)) {
		// 			if (form_item.is_term===true) ar_is_term.push(form_item)
		// 		}

		// 	const ar_query_elements = []
		// 	for (let [id, form_item] of Object.entries(form_items)) {

		// 		const current_group = []

		// 		const group_op = (form_item.is_term===true) ? "$or" : "$and"
		// 		const group = {}
		// 			  group[group_op] = []

		// 		// q value
		// 			if (form_item.q.length>0) {

		// 				const c_group_op = '$and'
		// 				const c_group = {}
		// 					  c_group[c_group_op] = []

		// 				  const safe_value = (typeof form_item.q==='string' || form_item.q instanceof String)
		// 					  ? form_item.q.replace(/(')/g, "''")
		// 					  : form_item.q

		// 				// q element
		// 					const element = {
		// 						field	: form_item.q_column,
		// 						value	: `'%${safe_value}%'`,
		// 						op		: form_item.eq // default is 'LIKE'
		// 					}

		// 					c_group[c_group_op].push(element)

		// 				// q_table element
		// 					// if (form_item.q_table && form_item.q_table!=="any") {

		// 					// 	const element_table = {
		// 					// 		field	: form_item.q_table_name,
		// 					// 		value	: `'${form_item.q_table}'`,
		// 					// 		op		: '='
		// 					// 	}

		// 					// 	c_group[c_group_op].push(element_table)
		// 					// }

		// 				// add basic group
		// 					group[group_op].push(c_group)

		// 				// is_term
		// 					// const t_group_op = 'AND'
		// 					// const t_group = {}
		// 					// 	  t_group[t_group_op] = []

		// 					// if (form_item.is_term===true) {

		// 					// 	const element = {
		// 					// 		field	: 'parents_text',
		// 					// 		value	: `'%${form_item.q}%'`,
		// 					// 		op		: 'LIKE',
		// 					// 		debug_name 	: form_item.name
		// 					// 	}
		// 					// 	t_group[t_group_op].push(element)

		// 					// }else{

		// 					// 	for (let g = 0; g < ar_is_term.length; g++) {
		// 					// 		const is_term_item = ar_is_term[g]

		// 					// 		if (is_term_item.q.length<1) continue

		// 					// 		const element = {
		// 					// 			field	: 'parents_text',
		// 					// 			value	: `'%${is_term_item.q}%'`,
		// 					// 			op		: 'LIKE',
		// 					// 			debug_name 	: form_item.name
		// 					// 		}
		// 					// 		t_group[t_group_op].push(element)
		// 					// 	}
		// 					// }

		// 					// if (t_group[t_group_op].length>0) {
		// 					// 	group[group_op].push(t_group)
		// 					// }
		// 			}

		// 		// q_selected values
		// 			if (form_item.q_selected.length>0) {

		// 				for (let j = 0; j < form_item.q_selected.length; j++) {

		// 					// value
		// 						const value = form_item.q_selected[j]

		// 						// escape html strings containing single quotes inside.
		// 						// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
		// 						const safe_value = value.replace(/(')/g, "''")

		// 					const c_group_op = "$and"
		// 					const c_group = {}
		// 						  c_group[c_group_op] = []

		// 					// elemet
		// 					const element = {
		// 						field	: form_item.q_column,
		// 						value	: (form_item.is_term===true) ? `'%"${safe_value}"%'` : `'${safe_value}'`,
		// 						op		: (form_item.is_term===true) ? "LIKE" : "="
		// 					}
		// 					c_group[c_group_op].push(element)

		// 					// q_table element
		// 						// if (form_item.q_table && form_item.q_table!=="any") {

		// 						// 	const element_table = {
		// 						// 		field	: form_item.q_table_name,
		// 						// 		value	: `'${form_item.q_table}'`,
		// 						// 		op		: '='
		// 						// 	}

		// 						// 	c_group[c_group_op].push(element_table)
		// 						// }

		// 					group[group_op].push(c_group)
		// 				}
		// 			}

		// 		if (group[group_op].length>0) {
		// 			ar_query_elements.push(group)
		// 		}
		// 	}

		// 	// debug
		// 		if(SHOW_DEBUG===true) {
		// 			// console.log("self.form_items:",self.form_items);
		// 			// console.log("ar_query_elements:",ar_query_elements);
		// 		}

		// 	// empty form case
		// 		if (ar_query_elements.length<1) {
		// 			// self.form_items.mint.node_input.focus()
		// 			// page.remove_spinner(div_result)
		// 			spinner.remove()
		// 			return false;
		// 		}

		// 	// export_data_buttons added once
		// 		if (!self.export_data_buttons) {
		// 			self.export_data_buttons = page.render_export_data_buttons()
		// 			self.export_data_container.appendChild(self.export_data_buttons)
		// 			self.export_data_container.classList.add("hide")
		// 		}

		// 	// loading set css
		// 		container_rows_list.classList.add("loading")

		// 	// scrool to head result
		// 		if (div_result && scroll_result===true) {
		// 			div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
		// 		}

		// 	// operators value
		// 		const operators_value = form_obj.querySelector('input[name="operators"]:checked').value;
		// 			// console.log("operators_value:",operators_value);

		// 		const filter = {}
		// 			  filter[operators_value] = ar_query_elements


		// 	// search rows exec against API
		// 		const js_promise = self.search_rows({
		// 			filter			: filter,
		// 			limit			: 0,
		// 			process_result	: {
		// 				fn 		: 'process_result::add_parents_and_children_recursive',
		// 				columns : [{name : "parents"}]
		// 			}
		// 		})
		// 		.then((parsed_data)=>{
		// 			// if(SHOW_DEBUG===true) {
		// 				// console.log("--- form_submit_OLD response:", parsed_data)
		// 			// }

		// 			// draw
		// 				// clean container_rows_list and add_spinner
		// 					while (container_rows_list.hasChildNodes()) {
		// 						container_rows_list.removeChild(container_rows_list.lastChild);
		// 					}
		// 					container_rows_list.classList.remove("loading")
		// 					// page.remove_spinner(div_result)
		// 					spinner.remove()

		// 				// draw rows
		// 					self.draw_rows({
		// 						target  : self.rows_list_container,
		// 						ar_rows : parsed_data
		// 					})
		// 					.then(function(){
		// 						// // scrool to head result
		// 						// 	if (response.result.length>0) {
		// 						// 		const div_result = document.querySelector(".result")
		// 						// 		if (div_result) {
		// 						// 			div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
		// 						// 		}
		// 						// 	}
		// 						self.export_data_container.classList.remove("hide")
		// 					})
		// 		})


		// 	return js_promise
		// },//end form_submit_OLD



	/**
	* SEARCH_ROWS
	* Call to API and load json data results of search
	*/
	search_rows : function(options) {

		const self = this

		// sort vars
			const filter			= options.filter || null
			const ar_fields			= options.ar_fields || ["*"]
			const order				= options.order || "norder ASC"
			const lang				= page_globals.WEB_CURRENT_LANG_CODE
			const process_result	= options.process_result || null
			const limit				= options.limit != undefined
				? options.limit
				: 30

		return new Promise(function(resolve){

			// parse_sql_filter
				const group = []
				// old
					// const parse_sql_filter = function(filter){

					// 	if (filter) {

					// 		const op		= Object.keys(filter)[0]
					// 		const ar_query	= filter[op]

					// 		const ar_filter = []
					// 		const ar_query_length = ar_query.length
					// 		for (let i = 0; i < ar_query_length; i++) {

					// 			const item = ar_query[i]
					// 				console.log("------------- item:",item);



					// 			const item_op = Object.keys(item)[0]
					// 			if(item_op==="$and" || item_op==="$or") {

					// 				const current_filter_line = "" + parse_sql_filter(item) + ""
					// 				ar_filter.push(current_filter_line)
					// 				continue;
					// 			}

					// 			// const filter_line = (item.field.indexOf("AS")!==-1)
					// 			// 	? "" +item.field+""  +" "+ item.op +" "+ item.value
					// 			// 	: "`"+item.field+"`" +" "+ item.op +" "+ item.value

					// 			let filter_line
					// 			if (item.op==='MATCH') {
					// 				filter_line = "MATCH (" + item.field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
					// 			}else{
					// 				filter_line = (item.field.indexOf("AS")!==-1)
					// 					? "" +item.field+""  +" "+ item.op +" "+ item.value
					// 					: "`"+item.field+"`" +" "+ item.op +" "+ item.value
					// 			}

					// 			ar_filter.push(filter_line)

					// 			// group
					// 				if (item.group) {
					// 					group.push(item.group)
					// 				}
					// 		}

					// 		const boolean_op = (op === '$and')
					// 			? 'AND'
					// 			: (op === '$or')
					// 				? 'OR'
					// 				: null

					// 		return ar_filter.join(" "+boolean_op+" ")
					// 	}

					// 	return null
					// }
				let parsed_filter    = self.form.parse_sql_filter(filter, group,true)

                let sql_filter    = parsed_filter
                    ? '(' + parsed_filter + ')'
                    : null;


				const filter_values = self.obtain_values_filter(filter)

				if(sql_filter.includes("`p_group`") || filter_values.id == "number"){

					sql_filter = `parents_text LIKE '%${filter_values.q}%' `
					
				}

				console.log("sql_filter_catalog", sql_filter)
				

			// debug
				if(SHOW_DEBUG===true) {
					// console.log("--- search_rows parsed sql_filter:")
					// console.log(sql_filter)
				}

			// request
				const request_body = {
					dedalo_get		: 'records',
					table			: 'catalog',
					ar_fields		: ar_fields,
					lang			: lang,
					sql_filter		: sql_filter,
					limit			: limit,
					count			: false,
					order			: order,
					process_result	: process_result
				}
				data_manager.request({
					body : request_body
				})
				.then((response)=>{
					// console.log("++++++++++++ request_body:",request_body);
					console.log("--- search_rows API response:",response);

					// data parsed
					const data = page.parse_catalog_data(response.result)

					// send event data_request_done (used by buttons download)
					event_manager.publish('data_request_done', {
						request_body		: request_body,
						result				: data,
						export_data_parser	: page.export_parse_catalog_data,
						filter 				: filter
					})

					resolve(data)
				})
		})
	},//end search_rows

	obtain_values_filter: function (filter) {
		if (typeof filter === "object" && filter !== null && Object.keys(filter).length < 2) {
			const primeraClave = Object.keys(filter)[0]; 
			return this.obtain_values_filter(filter[primeraClave]); 
		} else {
			return filter; // valor final
		}
	},

	/**
	* DRAW_ROWS
	*/
	draw_rows : function(options) {
		// console.log("draw_rows options:",options);

		const self = this

		// options
			const target	= options.target // self.rows_list_container
			const ar_rows	= options.ar_rows || []
			const structure_tree = options.structure_tree || []

		return new Promise(function(resolve){

			// pagination vars
				// const total		= self.search_options.total
				// const limit		= self.search_options.limit
				// const offset	= self.search_options.offset

			// container select and clean container div
				const container = target

			// no_results_found check
				const ar_rows_length = ar_rows.length
				if (ar_rows_length<1) {

					while (container.hasChildNodes()) {
						container.removeChild(container.lastChild);
					}
					// node_no_results_found
					common.create_dom_element({
						element_type	: 'div',
						class_name		: "no_results_found",
						inner_html		: tstring.no_results_found || "No results found",
						parent			: container
					})

					// scrool to head again
						window.scrollTo(0, 0);

					resolve(container)
					return false
				}

			// add_spinner
				// page.add_spinner(container)

			// const render_nodes = async () => {
				

				while (container.hasChildNodes()) {
					container.removeChild(container.lastChild);
				}


				//Generar filas aqui
				//console.log("structure_tree ",structure_tree)
	
				const numismatic_group_fields = Object.keys(structure_tree);
				for (let index = 0; index < numismatic_group_fields.length; index++) {
					
					self.render_numismatic_group(structure_tree,numismatic_group_fields[index],container);
					
				}

				image_gallery.removeGallery?.(); // limpia listeners antiguos
				image_gallery.set_up({ galleryNode: container });

				
				//container.appendChild(fragment)
				resolve(container)
				
			return true
		})
	},//end draw_rows


	render_numismatic_group : function(structure_tree,numismatic_group,container){

			const numismatic_group_div = common.create_dom_element({
						element_type	: 'div',
						class_name		: "numismatic_group",
						inner_html		: numismatic_group || "Sin grupo asociado",
						parent			: container
					})
			numismatic_group_div.addEventListener("click", (e) => {
    			e.stopPropagation();

			const children = numismatic_group_div.querySelectorAll(":scope > .people, :scope > .mint_div");
			children.forEach(child => {
				child.style.display = child.style.display === "none" ? "block" : "none";
			});
		});		
			this.render_people_numismatic_group(structure_tree[numismatic_group],numismatic_group_div);
	},

	render_people_numismatic_group : function(numismatic_group,container){

		const people_numismatic_group = Object.keys(numismatic_group.people);

			for (let index = 0; index < people_numismatic_group.length; index++) {
				
				const person_numismatic_group = people_numismatic_group[index];
				const people_numismatic_group_div = common.create_dom_element({
						element_type	: 'div',
						class_name		: "people",
						inner_html		: person_numismatic_group || "Sin grupo asociado",
						parent			: container
					})

				people_numismatic_group_div.style.paddingLeft = '1.5em';
				people_numismatic_group_div.style.color = '#2d8525';
				const mints_person_numismatic_group = Object.keys(numismatic_group.people[person_numismatic_group].mints);

				people_numismatic_group_div.addEventListener("click", (e) => {
					e.stopPropagation();
					const children = people_numismatic_group_div.querySelectorAll(":scope > .mint_div, :scope > .row_node");
					children.forEach(child => {
						child.style.display = child.style.display === "none" ? "block" : "none";
					});
				});

				for (let j = 0; j < mints_person_numismatic_group.length; j++) {
					const mint_person = mints_person_numismatic_group[j];
					this.render_mints_numismatic_group(numismatic_group.people[person_numismatic_group].mints[mint_person],mint_person,people_numismatic_group_div);
				}

				for (let j = 0; j < numismatic_group.people[person_numismatic_group].no_mints.length; j++) {
					
					people_numismatic_group_div.appendChild(this.render_rows(numismatic_group.people[person_numismatic_group].no_mints[j],numismatic_group.people[person_numismatic_group].no_mints))
					
				}

			}

			const mints_no_people_numismatic_group = Object.keys(numismatic_group.no_people.mints);
			for (let index = 0; index < mints_no_people_numismatic_group.length; index++) {
					const mint = mints_no_people_numismatic_group[index];
					this.render_mints_numismatic_group(numismatic_group.no_people.mints[mint],mint,container);
				}

			


	},

	render_mints_numismatic_group : function(types_mint,mint,container){
		const mints_person_numismatic_group_div = common.create_dom_element({
						element_type	: 'div',
						class_name		: "mint_div",
						inner_html		: mint || "Sin grupo asociado",
						parent			: container
					})
		mints_person_numismatic_group_div.style.paddingLeft = '1.5em';
		mints_person_numismatic_group_div.style.color = '#e2c832';

		mints_person_numismatic_group_div.addEventListener("click", (e) => {
			e.stopPropagation();
			if (e.target !== mints_person_numismatic_group_div) return;
			const children = mints_person_numismatic_group_div.querySelectorAll(":scope > .row_node");
					children.forEach(child => {
						child.style.display = child.style.display === "none" ? "block" : "none";
					});

		});

		for (let index = 0; index < types_mint.length; index++) {
			mints_person_numismatic_group_div.appendChild(this.render_rows(types_mint[index],types_mint));
		}

	},

	render_rows : function(row_object, ar_rows){

		// Build dom row
		// item row_object
			// const row_object = ar_rows[i]
		const self = this	
			if(SHOW_DEBUG===true) {
				// console.log("i row_object:", i, row_object);
			}

		// fix and set rows to catalog_row_fields
			catalog_row_fields.ar_rows = ar_rows
			catalog_row_fields.rows_painted = []
		// catalog_row_fields set
			//console.log("self.rows_list_container:",self.rows_list_container);
			const node = catalog_row_fields.draw_item(row_object,self.rows_list_container)

		return node
	},



	/**
	* GET_CATALOG_RANGE_YEARS
	* @return
	*/
	get_catalog_range_years : function() {

		return new Promise(function(resolve){

			const ar_fields = ['id','section_id','MIN(ref_date_in + 0) AS min','MAX(ref_date_in + 0) AS max']

			const request_body = {
				dedalo_get		: 'records',
				db_name			: page_globals.WEB_DB,
				lang			: page_globals.WEB_CURRENT_LANG_CODE,
				table			: 'catalog',
				ar_fields		: ar_fields,
				limit			: 0,
				count			: false,
				offset			: 0,
				order			: 'id ASC'
			}
			data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				// console.log("-> get_catalog_range_years api_response:",api_response);

				let min = 0
				let max = 0
				if (api_response.result) {
					for (let i = 0; i < api_response.result.length; i++) {
						const row = api_response.result[i]
						const current_min = parseInt(row.min)
						if (min===0 || current_min<min) {
							min = current_min
						}
						const current_max = parseInt(row.max)
						// if (current_max>min) {
							max = current_max
						// }
					}
				}

				const data = {
					min : min,
					max : max
				}

				resolve(data)
			})
		})
	},//end get_catalog_range_years

	get_authors_from_find : function(array_people_data,structure_tree) {
	
		for (let index = 0; index < array_people_data.length; index++) {
			
			const author = this.get_author(array_people_data[index]);
			const numismatic_group = JSON.parse(array_people_data[index].p_group)[0];

			if(!(author in structure_tree[numismatic_group].people) && author != null){
				//console.log("Creo a ",name_roles ," dentro del grupo numismatico con 2 o mas personas ", numismatic_group);

				const people_base = {mints: {},
									no_mints : []
									}

				structure_tree[numismatic_group].people[author] = people_base;
			}

		}
		
	},

	get_author: function(type_data) {
		let creators_data_parsed = null;

		try {
			creators_data_parsed = JSON.parse(type_data.ref_type_creators_data);
		} catch (e) {
			return null;
		}

		if (!creators_data_parsed || creators_data_parsed.length === 0) {
			return null;
		}

		const roles_raw  = type_data.ref_type_creators_roles || "";
		const names_raw  = type_data.ref_type_creators_names || "";
		const creators_roles = roles_raw.split(" | ");
		const creators_names = names_raw.split(" | ");

		if (creators_data_parsed.length > 1) {
			const index_author = creators_roles.findIndex(r => r && r.includes("Autoridad emisora"));
			if (index_author >= 0 && creators_names[index_author]) {
				return creators_names[index_author];
			}

			return null;
		}

		return creators_names[0] || null;
	},

	get_mints_from_find : function(types_parsed_data,structure_tree){

		for (let index = 0; index < types_parsed_data.length; index++) {
			
			const author = this.get_author(types_parsed_data[index]);
			const numismatic_group = JSON.parse(types_parsed_data[index].p_group)[0];
			const p_mint = types_parsed_data[index].p_mint;
			const mint_type = Array.isArray(p_mint) ? p_mint[0] : null;

			if(author){
				try {
					if(!(mint_type in structure_tree[numismatic_group].people[author].mints) && mint_type != null){
					structure_tree[numismatic_group].people[author].mints[mint_type] = [];
					}
				} catch (error) {
					console.log(structure_tree[numismatic_group].people)
				}
				

			}else{
				if(mint_type){
					structure_tree[numismatic_group].no_people.mints[mint_type] = [];
				}
				

			}
			
		}

	},

	get_types_from_find : function(types_parsed_data, structure_tree) {

		for (let index = 0; index < types_parsed_data.length; index++) {

			const author = this.get_author(types_parsed_data[index]);
			const numismatic_group = JSON.parse(types_parsed_data[index].p_group)[0];

			const p_mint = types_parsed_data[index].p_mint;
			const mint_type = Array.isArray(p_mint) && p_mint.length > 0 ? p_mint[0] : undefined;

			if (author) {

				if (!structure_tree[numismatic_group].people[author]) {
					structure_tree[numismatic_group].people[author] = { mints: {}, no_mints: [] };
				}

				if (mint_type) {

					if (!structure_tree[numismatic_group].people[author].mints[mint_type]) {
						structure_tree[numismatic_group].people[author].mints[mint_type] = [];
					}

					structure_tree[numismatic_group].people[author].mints[mint_type].push(types_parsed_data[index]);

				} else {

					structure_tree[numismatic_group].people[author].no_mints.push(types_parsed_data[index]);

				}

			} else {

				if (mint_type) {

					if (!structure_tree[numismatic_group].no_people.mints[mint_type]) {
						structure_tree[numismatic_group].no_people.mints[mint_type] = [];
					}

					structure_tree[numismatic_group].no_people.mints[mint_type].push(types_parsed_data[index]);

				} else {

					structure_tree[numismatic_group].no_people.no_mints.push(types_parsed_data[index]);

				}

			}

		}
	}




}//end catalog
