// https://code.tutsplus.com/tutorials/guide-to-creating-your-own-wordpress-editor-buttons--wp-30182

(function() {


	function renderCard( shortcode ) {
		var parsed, safeData, out;

		parsed = URIWYSIWYG.parseShortCodeAttributes( shortcode );
		safeData = window.encodeURIComponent( shortcode );

		out = '<div class="cl-card mceNonEditable" data-shortcode="' + safeData + '">';
		out += '<h1>' + parsed.title + '</h1>';
		out += '<p>' + URIWYSIWYG.unEscapeQuotes(parsed.body) + '</p>';
		if(parsed.link) {
			out += '<span class="button">Explore</span>';
		}
		out += '</div>';
		
		return out;
	}
	
	function restoreCardShortcodes( content ) {
		var html, els, i, t;
		
		// convert the content string into a DOM tree so we can parse it easily
		html = document.createElement('div');
		html.innerHTML = content;
		els = html.querySelectorAll('.cl-card');
		
		for(i=0; i<els.length; i++) {
			t = document.createTextNode( window.decodeURIComponent(els[i].getAttribute('data-shortcode')) );
			els[i].parentNode.replaceChild(t, els[i]);
		}
		
		//return the DOM tree as a string
		return html.innerHTML;
	}
	
	function generateCardShortcode(params) {
		return '[cl-card title="' + params.title + '" body="' + params.body + '" link="' + params.link + '"]';
	}





	tinymce.create('tinymce.plugins.uri_wysiwyg_card', {
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
			ed.addButton('card', {
				title : 'Card',
				text : '',
				cmd : 'card',
				image : url + '/i/card.png'
			});
		
			// add a js callback for the button
			ed.addCommand('card', function(args) {
			
				// create an empty object if args is empty
				if(!args) {
					args = {title:'', body:'', link:''}
				}
				// create an empty property so nothing is null
				var possibleArgs = ['title', 'body', 'link'];
				if(!args.title) {
					args.title = '';
				}
				possibleArgs.forEach(function(i){
					if(!args[i]) {
						args[i] = '';
					}
				});
				// prevent nested quotes... escape / unescape instead?
				args = URIWYSIWYG.unEscapeQuotesDeep(args);

				
				ed.windowManager.open({
					title: 'Insert / Update Card',
					body: [
						{type: 'textbox', name: 'title', label: 'Title', value: args.title},
						{type: 'textbox', name: 'body', label: 'Body', value: args.body},
						{type: 'textbox', name: 'link', label: 'Link', value: args.link}
					],
					onsubmit: function(e) {
						// Insert content when the window form is submitted
						e.data = URIWYSIWYG.escapeQuotesDeep(e.data);						
						
						shortcode = generateCardShortcode(e.data);
						
						ed.execCommand('mceInsertContent', 0, shortcode);
					}
				});

			});

			ed.on( 'BeforeSetContent', function( event ) {
				event.content = URIWYSIWYG.replaceShortcodes( event.content, 'cl-card', renderCard );
			});

			ed.on( 'PostProcess', function( event ) {
				if ( event.get ) {
					event.content = restoreCardShortcodes( event.content );
				}
			});

			//open popup on placeholder double click
			ed.on('DblClick',function(e) {
				var isCard = false, card, sc, attributes;
				card = e.target;
				while ( isCard === false && card.parentNode ) {
					if ( card.className.indexOf('cl-card') > -1 ) {
						isCard = true;
					} else {
						if(card.parentNode) {
							card = card.parentNode;
						}
					}
				}
				
				if ( isCard ) {
					sc = window.decodeURIComponent( card.getAttribute('data-shortcode') );
					attributes = URIWYSIWYG.parseShortCodeAttributes(sc);
					ed.execCommand('card', attributes);
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
	tinymce.PluginManager.add( 'uri_wysiwyg_card', tinymce.plugins.uri_wysiwyg_card );


})();

