"use strict";

var indexation_hierarchy = {

    rows_container: null,
    tree_container: null,
    list: null,
    pagination: null,
    current_node_id: null, // Nodo activo

    set_up: async function(options) {
        const self = this;

        self.rows_container = options.rows_container;
        self.tree_container = options.tree_container;

        self.pagination = {
            total: null,
            limit: 10,
            offset: 0,
            n_nodes: 8
        };

        const arbol_completo = common.create_dom_element({
            element_type: "div",
            class_name: "arbol_completo",
            parent: self.tree_container
        });

        // Generar árboles de categorías y contextos
        await self.generate_data(1, arbol_completo, 0, 0, "ts_find_category");
        await self.generate_data(134, arbol_completo, 0, 0, "ts_find_context");
    },

    generate_data: async function(id, nodo_padre, tab, nivel, table) {
        const self = this;

        const datos = await self.get_data(table, id, nivel === 0);
        if (!datos || !datos.result) return;

        for (let i = 0; i < datos.result.length; i++) {
            const node_data = datos.result[i];

            const nodo = common.create_dom_element({
                element_type: "div",
                class_name: "container_indexation",
                parent: nodo_padre
            });

            nodo.classList.add(table);
            nodo.style.paddingLeft = `${tab}em`;
            nodo.textContent = node_data.term;

            let estado_mostrar = false;
            let hijos_creados = false;

            // Crear botón de flecha si tiene hijos
            if (node_data.children || nivel === 0) {
                const button = common.create_dom_element({
                    element_type: "img",
                    class_name: "button_display",
                    src: "tpl/assets/images/arrow-right.svg",
                    parent: nodo
                });

                button.classList.add(`button_display_${node_data.section_id}_${table}`);

                button.addEventListener("click", function(e) {
                    e.stopPropagation();
                    const hijos_ocultables = Array.from(nodo.children)
                        .filter(hijo => hijo.classList.contains("container_indexation"));

                    if (estado_mostrar) {
                        button.style.transform = "rotate(0deg) translateX(20%) translateY(25%)";
                        hijos_ocultables.forEach(h => h.style.display = "none");
                    } else {
                        button.style.transform = "rotate(90deg) translateX(20%) translateY(-25%)";
                        hijos_ocultables.forEach(h => h.style.display = "block");

                        if (!hijos_creados) {
                            self.generate_data(node_data.section_id, nodo, tab + 1.5, nivel + 1, table);
                            hijos_creados = true;
                        }
                    }

                    estado_mostrar = !estado_mostrar;
                });
            }

            // Evento de clic en el nodo para actualizar la lista
            nodo.addEventListener("click", async function(e) {
                e.stopPropagation();

                self.current_node_id = node_data.section_id; // Guardar nodo activo
                self.pagination.offset = 0; // resetear página

                if(nivel != 0){

                    await self.reload_current_node();

                }
                
                // Suscribirse al evento paginate (solo una vez)
                if (!self._paginate_event_subscribed) {
                    self._paginate_event_subscribed = true;
                    event_manager.subscribe('paginate', async function(offset) {
                        self.pagination.offset = offset;
                        await self.reload_current_node();
                    });
                }

                const div_result = document.querySelector("#rows_container");
                if (div_result) {
                    div_result.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                }
            });
        }
    },

    reload_current_node: async function() {
        const self = this;
        if (!self.current_node_id) return;

        const filas = await self.get_rows_container(self.current_node_id);
        if (!filas || !filas.result) return;

        const data = page.parse_hoard_data(filas.result);
        self.pagination.total = filas.total;

        // Limpiar resultados anteriores
        while (self.rows_container.firstChild) {
            self.rows_container.removeChild(self.rows_container.firstChild);
        }

        // Crear nueva lista
        self.list = new list_factory();
        self.list.init({
            data: data,
            fn_row_builder: function(d) {
                return indexation_hierarchy.generate_row(d, self.rows_container);
            },
            pagination: self.pagination,
            caller: self
        });

        self.list.render_list().then(function(list_node) {
            if (list_node) self.rows_container.appendChild(list_node);
        });
    },

    get_data: async function(table, id, parent) {
        const sql_filter = !parent
            ? `parent LIKE "%${table === "ts_find_category" ? "tchicategory" : "cont"}1_${id}%"`
            : `section_id = ${id}`;

        try {
            return await data_manager.request({
                body: {
                    dedalo_get: "records",
                    table: table,
                    ar_fields: ["*"],
                    sql_filter: sql_filter,
                    limit: 0,
                    count: true,
                    offset: 0,
                    order: "norder",
                    process_result: null
                }
            });
        } catch (err) {
            console.error("Error fetching data:", err);
            return null;
        }
    },

    get_rows_container: async function(id) {
        const self = this;
        try {
            return await data_manager.request({
                body: {
                    dedalo_get: "records",
                    table: "findspots",
                    ar_fields: ["*"],
                    sql_filter: `JSON_CONTAINS(indexation_data,'"${id}" ') AND typology != ""`,
                    limit: self.pagination.limit,
                    count: true,
                    offset: self.pagination.offset,
                    order: "section_id",
                    process_result: null
                }
            });
        } catch (err) {
            console.error("Error fetching rows:", err);
            return null;
        }
    },

    generate_row: function(data, parent) {
        const container = common.create_dom_element({
            element_type: "div",
            class_name: "container_row_indexation_findspots",
            parent: parent
        });

        common.create_dom_element({
            element_type: "a",
            class_name: "row_indexation_findspots",
            href: `findspot/${data.section_id}`,
            text_content: data.name,
            parent: container
        });

        return container;
    }

};
