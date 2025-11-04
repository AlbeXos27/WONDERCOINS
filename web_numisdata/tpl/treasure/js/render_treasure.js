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
	draw_treasure : async function(options) {

		// options
			const row = options.row
			console.log("draw_hoard options:", row);
		// check row
			if (!row) {
				console.warn("Warning! draw_row row no found in options");
				return fragment;
			}

			//const coins =  await this.cargarMonedasComplejos(row.name);

		const fragment = new DocumentFragment();

		const coins = await this.cargarMonedasComplejos(row.coins);
		const types = await this.cargarTiposComplejos(row.types);

		console.log("Tipos del complejo:", types);

		//console.log("Monedas del complejo:", coins);

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
					if (row.place && row.place.length>0) {

						const place = "| "+row.place;
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
					inner_html		: (tstring.total_coins || 'Total coins') + ': ' + n_coins,
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
				
					resultado.complejos.datos.push(row)
					
						const map = map_fact.init({
							map_container : map_container,
							map_position  : row.map,
							source_maps   : page.maps_config.source_maps,
							result        : resultado,
							findspot	  : true,
							unique    	  : true
							});

				

				// Title Coins
				const title_coin = common.create_dom_element({
						element_type	: "h2",
						class_name 		: "title_info",
						text_content	: "Monedas Halladas",
						parent 			: fragment
					})

					common.create_dom_element({
						element_type	: "div",
						class_name 		: "golden-separator",
						parent 			: title_coin
					})

					const coinsContainer = common.create_dom_element({
						element_type	: "div",
						class_name 		: "coins_container",
						parent 			: fragment
					})


				
					for (let index = 0; index < coins.result.length; index++) {
							
							
						// Coins Container
						const infoContainer = common.create_dom_element({
							element_type: "div",
							class_name: "info_container",
							parent: coinsContainer
						});

						// Coin Title
							const title_container = common.create_dom_element({
								element_type: "div",
								class_name: "title-container",
								parent: infoContainer
							});

							const typeValue = coins && coins.result && coins.result[index] && coins.result[index].type_full_value;
							const parts = typeValue ? typeValue.split("|") : [];
							const lastPart = (parts && parts.length > 0 ? parts[parts.length - 1] : "").trim();

							const type_full_val = coins.result[index].denomination ? coins.result[index].denomination + " | " + lastPart.replace(coins.result[index].denomination, "").trim(): coins.result[index].type_full_value;
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

						const imgContainer = common.create_dom_element({
							element_type: "div",
							class_name: "img-container",
							parent: infoContainer
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

							//Collection

							common.create_dom_element({
								element_type: "div",
								class_name: "collection-container",
								text_content: coins.result[index].collection,
								parent: infoContainer
							});

							//informacion

							const weight = coins.result[index].weight ? coins.result[index].weight + " g; " : " ";
							const diameter = coins.result[index].diameter ? coins.result[index].diameter + " mm; " : " ";
							const dies = coins.result[index].dies ? coins.result[index].dies + " h" : " ";

							 common.create_dom_element({
								element_type: "div",
								class_name: "data-container",
								text_content: weight + diameter + dies,
								parent: infoContainer
							});



							//public info 

							common.create_dom_element({
								element_type: "div",
								class_name: "public-info",
								text_content: coins.result[index].bibliography_title,
								parent: infoContainer
							});



							//Coin link 
							
							const link = common.create_dom_element({
								element_type: "a",
								class_name: "coin_link",
								href: `/web_numisdata/coin/${coins.result[index].section_id}`,
								parent: infoContainer
								});

								// Crear la imagen

								const img = common.create_dom_element({
								element_type: "img",
								class_name: "coin_icon",
								src: "/web_numisdata/tpl/assets/images/icon_link_color.svg",   // aquí pones la ruta de la moneda
								parent: link
								});

								// Crear el texto
								const span = common.create_dom_element({
								element_type: "span",
								text_content: "MONEDA",
								parent: link
								});

							/*
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


							*/
                        }
						
		return fragment
	},//end draw_hoard




	cargarMonedasComplejos : async function(ids) {
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

cargarTiposComplejos : async function(ids) {
		try {
    // si ids es un array -> conviértelo en lista separada por comas
			const filtro = Array.isArray(ids)
			? `section_id IN (${ids.join(",")})`
			: `section_id = ${ids}`;

			const monedas = await data_manager.request({
			body: {
				dedalo_get: "records",
				table: "types",
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


}//end render_hoard