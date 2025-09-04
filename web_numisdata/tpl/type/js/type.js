/*global tstring, page_globals, page, event_manager, common, image_gallery, map_factory, type_row_fields_min, data_manager, Promise */
/*eslint no-undef: "error"*/
"use strict";



var type =  {



	// search_options
	search_options : {},

	// map. Instance of map_factory
	map : null,

	// div where the export data buttons where placed
	export_data_container : null,

	// section_id
	section_id : null,



	/**
	* SET_UP
	* When the HTML page is loaded
	*/
	set_up : function(options) {

		const self = this

		// options
			self.export_data_container	= options.export_data_container
			self.section_id				= options.section_id
			
		// export_data_buttons added once
			const export_data_buttons = page.render_export_data_buttons()
			self.export_data_container.appendChild(export_data_buttons)
			self.export_data_container.classList.add('hide')

		//suggestions_form_button
			const contact_form_button = page.create_suggestions_button()
			self.export_data_container.appendChild(contact_form_button)


		// trigger render type with current options.section_id
			if (typeof self.section_id!=="undefined") {

				// search by section_id	and draw on receive data
					self.get_row_data({
						section_id : self.section_id
					})
					.then(function(response){

						// container. clean container div
						console.log("[set_up->get_row_data] response:",response);
							const container	= document.getElementById('row_detail')
							while (container.hasChildNodes()) {
								container.removeChild(container.lastChild);
							}

						// combi request split results
							const type		= response.result.find(item => item.id==='type')
							const catalog	= response.result.find(item => item.id==='catalog')
							console.log(type)
						if (typeof type.result[0]!=="undefined") {

							const row			= type.result[0]
							const catalog_rows	= page.parse_catalog_data(catalog.result)[0] || null
							// app property catalog with all catalog rows result
								row.catalog = catalog_rows

							// parse data
								page.parse_type_data(row)

								console.log("Lista rows ",row);

							// send event data_request_done (used by buttons download)
								event_manager.publish('data_request_done', {
									request_body		: null,
									result				: row,
									export_data_parser	: page.export_parse_type_data
								})

								const ar_fields	= ['*']
								const count		= true
								const order		= "name"
								const resolve_portals_custom = {
									"bibliography_data" : "bibliographic_references"
								}
								const section_id_row = row.mint_data[0].section_id
								

								data_manager.request({
									body : {
										dedalo_get		: 'records',
										table			: 'mints',
										ar_fields		: ["*"],
										sql_filter		: "section_id = " + parseInt(section_id_row),
										limit			: 0,
										count			: count,
										offset			: 0,
										order			: order,
										process_result	: null,
										resolve_portals_custom : resolve_portals_custom,
									}
								})
								.then( async function(api_response){
									
								const datos_ceca = api_response.result[0];
								const map_fact = new map_factory() // creates / get existing instance of map

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

								const map_pars = datos_ceca.map ? JSON.parse(datos_ceca.map) : null
								resultado.cecas.datos.push(row.mint_data[0]);

									data_manager.request({
									body : {
										dedalo_get		: 'records',
										table			: 'findspots',
										ar_fields		: ["*"],
										sql_filter		: `types LIKE "%${self.section_id}%"` ,
										limit			: 0,
										count			: count,
										offset			: 0,
										order			: order,
										process_result	: null
									}
								})
								.then( async function(api_response){

									let hallazgos = new Array();
									for (let index = 0; index < api_response.result.length; index++) {
									
										const typesArray = JSON.parse(api_response.result[index].types);
										const result = typesArray.filter(num => num === `${self.section_id}`);
										result.length > 0 ? hallazgos.push(api_response.result[index]) : "";
										
									}

									resultado.hallazgos.datos = hallazgos;

									const map = map_fact.init({
										map_container : map_container,
										map_position  : map_pars,
										source_maps   : page.maps_config.source_maps,
										result        : resultado,
										unique    	  : true,
										zoom		  : 5
										});
									})

							});
							// render row nodes
							self.list_row_builder(row)
							.then(function(row_wrapper){

								// append final rendered node
									container.appendChild(row_wrapper)

								// newGallery
									const embeddedGallery = row_wrapper.querySelectorAll('a')
									if (embeddedGallery && embeddedGallery.length>0) {
										// hide default images
										row_wrapper.querySelector('.identify_coin_wrapper').remove()
										const newGallery = Object.create(image_gallery);
										newGallery.set_up_embedded ({
											galleryNode		: embeddedGallery,
											galleryPrimId	: 'embedded-gallery-id',
											containerId		: 'embedded-gallery',
											result			: response
										})
									}

								// activate images light box
									const images_gallery_containers = row_wrapper.querySelectorAll('.gallery')
									
									if (images_gallery_containers) {
										for (let i = 0; i < images_gallery_containers.length; i++) {
											page.activate_images_gallery(images_gallery_containers[i])
										}
									}

								// show export buttons
									self.export_data_container.classList.remove('hide')
							})
						}
					})
			}

		// navigate across records group
			// document.onkeyup = function(e) {
			// 	if (e.which == 37) { // arrow left <-
			// 		let button = document.getElementById("go_prev")
			// 		if (button) button.click()
			// 	}else if (e.which == 39) { // arrow right ->
			// 		let button = document.getElementById("go_next")
			// 		if (button) button.click()
			// 	}
			// }

		return true
	},//end set_up



	/**
	* GET_ROW_DATA
	* Call public API for row data based on current type section_id
	*/
	get_row_data : function(options) {

		// options
			const section_id	= options.section_id
			const lang			= options.lang || page_globals.WEB_CURRENT_LANG_CODE


		// combined call
			const ar_calls = []

		// type call
			ar_calls.push({
				id		: "type",
				options	: {
					dedalo_get				: 'records',
					table					: "types",
					ar_fields				: ["*"],
					lang					: lang,
					sql_filter				: "section_id = " + parseInt(section_id),
					count					: false,
					resolve_portals_custom	: {
						"bibliography_data"				: "bibliographic_references",
						// coins resolution
						"ref_coins_union"				: "coins",
						"coin_references"				: "coins",
						"coins.bibliography_data"		: "bibliographic_references",
						// "coins.images_obverse"		: "images",
						// findspots resolution
						"ref_coins_findspots_data"		: "findspots",
						"findspots.bibliography_data"	: "bibliographic_references",
						// hoard resolution
						"ref_coins_hoard_data"			: "hoards",
						"hoards.bibliography_data"		: "bibliographic_references",
						"denomination_data"				: "denomination",
						"material_data"					: "material",
						"related_types_data"			: "types",
						// mint resolution
						"mint_data"						: "mints"
					}
				}
			})

		// catalog call
			const ar_fields = ["section_id","term","term_data","term_table","term_section_tipo","parents",
							   'ref_mint_number', 'full_coins_reference_calculable', 'full_coins_reference_diameter_max',
							   'full_coins_reference_weight', 'full_coins_reference_axis']
			ar_calls.push({
				id		: "catalog",
				options	: {
					dedalo_get				: 'records',
					table					: "catalog",
					ar_fields				: ar_fields,
					lang					: lang,
					count					: false,
					sql_filter				: "term_data='[\"" + parseInt(section_id) + "\"]' AND term_table='types'",
					resolve_portals_custom	: {
						"parents" : "catalog"
					}
				}
			})


		// request
			const js_promise = data_manager.request({
				body : {
					dedalo_get	: 'combi',
					ar_calls	: ar_calls
				}
			})


		return js_promise
	},//end get_row_data



	/**
	* LIST_ROW_BUILDER
	* Build DOM nodes to insert into list pop-up
	*/
	list_row_builder : function(row) {

		const self = this

		return new Promise(function(resolve){

			// parse type bibliography_data
				self.parse_publication(row.bibliography_data)

			// parse type coins.bibliography_data
				const coins_length = row.ref_coins_union.length
				for (let i = 0; i < coins_length; i++) {
					const item = row.ref_coins_union[i]
					self.parse_publication(item.bibliography_data)
				}

			// parse type findspots.bibliography_data
				const findspots_length = row.ref_coins_findspots_data.length;
				for (let i = 0; i < findspots_length; i++) {
					const item = row.ref_coins_findspots_data[i]
					self.parse_publication(item.bibliography_data)
				}
			// parse type hoards.bibliography_data
				const hoards_length = row.ref_coins_hoard_data.length
				for (let i = 0; i < hoards_length; i++) {
					const item = row.ref_coins_hoard_data[i]
					self.parse_publication(item.bibliography_data)
				}

			// parse parse_ordered_coins creating _coins_group
				self.parse_ordered_coins(row)

			// render row
				type_row_fields_min.type_row_fields.caller = self
				const row_node = type_row_fields_min.type_row_fields.draw_item(row)


			resolve(row_node)
		})
	},//end list_row_builder



	/**
	* PARSE_PUBLICATION
	* Modify the received data by recombining publication information
	* @return array parsed_data
	*/
	parse_publication : function(data) {

		return page.parse_publication(data)
	},//end parse_publication



	/**
	* PARSE_ordered_coins
	* Modify the received data by recombining coins information
	* @return array parsed_data
	*/
	parse_ordered_coins : function(row) {

		const parsed_data	= []
		const separator		= " | "

		const typology_data			= page.split_data(row.ref_coins_typology_data, separator) // format is '["1"] | ["2"]'
		const typology_data_length	= typology_data.length

		const typology	=  page.split_data(row.ref_coins_typology, separator)
		const ref_coins	=  page.split_data(row.ref_coins, separator)

		for (let i = 0; i < typology_data_length; i++) {

			const typology_id = typology_data[i]
				? JSON.parse(typology_data[i])[0] // format is ["1"]
				: null

			const current_coins = ref_coins[i]
				? JSON.parse(ref_coins[i])
				: []

			const parsed_item = {
				typology_id	: typology_id,
				typology	: typology[i] || null,
				coins		: current_coins
			}

			parsed_data.push(parsed_item)
		}

		// assign to new property '_coins_group'
			row._coins_group = parsed_data


		return parsed_data
	},//end parse_ordered_coins



	/**
	* DRAW_MAP
	*/
	

	/**
	* MAP_DATA
	* @return array data
	*/
	


	/**
	* MAP_POPUP_BUILDER
	*/

}//end type
