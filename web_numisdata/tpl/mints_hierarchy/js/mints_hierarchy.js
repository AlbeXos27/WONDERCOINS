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
		
		const arbol_completo = common.create_dom_element({
			element_type : "div",
			class_name	 : "arbol_completo",
			parent		 : self.rows_container
		})

		await this.generate_data_mint(21057,arbol_completo,0,0);

		return true;

	},//end set_up

	generate_data_mint: async function(ind, nodo_padre, tab, nivel) {

    const cecas = await this.get_data_mints(ind);

    for (let index = 0; index < cecas.total; index++) {
	
        const info_node = common.create_dom_element({
            element_type: "div",
            class_name: "container_cecas",
            parent: nodo_padre
        });
		info_node.style.paddingLeft = `${tab}em`;


        let label = cecas.result[index].term_section_label;
		//console.log ("Label: "+label);

		if (typeof label === "string" && label.trim().startsWith("[")) {
		try {
			label = JSON.parse(label);
		} catch (e) {
			console.error("No se pudo parsear label:", label);
		}
		}

		if (Array.isArray(label) && (label.includes("Tipo") || label.includes("Cecas"))) {

			let type = cecas.result[index].term_data ? cecas.result[index].term_data.replace('"',"").replace("[","").replace("]","").replace('"','') : 0;
			console.log("Type: "+cecas.result[index].term_data);
			const enlace = common.create_dom_element({
				element_type: "a",
				text_content: cecas.result[index].term,
				parent: info_node
			});

			if (label.includes("Tipo") && (type != 0 || type)) {
				enlace.href = `/web_numisdata/type/${type}`;
				enlace.style.fontWeight = "normal";   // <- aquí fuerzas normal
			} else if (label.includes("Cecas")) {
				enlace.href = `/web_numisdata/mint/${type}`;
				enlace.style.fontWeight = "bold";     // <- aquí fuerzas negrita
			}

		} else {
			info_node.textContent = cecas.result[index].term;
			if (label.includes("Tipo")) {
				info_node.style.fontWeight = "normal";
			} else if (nivel === 0 || label.includes("Cecas"))  {
				info_node.style.fontWeight = "bold";
			} else {
				info_node.style.fontWeight = "normal";
			}
		}


        if (cecas.result[index].children) {
            const button_display = common.create_dom_element({
                element_type: "img",
                class_name: "button_display",
                src: "tpl/assets/images/arrow-right.svg",
                parent: info_node
            });

            button_display.classList.add(`button_display_${cecas.result[index].section_id}`);

            let estado_mostrar_monedas = false;
            let hijos_creados_monedas = false;

            button_display.addEventListener("mousedown", (e) => {
				e.stopPropagation();

				// Ocultables: hijos que sean nodos de subnivel
				const hijos_ocultables = Array.from(info_node.children)
					.filter(hijo => hijo.classList.contains("container_cecas"));

				if (estado_mostrar_monedas) {
					button_display.style.transform = "rotate(0deg) translateY(20%) translateX(30%)";
					hijos_ocultables.forEach(hijo => hijo.style.display = 'none');
				} else {
					button_display.style.transform = "rotate(90deg) translateX(30%) translateY(-20%)";
					hijos_ocultables.forEach(hijo => hijo.style.display = 'block');

					if (!hijos_creados_monedas) {
						this.generate_data_mint(cecas.result[index].section_id, info_node, 1.5, nivel+1);
						hijos_creados_monedas = true;
					}
				}

				estado_mostrar_monedas = !estado_mostrar_monedas;
			});


        }
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
						order: 'norder',
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

	