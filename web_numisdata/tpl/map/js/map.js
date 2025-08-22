/*global tstring, page_globals, SHOW_DEBUG, common, page, $, type_row_fields_min, map_factory, Promise, data_manager, event_manager, form_factory, catalog_row_fields */
/*eslint no-undef: "error"*/

"use strict";



var map = {



	/**
	* VARS
	*/
		// DOM items ready from page html
		form_container			: null,
		rows_container			: null,
		map_container			: null,
		map_container_numismatic_group : null,
		export_data_container	: null,

		map_factory_instance : null,
		map_factory_instance_numismatic_group : null,

		// master_map_global_data. All records from table 'map_global'
		master_map_global_data : null,

		// current_map_global_data. Current filtered records from table 'map_global'
		current_map_global_data : null,

		// global_data (direct rows from ddbb)
		global_data : null,

		// map_global_data (ready for map parsed data)
		map_global_data : null,

		// form instance on form_factory
		form : null,

		forn_node : null,

		map_config : null,

		button_state : false,

	/**
	* SET_UP
	* When the HTML page is loaded
	* @param object options
	*/
	set_up : function(options) {
		if(SHOW_DEBUG===true) {
			// console.log("--> map set_up options:",options);
		}

		const self = this

		// options
			self.form_container			= options.form_container
			self.map_container			= options.map_container
			self.rows_container			= options.rows_container
			self.export_data_container	= options.export_data_container
			self.map_container_numismatic_group	= options.map_container_numismatic_group

		// export_data_buttons added once
			const export_data_buttons = page.render_export_data_buttons()
			self.export_data_container.appendChild(export_data_buttons)
			self.export_data_container.classList.add('hide')


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



		this.cargarTodoYCrearMapa(resultado);


		// form
			self.form		= new form_factory()
			const form_node	= self.render_form()
			self.form_container.appendChild(form_node)

		// set config (from local storage)
			self.set_config()

		// show search button
			const show_search_button = document.getElementById("search_icon")
			show_search_button.addEventListener("mousedown", function(){

				let new_showing_search
				if (self.map_config.showing_search===true) {
					form_node.classList.add("hide")
					new_showing_search = false
				}else{
					form_node.classList.remove("hide")
					new_showing_search = true
				}
				self.set_config({
					showing_search : new_showing_search
				})
			})
			if (self.map_config.showing_search===true) {
				form_node.classList.remove("hide")
			}else{
				form_node.classList.add("hide")
			}

		// events
		


		return true
	},//end set_up


cargarTodoYCrearMapa : async function(resultado) {
	const self = this
	try {
		const hallazgos = await data_manager.request({
			body: {
				dedalo_get: 'records',
				table: 'findspots',
				ar_fields: ["*"],
				sql_filter: "",
				limit: 0,
				count: true,
				offset: 0,
				order: 'section_id ASC',
				process_result: null
			}
		});
		resultado.hallazgos.datos = hallazgos.result;

		const cecas = await data_manager.request({
			body: {
				dedalo_get: 'records',
				table: 'mints',
				ar_fields: ["*"],
				sql_filter: "",
				limit: 0,
				count: true,
				offset: 0,
				order: 'name',
				process_result: null
			}
		});
		resultado.cecas.datos = cecas.result;


		const complejos = await data_manager.request({
			body: {
				dedalo_get: 'records',
				table: 'hoards',
				ar_fields: ["*"],
				sql_filter: "",
				limit: 0,
				count: true,
				offset: 0,
				order: 'name',
				process_result: null
			}
		});
		resultado.complejos.datos = complejos.result;


		self.map_factory_instance = new map_factory();
		self.map_factory_instance.init({
			map_container: self.map_container,
			map_position: [36.5297, -6.2924],
			source_maps: page.maps_config.source_maps,
			result: resultado,
			map_node : this
		});
	} catch (error) {
		console.error("Error cargando datos:", error);
	}
},



	/**
	* SET_CONFIG
	* @param options object (optional)
	* @return
	*/
	set_config : function(options) {

		const self = this

		// cookie
		const map_config = localStorage.getItem('map_config');
		if (map_config) {
			// use existing one
			self.map_config = JSON.parse(map_config)
			// console.log("--> self.map_config 1 (already exists):", self.map_config);
		}else{
			// create a new one
			const map_config = {
				showing_search	: false
			}
			localStorage.setItem('map_config', JSON.stringify(map_config));
			self.map_config = map_config
			// console.log("--> self.map_config 2 (create new one):",self.map_config);
		}

		if (options) {
			for(const key in options) {
				self.map_config[key] = options[key]
			}
			localStorage.setItem('map_config', JSON.stringify(self.map_config));
		}
		// console.log("--> self.map_config [final]:", self.map_config);

		return self.map_config
	},//end set_config



	/**
	* RENDER_FORM
	*/
	render_form : function() {

		const self = this

		const fragment = new DocumentFragment()

		const form_row = common.create_dom_element({
			element_type	: "div",
			class_name		: "form-row fields",
			parent			: fragment
		})

		common.create_dom_element({
			element_type	: "div",
			class_name		: "golden-separator",
			parent			: form_row
		})

		// // section_id
		// 	self.form.item_factory({
		// 		id			: "section_id",
		// 		name		: "section_id",
		// 		label		: tstring.is || "ID",
		// 		q_column	: "section_id",
		// 		eq			: "=",
		// 		eq_in		: "",
		// 		eq_out		: "",
		// 		parent		: form_row
		// 	})

		// mint
			self.form.item_factory({
				id				: "mint",
				name			: "mint",
				label			: tstring.mint || "mint",
				q_column		: "name",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				sql_filter		: ` name LIKE '%%' AND name !='' `	, // FILTRO PARA HALLAZGOS ESTA BUGGED NO SE PORQUE?
				is_term			: true,
				q_selected_eq	: "LIKE",
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'mints'
					})
				}
			})

		// collection
		/* 	self.form.item_factory({
				id			: "collection",
				name		: "collection",
				label		: tstring.collection || "collection",
				q_column	: "collection",
				eq			: "LIKE",
				eq_in		: "%",
				eq_out		: "%",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'coins'
					})
				}
			}) */

		// // ref_auction
		// 	self.form.item_factory({
		// 		id			: "ref_auction",
		// 		name		: "ref_auction",
		// 		label		: tstring.auction || "auction",
		// 		q_column	: "ref_auction",
		// 		eq			: "LIKE",
		// 		eq_in		: "%",
		// 		eq_out		: "%",
		// 		parent		: form_row,
		// 		callback	: function(form_item) {
		// 			self.form.activate_autocomplete({
		// 				form_item	: form_item,
		// 				table		: 'coins'
		// 			})
		// 		}
		// 	})



		// findspot
			self.form.item_factory({
				id			: "findspot",
				name		: "findspot",
				label		: tstring.findspot || "findspot",
				q_column	: "name",
				sql_filter	: ` name LIKE '%%' AND name !='' `, // FILTRO PARA CECAS AUNQUE SEA HALLAZGOS ESTA BUGGED NO SE PORQUE?
				q_selected_eq	: "LIKE",
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'findspots'
					})
				}
			})

		// hoard
			self.form.item_factory({
				id				: "hoard",
				name			: "hoard",
				label			: tstring.hoard || "hoard",
				q_column		: "name",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				sql_filter		: ` name LIKE '%%' AND name !='' `	, // FILTRO PARA HALLAZGOS ESTA BUGGED NO SE PORQUE?
				q_selected_eq	: "LIKE",
				parent			: form_row,
				callback		: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'hoards'
					})
				}
			})

		// catalog
			self.form.item_factory({
				id			: "catalog",
				name		: "catalog",
				label		: "Grupo Numismatico",
				q_column		: "term",
				value_wrapper	: ['["','"]'], // to obtain ["value"] in selected value only
				sql_filter		: ` term LIKE '%%' AND term !='' `	, 
				q_selected_eq	: "LIKE",		
				parent		: form_row,
				callback	: function(form_item) {
					self.form.activate_autocomplete({
						form_item	: form_item,
						table		: 'catalog',
						id			: false
					})
				}
			})
			

			this.observeAllContainers(form_row,self,1)



		// submit button
			const submit_group = common.create_dom_element({
				element_type	: "div",
				class_name		: "form-group field button_submit",
				parent			: fragment
			})
			const submit_button = common.create_dom_element({
				element_type	: "input",
				type			: "submit",
				id				: "submit",
				value			: tstring.search || "Search",
				class_name		: "btn btn-light btn-block primary",
				parent			: submit_group
			})
			submit_button.addEventListener("click",function(e){
				e.preventDefault()
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







	// Función que conecta el observer al último container_values
	observeAllContainers: function (form_row, self, id) {
    let observers = [];

    const connectToContainer = (container) => {
        const obs = new MutationObserver(async (mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    if (container.children.length > 0) {
                        const lastValueLabel = container.lastElementChild.querySelector('.value_label').textContent;
						
						await data_manager.request({
							body : {
								dedalo_get	: 'records',
								table		: "catalog",
								ar_fields	: ["*"],
								sql_filter	: `term LIKE "%${lastValueLabel}%"`,
								limit		: 0
							}
							
							}).then((api_response) => { 

								if(api_response.result[0].children != null){

									self.form.item_factory({
										id: "catalog" + id,
										name: "catalog" + id,
										label: lastValueLabel,
										q_column: "term",
										value_wrapper: ['["', '"]'],
										sql_filter: ` term LIKE '%%' AND term !='' `,
										q_selected_eq: "LIKE",
										parent: form_row,
										callback: function(form_item) {
											self.form.activate_autocomplete({
												form_item: form_item,
												table: 'catalog',
												id	: true,
												label : lastValueLabel
											});
										}
									});

								id++;
								}

							})

                    } else {
                        let next = container.parentNode.nextElementSibling;
                        while (next) {
                            let toRemove = next;
                            next = next.nextElementSibling;
                            toRemove.remove();
                            id--;
                        }

                    }
                }
            }
        });

        obs.observe(container, { childList: true });
        observers.push(obs);
    };

    const parentObserver = new MutationObserver(() => {
        const containers = form_row.querySelectorAll('.container_values');
        observers.forEach(o => o.disconnect()); // limpia anteriores
        observers = [];

        containers.forEach(container => {
            if (container.previousElementSibling.id && container.previousElementSibling.id.includes("catalog")) {
                connectToContainer(container);
            }
        });
    });

    parentObserver.observe(form_row, { childList: true });

    form_row.querySelectorAll('.container_values').forEach(container => {
        if (container.previousElementSibling.id && container.previousElementSibling.id.includes("catalog")) {
            connectToContainer(container);
        }
    });
},


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

		// clean container
			while (self.rows_container.hasChildNodes()) {
				self.rows_container.removeChild(self.rows_container.lastChild);
			}

		// loading start
			// if (!self.pagination.total) {
			// 	page.add_spinner(rows_container)
			// }else{
			// 	rows_container.classList.add("loading")
			// }

		return new Promise(function(resolve){

			const ar_fields = ["*"]

			// sql_filter

				const filter = self.form.build_filter()
				//console.log(self.form.form_items) // -----IMPORTANTE-----
				// parse_sql_filter
				const group			= []
				const parsed_filter	= self.form.parse_sql_filter(filter, group,false)
				const sql_filter	= parsed_filter
					? '(' + parsed_filter + ')'
					: null

				if(SHOW_DEBUG===true) {
					// console.log("-> coins form_submit filter:",filter);
					// console.log("-> coins form_submit sql_filter:",sql_filter);
				}
				// if (!sql_filter|| sql_filter.length<3) {
				// 	return new Promise(function(resolve){
				// 		// loading ends
				// 		rows_container.classList.remove("loading")
				// 		console.warn("Ignored submit. Invalid sql_filter.", sql_filter);
				// 		resolve(false)
				// 	})
				// }


				let table = null
				let q = null
				let q_selected = null
				let label = "name"
				let tam_form_items = Object.keys(self.form.form_items)
  						.filter(k => k.startsWith("catalog") && self.form.form_items[k].q_selected.length > 0 || self.form.form_items.mint.q !== "");

			if(self.form.form_items.mint.q !== "" || self.form.form_items.mint.q_selected.length > 0){

				table = "mints"
				q = self.form.form_items.mint.q
				q_selected = self.form.form_items.mint.q_selected

			}else{

				if(self.form.form_items.findspot.q !== "" || self.form.form_items.findspot.q_selected.length > 0){

				table = "findspots"
				q = self.form.form_items.findspot.q
				q_selected = self.form.form_items.findspot.q_selected


				
				}else{

					if(self.form.form_items.hoard.q !== "" || self.form.form_items.hoard.q_selected.length > 0){

						table = "hoards"
						q = self.form.form_items.hoard.q
						q_selected = self.form.form_items.hoard.q_selected

					}else{

						table = "catalog"
						q = tam_form_items.length > 1 ? self.form.form_items[tam_form_items[tam_form_items.length-1]].q :  self.form.form_items[tam_form_items[tam_form_items.length-1]].q
						q_selected = tam_form_items.length > 1 ?  self.form.form_items[tam_form_items[tam_form_items.length-1]].q_selected :  self.form.form_items[tam_form_items[tam_form_items.length-1]].q_selected
						label = "parents_text"
					}

				}

			}

			

			let sql_filter_final = ` ${label} LIKE '%${q !== '' ? q : q_selected}%' AND ${label} !=''`

			

			// HACER LLAMADA A API CON DATA_MANAGER.REQUEST CON EL CAMPO MINT DE LA TABLA COINS -> NOMBRE DE LA CECA PARA RECOGER MONEDA

			if(table){
			data_manager.request({
				body : {
					dedalo_get		: 'records',
					table			: table,
					ar_fields		: ar_fields,
					sql_filter		: table != "catalog" ? sql_filter_final : sql_filter_final + "AND ref_mint_related != '' " ,
					limit			: 0,
					count			: true,
					offset			: 0,
					order			: 'section_id ASC',
					// group		: "type_data",
					process_result	: null
				}
			})
			.then(async function(api_response){

				const location = {
						lon: null,
						lat: null
					};

				if (api_response.result) {

					if(table == "catalog"){
						let filtro = ""
						
						for (let index = 0; index < api_response.total; index++) {

							filtro += index == 0 ? `section_id = ${JSON.parse(api_response.result[index].ref_mint_related_data)[0]}` : ` OR section_id = ${JSON.parse(api_response.result[index].ref_mint_related_data)[0]}`;
						}
						
						let resultado1 = {

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

						

						resultado1.cecas.datos = await self.cargarCecasFiltradas(filtro);

						let data_ceca_lat = 0
						let data_ceca_lon = 0



						for (let index = 0; index < resultado1.cecas.datos.length; index++) {
							
							const data_ceca = JSON.parse(resultado1.cecas.datos[index].map);
							
							data_ceca_lat  += data_ceca.lat;
							data_ceca_lon  += data_ceca.lon;

						}

						data_ceca_lat = data_ceca_lat/resultado1.cecas.datos.length;
						data_ceca_lon = data_ceca_lon/resultado1.cecas.datos.length;
						
						if (document.getElementById("map_container_numismatic_group").hasChildNodes()) {
							document.getElementById("map_container_numismatic_group").innerHTML = "";
						}

						// Destruir instancia previa si existe
						if (self.map_factory_instance_numismatic_group) {
							self.map_factory_instance_numismatic_group.map.remove();
						}

						self.map_factory_instance_numismatic_group = new map_factory();
						self.map_factory_instance_numismatic_group.init({
							map_container: self.map_container_numismatic_group,
							map_position: [data_ceca_lat, data_ceca_lon],
							source_maps: page.maps_config.source_maps,
							result: resultado1,
							map_node : self
						});

						self.map_container_numismatic_group.style.display = "block";
			
						const title_numismatic_group = document.getElementById("title_numismatic_group");

						if(title_numismatic_group.style.display == "none"){

							title_numismatic_group.style.display = "block"
							const separador = common.create_dom_element({
								element_type	: "div",
								class_name		: "golden-separator",
								parent			: title_numismatic_group
							})

							separador.style.marginBottom = "20px"
						}
						
						self.map_container_numismatic_group.classList.remove("loading")

					}else{

						const datos_location = JSON.parse(api_response.result[0].map)
						location.lat = datos_location.lat;
						location.lon = datos_location.lon;
						self.map_factory_instance.move_map_to_point(location)

					}

					self.map_container.classList.remove("loading")
					
				}
				
				resolve(true)
			})}
		})
	},//end form_submit

	cargarMonedasCecas : async function(ceca) {
		try {
			const monedas = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'coins',
					ar_fields: ["*"],
					sql_filter: `mint_name LIKE '%${ceca}%'`,
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

	cargarCecasFiltradas : async function(sql_filter) {
		try {

			const cecas_filtradas = await data_manager.request({
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

			return cecas_filtradas.result;

		} catch (error) {
			console.error("Error cargando datos:", error);
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
	cargarMonedasComplejos : async function(complejo) {
		try {
			const monedas = await data_manager.request({
				body: {
					dedalo_get: 'records',
					table: 'coins',
					ar_fields: ["*"],
					sql_filter: `hoard LIKE '%${complejo}%'`,
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
	generate_Tree : async function(tree,node,node_parent,padding,font_Size){
		
	
		const info_node = common.create_dom_element({
					element_type	: "div",
					class_name		: "container_prueba",
					parent			: node_parent
		})

		const link_node = common.create_dom_element({
					element_type: "a",
					class_name: "info_link",
					text_content: node.info_nodo.name,
					href: `/web_numisdata/findspot/${node.info_nodo.section_id}`,
					parent: info_node
		});

		const font_size = 1.5;   // Tamaño en rem

		info_node.style.paddingLeft = `${padding}em`;
		link_node.style.fontSize = `${font_size}rem`;
		link_node.style.textTransform = "uppercase";
		link_node.style.fontWeight = "bold";

		if(node.info_nodo.coins != null){
						const coins = await this.cargarMonedasHallazgos(node.info_nodo.name)
						const container_rows = common.create_dom_element({
							element_type	: "div",
							class_name		: "container_rows",
							parent			: info_node
						})
						container_rows.style.paddingLeft = `${1}em`
						this.generate_rows_findspot(container_rows,coins.result)
		}


		if(node.info_nodo.children != null){

				for (let index = 0; index < tree.length; index++) {
				if (tree[index].info_nodo.parent == '["'+node.info_nodo.section_id+'"]') {
					
					tree[index].padre = "'"+node.info_nodo.section_id+"'"
					await this.generate_Tree(tree,tree[index],info_node,1.5,1.3)
				}
				
			}
		}

	},


/*  */

	generate_rows_findspot : function(parent,coins){
			for (let index = 0; index < coins.length; index++) {
			
			const info_coin = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_coin",
				parent			: parent
			})

			const container_images = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_images",
				parent			: info_coin
			})
			const parsedCoinData = coins[index];
			const image_obverse = "https://wondercoins.uca.es" + (parsedCoinData.image_obverse != null ? parsedCoinData.image_obverse : "/dedalo/media/image/1.5MB/20000/rsc29_rsc170_20917.jpg")
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_observe",
				src				: image_obverse,
				parent			: container_images
			})
			const image_reverse = "https://wondercoins.uca.es" + (parsedCoinData.image_obverse != null ? parsedCoinData.image_obverse : "/dedalo/media/image/1.5MB/20000/rsc29_rsc170_20917.jpg")
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_reserve",
				src				: image_reverse,
				parent			: container_images
			})
			const container_data = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_data",
				parent			: info_coin
			})
			
			let weight_text = null
			if(coins[index].weight != null){
				weight_text = "Peso: " + coins[index].weight +"g"
			}else{
				weight_text= "Peso: N/A"
			}

			const weight = common.create_dom_element({
				element_type	: "span",
				class_name		: "weight",
				text_content	: weight_text,
				parent			: container_data
			})
			const diameter = common.create_dom_element({
				element_type	: "span",
				class_name		: "diameter",
				text_content	: "Módulo: "+ coins[index].diameter +"mm" ,
				parent			: container_data
			})

			const catalogue_type = common.create_dom_element({
				element_type	: "span",
				class_name		: "catalogue_type",
				text_content	: "Colección: "+ coins[index].collection ,
				parent			: container_data
			})

			let findspot_text = coins[index].findspot.split(" | ")[0]
			const findspot = common.create_dom_element({
				element_type	: "span",
				class_name		: "findspot",
				text_content	:  "Hallazgo: "+ findspot_text,
				parent			: info_coin
			})

			const tipo = common.create_dom_element({
				element_type	: "span",
				class_name		: "type",
				text_content	:  "Tipo: "+ coins[index].type_full_value,
				parent			: info_coin
			})

			const container_links = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_links",
				parent			: info_coin
			})

			const type_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "type_link",
				href			: "/web_numisdata/type/"+ coins[index].type,
				text_content	: "TIPO",
				parent			: container_links
			})
			
		}


	},

	render_rows : async function(row,coins){

		if(row.table === "mints"){

			await this.render_rows_cecas(row,coins)

		}else{
			if(row.table === "findspots"){

				await this.render_rows_hallazgo(row,coins)

			}else{

				await this.render_rows_complejos(row,coins)

			}
		}



	},

	render_rows_hallazgo : async function(row) {

		const self = this
		const fragment = new DocumentFragment()
		let text_content = null
		let separador = null

		text_content = "Hallazgo : " + row.name
		separador = "-"
		

		const container_titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_title",
			parent			: fragment
		})

		const titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle green-color",
			text_content	: text_content,
			parent			: container_titulo
		})

		const imagen = common.create_dom_element({
			element_type	: "img",
			class_name		: "imagen",
			src				: "tpl/assets/images/arrow-right.svg",
			parent			: container_titulo
		})

		const separator = common.create_dom_element({
			element_type	: "div",
			class_name		: "golden-separator",
			parent			: fragment
		})
		
		let text_road = ""
		if(row.parents_text){

			for (let index = 0; index < JSON.parse(row.parents_text).length-1; index++) {

				if(index < JSON.parse(row.parents_text).length-2){
					text_road += JSON.parse(row.parents_text)[index]+","
				}else{
					text_road += JSON.parse(row.parents_text)[index]
				}
			
			}

		}


		const road = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle mid",
			text_content	: text_road != "" ? text_road.replace(/,/g, " - ") : row.name,
			parent			: fragment

		})

	


		const findspot_tree = await this.createfindspot_Tree(row)
		await this.generate_Tree(findspot_tree,findspot_tree[0],fragment,0)

		road.style.display = "none"

		imagen.addEventListener("mousedown", function(){

			if(self.button_state){
				imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
				road.style.display = "none"
				
			}else{
				imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
				road.style.display = "block"
			}
			self.button_state = !self.button_state
		})

		self.rows_container.appendChild(fragment)

	},

	

	render_rows_cecas : async function(row,coins) {

		const self = this
		const fragment = new DocumentFragment()
		let text_content = null
		let separador = null

		text_content = "Ceca : " + row.name
		separador = ","


		const container_titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_title",
			parent			: fragment
		})

		const titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle green-color",
			text_content	: text_content,
			parent			: container_titulo
		})

		const imagen = common.create_dom_element({
			element_type	: "img",
			class_name		: "imagen",
			src				: "tpl/assets/images/arrow-right.svg",
			parent			: container_titulo
		})

		const separator = common.create_dom_element({
			element_type	: "div",
			class_name		: "golden-separator",
			parent			: fragment
		})
		
		const road = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle mid",
			text_content	: row.place.split(separador)[0],
			parent			: fragment
		})

		const container_text_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_text_rows",
			parent			: fragment
		})

		const title_text_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "title_text_rows",
			text_content	: "Monedas("+coins.length+")",
			parent			: container_text_rows
		})


		const imagen_flecha_monedas = common.create_dom_element({
			element_type	: "img",
			class_name		: "imagen_text_rows",
			src				: "tpl/assets/images/arrow-right.svg",
			parent			: container_text_rows
		})

		const container_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_rows",
			parent			: fragment
		})

		for (let index = 0; index < coins.length; index++) {
			
			const info_coin = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_coin",
				parent			: container_rows
			})

			const container_images = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_images",
				parent			: info_coin
			})
			const parsedCoinData = coins[index];
			const image_obverse = "https://wondercoins.uca.es" + (parsedCoinData.image_obverse != null ? parsedCoinData.image_obverse : "/dedalo/media/image/1.5MB/20000/rsc29_rsc170_20917.jpg")
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_observe",
				src				: image_obverse,
				parent			: container_images
			})
			const image_reverse = "https://wondercoins.uca.es" + (parsedCoinData.image_obverse != null ? parsedCoinData.image_obverse : "/dedalo/media/image/1.5MB/20000/rsc29_rsc170_20917.jpg")
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_reserve",
				src				: image_reverse,
				parent			: container_images
			})
			const container_data = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_data",
				parent			: info_coin
			})
			
			let weight_text = null
			if(coins[index].weight != null){
				weight_text = "Peso: " + coins[index].weight +"g"
			}else{
				weight_text= "Peso: N/A"
			}

			const weight = common.create_dom_element({
				element_type	: "span",
				class_name		: "weight",
				text_content	: weight_text,
				parent			: container_data
			})
			const diameter = common.create_dom_element({
				element_type	: "span",
				class_name		: "diameter",
				text_content	: "Módulo: "+ coins[index].diameter +"mm" ,
				parent			: container_data
			})

			const catalogue_type = common.create_dom_element({
				element_type	: "span",
				class_name		: "catalogue_type",
				text_content	: "Colección: "+ coins[index].collection ,
				parent			: container_data
			})

			let findspot_text = coins[index].findspot.split(" | ")[0]
			const findspot = common.create_dom_element({
				element_type	: "span",
				class_name		: "findspot",
				text_content	:  "Hallazgo: "+ findspot_text,
				parent			: info_coin
			})

			const tipo = common.create_dom_element({
				element_type	: "span",
				class_name		: "type",
				text_content	:  "Tipo: "+ coins[index].type_full_value,
				parent			: info_coin
			})

			const container_links = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_links",
				parent			: info_coin
			})
			let value = coins[index].type_data ? coins[index].type_data.replace('"',"").replace("[","").replace("]","").replace('"','') : 0;
			let coin_type = value;

			const type_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "type_link",
				href			: "/web_numisdata/type/"+ coin_type,
				text_content	: "TIPO",
				parent			: container_links
			})
			
		}


		road.style.display = "none"
		container_rows.style.display = "none"
		let container_rows_state = false
		imagen.addEventListener("mousedown", function(){

			if(self.button_state){
				imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
				road.style.display = "none"
				
			}else{
				imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
				road.style.display = "block"
			}
			self.button_state = !self.button_state
		})

		imagen_flecha_monedas.addEventListener("mousedown", function(){

			if(container_rows_state){
				imagen_flecha_monedas.style.transform  = "rotate(0deg) translateY(0.60vh)";
				container_rows.style.display = "none"
				
			}else{
				imagen_flecha_monedas.style.transform  = "rotate(90deg) translateX(0.60vh)";
				container_rows.style.display = "grid"
			}
			container_rows_state = !container_rows_state
		})


		self.rows_container.appendChild(fragment)

	},
		render_rows_complejos : async function(row,coins) {

		const self = this
		const fragment = new DocumentFragment()
		let text_content = null
		let separador = null

		text_content = "Complejo : " + row.name
		separador = "-"
		

		const container_titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_title",
			parent			: fragment
		})

		const titulo = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle green-color",
			text_content	: text_content,
			parent			: container_titulo
		})

		const imagen = common.create_dom_element({
			element_type	: "img",
			class_name		: "imagen",
			src				: "tpl/assets/images/arrow-right.svg",
			parent			: container_titulo
		})

		const separator = common.create_dom_element({
			element_type	: "div",
			class_name		: "golden-separator",
			parent			: fragment
		})
		
		const road = common.create_dom_element({
			element_type	: "div",
			class_name		: "line-tittle mid",
			text_content	:  row.place.replace(/,/g, " - "),
			parent			: fragment
		})

		const container_text_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_text_rows",
			parent			: fragment
		})

		const title_text_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "title_text_rows",
			text_content	: "Monedas("+coins.length+")",
			parent			: container_text_rows
		})


		const imagen_flecha_monedas = common.create_dom_element({
			element_type	: "img",
			class_name		: "imagen_text_rows",
			src				: "tpl/assets/images/arrow-right.svg",
			parent			: container_text_rows
		})

		const container_rows = common.create_dom_element({
			element_type	: "div",
			class_name		: "container_rows",
			parent			: fragment
		})

		for (let index = 0; index < coins.length; index++) {
			
			const info_coin = common.create_dom_element({
				element_type	: "div",
				class_name		: "info_coin",
				parent			: container_rows
			})

			const container_images = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_images",
				parent			: info_coin
			})
			const parsedCoinData = coins[index];
			const image_obverse = "https://wondercoins.uca.es" + (parsedCoinData.image_obverse != null ? parsedCoinData.image_obverse : "/dedalo/media/image/1.5MB/20000/rsc29_rsc170_20917.jpg")
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_observe",
				src				: image_obverse,
				parent			: container_images
			})
			const image_reverse = "https://wondercoins.uca.es" + (parsedCoinData.image_obverse != null ? parsedCoinData.image_obverse : "/dedalo/media/image/1.5MB/20000/rsc29_rsc170_20917.jpg")
			common.create_dom_element({
				element_type	: "img",
				class_name		: "img_reserve",
				src				: image_reverse,
				parent			: container_images
			})
			const container_data = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_data",
				parent			: info_coin
			})
			
			let weight_text = null
			if(coins[index].weight != null){
				weight_text = "Peso: " + coins[index].weight +"g"
			}else{
				weight_text= "Peso: N/A"
			}

			const weight = common.create_dom_element({
				element_type	: "span",
				class_name		: "weight",
				text_content	: weight_text,
				parent			: container_data
			})
			const diameter = common.create_dom_element({
				element_type	: "span",
				class_name		: "diameter",
				text_content	: "Módulo: "+ coins[index].diameter +"mm" ,
				parent			: container_data
			})

			const catalogue_type = common.create_dom_element({
				element_type	: "span",
				class_name		: "catalogue_type",
				text_content	: "Colección: "+ coins[index].collection ,
				parent			: container_data
			})

			let findspot_text = coins[index].findspot.split(" | ")[0]
			const findspot = common.create_dom_element({
				element_type	: "span",
				class_name		: "findspot",
				text_content	:  "Hallazgo: "+ findspot_text,
				parent			: info_coin
			})

			const tipo = common.create_dom_element({
				element_type	: "span",
				class_name		: "type",
				text_content	:  "Tipo: "+ coins[index].type_full_value,
				parent			: info_coin
			})

			const container_links = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_links",
				parent			: info_coin
			})
			let value = coins[index].type_data ? coins[index].type_data.replace('"',"").replace("[","").replace("]","").replace('"','') : 0;
			let coin_type = value;
			const type_link = common.create_dom_element({
				element_type	: "a",
				class_name		: "type_link",
				href			: "/web_numisdata/type/"+ coin_type,
				text_content	: "TIPO",
				parent			: container_links
			})
			
		}


		road.style.display = "none"
		container_rows.style.display = "none"
		let container_rows_state = false
		imagen.addEventListener("mousedown", function(){

			if(self.button_state){
				imagen.style.transform  = "rotate(0deg) translateY(0.75vh)";
				road.style.display = "none"
				
			}else{
				imagen.style.transform  = "rotate(90deg) translateX(0.75vh)";
				road.style.display = "block"
			}
			self.button_state = !self.button_state
		})

		imagen_flecha_monedas.addEventListener("mousedown", function(){

			if(container_rows_state){
				imagen_flecha_monedas.style.transform  = "rotate(0deg) translateY(0.60vh)";
				container_rows.style.display = "none"
				
			}else{
				imagen_flecha_monedas.style.transform  = "rotate(90deg) translateX(0.60vh)";
				container_rows.style.display = "grid"
			}
			container_rows_state = !container_rows_state
		})


		self.rows_container.appendChild(fragment)

	},


	



}//end coins


