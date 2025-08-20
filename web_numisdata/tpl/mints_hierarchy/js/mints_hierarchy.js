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

		const cecas_iniciales = await this.get_data_mints(21057)

		const arbol_completo = common.create_dom_element({
			element_type : "div",
			class_name	 : "arbol_completo",
			parent		 : self.rows_container
		})

		this.generate_data_mint(21057,arbol_completo,0);

		return true;

	},//end set_up

	generate_data_mint: async function(index,nodo_padre,tab) {

		const cecas = await this.get_data_mints(index);

		for (let index = 0; index < cecas.total; index++) {
	
			const info_node = common.create_dom_element({
				element_type	: "div",
				class_name		: "container_cecas",
				text_content	: cecas.result[index].term,
				parent			: nodo_padre
			})

			info_node.style.paddingLeft = `${tab}em`;


			if(cecas.result[index].children)
			{
				const button_display = common.create_dom_element({
					element_type	: "img",
					class_name		: `button_display`,
					src				: "tpl/assets/images/arrow-right.svg",
					parent			: info_node
				})
				button_display.classList.add(`button_display_${cecas.result[index].section_id}`)
			}

			let estado_mostrar_monedas = false
			let hijos_creados_monedas = false
			document.addEventListener("mousedown", (e) => {

			const button = e.target.closest(`.button_display_${cecas.result[index].section_id}`);
			const hijos = Array.from(info_node.children).slice(1);

				if (estado_mostrar_monedas) {

					button.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
						hijos.forEach(hijo => {
							hijo.style.display = 'none'; 
						});
				} else {

					button.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
						hijos.forEach(hijo => {
							hijo.style.display = 'block'; 
						});
					if(!hijos_creados_monedas){

						this.generate_data_mint(cecas.result[index].section_id,info_node,1.5)
						hijos_creados_monedas = !hijos_creados_monedas;
					}
					
				}

				estado_mostrar_monedas = !estado_mostrar_monedas;

			});

		}
	},

	get_data_mints: async function(id) {
			try {
				const cecas = await data_manager.request({
					body: {
						dedalo_get: 'records',
						table: 'catalog',
						ar_fields: ["*"],
						sql_filter: `parent LIKE '%"${id}"%'`,
						limit: 0,
						count: true,
						offset: 0,
						order: 'section_id',
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

	