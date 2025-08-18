/*global tstring, hoards_row_fields, SHOW_DEBUG, common, page, event_manager, data_manager, list_factory, form_factory */
/*eslint no-undef: "error"*/

"use strict";



var hoards =  {



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
		table			: null,



	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {

		const self = this

		// options
			self.form_container	= options.form_container
			self.rows_container	= options.rows_container
			self.table			= options.table // hoards | findspots

		// form
			self.form		= new form_factory() // obtener operaciones para crear formulario
			const form_node	= self.render_form() // creacion del formulario para pasarlo a js
			self.form_container.appendChild(form_node)

		// pagination
			self.pagination = {
				total	: null,
				limit	: 15,
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

		// first list
			self.form_submit()

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

		/* // section_id
			self.form.item_factory({
				id			: "section_id",
				name		: "section_id",
				label		: tstring.id || "ID",
				q_column	: "section_id",
				eq			: "=",
				eq_in		: "",
				eq_out		: "",
				parent		: form_row
			})
 */


		 // global_search
			self.form.item_factory({
				id 			: "global_search",
				name 		: "global_search",
				label		: tstring.global_search || "global_search",
				q_column 	: "name",
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

		// name
			self.form.item_factory({
				id			: "name",
				name		: "name",
				label		: tstring.name || "Name",
				q_column	: "name",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='findspots' // hoards | findspots
						? 'findspots'
						: 'hoards'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
					})
				}
			})

		// place
			self.form.item_factory({
				id			: "place",
				name		: "place",
				label		: tstring.place || "Place",
				q_column	: "place",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='findspots' // hoards | findspots
						? 'findspots'
						: 'hoards'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
					})
				}
			})
		// typology
			self.form.item_factory({
				id			: "typology",
				name		: "typology",
				label		: tstring.typology || "Typology",
				q_column	: "typology",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='publications' // hoards | findspots
						? 'publications'
						: 'publications'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
					})
				}
			})
		// indexation
			self.form.item_factory({
				id			: "indexation",
				name		: "indexation",
				label		: tstring.indexation || "Indexation",
				q_column	: "indexation",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					const table = self.table==='findspots' // hoards | findspots
						? 'findspots'
						: 'hoards'
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: table
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
					total	: null,
					limit	: 15,
					offset	: 0,
					n_nodes	: 8
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

			const table = self.table==='findspots' // hoards | findspots
				? 'findspots'
				: 'hoards'
			const ar_fields	= ['*']
			const count		= true
			const order		= "name"
			const resolve_portals_custom = {
				"bibliography_data" : "bibliographic_references"
			}

			//sql_filter
			const filter = self.form.build_filter()
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group)
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
			
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }
		
			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: table,
					ar_fields		: ar_fields,
					sql_filter		: final_filter ,
					limit			: 0,
					count			: count,
					offset			: 0,
					order			: order,
					process_result	: null,
					resolve_portals_custom : resolve_portals_custom,
				}
			})
			.then( async function(api_response){
				console.log("--------------- api_response:",api_response);
	

				// parse data
					const data	= page.parse_hoard_data(api_response.result)
					const total	= api_response.total
					const hallazgo_resultado = final_filter == base_filter ? Math.floor(Math.random() * (total)) : 0;

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
					if(window.innerWidth > 768){
								const estructura = common.create_dom_element({
						element_type	: "div",
						class_name		: "grid-stack",
						parent			: rows_container
					})

					const grid = GridStack.init(estructura);
					const titulo = grid.addWidget({w:4,h:2,content: `${api_response.result[hallazgo_resultado].name}`})
					const contentDiv = titulo.querySelector('.grid-stack-item-content');
					contentDiv.id = "titulo-ficha";

					const imagen_ident = grid.addWidget({w:4,h:2,content: `<img src="https://wondercoins.uca.es${api_response.result[hallazgo_resultado].identify_image}" alt="Imagen dinámica" style="width:100%; height:100%; object-fit:cover; overflow: hidden;"`})
					const img_ident = imagen_ident.querySelector('.grid-stack-item-content');
					img_ident.id = "img_ident"


								const map_fact = new map_factory() // creates / get existing instance of map
								

					grid.addWidget({w:4,h:12,content: ""})
					grid.addWidget({w:4,h:4,content: `${api_response.result[hallazgo_resultado].public_info}`})
					const ubicacion = grid.addWidget({w:4,h:4,content: ``}) //ubicacion

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
				
						resultado.hallazgos.datos.push(api_response.result[hallazgo_resultado])


					map_fact.init({
									map_container		: ubicacion,
									map_position		: api_response.result[hallazgo_resultado].map,
									source_maps			: page.maps_config.source_maps,
									result				: resultado,
									findspot			: true
								})
	
					grid.addWidget({w:2,h:1,content: `${api_response.result[hallazgo_resultado].typology}`})
					grid.addWidget({w:2,h:1,content: `${api_response.result[hallazgo_resultado].date_in} / ${api_response.result[hallazgo_resultado].date_out}`})
					grid.addWidget({w:2,h:1,content: ``})
					grid.addWidget({w:2,h:1,content: ``})
					grid.addWidget({w:8,h:1,content: ``})
					grid.addWidget({w:8,h:4,content: `${api_response.result[hallazgo_resultado].public_info}`})

					let bibliografia_array = []

					for (let index = 0; index < api_response.result[hallazgo_resultado].bibliography_data.length; index++) {
						
						bibliografia_array.push(api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_title +" / "+api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_authors + " / (" + api_response.result[hallazgo_resultado].bibliography_data[index].ref_publications_date + ")")
					}

					let bibliografia = ""
					bibliografia = bibliografia_array.join("\n")

					grid.addWidget({
						w: 8, h: 4, content: `<div style="white-space: pre-line; font-size: 1.5rem;">${bibliografia}</div>`
					});

					let nombres_array = []
					let total_autores = api_response.result[hallazgo_resultado].authorship_names.split("|").length

					for (let index = 0; index < total_autores; index++) {

						nombres_array.push(api_response.result[hallazgo_resultado].authorship_names.split("|")[index] + " " + api_response.result[hallazgo_resultado].authorship_surnames.split("|")[index] + "/" + api_response.result[hallazgo_resultado].authorship_roles.split("|")[index])
				
					}

					let nombres_autores = ""

					nombres_autores = nombres_array.join("\n");


					grid.addWidget({w:4,h:4,content: `<div style="white-space: pre-line; font-size: 1.5rem;">${nombres_autores}</div>`})
					}
			

					const titulo_arbol = common.create_dom_element({
						element_type	: "h1",
						class_name 		: "title",
						text_content	: "Hallazgo Jerarquizado",
						parent 			: rows_container
					})
					
					common.create_dom_element({
						element_type	: "div",
						class_name 		: "golden-separator",
						parent 			: titulo_arbol
					})

					const arbol_completo = common.create_dom_element({
						element_type : "div",
						class_name	 : "arbol_moneda",
						parent		 : rows_container
					})
					

					arbol_completo.appendChild(await self.render_rows_hallazgo_completo(api_response.result[hallazgo_resultado]))




			})

			// scrool to head result
			const div_result = document.querySelector(".rows_container")
			if (div_result) {
				div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			}
		})
	},//end form_submit



	render_rows_hallazgo : async function(row) {
		const fragment = new DocumentFragment()
		var findspot_tree = await this.createfindspot_Tree(row)
		this.generate_Tree(findspot_tree,findspot_tree[0],fragment,0)

		return fragment
	},

	render_rows_hallazgo_completo : async function(row){

		const fragment = new DocumentFragment()
		var findspot_tree = await this.createfindspot_Tree(row)
		this.generate_Tree_completo(findspot_tree,findspot_tree[0],fragment,0,0,2)

		return fragment

	},


	createfindspot_Tree : async function (findspot){

		const findspots_tree = []
		const findspot_sons = await this.cargarHijosHallazgos(findspot.section_id)
		findspots_tree.push({info_nodo: findspot, padre : null})

		for (let index = 0; index < findspot_sons.result.length; index++) {

			const parent_node = JSON.parse(findspot_sons.result[index].parents)
			findspots_tree.push({ info_nodo: findspot_sons.result[index], padre: parent_node[0]});
						
		}

		return findspots_tree

	},

	cargarHijosHallazgos : async function(hallazgo) {
		try {
			const hijos = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'findspots',
					ar_fields: ["*"],
					sql_filter: `parents LIKE '%"${hallazgo}"%'`,
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
	},

	generate_Tree : function(tree,node,node_parent,padding){

	
		const info_node = common.create_dom_element({
					element_type	: "div",
					class_name		: "container_prueba",
					text_content	: node.info_nodo.name,
					parent			: node_parent
		})
		
		info_node.style.paddingLeft = `${padding}em`
		

		if(node.info_nodo.children != null){

				for (let index = 0; index < tree.length; index++) {
				if (tree[index].info_nodo.parent == '["'+node.info_nodo.section_id+'"]') {
					
					tree[index].padre = "'"+node.info_nodo.section_id+"'"
					this.generate_Tree(tree,tree[index],info_node,1.5)
				}
				
			}
		}

	},

	cargarMonedasHallazgos : async function(ceca) {
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
	},

	generate_Tree_completo : async function(tree,node,node_parent,padding,level,font_size){
			const Shades = [
			"#453000ff", // un poco más oscuro que antes para contraste
			"#5a3f00ff",
			"#6d4d00ff",
			"#7f5b00ff",
			"#916900ff",
			"#a37800ff",
			"#b48600ff",
			"#c49400ff",
			"#d5a200ff",
			"#e6b000ff",
			"#f7be00ff",
			"#f9cb15ff",
			"#f9d733ff",
			"#f9e152ff",
			"#f9eb70ff",
			"#faf58eff",
			"#fafaabff",
			"#fcfdc8ff",
			"#feffe5ff",
			"#ffffffcc"
			];

		const info_node = common.create_dom_element({
					element_type	: "div",
					class_name		: "container_prueba",
					text_content	: node.info_nodo.name,
					parent			: node_parent
		})
	
		info_node.style.paddingLeft = `${padding}em`
		info_node.style.fontSize = `${font_size}rem`
		info_node.style.textTransform = "uppercase"
		info_node.style.fontWeight = "bold"
		info_node.style.color = `${Shades[level]}`


		if(node.info_nodo.coins != null){
						const coins = await this.cargarMonedasHallazgos(node.info_nodo.name)

						const button_display = common.create_dom_element({
							element_type	: "img",
							class_name		: "button_display",
							src				: "tpl/assets/images/arrow-right.svg",
							parent			: info_node
						})


						button_display.classList.add(`button_display_${node.info_nodo.section_id}`)
						button_display.style.transform = ` translateX(30%) translateY(18%)`
						const container_swiper = common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper swiper_${node.info_nodo.section_id}`,
							parent			: info_node
						})
						container_swiper.style.display = "none"
						const swiper = common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-wrapper`,
							parent			: container_swiper
						})

						for (let index = 0; index < coins.result.length; index++) {
							console.log(coins.result[index])
							const slide1 = common.create_dom_element({
								element_type: "div",
								class_name: "swiper-slide",
								parent: swiper
							});

							// Flip card container
							const flipCard1 = common.create_dom_element({
								element_type: "div",
								class_name: `flip-card`,
								parent: slide1
							});

							flipCard1.classList.add(`flip-card_${coins.result[index].section_id}`)
							flipCard1.style.fontWeight = "normal"
							
							// Flip inner
							const flipInner1 = common.create_dom_element({
								element_type: "div",
								class_name: "flip-card-inner",
								parent: flipCard1
							});

							// Front
							const flipFront1 = common.create_dom_element({
								element_type: "div",
								class_name: "flip-card-front",
								parent: flipInner1
							});

							//imágenes del anverso y reverso de la moneda
							const image_obverse = "https://wondercoins.uca.es" + coins.result[index].image_obverse;
							const image_reverse = "https://wondercoins.uca.es" + coins.result[index].image_reverse;

							common.create_dom_element({
								element_type: "img",
								class_name: "img_obverse",
								parent: flipFront1,
								src: image_obverse
							});

							common.create_dom_element({
								element_type: "img",
								parent: flipFront1,
								src: image_reverse
							});

							// Back
							const flipBack1 = common.create_dom_element({
								element_type: "div",
								class_name: "flip-card-back",
								parent: flipInner1
							});

							// Información de la moneda
							let value = coins.result[index].type_data ? coins.result[index].type_data.replace('"',"").replace("[","").replace("]","").replace('"','') : 0;
							let coin_type = value

							// Coin Type
							const type_container = common.create_dom_element({
								element_type: "div",
								class_name: "type_container",
								parent: flipBack1
							});
							const type_full_val = coins.result[index].denomination ? coins.result[index].denomination + coins.result[index].type_full_value.split(`${coins.result[index].denomination}`)[1] : coins.result[index].type_full_value;
							const type_none = type_full_val ? type_full_val : "Tipo";
							common.create_dom_element({
								element_type: "a",
								class_name: "type_link",
								href: `/web_numisdata/type/${coin_type}`,
								text_content: type_none, 
								parent: type_container
							});

							// Findspot
							const findspot_container = common.create_dom_element({
								element_type: "div",
								class_name: "findspot_container",
								parent: flipBack1
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Excavación:",
								parent: findspot_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "findspot_text",
								text_content: coins.result[index].findspot.split(" | ")[0],
								parent: findspot_container
							});

							//Date
							const date_container = common.create_dom_element({
								element_type: "div",
								class_name: "date_container",
								parent: flipBack1
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Datación: ",
								parent: date_container
							});

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
								parent: date_container
							});

							// Weight + Diameter

							const weidia_container = common.create_dom_element({
								element_type: "div",
								class_name: "weigdia_container",
								parent: flipBack1
							});

							// Weight

							const weight_container = common.create_dom_element({
								element_type: "div",
								class_name: "weight_container",
								parent: weidia_container
							});
							
							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Peso: ",
								parent: weight_container
							});

							const weightText = coins.result[index].weight ? coins.result[index].weight + " gramos" : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "weight_text",
								text_content: weightText,
								parent: weight_container
							});

							// Diameter
							const diameter_container = common.create_dom_element({
								element_type: "div",
								class_name: "diameter_container",
								parent: weidia_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Diametro: ",
								parent: diameter_container
							});

							const diameterText = coins.result[index].diameter ? coins.result[index].diameter + " mm" : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "diameter_text",
								text_content: diameterText,
								parent: diameter_container
							});

							//Dies + Collection

							const dico_container = common.create_dom_element({
								element_type: "div",
								class_name: "dico_container",
								parent: flipBack1
							});

							// Dies
							const dies_container = common.create_dom_element({
								element_type: "div",
								class_name: "dies_container",
								parent: dico_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Posición de cuños: ",
								parent: dies_container
							});

							const diesText = coins.result[index].dies ? coins.result[index].dies : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "dies_text",
								text_content: diesText,
								parent: dies_container
							});

							// Collection
							const collection_container = common.create_dom_element({
								element_type: "div",
								class_name: "collection_container",
								parent: dico_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Colección: ",
								parent: collection_container
							});

							const collectionText = coins.result[index].collection ? coins.result[index].collection : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "collection_text",
								text_content: collectionText,
								parent: collection_container
							});

							// Findspot type + section_id
							const finsec_container = common.create_dom_element({
								element_type: "div",
								class_name: "finsec_container",
								parent: flipBack1
							});

							// Findspot type
							const find_type_container = common.create_dom_element({
								element_type: "div",
								class_name: "fin_type_container",
								parent: finsec_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Tipo de deposito: ",
								parent: find_type_container
							});

							const findspotTypeText = coins.result[index].find_type ? coins.result[index].find_type : "N/A";
							common.create_dom_element({
								element_type: "p",
								class_name: "fin_type_text",
								text_content: findspotTypeText,
								parent: find_type_container
							});

							// Section ID
							const section_id_container = common.create_dom_element({
								element_type: "div",
								class_name: "section_id_container",
								parent: finsec_container
							});

							common.create_dom_element({
								element_type: "p",
								class_name: "descriptive_title",
								text_content: "Nº de inventario: ",
								parent: section_id_container
							});

							const sectionIdText = coins.result[index].section_id ? coins.result[index].section_id : "N/A";

							common.create_dom_element({
								element_type: "p",
								class_name: "section_id_text",
								text_content: sectionIdText,
								parent: section_id_container
							});

							

							document.addEventListener("click", (e) => {

								const card = e.target.closest(`.flip-card_${coins.result[index].section_id}`);
								if (card) {
									card.classList.toggle("flipped");
								}

							});

						}

	

						common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-button-prev swiper-prev-${node.info_nodo.section_id}`,
							parent			: container_swiper
						})

						common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-button-next swiper-next-${node.info_nodo.section_id}`,
							parent			: container_swiper
						})

						common.create_dom_element({
							element_type	: "div",
							class_name		: `swiper-pagination swiper-pagination-${node.info_nodo.section_id}`,
							parent			: container_swiper
						})



						container_swiper.style.paddingLeft = `${1}em`

						new Swiper(`.swiper_${node.info_nodo.section_id}`, {
										pagination: {
											el: `.swiper-pagination-${node.info_nodo.section_id}`,
											clickable: true,
										},
										navigation: {
											nextEl: `.swiper-next-${node.info_nodo.section_id}`,
											prevEl: `.swiper-prev-${node.info_nodo.section_id}`,
										}
										});



						let estado_mostrar_monedas = false

						document.addEventListener("mousedown", (e) => {
							const button = e.target.closest(`.button_display_${node.info_nodo.section_id}`);

							if (!button || !container_swiper) return;

							if (estado_mostrar_monedas) {
								button.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
								container_swiper.style.display = "none";
							} else {
								button.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
								container_swiper.style.display = "block";
							}

							estado_mostrar_monedas = !estado_mostrar_monedas;
						});

						
		}


		if(node.info_nodo.children != null){

				for (let index = 0; index < tree.length; index++) {
				if (tree[index].info_nodo.parent == '["'+node.info_nodo.section_id+'"]') {
					
					tree[index].padre = "'"+node.info_nodo.section_id+"'"
					if(window.innerWidth > 768){
						this.generate_Tree_completo(tree,tree[index],info_node,2,level+1,font_size-0.1)
					}else{
						this.generate_Tree_completo(tree,tree[index],info_node,0.4,level+1,font_size-0.2)
					}
					
				}
				
			}
		}

	},

	





}//end hoards
