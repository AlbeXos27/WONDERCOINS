/*global tstring, form_factory, list_factory, Promise, 																																									psqo_factory, mints_rows, SHOW_DEBUG, common, page, data_manager, event_manager */
/*eslint no-undef: "error"*/

"use strict";



var treasures =  {

	// trigger_url 	: page_globals.__WEB_TEMPLATE_WEB__ + "/mints/trigger.mints.php",
	search_options 	: {},

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

	/**
	* SET_UP
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container
			self.rows_container	= options.rows_container
			const psqo			= options.psqo


		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			self.form_container.appendChild(form_node)

		// pagination
			self.pagination = {
				total	: null,
				limit	: 10,
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

		// first search
			if(psqo && psqo.length>1){

				// if psqo is received, recreate the original search into the current form and submit
				const decoded_psqo = psqo_factory.decode_psqo(psqo)
				if (decoded_psqo) {

					self.form.parse_psqo_to_form(decoded_psqo)

					self.form_submit(form_node, {
						scroll_result : true
					})
				}//end if (decoded_psqo)

			}else{

				self.pagination = {
					total		: null,
					limit	: 10,
					offset		: 0,
					n_nodes	: 8
				}
				self.form_submit()
			}


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

		// name
			self.form.item_factory({
				id			: "name",
				name		: "name",
				label		: "Nombre" || "Treasure",
				q_column	: "name",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'hoards'
					})
				}
			})

		// Place
			self.form.item_factory({
				id			: "place",
				name		: "place",
				label		: "Lugar" || "Place",
				q_column	: "place",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'hoards'
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
					total		: null,
					// limit	: 10,
					offset		: 0,
					// n_nodes	: 8
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

			const table		= 'hoards'
			const ar_fields	= ['*']
			const limit		= self.pagination.limit || 0
			const offset	= self.pagination.offset || 0
			const count		= true
			const order		= "name"

				const filter = self.form.build_filter()
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group,true)
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
				if(SHOW_DEBUG===true) {
					// console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				

			const body = {
				dedalo_get		: 'records',
				table			: table,
				ar_fields		: ar_fields,
				sql_filter		: final_filter,
				limit			: limit,
				count			: count,
				offset			: offset,
				order			: order,
				process_result	: null
			}
			data_manager.request({
				body : body
			})
			.then(function(api_response){

				// parse data
					const data	= page.parse_hoard_data(api_response.result)
					const total	= api_response.total

					self.pagination.total	= total
					self.pagination.offset	= offset

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

				// render
					self.list = self.list || new list_factory() // creates / get existing instance of list
					self.list.init({
						data			: data,
						fn_row_builder	: self.list_row_builder,
						pagination	: self.pagination,
						caller			: self
					})
					self.list.render_list()
					.then(function(list_node){
						if (list_node) {
							rows_container.appendChild(list_node)
						}
						resolve(list_node)
					})

				// load all id sequence
					const ar_id_promise = (limit===0 && offset===0)
						? Promise.resolve( data.map(el => el.section_id) ) // use existing
						: (()=>{
							// create a unlimited search
							const new_body		= Object.assign({}, body)
							new_body.limit		= 0
							new_body.offset		= 0
							new_body.count		= false
							new_body.ar_fields	= ['section_id']

							return data_manager.request({
								body : new_body
							})
							.then(function(response){
								const ar_id = response.result
									? response.result.map(el => el.section_id)
									: null
								return(ar_id)
							})
						  })()
					ar_id_promise.then(function(){
						// console.log("********** ar_id:",ar_id);
					})
			})

			// scrool to head result
			const div_result = document.querySelector(".rows_container")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}
		})
	},//end form_submit



	/**
	* LIST_ROW_BUILDER
	* This function is a callback defined when list_factory is initialized (!)
	* @param object data (db row parsed)
	* @param object caller (instance of class caller like coin)
	* @return DocumentFragment node
	*/
	list_row_builder : function(data){

		return treasures_rows.draw_item(data)
	}//end list_row_builder





}//end treasures
