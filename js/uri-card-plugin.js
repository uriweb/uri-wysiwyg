// https://code.tutsplus.com/tutorials/guide-to-creating-your-own-wordpress-editor-buttons--wp-30182

(function() {

	function renderCard( shortcode ) {
		var parsed, safeData, out;

		parsed = URIWYSIWYG.parseShortCodeAttributes( shortcode );
		safeData = window.encodeURIComponent( shortcode );

		out = '<div class="cl-card mceNonEditable" data-shortcode="' + safeData + '">';
        if(parsed.img) {
            out += '<img alt="' + parsed.alt + '" src="' + parsed.img + '"/>';
        }
        if(parsed.title) {
		  out += '<h1>' + parsed.title + '</h1>';
        }
        if(parsed.body) {
		  out += '<p>' + URIWYSIWYG.unEscapeQuotes(parsed.body) + '</p>';
        }
        if(!parsed.button) { parsed.button = 'Explore'; }
        out += '<span class="cl-button">' + parsed.button + '</span>';
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

		var attributes = [];
		
        if(!params.button) {
            params.button = 'Explore';
        }
        
		for(i in params) {
			attributes.push(i + '="' + params[i] + '"');
		}
		
		return '[cl-card ' + attributes.join(' ') + ']';

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
			ed.addButton('CLCard', {
				title : 'Card',
				text : '',
				cmd : 'CLCard',
				image : url + '/i/card@2x.png'
			});
		
			// add a js callback for the button
			ed.addCommand('CLCard', function(args) {
			
				// create an empty object if args is empty
				if(!args) {
					args = {title:'', body:'', link:''}
				}
				// create an empty property so nothing is null
				var possibleArgs = ['title', 'body', 'link', 'button', 'img', 'alt', 'tooltip'];
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
				
				var imageEl = '';
				if(args.img) {
					imageEl = '<img src="' + args.img + '" alt="' + args.alt + '" />';
				}

				ed.windowManager.open({
					title: 'Insert / Update Card',
					library: {type: 'image'},
					body: [
						{type: 'textbox', name: 'title', label: 'Title', value: args.title},
						{type: 'textbox', multiline: 'true', name: 'body', label: 'Body', value: args.body},
						{type: 'textbox', name: 'link', label: 'Link', value: args.link},
                        {type: 'textbox', name: 'button', label: 'Button Text', 'placeholder':'Explore', value: args.button},
						{type: 'textbox', name: 'alt', id: 'alt', value: args.alt, subtype: 'hidden'},
						{type: 'textbox', name: 'img', id: 'img', value: args.img, subtype: 'hidden'},
						{type: 'container', label: ' ', html: '<div id="wysiwyg-img-preview">' + imageEl + '</div>'},
						{type: 'button', label: 'Image', text: 'Choose an image', onclick: URIWYSIWYG.mediaPicker}
					],
					onsubmit: function(e) {
						// Insert content when the window form is submitted
						e.data = URIWYSIWYG.escapeQuotesDeep(e.data);						
						shortcode = generateCardShortcode(e.data);
						ed.execCommand('mceInsertContent', 0, shortcode);
					}
				},
				{
					wp: wp,
				});

			});

			ed.on( 'BeforeSetContent', function( event ) {
				event.content = URIWYSIWYG.replaceShortcodes( event.content, 'cl-card', true, renderCard );
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
					ed.execCommand('CLCard', attributes);
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

