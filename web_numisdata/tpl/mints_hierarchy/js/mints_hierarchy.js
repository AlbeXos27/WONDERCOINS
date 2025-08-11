/*global tstring, form_factory, list_factory, Promise, 																																									psqo_factory, mints_rows, SHOW_DEBUG, common, page, data_manager, event_manager */
/*eslint no-undef: "error"*/

"use strict";



var mints_hierarchy =  {

		// DOM items ready from page html
		rows_container	: null,

	/**
	* SET_UP
	*/
	set_up : async function(options) {

		const self = this

		self.rows_container	= options.rows_container

		await this.get_data_mints(null)

		return true
	},//end set_up

	get_data_mints: async function(id) {
			try {
				const cecas = await data_manager.request({
					body: {
						dedalo_get: 'records',
						table: 'catalog',
						ar_fields: ["*"],
						sql_filter: id == null ? "section_id = 21057" : `parent LIKE "%${id}%"`,
						limit: 0,
						count: true,
						offset: 0,
						order: '',
						process_result: null
					}
				});
				return cecas;
			} catch (err) {
				console.error("Error fetching mints:", err);
				return null;
			}
	},





}

	