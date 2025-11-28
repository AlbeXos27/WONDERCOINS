/*global tstring, page_globals, SHOW_DEBUG, coin_row, event_manager, data_manager, Promise, page */
/*eslint no-undef: "error"*/

"use strict";



var coin = {


	section_id				: null,
	export_data_container	: null,


	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
set_up: function(options) {
    const self = this;

    self.section_id = options.section_id;
    self.export_data_container = options.export_data_container;

   /*  const export_data_buttons = page.render_export_data_buttons();
    self.export_data_container.appendChild(export_data_buttons); */
    self.export_data_container.classList.add('hide');

    const contact_form_button = page.create_suggestions_button();
    self.export_data_container.appendChild(contact_form_button);

    if (self.section_id && self.section_id > 0) {
        self.get_row_data({ section_id: self.section_id })
            .then(function(data) {
                if (!data || data.length === 0) {
                    console.error("No hay datos para section_id:", self.section_id);
                    return;
                }
                const row = data[0];

                // asegurarse de que los campos null tengan un valor seguro
                const safe_row = {
                    ...row,
                    legend_obverse: row.legend_obverse || "",
                    legend_reverse: row.legend_reverse || "",
                    countermark_obverse: row.countermark_obverse || "",
                    countermark_reverse: row.countermark_reverse || "",
                    auction_data: row.auction_data || []
                };

                const target = document.getElementById('row_detail');
                if (target) {
                    self.render_row({ target: target, row: safe_row })
                        .then(function() {
                            const images_gallery_container = target.querySelector('.gallery');
                            page.activate_images_gallery(images_gallery_container);
                            self.export_data_container.classList.remove('hide');
                        });
                }
            });
    } else {
        console.error("section_id inválido: ", options);
    }

    return true;
},//end set_up



	/**
	* GET_ROW_DATA
	* Make a request to Dédalo public API to get current section_id record
	* parse the result
	* @return promise : array of rows (one expected)
	*/
	get_row_data : function(options) {

		const self = this

		// options
			const section_id = options.section_id

		return new Promise(function(resolve){

			// vars
				const sql_filter	= 'section_id=' + section_id
				const ar_fields		= ['*']

			const request_body = {
					dedalo_get		: 'records',
					db_name			: page_globals.WEB_DB,
					lang			: page_globals.WEB_CURRENT_LANG_CODE,
					table			: 'coins',
					ar_fields		: ar_fields,
					sql_filter		: sql_filter,
					limit			: 1,
					count			: false,
					offset			: 0,
					resolve_portals_custom	: {
						type_data			: 'types',
						bibliography_data	: 'bibliographic_references',
						image_obverse_data	: 'images'
						// images_obverse	: 'images_obverse',
						// images_reverse	: 'images_reverse'
					}
				}

			// request
			return data_manager.request({
				body : request_body
			})
			.then(function(api_response){
				// console.log("--> coins get_row_data api_response:", api_response);

				// parse server data
					const data = page.parse_coin_data(api_response.result)

				// send event data_request_done (used by download buttons)
					event_manager.publish('data_request_done', {
						request_body		: request_body,
						result				: data,
						export_data_parser	: page.export_parse_coin_data
					})

				resolve(data)
			})
		})
	},//end get_row_data



	/**
	* RENDER_ROW
	*/
	render_row: function(options) {
    const self = this;
    const row = options.row;
    const container = options.target;
    self.row = row;

    return new Promise(function(resolve) {
        while (container.firstChild) container.removeChild(container.firstChild);

        // envolver draw_coin en try/catch para evitar errores por campos null
        let coin_row_wrapper;
        try {
            coin_row_wrapper = coin_row.draw_coin(row);
        } catch (err) {
            console.error("Error al dibujar la moneda:", err, row);
            coin_row_wrapper = document.createElement('div');
            coin_row_wrapper.textContent = "Error mostrando datos de la moneda.";
        }

        container.appendChild(coin_row_wrapper);
        resolve(container);
		});
	}//end render_row



}//end coin
