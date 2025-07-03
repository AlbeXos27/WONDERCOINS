/*global page_globals, common, DocumentFragment, map_factory, tstring, page, hoards */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var render_hoards = {



	ar_rows	: [],
	caller	: null,



	draw_item : function(row) {

		const fragment = new DocumentFragment()

		



		// wrapper
			
			/* let resultado = {
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
				
						resultado.hallazgos.datos.push(row)
			const wrapper = common.create_dom_element({
				element_type	: "div",
				class_name		: "row_wrapper",
				parent			: fragment
			})

			// map_wrapper
				const map_wrapper = common.create_dom_element({
					element_type 	: "div",
					class_name		: "map_wrapper",
					parent 			: wrapper
				})
				if (row.map) {
					// set node only when it is in DOM (to save browser resources)
						const observer = new IntersectionObserver(function(entries) {
							const entry = entries[1] || entries[0]
							if (entry.isIntersecting===true || entry.intersectionRatio > 0) {
								observer.disconnect();

								// create a full map
								const map_position	= row.map
								const container		= map_wrapper // document.getElementById("map_container")

								const map = new map_factory() // creates / get existing instance of map
								map.init({
									map_container		: map_wrapper,
									map_position		: map_position,
									source_maps			: page.maps_config.source_maps,
									result				: resultado
								})
								
							}
						}, { threshold: [0] });
						observer.observe(map_wrapper);
				}

			// info_wrap
				const info_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "info_wrap",
					parent 			: wrapper
				})


			// title_wrap
				const title_wrap = common.create_dom_element({
					element_type	: "div",
					class_name		: "title_wrap",
					parent			: info_wrap
				})

				// name
					const target_path = row.table==='findspots'
						? 'findspot'
						: 'hoard'
					const hoard_uri = page_globals.__WEB_ROOT_WEB__ + '/'+target_path+'/' + row.section_id
					// const hoard_uri_text	='<a class="icon_link" href="'+hoard_uri+'"></a>'
					const hoard_uri_text ='<span class="icon_link"></span>'
					common.create_dom_element ({
						element_type	: "a",
						href			: hoard_uri,
						inner_html		: row.name + hoard_uri_text,
						class_name		: 'name',
						target			: '_blank',
						parent			: title_wrap
					})

				// place
					const place = row.place || ''
					common.create_dom_element ({
						element_type	: 'div',
						class_name		: 'label',
						inner_html		: place,
						parent			: title_wrap
					})

			// info_text_wrap
				const info_text_wrap = common.create_dom_element({
					element_type 	: "div",
					class_name		: "info_text_wrap",
					parent 			: info_wrap
				})

				// total_coins
					if (row.coins && row.coins.length>0) {
						const n_coins = row.coins.length
						const total_coins = common.create_dom_element ({
							element_type	: 'span',
							class_name		: '',
							inner_html		: (tstring.total_coins || 'Total coins') + ': ' + n_coins,
							parent			: info_text_wrap
						})
					}

					if(row.date_in != null || row.date_out != null){
							
						common.create_dom_element ({
							element_type	: 'span',
							class_name		: '',
							inner_html		: ('Cronologia del tipo : ( ') + (row.date_in != null ? row.date_in : "N/A") + " / " + (row.date_out != null ? row.date_out : "N/A") + ")",
							parent			: info_wrap
						})
					}


					
					/* if(row.date_in != null || row.date_out != null){
							
						common.create_dom_element ({
							element_type	: 'span',
							class_name		: '',
							inner_html		: ('Cronologia del tipo : ( ') + (row.date_in != null ? row.date_in : "N/A") + " / " + (row.date_out != null ? row.date_out : "N/A") + ")",
							parent			: info_wrap
						})
					}
					*/ 

					/*  const public_info = row.public_info || ""
					 common.create_dom_element ({
					 	element_type	: "span",
					 	inner_html		: '\n'+public_info,
						class_name		: "",
					 	parent			: info_wrap
					 })
 */
				// link
					// const link = row.link || ''
					// common.create_dom_element ({
					// 	element_type	: 'a',
					// 	href			: link,
					// 	inner_html		: link,
					// 	class_name		: '',
					// 	target			: '_blank',
					// 	parent			: info_text_wrap
					// })
		
 

		return fragment
	}//end draw_item



}//end coins_row_fields
