<?php
/*
Plugin Name: URI WYSIWYG
Plugin URI: http://www.uri.edu
Description: Create a set of custom WYSIWYG buttons
Version: 0.1
Author: John Pennypacker <jpennypacker@uri.edu>
Author URI: 
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
	// load the custom cards plugin
	$plugin_array['uri_wysiwyg'] = plugins_url( '/js/uri-cards-plugin.js', __FILE__ );
	return $plugin_array;
}
// Load the TinyMCE plugin
add_filter( 'mce_external_plugins', 'uri_wysiwyg_register_tinymce_plugin' );

/**
 *
 */
function uri_wysiwyg_register_buttons( $buttons ) {
	array_push( $buttons, 'card' );
	return $buttons;
}
// add new buttons
add_filter( 'mce_buttons', 'uri_wysiwyg_register_buttons' );
 
// add custom css to the WYSIWYG Editor
if ( is_admin() ){
	add_editor_style( plugins_url( 'css/uri-wysiwyg.css?d=' . strtotime('now') , __FILE__ ) );
}

