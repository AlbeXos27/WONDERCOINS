/* global tstring, SHOW_DEBUG, common, page */
/*eslint no-undef: "error"*/
"use strict";



function form_factory() {

	// vars
	// form_items. Array of form objects including properties and nodes
	this.form_items	= []
	// form element DOM node
	this.node		= null
	// form operators_node
	this.operators_node = null
	this.group = []


	/**
	* ITEM_FACTORY
	*/
	this.item_factory = function(options) {

		const self = this

		// form_item. create new instance of form_item
			const form_item = self.build_form_item(options)

		// node
			if(options.parent) {
				self.build_form_node(form_item, options.parent)
			}

		// callback
			if (typeof options.callback==="function") {
				options.callback(form_item)
			}

		// store current instance
			self.form_items[options.id] = form_item


		return form_item
	}//end item_factory



	/**
	* BUILD_FORM_ITEM
	* Every form input has a js object representation
	*/
	this.build_form_item = function(options) {

		// console.log("options.eq_in:", typeof options.eq_in, options.name);
		// console.log("options.eq_out:", typeof options.eq_out, options.name);

		const form_item = {
			id				: options.name,	// Like 'mint'
			name			: options.name, // Like 'mint'
			label			: options.label, // Used to placeholder too
			class_name 		: options.class_name || null,
			// search elements
			q				: options.q || "", // user keyboard enters values
			q_selected		: [], // user picked values from autocomplete options
			q_selected_eq	: options.q_selected_eq || "=", // default internal comparator used in autocomplete	with user picked values
			q_column		: options.q_column, // like 'term'
			q_column_filter	: options.q_column_filter, // overwrite q_column as filter column name
			q_column_group	: options.q_column_group, // overwrite q_column as group column name (autocomplete)
			q_splittable	: options.q_splittable || false, // depending on its value the item content will be splitted or not on loading it (see qdp catalog)
			sql_filter		: options.sql_filter || null,
			// special double filters
			// q_table 		: options.q_table, // like 'mints'
			// q_table_name : 'term_table', // like 'term_table'
			// autocomplete options
			eq				: options.eq || "LIKE", // default internal comparator used in autocomplete
			eq_in			: typeof options.eq_in!=='undefined'  ? options.eq_in  : '', // used in autocomplete to define if term begins with .. o in the middle of..
			eq_out			: typeof options.eq_out!=='undefined' ? options.eq_out : '%', // used in autocomplete to define if term ends with .. o in the middle of..
			// category. thesurus terms and not terms
			is_term			: options.is_term || false, // terms use special json format as '["name"]' instead 'name'
			callback		: options.callback || false, // callback function
			list_format		: options.list_format || null, // TO DEPRECATE !!! USE activate_autocomplete parse_result (!)
			wrapper			: options.wrapper || null, // like YEAR to obtain YEAR(name)
			value_wrapper	: options.value_wrapper || null, // like ['["','"]'] to obtain ["value"] in selected value only
			value_split		: options.value_split || null, // like ' - ' to generate one item by beat in autocomplete
			// nodes (are set on build_form_node)
			node_input		: null,
			node_values		: null,
			// input type and fixed values (case 'select')
			input_type		: options.input_type,
			input_values	: options.input_values,
			// operator between values of the field
			group_op		: options.group_op || '$and'
		}

		// add node
			// forms.build_form_node(form_item, options.parent)


		return form_item
	}//end build_form_item



	/**
	* BUILD_FORM_NODE
	*/
	this.build_form_node = function(form_item, parent) {
		// console.log("form_item:",form_item);
		// grouper
			const group = common.create_dom_element({
				element_type	: 'div',
				class_name		: "form-group field " + (form_item.class_name || ''),
				title			: (form_item.is_term) ? (form_item.label + ' (is_term)') : form_item.label,
				parent			: parent
			})

		// input
			switch(form_item.input_type) {

				case 'range_slider':
					const range_slider_labels = common.create_dom_element({
						element_type	: 'div',
						class_name		: "range_slider_labels",
						parent			: group
					})
					const range_slider_value_in = common.create_dom_element({
						element_type	: 'input',
						type			: 'text',
						id				: form_item.id + "_in",
						class_name		: "form-control range_slider_value value_in",
						parent			: range_slider_labels
					})
					const node_label = common.create_dom_element({
						element_type	: 'span',
						class_name		: "form-control range_slider_label node_label",
						inner_html		: form_item.label,
						parent			: range_slider_labels
					})
					const range_slider_value_out = common.create_dom_element({
						element_type	: 'input',
						type			: 'text',
						id				: form_item.id + "_out",
						class_name		: "form-control range_slider_value value_out",
						parent			: range_slider_labels
					})
					const node_slider = common.create_dom_element({
						element_type	: 'div',
						id				: form_item.id,
						class_name		: "form-control " + (form_item.class_name ? (' '+form_item.class_name) : ''),
						// value			: form_item.q || '',
						parent			: group
					})
					// node_select.addEventListener("change", function(e){
					// 		console.log("e.target.value:",e.target.value);
					// 	if (e.target.value) {
					// 		form_item.q = e.target.value
					// 		console.log("form_item:",form_item);
					// 	}
					// })
					form_item.node_input = node_slider
					break;

				case 'select':
					const node_select = common.create_dom_element({
						element_type	: 'select',
						id				: form_item.id,
						class_name		: "form-control ui-autocomplete-select" + (form_item.class_name ? (' '+form_item.class_name) : ''),
						value			: form_item.q || '',
						parent			: group
					})
					for (let i = 0; i < form_item.input_values.length; i++) {
						form_item.input_values[i]
						common.create_dom_element({
							element_type	: 'option',
							value			: form_item.input_values[i].value,
							inner_html		: form_item.input_values[i].label,
							parent			: node_select
						})
					}
					node_select.addEventListener("change", function(e){
							console.log("e.target.value:",e.target.value);
						if (e.target.value) {
							form_item.q = e.target.value
							console.log("form_item:",form_item);
						}
					})
					form_item.node_input = node_select
					break;

				default:
					let label_node
					const node_input = common.create_dom_element({
						element_type	: 'input',
						type			: 'text',
						id				: form_item.id,
						class_name		: "form-control ui-autocomplete-input" + (form_item.class_name ? (' '+form_item.class_name) : ''),
						placeholder		: form_item.label,
						value			: form_item.q || '',
						parent			: group
					})
					node_input.addEventListener("keyup", function(e){
						// asign value
						form_item.q = e.target.value
						// show label at top
						if (node_input.value.length>0) {
							label_node = label_node || common.create_dom_element({
								element_type	: 'span',
								class_name		: "form_input_label",
								inner_html		: form_item.label,
								parent			: group
							})
						}else if (label_node) {
							label_node.remove()
							label_node = null
						}
					})
					node_input.addEventListener("blur", function(e){
						if (label_node && node_input.value.length===0) {
							label_node.remove()
							label_node = null
						}
					})
					form_item.node_input = node_input
					break;
			}


		// values container (user selections)
			const node_values = common.create_dom_element({
				element_type	: 'div',
				// id			: form_item.name + '_values',
				class_name		: "container_values",
				parent			: group
			})
			form_item.node_values = node_values


		return true
	}//end build_form_node



	/**
	* BUILD_OPERATORS_NODE
	*/
	this.build_operators_node = function() {

		const self = this

		const group = common.create_dom_element({
			element_type	: "div",
			class_name		: "form-group field field_operators"
		})

		const operator_label = common.create_dom_element({
			element_type	: "span",
			class_name 		: "radio operators",
			text_content 	: tstring["operator"] || "Operator",
			parent 			: group
		})
		// radio 1
		const radio1 = common.create_dom_element({
			element_type	: "input",
			type 			: "radio",
			id 				: "operator_or",
			parent 			: group
		})
		radio1.setAttribute("name","operators")
		radio1.setAttribute("value","$or")
		const radio1_label = common.create_dom_element({
			element_type	: "label",
			text_content 	: tstring["or"] || "or",
			parent 			: group
		})
		radio1_label.setAttribute("for","operator_or")
		// radio 2
		const radio2 = common.create_dom_element({
			element_type	: "input",
			type 			: "radio",
			id 				: "operator_and",
			name 			: "operators",
			parent 			: group
		})
		radio2.setAttribute("name","operators")
		radio2.setAttribute("value","$and")
		radio2.setAttribute("checked","checked")
		const radio2_label = common.create_dom_element({
			element_type	: "label",
			text_content 	: tstring["and"] || "and",
			parent 			: group
		})
		radio2_label.setAttribute("for","operator_and")

		// fix node
			self.operators_node = group

		return group
	}//end build_operators_node




	/**
	* SET_OPERATOR_NODE_VALUE
	* Set a q value to a form item
	*/
	this.set_operator_node_value = function(operator_value) {

		const self = this

		const operator = (operator_value === '$and')
			? 'and'
			: (operator_value === '$or')
				? 'or'
				: null

		if(!operator){
			return false
		}

		const radio_button = self.operators_node.querySelector('#operator_'+operator)
		radio_button.setAttribute("checked","checked")

		return true
	}//end set_operator_node_value




	/**
	* ADD_SELECTED_VALUE
	*/
	this.add_selected_value = function(form_item, label, value) {

		const container = form_item.node_values

		// Check if already exists
			const inputs		= container.querySelectorAll(".input_values")
			const inputs_length	= inputs.length
			for (let i = inputs_length - 1; i >= 0; i--) {
				if (value===inputs[i].value) return false;
			}

		// Create new line
			const line = common.create_dom_element({
				element_type	: "div",
				class_name		: "line_value",
				parent			: container
			})

		// trash.
			// awesome font 4 <i class="fal fa-trash-alt"></i>
			// awesome font 5 <i class="far fa-trash-alt"></i>
			const trash = common.create_dom_element({
				element_type	: "i",
				class_name		: "icon remove fal far fa-trash fa-trash-alt", //  fa-trash awesome font 4
				parent			: line
			})
			trash.addEventListener("click",function(){

				// remove from form_item q_selected
				const index = form_item.q_selected.indexOf(value);
				if (index > -1) {
					// remove array element
					form_item.q_selected.splice(index, 1);

					// remove dom node
					this.parentNode.remove()

					// debug
					if(SHOW_DEBUG===true) {
						console.log("form_item.q_selected removed value:",value,form_item.q_selected);
					}
				}
			})

		// label
			const value_label = common.create_dom_element({
				element_type	: "span",
				class_name		: "value_label",
				inner_html		: label,
				parent			: line
			})

		// input
			const input = common.create_dom_element({
				element_type	: "input",
				class_name		: "input_values",
				parent			: line
			})
			input.value = value

		// add to form_item
			form_item.q_selected.push(value)

		// clean values
			form_item.node_input.value	= ""
			form_item.q					= ""


		return true
	}//end add_selected_value



	/**
	* SET_INPUT_VALUE
	* Set a q value to a form item
	*/
	this.set_input_value = function(form_item, value) {

		// add value
			form_item.node_input.value	= value
			form_item.q					= value

		return true
	}//end set_input_value


	/**
	* SET_FORM_ITEM
	* Set a imput node of the form with the value and config searc of the psqo item object
	*/
	this.set_form_item = function(psqo_item) {
		//console.log("set_form_item psqo_item:",psqo_item);

		const self = this
		const q_column = psqo_item.id

		// find form_items match q_column
			const form_item = (()=>{

				return self.form_items[q_column]

				// for(const key in self.form_items) {

				// 	const value = self.form_items[key]

				// 	if (value.q_column===q_column) {
				// 		return value
				// 	}
				// }

				// return false;
			})();
			if (!form_item) {
				console.error("Error on get form item", psqo_item, self.form_items);
				return false
			}
			

		// set properties
			form_item.op		= psqo_item.op || form_item.op
			form_item.eq_in		= psqo_item.eq_in || form_item.eq_in
			form_item.eq_out	= psqo_item.eq_out || form_item.eq_out
		// const clean_value = psqo_item.value.replace(^'\[")|(^'\%?)|(\%?'$)|("\]'$)
		// const clean_value = decodeURIComponent(psqo_item.q)
		const clean_value = psqo_item.q

		// add value
			if (psqo_item.q_type==='q_selected') {

				const label = clean_value
				self.add_selected_value(form_item, label, clean_value)

			}else{

				self.set_input_value(form_item, clean_value)
			}


		return form_item
	}//end set_form_item



	/**
	* BUILD_FILTER
	* Creates a complete sqo filter using form items values
	*/
	this.build_filter = function(options={}) {

		const self = this
		// console.log("self.operators_node:",self.operators_node);

		// options
			const form_items = options.form_items || self.form_items

		// global operator
			// const operators_node = self.operators_node
			// const operator_value = (operators_node)
			// 	? operators_node.querySelector('input[name="operators"]:checked').value
			// 	: '$and'

		const ar_query_elements = []
		for (let [id, form_item] of Object.entries(form_items)) {

			// const current_group = []

			const group_op = (form_item.is_term===true)
				? '$or'
				: form_item.group_op
					? form_item.group_op
					: '$and'

			// const group_op = operator_value || '$and'
			const group = {}
				  group[group_op] = []

			// q value or sql_filter
				if ( (form_item.q.length!==0 && form_item.q!=='*') || (form_item.sql_filter) ) {

					if (form_item.input_type==='range_slider' && (!form_item.sql_filter || form_item.sql_filter.length<2)) {
						continue;
					}

					const c_group_op = '$and'
					// const c_group_op = operator_value || '$and'
					const c_group = {}
						  c_group[c_group_op] = []

					// escape html strings containing single quotes inside.
					// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
					const safe_value = (typeof form_item.q==='string' || form_item.q instanceof String)
						? form_item.q.replace(/(')/g, "''")
						: form_item.q // negative int numbers case like -375

					// q element
						const element = {
							id		: form_item.id,
							field	: form_item.q_column,
							value	: `'${form_item.eq_in}${safe_value}${form_item.eq_out}'`, // Like '%${form_item.q}%'
							op		: form_item.eq, // default is 'LIKE'
							q_type	: 'q',
							q		: form_item.q
						}

						// optionals
							if (form_item.sql_filter) {
								element.sql_filter = form_item.sql_filter
							}
							if (form_item.wrapper) {
								element.wrapper = form_item.wrapper
							}

						c_group[c_group_op].push(element)

					// q_table element
						// if (form_item.q_table && form_item.q_table!=="any") {

						// 	const element_table = {
						// 		field	: form_item.q_table_name,
						// 		value	: `'${form_item.q_table}'`,
						// 		op		: '='
						// 	}

						// 	c_group[c_group_op].push(element_table)
						// }

					// add basic group
						group[group_op].push(c_group)
				}

			// q_selected values
				if (form_item.q_selected.length!==0) {

					for (let j = 0; j < form_item.q_selected.length; j++) {

						const value = form_item.q_selected[j]
						// escape html strings containing single quotes inside.
						// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
						const safe_value = (typeof value==='string' || value instanceof String)
							? value.replace(/(')/g, "''")
							: value

						// item_value
							const item_value = (form_item.value_wrapper && form_item.value_wrapper.length>1) // like [""]
								? form_item.value_wrapper[0] + safe_value + form_item.value_wrapper[1]
								: safe_value

						const c_group_op = '$and'
						// const c_group_op = operator_value || '$and'
						const c_group = {}
							  c_group[c_group_op] = []

						// elemet
						const element = {
							id		: form_item.id,
							field	: form_item.q_column,
							value	: (form_item.q_selected_eq==="LIKE") ? `'%${item_value}%'` : `'${item_value}'`,
							op		: form_item.q_selected_eq,
							q_type	: 'q_selected',
							q		: value
						}

						// optionals
							if (form_item.sql_filter) {
								element.sql_filter = form_item.sql_filter
							}
							if (form_item.wrapper) {
								element.wrapper = form_item.wrapper
							}

						c_group[c_group_op].push(element)

						// q_table element
							// if (form_item.q_table && form_item.q_table!=="any") {

							// 	const element_table = {
							// 		field	: form_item.q_table_name,
							// 		value	: `'${form_item.q_table}'`,
							// 		op		: '='
							// 	}

							// 	c_group[c_group_op].push(element_table)
							// }

						group[group_op].push(c_group)
					}
				}

			if (group[group_op].length>0) {
				ar_query_elements.push(group)
			}
		}

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("self.form_items:",self.form_items);
				// console.log("ar_query_elements:",ar_query_elements);
			}

		// empty form case
			if (ar_query_elements.length<1) {
				console.warn("-> form_to_sql_filter empty elements selected:", ar_query_elements)
				return false;
			}

		// input_operators (optional)
			const input_operators = self.operators_node
				? self.operators_node.querySelector('input[name="operators"]')
				: null

		// operators_value
			const operators_value = input_operators
				? self.operators_node.querySelector('input[name="operators"]:checked').value
				: "$and";

		// filter object
			const filter = {}
				  filter[operators_value] = ar_query_elements


		return filter
	}//end build_filter



	/**
	* PARSE_SQL_FILTER
	* Convert filter object to plain sql code ready to send to database
	* @param object filter
	* @return string
	*/
	this.parse_sql_filter = function(filter, group, recursive, global_search,table){

		const self = this
		const sql_filter = (filter)
			? (function() {

				const op		= Object.keys(filter)[0]
				const ar_query	= filter[op]
				const item_table = table
				const ar_filter = []
				const ar_query_length = ar_query.length
				for (let i = 0; i < ar_query_length; i++) {

					const item = ar_query[i]
					const item_op = Object.keys(item)[0]
					

					if(item_op==="$and" || item_op==="$or") {

						// recursion
						if(recursive){
							const current_filter_line = "" + self.parse_sql_filter(item, group,recursive,global_search,table) + ""
							ar_filter.push(current_filter_line)
						}

						continue;
					}

					// item_field
						const item_field = (item.wrapper && item.wrapper.length>0) // like YEAR(mycolumn_name)
							? item.wrapper + "(" + item.field + ")"
							: item.field

					let filter_line
					/*  if (item.op==='MATCH') {
						filter_line = "MATCH (" + item.field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
					 }else{
					 	filter_line = (item.field.indexOf("AS")!==-1)
							? "" +item.field+""  +" "+ item.op +" "+ item.value
							: "`"+item.field+"`" +" "+ item.op +" "+ item.value
					} */
					if (item.sql_filter && item.sql_filter.length>0) {
						filter_line = item.sql_filter
					}else if (item.op==='MATCH') {
						filter_line = "MATCH (" + item_field + ") AGAINST ("+item.value+" IN BOOLEAN MODE)"
					}else{
						filter_line = (item_field.indexOf("AS")!==-1 || item_field.indexOf("CONCAT")!==-1 || (item.wrapper && item.wrapper.length>0))
							? "(" +item_field+""  +" "+ item.op +" "+ item.value + (" AND "+item_field+"!='')")
							: "(`"+item_field+"`" +" "+ item.op +" "+ item.value	+ (" AND `"+item_field+"`!='')")

					}
					if(item_field == "term"){
							filter_line += ` AND term_section_label LIKE '%Grupo numismático%' AND parent LIKE  '["21057"]'`;
					}
					
					if(global_search){
						filter_line = "(" + filter_line;
						filter_line += ` OR parents_text LIKE ${item.value})`;
					}

					if(item_table == "findspots" ){
						filter_line += ` AND typology != '' `;
					}


					filter_line += " AND lang = 'lg-spa'"
					ar_filter.push(filter_line)

					// group
						if (group && item.group) {
							group.push(item.group)
						}
				}

				const boolean_op = (op === '$and')
					? 'AND'
					: (op === '$or')
						? 'OR'
						: null

				return ar_filter.join(" "+boolean_op+" ")
			  })()
			: null
			 //console.log("sql_filter:",sql_filter);

		return sql_filter
	}//end parse_sql_filter



	/**
	* PARSE_PSQO_TO_FORM
	* @return
	*/
	this.parse_psqo_to_form = function(psqo, recursion) {

		const self = this

		const global_key = Object.keys(psqo)[0]
		if(global_key==='$and' || global_key==='$or'){
			// set global oprators value
				if (!recursion) {
					// console.log("//----- SET global_key:",global_key);
					self.set_operator_node_value(global_key)
				}

			// recursion values
				for (let i = 0; i < psqo[global_key].length; i++) {
					self.parse_psqo_to_form(psqo[global_key][i], true)
				}
		}else{
			self.set_form_item(psqo)
		}


		return true
	};//end parse_psqo_to_form



	/**
	* FULL_TEXT_SEARCH_OPERATORS_INFO
	* @return
	*/
	this.full_text_search_operators_info = function() {

		const grid = common.create_dom_element({
			element_type	: "div",
			class_name		: "full_text_search_operators_info"
		})

		const pairs = [
			{
				op		: tstring.operator,
				info	: tstring.description
			},
			{
				op		: "+",
				info	: tstring.include_the_word || "Include, the word must be present."
			},
			{
				op		: "-",
				info	: tstring.exclude_the_word || "Exclude, the word must not be present."
			},
			{
				op		: ">",
				info	: tstring.increase_ranking || "Include, and increase ranking value."
			},
			{
				op		: "<",
				info	: tstring.decrease_ranking || "Include, and decrease the ranking value."
			},
			{
				op		: "()",
				info	: tstring.group_words || "Group words into subexpressions (allowing them to be included, excluded, ranked, and so forth as a group)."
			},
			{
				op		: "~",
				info	: tstring.negate_word || "Negate a word’s ranking value."
			},
			{
				op		: "*",
				info	: tstring.wildcard_at_end || "Wildcard at the end of the word."
			},
			{
				op		: "“”",
				info	: tstring.defines_phrase || "Defines a phrase (as opposed to a list of individual words, the entire phrase is matched for inclusion or exclusion)."
			}
		]

		for (let i = 0; i < pairs.length; i++) {

			common.create_dom_element({
				element_type	: "div",
				class_name		: "op",
				text_content	: pairs[i].op,
				parent			: grid
			})

			common.create_dom_element({
				element_type	: "div",
				class_name		: "info",
				text_content	: pairs[i].info,
				parent			: grid
			})
		}

		return grid
	}//end full_text_search_operators_info



	/**
	* ACTIVATE_AUTOCOMPLETE
	* Generic autocomplete activation with support for HTML (Scott González)
	* @param object options
	*/
	this.activate_autocomplete = function(options) {
	const self = this;

	const form_item = options.form_item;
	const id = options.id || false;
	const label = options.label || "";
	const limit = options.limit || 0;
	const table = options.table || form_item.table;
	const cross_filter = options.cross_filter || true;
	const order = options.order || 'name ASC';
	const parent_in = options.parent_in || false;
	const global_search = options.global_search || false;
	const activate_filter = options.activate_filter === false ? false : true;
	const value_splittable = options.value_splittable === true ? true : false;
	const parse_result = options.parse_result || function(ar_result, term) {
		return ar_result.map(function(item){
			item.label = item.label.replace(/<br>/g," ");
			if (typeof page.parse_legend_svg==='function') {
				item.label = page.parse_legend_svg(item.label);
			}
			return item;
		});
	};

	if (!form_item.pagination) {
		form_item.pagination = { currentPage: 1, lastTerm: "" };
	}

	(function($){
		var proto = $.ui.autocomplete.prototype,
			initSource = proto._initSource;

		function filter(array, term) {
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
			return $.grep(array, function(value) {
				return matcher.test($("<div>").html(value.label || value.value || value).text());
			});
		}

		$.extend(proto, {
			_initSource: function() {
				if (this.options.html && $.isArray(this.options.source)) {
					this.source = function(request, response) {
						response(filter(this.options.source, request.term));
					};
				} else {
					initSource.call(this);
				}
			},
			_renderItem: function(ul, item) {
				var final_label = item.label;
				var ar_parts = final_label.split(' | ');
				var ar_clean = [];
				for (var i = 0; i < ar_parts.length; i++) {
					var current = ar_parts[i];
					if (current.length > 1 && current !== '<i>.</i>') ar_clean.push(current);
				}
				final_label = ar_clean.join(' | ');
				return $("<li class='ui-menu-item'></li>")
					.data("item.autocomplete", item)
					.append($("<div class='ui-menu-item-wrapper'></div>")[this.options.html ? "html" : "text"](final_label))
					.appendTo(ul);
			}
		});
	})(jQuery);
	
	const cache = {};
	$(form_item.node_input).autocomplete({
		delay: 150,
		minLength: 0,
		html: true,
		source: async function(request, response) {
			const term = request.term;
			const pagData = form_item.pagination;

			// Reiniciar búsqueda si cambia el término, pero mantener currentPage
			if (term !== pagData.lastTerm) {
				pagData.lastTerm = term;
			}

			const field = form_item.q_name;

			const q_column = form_item.q_column;
			const q_column_group = form_item.q_column_group || q_column;

			const op = "$and";
			const filterObj = {};
			filterObj[op] = [];

			console.log("filterObj", filterObj)

			const value_parsed = (form_item.eq_in) + term + (form_item.eq_out);
			const safe_value = typeof value_parsed === 'string' ? value_parsed.replace(/(')/g, "''") : value_parsed;
			filterObj[op].push({
				field: form_item.q_column_filter || q_column,
				value: `'${safe_value}'`,
				op: form_item.eq,
				group: q_column_group
			});

			if (cross_filter) {
				const c_op = "$and";
				const c_filter = {};
				c_filter[c_op] = [];

				for (let [id, current_form_item] of Object.entries(self.form_items)) {
					if (current_form_item.id === form_item.id) continue;

					if ((current_form_item.q.length !== 0 && current_form_item.q !== '*') || current_form_item.sql_filter) {
						c_filter[c_op].push({
							field: current_form_item.q_column,
							value: `'%${current_form_item.q}%'`,
							op: "LIKE",
							sql_filter: current_form_item.sql_filter,
							wrapper: current_form_item.wrapper
						});
					}

					if (current_form_item.q_selected.length !== 0) {
						for (let k = 0; k < current_form_item.q_selected.length; k++) {
							const value = current_form_item.q_selected[k];
							const safe_value2 = typeof value === 'string' ? value.replace(/(')/g, "''") : value;
							c_filter[c_op].push({
								field: current_form_item.q_column,
								value: (current_form_item.is_term === true) ? `'%${safe_value2}%'` : `'${safe_value2}'`,
								op: (current_form_item.is_term === true) ? "LIKE" : "=",
								sql_filter: current_form_item.sql_filter,
								wrapper: current_form_item.wrapper
							});
						}
					}
				}

				if (c_filter[c_op].length > 0) {
					filterObj[op].push(c_filter);
				}
			}


			const sql_filter = self.parse_sql_filter(filterObj, self.group, activate_filter, global_search, table);
			const table_resolved = typeof table === "function" ? table() : table;

			const field_beats = q_column.split(' AS ');
			const plain_field = field_beats[0];
			let section_id = "";
			const lang = "lg-spa";

			if(id){
				await data_manager.request({
					body: {
						dedalo_get: 'records',
						table: table_resolved,
						lang: lang,
						ar_fields: [plain_field + " AS name", "section_id"],
						sql_filter: !id ? sql_filter : " `term` LIKE '%" + label + "%'",
						group: plain_field,
						limit: limit,
						order: order
					}
				}).then((api_response) => {
					section_id = api_response.result[0].section_id;
				});
			}
			const ar_result = [];
			
			await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: table_resolved,
					lang: lang,
					ar_fields: [plain_field + " AS name", (table_resolved === "findspots" || table_resolved === "catalog") ? "parents_text" : "section_id"],
					sql_filter: !id ? sql_filter  + (table_resolved == "findspots" ? " AND coins != ''" : "") : `parent LIKE  '["${section_id}"]'`,
					group: plain_field,
					limit: 0,
					offset : (pagData.currentPage - 1) * 20,
					order: order
				}
			}).then((api_response) => {
				console.log("form_factory macaco",sql_filter)
				const len = api_response.result.length;

				if (pagData.currentPage > 1) {
					ar_result.push({
						label: "<div class='ac-nav-btn'>&laquo; Página anterior</div>",
						value: "__prev__"
					});
				}

				for (let i = 0; i < len; i++) {
					const item = api_response.result[i];
					if (!item.name || item.name.length < 1) continue;

					let base_value = (item.name.indexOf("[\"")===0 && item.name.indexOf("] | [")!==-1)
						? JSON.stringify([].concat(...item.name.split(" | ").map(el => JSON.parse(el))))
						: item.name;

					const current_ar_value = (base_value.indexOf("[\"")===0)
						? JSON.parse(base_value)
						: (Array.isArray(base_value) ? base_value : [base_value]);

					for (let j = 0; j < current_ar_value.length; j++) {
						const item_name = current_ar_value[j];
						if (!item_name || item_name === '[]') continue;

						let extra_label = "";
						if (item.parents_text && table_resolved === "findspots" && parent_in) {
							try {
								const camino = JSON.parse(item.parents_text);
								if (Array.isArray(camino)) extra_label = " | " + camino.join(" | ");
							} catch(e) { extra_label = " | " + item.parents_text; }
						}

						if(value_splittable){

							const splittable_values = item_name.split("|");

							splittable_values.forEach(splittable_value => {

								const clean_value = splittable_value.trim();
								const split_value = clean_value.split(',');
								if(split_value.length > 1){

									split_value.forEach(splitted_values => {

										const clean_value_splitted = splitted_values.trim();
										if(!clean_value_splitted.includes("Digitali")){

											if (!ar_result.find(el => el.label.includes(clean_value_splitted) )) {
												ar_result.push({ label: clean_value_splitted, value: clean_value_splitted });
											}

										}	

									})

								}else{

									if (!ar_result.find(el => el.label.includes(clean_value))) {
										ar_result.push({ label: clean_value, value: clean_value });
									}

								}

								
							})

						}else{

							if (!ar_result.find(el => el.value === item_name)) {
								ar_result.push({ label: `${item_name}${extra_label}`, value: item_name });
							}


						}
						
						
					}
				}

				let ar_result_final = parse_result(ar_result, term);
				const results_per_page = 20;
				let has_next_page = false;
				const offset = (pagData.currentPage - 1) * 20;
				let items_only = ar_result_final.filter(item => item.value !== '__prev__');


				if ((pagData.currentPage)*20 <= items_only.length) {
					has_next_page = true;
				}

				let final_results = items_only.slice(offset, results_per_page + offset);
				
				const safe_value_final= safe_value.replace(/%/g, '')
				if(safe_value_final != ''){
					final_results = items_only.filter(item => normalize(item.label).includes(safe_value_final.trim()));
				}

				//console.log("final_results ",final_results)

				// 4. Reinsertar los botones de navegación
				if (pagData.currentPage > 1) {
					// Reinsertar el botón "Anterior" si corresponde
					final_results.unshift({
						label: "<div class='ac-nav-btn'>&laquo; Página anterior</div>",
						value: "__prev__"
					});
				}

				if (has_next_page) {
					// Añadir el botón "Siguiente"
					final_results.push({
						label: "<div class='ac-nav-btn'>Página siguiente &raquo;</div>",
						value: "__next__"
					});
				}

				// 5. Lógica de Caché (CORREGIDA para incluir botones)
				if (filterObj[op].length === 1 && typeof table !== "function" && pagData.currentPage === 1) {
					// Cacheamos el resultado final CON botones para la página 1
					cache[term] = final_results; 
				}

				// 6. Responder
				response(final_results);
			});
		},
		select: function(event, ui) {
			event.preventDefault();
			const pagData = form_item.pagination;

			if (ui.item.value === "__next__") {
				pagData.currentPage++;
				setTimeout(() => $(form_item.node_input).focus().autocomplete('search', pagData.lastTerm), 0);
				return false;
			}
			if (ui.item.value === "__prev__") {
				pagData.currentPage = Math.max(1, pagData.currentPage - 1);
				setTimeout(() => $(form_item.node_input).focus().autocomplete('search', pagData.lastTerm), 0);
				return false;
			}

			self.add_selected_value(form_item, ui.item.label, ui.item.value);
			this.value = '';
			return false;
		},
		focus: function() { return false; }
	})
	.on("keydown", function(event) {
		if (event.keyCode === $.ui.keyCode.ENTER) $(this).autocomplete('close');
	})
	.focus(function() {
		$(this).autocomplete('search', null);
	});

	$(form_item.node_input).on("mousedown", ".ac-nav-btn", function(e){ e.preventDefault(); });

	return true;
}

	//end activate_autocomplete

function normalize(str) {
  return str
    .normalize('NFD')                // separa letras y acentos
    .replace(/[\u0300-\u036f]/g, '') // elimina los acentos
    .toLowerCase();                  // pasa a minúsculas
}

		/**
		* FORM_TO_SQL_FILTER (DEPRECATED!)
		* Builds a plain sql filter from the form nodes values
		*/
		this.form_to_sql_filter = function(options) {
			console.error("WARNING! form_to_sql_filter is DEPRECATED! Use build_filter instead!");

			const self = this

			// options
				const form_node = options.form_node

			// short vars
				const form_items = self.form_items


			const ar_query_elements = []
			for (let [id, form_item] of Object.entries(form_items)) {

				const current_group = []

				const group_op = "AND"
				const group = {}
					group[group_op] = []

				// q value
					if (form_item.q.length!==0) {

						const c_group_op = 'AND'
						const c_group = {}
							c_group[c_group_op] = []

						const safe_value = form_item.q.replace(/(')/g, "''")

						const value_parsed = (form_item.eq_in) + safe_value + (form_item.eq_out)

						// q element
							const element = {
								field	: form_item.q_column,
								value	: value_parsed, // `'${form_item.q}'`,
								op		: form_item.eq // default is 'LIKE'
							}

							c_group[c_group_op].push(element)

						// add basic group
							group[group_op].push(c_group)
					}

				// q_selected values
					if (form_item.q_selected.length!==0) {

						for (let j = 0; j < form_item.q_selected.length; j++) {

							// value
								const value = form_item.q_selected[j]

								// escape html strings containing single quotes inside.
								// Like 'leyend <img data="{'lat':'452.6'}">' to 'leyend <img data="{''lat'':''452.6''}">'
								const safe_value = value.replace(/(')/g, "''")

							const c_group_op = "AND"
							const c_group = {}
								c_group[c_group_op] = []

							// elemet
							const element = {
								field	: form_item.q_column,
								value	: (form_item.is_term===true) ? `'%"${safe_value}"%'` : `'${safe_value}'`,
								op		: (form_item.is_term===true) ? "LIKE" : "="
							}
							c_group[c_group_op].push(element)

							group[group_op].push(c_group)
						}
					}

				if (group[group_op].length>0) {
					ar_query_elements.push(group)
				}
			}

			// debug
				if(SHOW_DEBUG===true) {
					// console.log("self.form_items:",self.form_items);
					// console.log("ar_query_elements:",ar_query_elements);
				}

			// empty form case
				if (ar_query_elements.length<1) {
					console.warn("-> form_to_sql_filter empty elements selected:", ar_query_elements)
					return null
				}

			// operators value
				const input_operators = form_node.querySelector('input[name="operators"]')
				const operators_value = input_operators
					? form_node.querySelector('input[name="operators"]:checked').value
					: "AND";

				const filter = {}
					filter[operators_value] = ar_query_elements

			// debug
				if(SHOW_DEBUG===true) {
					// console.log("-> form_to_sql_filter filter:",filter)
				}

			// sql_filter
				const sql_filter = self.parse_sql_filter(filter,undefined,true)


			return sql_filter
		}//end form_to_sql_filter



}//end form_factory



var psqo_factory = {



	/**
	* BUILD_SAFE_PSQO
	* Check and validate psqo element
	*/
	build_safe_psqo : function(psqo){

		const self = this

		const global_key = Object.keys(psqo)[0]
		if(global_key==='$and' || global_key==='$or'){
			// recursion values
			for (let i = 0; i < psqo[global_key].length; i++) {
				psqo[global_key][i] = self.build_safe_psqo(psqo[global_key][i])
			}
		}else{
			return clean_psqo_item(psqo)
		}

		function clean_psqo_item(psqo_item){

			// des
				// const eq_in			= (psqo_item.eq_in && psqo_item.eq_in === '%') ? '%' : ''
				// const eq_out		= (psqo_item.eq_out && psqo_item.eq_out === '%') ? '%' : ''
				// const value			= psqo_item.value
				// const safe_value	= (typeof value==='string' || value instanceof String)
				// 	? value.replace(/(')/g, "''")
				// 	: value

			// mandatory properties
				const id		= psqo_item.id
				const field		= psqo_item.field // db column name like 'p_culture'
				const q			= psqo_item.q // search value original like 'arse'
				const q_type	= typeof psqo_item.q_type!=="undefined" // type of form value: q | q_selected
					? psqo_item.q_type
					: 'q'

			// const safe_q	= (typeof q==='string' || q instanceof String)
			// 	? encodeURIComponent(q)
			// 	: q

			const new_psqo_item = {
				id		: id,
				field	: field,
				q		: q,
				q_type	: q_type
			}

			// optionals
				if (psqo_item.op) {
					new_psqo_item.op = psqo_item.op
				}
				if (psqo_item.eq_in) {
					new_psqo_item.eq_in = psqo_item.eq_in
				}
				if (psqo_item.eq_out) {
					new_psqo_item.eq_out = psqo_item.eq_out
				}

			return new_psqo_item
		}

		return psqo
	},// build_safe_psqo



	/**
	* ENCODE_PSQO
	* @see https://pieroxy.net/blog/pages/lz-string/guide.html#inline_menu_3
	* Encode psqo object using base64 to allow use it in url context
	*/
	encode_psqo : function(psqo){

		// const encoded_psqo = window.btoa(JSON.stringify(psqo));
		const base = JSON.stringify(psqo);
		return LZString.compressToEncodedURIComponent(base);

		// return encoded_psqo
	},//end encode_psqo



	/**
	* DECODE_PSQO
	* Decode previously stringified and base64 encoded psqo object
	* @see https://pieroxy.net/blog/pages/lz-string/guide.html#inline_menu_3
	* @return object | null
	*/
	decode_psqo : function(psqo){

		const parsed_psqo = (()=>{
			try {
				// return JSON.parse(window.atob(psqo))

				const base = LZString.decompressFromEncodedURIComponent(psqo);
				return JSON.parse(base)

			}catch(error) {
				console.log("psqo:",psqo);
				console.warn("invalid psqo: ", error);
			}
			return null
		})()


		return parsed_psqo
	}//end decode_psqo



}//end psqo_factory
