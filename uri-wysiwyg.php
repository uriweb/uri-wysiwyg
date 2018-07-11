<?php
/*
Plugin Name: URI WYSIWYG
Plugin URI: http://www.uri.edu
Description: Create a set of custom WYSIWYG buttons
Version: 0.1
Author: URI Web Communications
Author URI: 
@author John Pennypacker <jpennypacker@uri.edu>
@author Brandon Fuller <bjcfuller@uri.edu>
@see https://codex.wordpress.org/TinyMCE_Custom_Buttons
*/

// Block direct requests
if ( !defined('ABSPATH') )
	die('-1');
	

/**
 *
 */
function uri_wysiwyg_register_tinymce_plugin( $plugin_array ) {
	// load up the noneditable plugin from TinyMCE
	$plugin_array['noneditable'] = plugins_url( '/js/noneditable/plugin.min.js', __FILE__ );

	// load the custom boxout plugin
	$plugin_array['uri_wysiwyg_boxout'] = plugins_url( '/js/uri-boxout-plugin.js', __FILE__ );
	// load the custom buttons plugin
	$plugin_array['uri_wysiwyg_button'] = plugins_url( '/js/uri-button-plugin.js', __FILE__ );
	// load the custom cards plugin
	$plugin_array['uri_wysiwyg_card'] = plugins_url( '/js/uri-card-plugin.js', __FILE__ );
    // load the custom heros plugin
	$plugin_array['uri_wysiwyg_hero'] = plugins_url( '/js/uri-hero-plugin.js', __FILE__ );
	// load the custom metric plugin
	$plugin_array['uri_wysiwyg_metric'] = plugins_url( '/js/uri-metric-plugin.js', __FILE__ );
    // load the custom notice plugin
	$plugin_array['uri_wysiwyg_notice'] = plugins_url( '/js/uri-notice-plugin.js', __FILE__ );
    // load the custom panel plugin
	$plugin_array['uri_wysiwyg_panel'] = plugins_url( '/js/uri-panel-plugin.js', __FILE__ );
	// load the custom quote plugin
	$plugin_array['uri_wysiwyg_quote'] = plugins_url( '/js/uri-quote-plugin.js', __FILE__ );
    // load the custom video plugin
	$plugin_array['uri_wysiwyg_video'] = plugins_url( '/js/uri-video-plugin.js', __FILE__ );
    // load the custom tiles plugin
	$plugin_array['uri_wysiwyg_tiles'] = plugins_url( '/js/uri-tiles-plugin.js', __FILE__ );

	return $plugin_array;
}
// Load the TinyMCE plugin
add_filter( 'mce_external_plugins', 'uri_wysiwyg_register_tinymce_plugin' );


/**
 *
 */
function uri_wysiwyg_register_buttons( $buttons ) {
	array_unshift( $buttons, 'CLBoxout', 'CLButton', 'CLCard', 'CLHero', 'CLMetric', 'CLNotice', 'CLPanel', 'CLQuote', 'CLVideo', 'CLTiles' );
	return $buttons;
}
// add new buttons
add_filter( 'mce_buttons_3', 'uri_wysiwyg_register_buttons' );
 

/**
 * Enqueue a script in the WordPress admin
 * @param int $hook Hook suffix for the current admin page.
 */
function uri_wysiwyg_add_scripts( $hook ) {
	$v = strtotime('now'); // was 1.0
	if ( 'edit.php' === $hook || 1==1) { // @todo: only load on the add/edit screen?
	  wp_enqueue_style('URIWYSIWYG-admin-styles', plugins_url( '/css/uri-wysiwyg-admin.css', __FILE__ ) );
		wp_enqueue_script( 'URIWYSIWYG', plugins_url( '/js/uri-wysiwyg-helpers.js', __FILE__ ), array(), $v );
	}

}
add_action( 'admin_enqueue_scripts', 'uri_wysiwyg_add_scripts' );


/**
 * Apply styles to the visual editor
 */ 
function uri_wysiwyg_editor_style( $url ) {
	if ( !empty($url) ) {
		$url .= ',';
	}
	$url .= plugins_url( '/css/uri-wysiwyg-editor.css', __FILE__ );
 	return $url;
}
add_filter('mce_css', 'uri_wysiwyg_editor_style');






/**
 * Expose the Format menu in TinyMCE
 */
function uri_wysiwyg_enable_styles_menu( $buttons ) {
	array_unshift( $buttons, 'styleselect' );
	return $buttons;
}
add_filter( 'mce_buttons_2', 'uri_wysiwyg_enable_styles_menu' );


/**
 * Callback function to filter the MCE Format Menu settings
 * Add URI Modern styles to the menu
 */
function uri_wysiwyg_insert_formats( $init_array ) {  

	$style_formats = array(  
		// for reasons unknown, WP doesn't like using p for 'block'
		array(  
			'title' => 'Introduction',  
			'block' => 'div',  
			'classes' => 'type-intro',
			'wrapper' => true,
		),  
		array(  
			'title' => 'Full Width',  
			'block' => 'div',  
			'classes' => 'fullwidth',
			'wrapper' => true,
		),
// 		array(
// 			'title' => 'Red Uppercase Text',
// 			'inline' => 'span',
// 			'styles' => array(
// 				'color' => '#ff0000',
// 				'fontWeight' => 'bold',
// 				'textTransform' => 'uppercase'
// 			)
// 		),

	);  
	// Insert the array, JSON ENCODED, into 'style_formats'
	$init_array['style_formats'] = json_encode( $style_formats );  
	
	return $init_array;  
  
} 
add_filter( 'tiny_mce_before_init', 'uri_wysiwyg_insert_formats' );  





/**
 * Set up an AJAX endpoint to parse shortcodes and get the HTML from the server
 */
function uri_wysiwyg_get_html() {
	// only allow contributors to use this endpoint
	if ( ! current_user_can( 'edit_posts' ) ) {
		header('HTTP/1.0 403 Forbidden');
		return __( 'This resource is for authors only, sorry.', 'uri' );
	}

	if ( empty( $_GET['sc'] ) ) {
		return;
	}
	
	$sc = ( get_magic_quotes_gpc() ) ? $_GET['sc'] : stripslashes( $_GET['sc'] );
	$sc = mb_convert_encoding($sc, 'HTML-ENTITIES', 'UTF-8');
	
	$out = do_shortcode( $sc );
	
	
	// parse errors out of the returned HTML, otherwise, they'll be saved in the post.
	
	$dom = new DOMDocument();
	$dom->loadHTML( $out, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );

	$divs = $dom->getElementsByTagName( 'div' );
	foreach ( $divs as $element ) {
		$class = $element->getAttribute( 'class' );
		if ( strpos( $class, 'cl-errors' ) !== FALSE ) {
			$element->parentNode->removeChild( $element );
		}
	}
	
	$out = $dom->saveHTML();
	
// 	echo '<pre>';
// 	print_r( $_GET['sc'] );
// 	echo '<hr>';
// 	print_r( $sc );
// 	print_r ( $out );
// 	exit;

	// return the output
	wp_send_json( $out );
  wp_die();
}
add_action('wp_ajax_uri_wysiwyg',  'uri_wysiwyg_get_html');
