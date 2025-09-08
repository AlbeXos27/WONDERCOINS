/*global tstring, form_factory, list_factory, Promise, 																																									psqo_factory, mints_rows, SHOW_DEBUG, common, page, data_manager, event_manager */
/*eslint no-undef: "error"*/

"use strict";



var findspots_hierarchy =  {

		// DOM items ready from page html
		rows_container	: null,

	/**
	* SET_UP
	*/
	set_up : async function(options) {

		const self = this

		self.rows_container	= options.rows_container

		const cecas_iniciales = await this.get_data_mints(21057)

		const nivel = 0;

		const arbol_completo = common.create_dom_element({
			element_type : "div",
			class_name	 : "arbol_completo",
			parent		 : self.rows_container
		})

		await this.generate_data_mint(21057,arbol_completo,0,0);

		return true;

	},//end set_up

	generate_data_mint: async function(ind, nodo_padre, tab, nivel) {

    const hallazgos = await this.get_data_mints(ind);

    for (let index = 0; index < hallazgos.total; index++) {
	
        const info_node = common.create_dom_element({
            element_type: "div",
            class_name: "container_hallazgos",
            parent: nodo_padre
        });
		info_node.style.paddingLeft = `${tab}em`;


		const enlace = common.create_dom_element({
			element_type: "a",
			text_content: hallazgos.result[index].term,
			parent: info_node,
            href : "/web_numisdata/findspot/" // Valor por defecto, se actualizará abajo
                
		});




        if (hallazgos.result[index].children) {
            const button_display = common.create_dom_element({
                element_type: "img",
                class_name: "button_display",
                src: "tpl/assets/images/arrow-right.svg",
                parent: info_node
            });

            button_display.classList.add(`button_display_${hallazgos.result[index].section_id}`);

            let estado_mostrar_monedas = false;
            let hijos_creados_monedas = false;

            button_display.addEventListener("mousedown", (e) => {
				e.stopPropagation();

				// Ocultables: hijos que sean nodos de subnivel
				const hijos_ocultables = Array.from(info_node.children)
					.filter(hijo => hijo.classList.contains("container_hallazgos"));

				if (estado_mostrar_monedas) {
					button_display.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
					hijos_ocultables.forEach(hijo => hijo.style.display = 'none');
				} else {
					button_display.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
					hijos_ocultables.forEach(hijo => hijo.style.display = 'block');

					if (!hijos_creados_monedas) {
						this.generate_data_mint(hallazgos.result[index].section_id, info_node, 1.5, nivel+1);
						hijos_creados_monedas = true;
					}
				}

				estado_mostrar_monedas = !estado_mostrar_monedas;
			});


        }
    }
},


	get_data_findspots: async function(id) {
			try {
				const hallazgos = await data_manager.request({
					body: {
						dedalo_get: 'records',
						table: 'findspots',
						ar_fields: ["*"],
						sql_filter: `parent LIKE '%"${id}"%'`,
						limit: 0,
						count: true,
						offset: 0,
						order: 'section_id',
						process_result: null
					}
				});
				return hallazgos;
			} catch (err) {
				console.error("Error fetching mints:", err);
				return null;
			}
	},


}

	