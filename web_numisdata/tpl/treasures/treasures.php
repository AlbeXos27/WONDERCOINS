<?php

// mints

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
        array_unshift(page::$css_ar_url,
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/MarkerCluster.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/fullscreen/leaflet.fullscreen.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.legend.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/gridstack/gridstack.min.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/swiper/swiper-bundle.min.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leafletdraw/leaflet.draw.css'
		);

		

	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';

		// row_fields js add
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/treasures_rows'.JS_SUFFIX.'.js';
        page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/fullscreen/Leaflet.fullscreen.min.js';
		page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.legend.js';
		page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leafletdraw/leaflet.draw.js';


	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


	// page_title fix
		$this->page_title = $this->row->term;	