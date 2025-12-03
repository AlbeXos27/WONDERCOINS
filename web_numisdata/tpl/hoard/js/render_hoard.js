/*global tstring, biblio_row_fields, hoards, map_factory, common, page, dedalo_logged, DocumentFragment, tstring */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";


var render_hoard = {


	caller  : null,


	/**
	* DRAW_HOARD
	* Render main row data (tile, body, bibliography, et.)
	*/
	draw_hoard : async function(options) {

		// options
			const row = options.row
			console.log("draw_hoard options:", row);
		// check row
			if (!row) {
				console.warn("Warning! draw_row row no found in options");
				return fragment;
			}

			const coins =  await this.cargarMonedasHallazgos(row.coins);

				//console.log("MONEDAS ",coins);
		const fragment = new DocumentFragment();

		// line
			const line = common.create_dom_element({
				element_type	: "div",
				parent			: fragment
			})

		// section_id
			if (dedalo_logged===true) {
				const link = common.create_dom_element({
					element_type	: "a",
					class_name		: "section_id go_to_dedalo",
					text_content	: row.section_id,
					href			: '/dedalo/lib/dedalo/main/?t=numisdata5&id=' + row.section_id,
					parent			: line
				})
				link.setAttribute('target', '_blank');
			}

			console.log("ROW ",row);

		// name & place
			if (row.name && row.name.length>0) {

				// line
					const lineTittleWrap = common.create_dom_element({
						element_type	: "div",
						class_name		: "line-tittle-wrap",
						parent			: line
					})

				// name
					common.create_dom_element({
						element_type	: "div",
						class_name		: "line-tittle golden-color",
						text_content	: row.name,
						parent			: lineTittleWrap
					})

				// place
					if (row.parents_text && row.parents_text.length>0) {
						const place = "| "+Array.from(JSON.parse(row.parents_text)).join(" - ");	
						common.create_dom_element({
							element_type	: "div",
							class_name		: "info_value",
							text_content	: place,
							parent			: lineTittleWrap
						})
					}
					if (row.indexation && row.indexation.length>0) {

						const place = "Indexación | "+row.indexation;
						common.create_dom_element({
							element_type	: "div",
							class_name		: "info_value",
							text_content	: place,
							parent			: lineTittleWrap
						})
					}
			}//end if (row.name && row.name.length>0)

		// total_coins
			if (row.coins && row.coins.length>0) {
				const n_coins = row.coins.length
				common.create_dom_element ({
					element_type	: 'div',
					class_name		: 'info_text_block',
					inner_html		: (tstring.total_coins || 'Total monedas') + ': ' + n_coins,
					parent			: fragment
				})
			}

			if(row.abstract){
				common.create_dom_element ({
					element_type	: 'div',
					class_name		: 'info_text_block',
					inner_html		: row.abstract,
					parent			: fragment
				})
			}
		// public_info
			if (row.public_info) {
				common.create_dom_element ({
					element_type	: 'div',
					class_name		: 'info_text_block',
					inner_html		: row.public_info,
					parent			: fragment
				})
			}

		// bibliography_data
			if (row.bibliography_data && row.bibliography_data.length>0) {
				//create the graphical red line that divide blocks
				const lineSeparator = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_line separator",
					parent			: fragment
				})
				//create the tittle block inside a red background
				common.create_dom_element({
					element_type	: "label",
					class_name		: "big_label",
					text_content	: tstring.bibliographic_references || "Bibliographic references",
					parent			: lineSeparator
				})

				const bibliography_block = common.create_dom_element({
					element_type	: "div",
					class_name		: "info_text_block",
					parent			: fragment
				})

				const ref_biblio		= row.bibliography_data
				const ref_biblio_length	= ref_biblio.length
				for (let i = 0; i < ref_biblio_length; i++) {

					// build full ref biblio node
					const biblio_row_node = biblio_row_fields.render_row_bibliography(ref_biblio[i])

					const biblio_row_wrapper = common.create_dom_element({
						element_type	: "div",
						class_name		: "bibliographic_reference",
						parent			: bibliography_block
					})
					biblio_row_wrapper.appendChild(biblio_row_node)
				}

				page.create_expandable_block(bibliography_block, fragment);
			}

		// link
			if (row.link) {
				common.create_dom_element ({
					element_type	: 'a',
					class_name		: 'icon_link info_value',
					inner_html		: row.link,
					href			: row.link,
					target			: '_blank',
					parent			: fragment
				})
			}

		// map
			const map_container = common.create_dom_element({
				element_type	: "div",
				class_name		: "map_container",
				parent			: fragment
			})

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
					if(row.types){
						const mints = await this.get_mint_points(row.types);
						resultado.cecas.datos = mints.result;
					}
					resultado.hallazgos.datos.push(row)
					
						const map = map_fact.init({
							map_container : map_container,
							map_position  : row.map,
							source_maps   : page.maps_config.source_maps,
							result        : resultado,
							findspot	  : true,
							unique    	  : true
							});

				const title_coin = common.create_dom_element({
						element_type	: "h2",
						class_name 		: "title_info",
						text_content	: "Monedas Encontradas",
						parent 			: fragment
					})

					common.create_dom_element({
						element_type	: "div",
						class_name 		: "golden-separator",
						parent 			: title_coin
					})


					for (let index = 0; index < coins.result.length; index++) {
							
							
						// Card Container
						const coinsContainer = common.create_dom_element({
							element_type: "div",
							class_name: "coins-container",
							parent: fragment
						});

						// Coin Title
							const title_container = common.create_dom_element({
								element_type: "div",
								class_name: "title-container",
								parent: coinsContainer
							});

							const typeValue = coins.result[index] && coins.result[index].type_full_value ? coins.result[index].type_full_value : "";

							const parts = typeValue ? typeValue.split("|") : [];
							const lastPart = parts.length > 0 ? parts[parts.length - 1].trim() : "";

							const type_full_val = coins.result[index].denomination ? coins.result[index].denomination.split(" | ")[0] + " | " + lastPart.replace(coins.result[index].denomination, "").trim(): coins.result[index].type_full_value;
							const type_none = type_full_val ? type_full_val : "Tipo";

							let value = coins.result[index].type_data ? coins.result[index].type_data.replace('"',"").replace("[","").replace("]","").replace('"','') : 0;
							let coin_type = value
							
							common.create_dom_element({
								element_type: "a",
								class_name: "type_link",
								href: `/web_numisdata/type/${coin_type}`,
								text_content: type_none, 
								parent: title_container
							});

						// Contenedor global datos 

						const data_container = common.create_dom_element({
							element_type: "div",
							class_name: "data-container",
							parent: coinsContainer
						});

						const imgContainer = common.create_dom_element({
							element_type: "div",
							class_name: "img-container",
							parent: data_container
						});

							const image_obverse = "https://wondercoins.uca.es" + coins.result[index].image_obverse;
							const image_reverse = "https://wondercoins.uca.es" + coins.result[index].image_reverse;

							common.create_dom_element({
								element_type: "img",
								class_name: "img_obverse",
								parent: imgContainer,
								src: image_obverse
							});

							common.create_dom_element({
								element_type: "img",
								class_name: "img_obverse",
								parent: imgContainer,
								src: image_reverse
							});

							//informacion
							const info_container = common.create_dom_element({
								element_type: "div",
								class_name: "info-container",
								parent: data_container
							});

							//Date 

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
								parent: info_container
							});

							const weightText = coins.result[index].weight ? coins.result[index].weight + " gramos" : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "weight_text",
								text_content: weightText,
								parent: info_container
							});

							const diameterText = coins.result[index].diameter ? coins.result[index].diameter + " mm" : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "diameter_text",
								text_content: diameterText,
								parent: info_container
							});

							const collectionText = coins.result[index].collection ? coins.result[index].collection : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "collection_text",
								text_content: collectionText,
								parent: info_container
							});

							//Findspot

							const findspot_container = common.create_dom_element({
								element_type: "div",
								class_name: "findspot_container",
								parent: coinsContainer
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "findspot_text",
								text_content: coins.result[index].findspot.split(" | ")[0],
								parent: findspot_container
							});
							
						}
						
		return fragment
	},//end draw_hoard



	/**
	* DRAW_TYPES_LIST_NODE
	*/
	draw_types_list_node : function(options) {

		// options
			const response = options.response // API response

		// render data
			const types_list_node = map.render_types_list({
				global_data_item	: response.global_data_item,
				types_rows			: response.types_rows,
				coins_rows			: response.coins_rows,
				info				: response.info
			})


		return types_list_node
	},//end draw_types_list_node


	/*cargarMonedasHallazgos : async function(ceca) {
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
	},*/

	cargarMonedasHallazgos : async function(ids) {
		try {
    // si ids es un array -> conviértelo en lista separada por comas
			const filtro = Array.isArray(ids)
			? `section_id IN (${ids.join(",")})`
			: `section_id = ${ids}`;

			const monedas = await data_manager.request({
			body: {
				dedalo_get: "records",
				table: "coins",
				ar_fields: ["*"],
				sql_filter: filtro,
				limit: 0,
				count: true,
				offset: 0,
				order: "section_id ASC",
				process_result: null,
			},
			});

			return monedas;
		} catch (error) {
			console.error("Error cargando datos:", error);
		}
},

	get_mint_points : async function(types) {
		
		let sql_filter = "";

		for (let index = 0; index < types.length; index++) {
			
			sql_filter += index != types.length - 1 ? `JSON_CONTAINS(relations_types, '"${types[index]}"') OR ` : `JSON_CONTAINS(relations_types, '"${types[index]}"')`
	
		}


		try {
			const hijos = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'mints',
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


	}
	

}//end render_hoard