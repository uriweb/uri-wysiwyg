// https://code.tutsplus.com/tutorials/guide-to-creating-your-own-wordpress-editor-buttons--wp-30182

(function() {

	function renderPanel( shortcode ) {
		var parsed, safeData, classes, out;
        
		parsed = URIWYSIWYG.parseShortCodeAttributes( shortcode );
		safeData = window.encodeURIComponent( shortcode );
        classes = 'mceNonEditable cl-panel';
        
        out = '<div data-shortcode="' + safeData + '"';
        if(parsed.reverse == 'true') {
            classes += ' reverse';
        }
        out += ' class="' + classes + '">';
        out += '<figure>'
        if(parsed.img) {
            out += '<img alt="' + parsed.alt + '" src="' + parsed.img + '"/>';
        }
        out += '</figure>';
        out += '<article>';
        if(parsed.title) {
            out += '<h1>' + parsed.title + '</h1>';
        }
        if(parsed.content) {
            out += '<p>' + parsed.content + '</p>';
        }
        out += '</article>';
        out += '</div>';
		
		return out;
	}
	
	function restorePanelShortcodes( content ) {
		var html, els, i, t;
		
		// convert the content string into a DOM tree so we can parse it easily
		html = document.createElement('div');
		html.innerHTML = content;
		els = html.querySelectorAll('.cl-panel');
		
		for(i=0; i<els.length; i++) {
			t = document.createTextNode( window.decodeURIComponent(els[i].getAttribute('data-shortcode')) );
			els[i].parentNode.replaceChild(t, els[i]);
		}
		
		//return the DOM tree as a string
		return html.innerHTML;
	}
	
	function generatePanelShortcode(params) {

		var attributes = [];
        
		for(i in params) {
            if(i != 'content') {
                attributes.push(i + '="' + params[i] + '"');
            }
		}
		
		return '[cl-panel ' + attributes.join(' ') + ']' + params.content + '[/cl-panel]';

	}





	tinymce.create('tinymce.plugins.uri_wysiwyg_panel', {
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
			ed.addButton('CLPanel', {
				title : 'Panel',
				text : '',
				cmd : 'CLPanel',
				image : url + '/i/panel@2x.png'
			});
		
			// add a js callback for the button
			ed.addCommand('CLPanel', function(args) {
			
				// create an empty object if args is empty
				if(!args) {
					args = {}
				}
				// create an empty property so nothing is null
				var possibleArgs = ['img', 'alt', 'title', 'reverse', 'content'];
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
					title: 'Insert / Update Panel',
					body: [
                        {type: 'textbox', name: 'alt', id: 'alt', value: args.alt, subtype: 'hidden'},
						{type: 'textbox', name: 'img', id: 'img', value: args.img, subtype: 'hidden'},
						{type: 'container', label: ' ', html: '<div id="wysiwyg-img-preview">' + imageEl + '</div>'},
                        {type: 'button', label: 'Image', text: 'Choose an image', onclick: URIWYSIWYG.mediaPicker},
						{type: 'textbox', name: 'title', label: 'Title', value: args.title},
                        {type: 'textbox', multiline: 'true', name: 'content', label: 'Content', value: args.content},
                        {type: 'checkbox', name: 'reverse', label: 'Reverse', checked: args.reverse }
					],
					onsubmit: function(e) {
						// Insert content when the window form is submitted
						e.data = URIWYSIWYG.escapeQuotesDeep(e.data);						
						shortcode = generatePanelShortcode(e.data);
						ed.execCommand('mceInsertContent', 0, shortcode);
					}
				},
				{
					wp: wp,
				});

			});
            
			ed.on( 'BeforeSetContent', function( event ) {
				event.content = URIWYSIWYG.replaceShortcodes( event.content, 'cl-panel', false, renderPanel );
			});

			ed.on( 'PostProcess', function( event ) {
				if ( event.get ) {
					event.content = restorePanelShortcodes( event.content );
				}
			});

			//open popup on placeholder double click
			ed.on('DblClick',function(e) {
				var isCard = false, card, sc, attributes;
				card = e.target;
				while ( isCard === false && card.parentNode ) {
					if ( card.className.indexOf('cl-panel') > -1 ) {
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
					ed.execCommand('CLPanel', attributes);
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
	tinymce.PluginManager.add( 'uri_wysiwyg_panel', tinymce.plugins.uri_wysiwyg_panel );


})();

