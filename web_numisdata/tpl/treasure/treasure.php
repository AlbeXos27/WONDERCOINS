<?php

// mint

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		array_unshift(page::$css_ar_url,
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/MarkerCluster.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.legend.css',
			__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leafletdraw/leaflet.draw.css',
		);


	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/treasures/js/treasures'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/map/js/map'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/render_treasure'.JS_SUFFIX.'.js';
		page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.legend.js';
		page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leafletdraw/leaflet.draw.js';

	// area name
		$area_name 	= $_GET['area_name'];
		$ar_parts 	= explode('/', $area_name);

	// section_id (is inside get var 'area_name' as '/min/36')
		$section_id = isset($ar_parts[1]) ? (int)$ar_parts[1] : null;


	// page basic vars
		$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});