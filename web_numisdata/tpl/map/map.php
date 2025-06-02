<?php

// map

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		// Prepend this style to the beginning of 'page::$css_ar_url' array to decrease its prevalence
		// page::$css_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/css/catalog.css';
		array_unshift(page::$css_ar_url,
			__WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet/dist/leaflet.css',
			__WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet.markercluster/dist/MarkerCluster.css',
			__WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/fullscreen/leaflet.fullscreen.css',
			__WEB_TEMPLATE_WEB__ . '/catalog/css/catalog.css',
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css',
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/special-tools-modal/special-tools-modal.css',               
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/Leaflet.Control.Layers.Tree/L.Control.Layers.Tree.css', 
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/leaflet-graphicscale/dist/Leaflet.GraphicScale.min.css',
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css',
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/simpleLightbox/dist/simpleLightbox.css',
                        __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/css/tool_leaflet_special_tools.css',
                        
                        
		);

	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
		// page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/coins_row'.JS_SUFFIX.'.js';
		//page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';

                //page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
		// page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog.js';
		//page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog_row_fields'.JS_SUFFIX.'.js';
		//page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/type/js/type_row_fields'.JS_SUFFIX.'.js';
		// page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/mint/js/mint.js';

                /* SPECIALTOOLS */
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/translate/translate.js?v=' . bin2hex(random_bytes(32));
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet/dist/leaflet.js';
                
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet.markercluster/dist/leaflet.markercluster.js';
                
		page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog_row_fields'.JS_SUFFIX.'.js';
		
                page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/type/js/type_row_fields'.JS_SUFFIX.'.js';
                
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/fullscreen/Leaflet.fullscreen.min.js';
               
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.min.js';
                
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/special-tools-modal/special-tools-modal.js';
                
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/Leaflet.Control.Layers.Tree/L.Control.Layers.Tree.js';
                
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/@turf/turf/turf.min.js';
    
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/iro/dist/iro.min.js';
    
                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/leaflet.shapefile/catiline.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/leaflet.shapefile/leaflet.shpfile.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/leaflet-kml/L.KML.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/georaster/dist/georaster.browser.bundle.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/georaster-layer-for-leaflet/dist/georaster-layer-for-leaflet.min.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/Leaflet.ImageOverlay.Rotated/Leaflet.ImageOverlay.Rotated.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/dom-to-image/dist/dom-to-image.min.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/marker-filter-color/marker-filter-color.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/leaflet-graphicscale/dist/Leaflet.GraphicScale.min.js';           

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/Leaflet.UTM/L.LatLng.UTM.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/projections/projections.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/node_modules/leaflet-control-geocoder/dist/Control.Geocoder.min.js';

                page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/tool_leaflet_special_tools/external-lib/simpleLightbox/dist/simpleLightbox.min.js';          
                
                /* SPECIALTOOLS */
                

	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


	// page_title fix
		$this->page_title = $this->row->term;