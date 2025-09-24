"use strict";



var treasures_rows = {


	ar_rows : [],
	caller  : null,
	last_type : null,



	draw_item : function(row) {

		const self = this
		
		const fragment = new DocumentFragment()

	// wrapper
		const wrapper = common.create_dom_element({
			element_type	: "div",
			class_name		: "treasures_row_wrapper",
			parent			: fragment
		})

        const map_container = common.create_dom_element({
            element_type    : "div",
            class_name      : "map_container",
            parent          : wrapper
        })

        //console.log("ROWSSSS",row)

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

        const map_fact = new map_factory() // creates / get existing instance of map

						const map = map_fact.init({
							map_container : map_container,
							map_position  : row.map,
							source_maps   : page.maps_config.source_maps,
							result        : resultado,
							findspot	  : true
							});

		const name = row.name
		const mint_id = row.section_id
		const mint_uri	= page_globals.__WEB_ROOT_WEB__ + "/hoard/" + mint_id
		const mint_uri_text	= "<a class=\"icon_link\" href=\""+mint_uri+"\"></a> "

        const info = common.create_dom_element({
            element_type    : "div",
            class_name      : "info",
            parent          : wrapper
        })

		const title = common.create_dom_element({
			element_type	: "a",
			inner_html  	: name + mint_uri_text,
			class_name		: "name",
			href 			: mint_uri,
			target 			: "_blank",
			parent 			: info
		})

		common.create_dom_element({
			element_type	: "div",
			inner_html  	: row.place,
			class_name		: "text",
			parent 			: info
		})
		console.log("ROW",row)
		if (row.coins){

			common.create_dom_element({
				element_type	: "div",
				class_name		: "coins",
				parent 			: info,
				inner_html	: "Total coins: " + row.coins.length
			})	

		}
		
		return fragment
	}


}//end treasures_rows
