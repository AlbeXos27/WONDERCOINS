/*global tstring, form_factory, list_factory, Promise, 																																									psqo_factory, mints_rows, SHOW_DEBUG, common, page, data_manager, event_manager */
/*eslint no-undef: "error"*/

"use strict";



var indexation_hierarchy =  {

		// DOM items ready from page html
		rows_container	: null,

	/**
	* SET_UP
	*/
	set_up : async function(options) {

		const self = this

		self.rows_container	= options.rows_container;


		const arbol_completo = common.create_dom_element({
			element_type : "div",
			class_name	 : "arbol_completo",
			parent		 : self.rows_container
		})

		await this.generate_data(1,arbol_completo,0,0,"ts_find_category");
		await this.generate_data(134,arbol_completo,0,0,"ts_find_context");
		
		


		return true;

	},//end set_up

	generate_data: async function(id, nodo_padre, tab, nivel,table){

		if(nivel == 0){

			const datos_inicial = await this.get_data(table,id,true);
			
			const nodo_inicial = common.create_dom_element({
				element_type : "div",
				class_name	 : "container_indexation",
				parent		 : nodo_padre
			});

			nodo_inicial.classList.add(table);
			nodo_inicial.textContent = datos_inicial.result[0].term;

			const button_display = common.create_dom_element({
                element_type: "img",
                class_name: "button_display",
                src: "tpl/assets/images/arrow-right.svg",
                parent: nodo_inicial
            });

			button_display.classList.add(`button_display_${datos_inicial.result[0].section_id}_${table}`);

			let estado_mostrar_monedas = false;
            let hijos_creados_monedas = false;

            button_display.addEventListener("mousedown", (e) => {
				e.stopPropagation();

				// Ocultables: hijos que sean nodos de subnivel
				const hijos_ocultables = Array.from(nodo_inicial.children)
					.filter(hijo => hijo.classList.contains("container_indexation"));

				if (estado_mostrar_monedas) {
					button_display.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
					hijos_ocultables.forEach(hijo => hijo.style.display = 'none');
				} else {
					button_display.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
					hijos_ocultables.forEach(hijo => hijo.style.display = 'block');

					if (!hijos_creados_monedas) {
						this.generate_data(datos_inicial.result[0].section_id, nodo_inicial, 1.5, nivel+1,table);
						hijos_creados_monedas = true;
					}
				}

				estado_mostrar_monedas = !estado_mostrar_monedas;
			});


		}else{

			const datos_iniciales = await this.get_data(table,id,false);

			for (let index = 0; index < datos_iniciales.total; index++) {
				
				 const info_node = common.create_dom_element({
					element_type: "div",
					class_name: "container_indexation",
					parent: nodo_padre
				});

				info_node.classList.add(table);
				info_node.style.paddingLeft = `${tab}em`;
				info_node.textContent = datos_iniciales.result[index].term;

				if(datos_iniciales.result[index].children){

				const button_display = common.create_dom_element({
					element_type: "img",
					class_name: "button_display",
					src: "tpl/assets/images/arrow-right.svg",
					parent: info_node
				});

				button_display.classList.add(`button_display_${datos_iniciales.result[index].section_id}_${table}`);

				let estado_mostrar_monedas = false;
				let hijos_creados_monedas = false;

				button_display.addEventListener("mousedown", (e) => {
					e.stopPropagation();

					// Ocultables: hijos que sean nodos de subnivel
					const hijos_ocultables = Array.from(info_node.children)
						.filter(hijo => hijo.classList.contains("container_indexation"));

					if (estado_mostrar_monedas) {
						button_display.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
						hijos_ocultables.forEach(hijo => hijo.style.display = 'none');
					} else {
						button_display.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
						hijos_ocultables.forEach(hijo => hijo.style.display = 'block');

						if (!hijos_creados_monedas) {
							this.generate_data(datos_iniciales.result[index].section_id, info_node, 1.5, nivel+1,table);
							hijos_creados_monedas = true;
						}
					}

					estado_mostrar_monedas = !estado_mostrar_monedas;
				});
				
				}
			
			} 

		}

	},


	get_data: async function(table,id,parent) {
			const sql_filter = !parent ? `parent LIKE "%${table == "ts_find_category" ? "tchicategory" : "cont" }1_${id}%"` : `section_id = ${id}`;
			try {
				const context = await data_manager.request({
					body: {
						dedalo_get: 'records',
						table: table,
						ar_fields: ["*"],
						sql_filter: sql_filter,
						limit: 0,
						count: true,
						offset: 0,
						order: 'norder',
						process_result: null
					}
				});
				return context;
			} catch (err) {
				console.error("Error fetching mints:", err);
				return null;
			}
	},





}

	