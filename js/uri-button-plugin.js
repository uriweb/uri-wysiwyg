// https://code.tutsplus.com/tutorials/guide-to-creating-your-own-wordpress-editor-buttons--wp-30182

(function() {


	function replaceButtonShortcodes( content, shortcodeName ) {
		var re = new RegExp("\\[" + shortcodeName + "([^\\]]*)\\]", "g");
		return content.replace( re, function( match ) {
			return renderButton( match );
		});
	}


	function renderButton( shortcode ) {
		var parsed, safeData, out;

		parsed = URIWYSIWYG.parseShortCodeAttributes( shortcode );
		safeData = window.encodeURIComponent( shortcode );

		out = '<a class="cl-button prominent" data-shortcode="' + safeData + '">';

		if(parsed.text) {
			out += parsed.text;
		} else {
			out += 'Explore';
		}
		out += '</a>';
		
		return out;
	}


	function restoreButtonShortcodes( content ) {
		var html, els, i, t;
		
		// convert the content string into a DOM tree so we can parse it easily
		html = document.createElement('div');
		html.innerHTML = content;
		els = html.querySelectorAll('.cl-button');
		
		for(i=0; i<els.length; i++) {
			t = document.createTextNode( window.decodeURIComponent(els[i].getAttribute('data-shortcode')) );
			els[i].parentNode.replaceChild(t, els[i]);
		}
		
		//return the DOM tree as a string
		return html.innerHTML;
	}
	
	function generateButtonShortcode(params) {
		return '[cl-button link="' + params.link + '"]';
	}





	tinymce.create('tinymce.plugins.uri_wysiwyg_button', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {

			// add the button that the WP plugin defined in the mce_buttons filter callback
			ed.addButton('button', {
				title : 'Button',
				text : '',
				cmd : 'button',
				image : url + '/i/button.png'
			});
		
			// add a js callback for the button
			ed.addCommand('button', function(args) {
			
				// create an empty property so nothing is null
				var possibleArgs = ['link', 'text', 'tooltip', 'prominent'];

				// create an empty object if args is empty
				if(!args) {
					args = {}
				}
				possibleArgs.forEach(function(i){
					if(!args[i]) {
						args[i] = '';
					}
				});
								
				// prevent nested quotes... escape / unescape instead?
				args = URIWYSIWYG.unEscapeQuotesDeep(args);
				
				ed.windowManager.open({
					title: 'Insert / Update Button',
					body: [
						{type: 'textbox', name: 'link', label: 'Link', value: args.link},
						{type: 'textbox', name: 'body', label: 'Text', 'placeholder': 'Explore', value: args.text},
						{type: 'textbox', name: 'tooltip', label: 'Tooltip', 'placeholder': '(optional)', value: args.tooltip},
						{type: 'checkbox', name: 'prominent', label: 'Prominent', value: args.prominent}
					],
					onsubmit: function(e) {
						// Insert content when the window form is submitted
						e.data = URIWYSIWYG.escapeQuotesDeep(e.data);						
						shortcode = generateButtonShortcode(e.data);
						ed.execCommand('mceInsertContent', 0, shortcode);
					}
				});

			});

			ed.on( 'BeforeSetContent', function( event ) {
				event.content = replaceButtonShortcodes( event.content, 'cl-button' );
			});

			ed.on( 'PostProcess', function( event ) {
				if ( event.get ) {
					event.content = restoreButtonShortcodes( event.content );
				}
			});

			//open popup on placeholder double click
			ed.on('DblClick',function(e) {
				var isButton = false, button, sc, attributes;
				button = e.target;
				while ( isButton === false && button.parentNode ) {
					if ( button.className.indexOf('cl-button') > -1 ) {
						isButton = true;
					} else {
						if(button.parentNode) {
							button = button.parentNode;
						}
					}
				}
				
				if ( isButton ) {
					sc = window.decodeURIComponent( button.getAttribute('data-shortcode') );
					attributes = URIWYSIWYG.parseShortCodeAttributes(sc);
					ed.execCommand('button', attributes);
				}
			});

		},


		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
				return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'URI WYSIWYG',
				author : 'John Pennypacker',
				authorurl : 'https://today.uri.edu',
				infourl : 'https://www.uri.edu/communications',
				version : "0.1"
			};
		}


	});

	// Register plugin
	tinymce.PluginManager.add( 'uri_wysiwyg_button', tinymce.plugins.uri_wysiwyg_button );


})();

