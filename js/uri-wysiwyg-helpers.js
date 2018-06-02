/**
 * Helper functions for URI WYSIWYG
 */

class URIWYSIWYG {

	// escapes quotes on every element in an array (if element is a string)
	static escapeQuotesDeep(a) {
		for(i in a) {
			if(typeof a[i] === 'string') {
				a[i] = this.escapeQuotes(a[i]);
			}
		}
		return a;
	}

	// replace quotes with curly quotes
	static escapeQuotes(s) {
		s = s.replace(/"\b/g, "&#8220;");
		s = s.replace(/"/g, "&#8221;");
		return s;
		return s.replace(/"/g, '%25');
	}
	
	// unescapes quotes on every element in an array (if element is a string)
	static unEscapeQuotesDeep(a) {
		for(i in a) {
			if(typeof a[i] === 'string') {
				a[i] = this.unEscapeQuotes(a[i]);
			}
		}
		return a;
	}

	// replace %25 with "
	static unEscapeQuotes(s) {
		return s.replace(/%25/g, '"');
	}

	/**
	 * Replace HTML ASCII characters with their HTML entities
	 * Specifically, replace &, ", ', <, and >
	 * note: replaces straight quotes (double primes) with curly quotes
	 *
	 * @param str s
	 * @return str
	 */
	static htmlEscape(s) {
		// tend to quotes... using the entities here will cause the visual editor to
		// display them literally, that's why this doesn't call escapeQuotes()
		
		// replace all quotes before a word boundary with an opening curly quote
		s = s.replace(/"\b/g, "“");
		// replace the rest of the quotes with a closing curly quote
		s = s.replace(/"/g, "”");
		
		return s
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&#34;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
	
	/**
	 * Replace HTML entities with their ASCII characters
	 * @see htmlEscape()
	 * @param str s
	 * @return str
	 */
	static htmlUnescape(s) {
		return s
			.replace(/&#34;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&');
	}
	

	
	/* Replace shortcode with HTML
	 * @param content string The editor content
	 * @param shortcodeName string The shortcode name
	 * @param selfclosing bool Whether the shortcode is self-closing
	 * @param callback function The callback function
	 */
	static replaceShortcodes( content, shortcodeName, selfclosing, callback ) {

		var re = selfclosing ? new RegExp('\\[' + shortcodeName + '([^\\]]*)\\]', 'g') : new RegExp('\\[' + shortcodeName + '.+?\\[/' + shortcodeName + '\\]', 'g');
        
		return content.replace( re, function( match ) {
			return callback( match );
		});
	}

	
	/* Parses a short code and returns an array of attributes
	 * @param sc string The shortcode
	 */
	static parseShortCodeAttributes(sc) {
	
		var attributes, atts, innerContent, x, t;
        
		attributes = {};
		atts = sc.match(/[\w-]+="[^"]*"/gi);

		for ( x in atts ) {
			t = atts[x].split('=');
			t[1] = t[1].replace(/\"/gi, '');	
			attributes[t[0]] = t[1];
		}
        
		innerContent = sc.match(/\].+?\[/gi);
		if (innerContent) {
			attributes['content'] = innerContent[0].replace(/^\]|\[$/gi,'').trim();
		}
                
		return attributes;
	}
    
	/* Replace HTML with shortcode
	 * @param content string The editor content
	 * @param sc string The shortcode name
	 */
	static restoreShortcodes( content, sc ) {
		var html, els, i, t;
		
// 		if(sc == 'cl-button') {
// 			console.log("content");
// 			console.log(content);
// 		}

	
		// convert the content string into a DOM tree so we can parse it easily
		html = document.createElement('div');
		html.innerHTML = content;
		els = html.querySelectorAll('.' + sc);
	
		for(i=0; i<els.length; i++) {
			t = document.createTextNode( window.decodeURIComponent(els[i].getAttribute('data-shortcode')) );
// 			if(sc == 'cl-button') {
// 				console.log("t");
// 				console.log(t);
// 			}
			els[i].parentNode.replaceChild(t, els[i]);
		}

		//return the DOM tree as a string
		var out = this.htmlUnescape( html.innerHTML );
// 		if(sc == 'cl-button') {
// 			console.log("html.innerHTML");
// 			console.log(html.innerHTML);
// 			console.log("out");
// 			console.log(out);
// 		}
		return out;
		//return html.innerHTML;
	}
    
    
	// invokes the wp media picker from a tinymce modal
	static mediaPicker(e) {
		e.preventDefault();
		var imgurl, altEl, picker, alt;
		
		imgurl = document.getElementById('img');
		altEl = document.getElementById('alt');
		picker = wp.media.frames.file_frame = wp.media({
			title: 'Select an image',
			button: {text: 'Add an image'},
			multiple: false
		});		
		
		picker.on('select', function() {
			var attachment = picker.state().get('selection').first().toJSON();
			imgurl.value = attachment.sizes.full.url;
			if(!altEl.value){
				if(attachment.alt) {
					alt = attachment.alt;
				} else if(attachment.title) {
					alt = attachment.title;
				} else {
					alt = '';
				}
				altEl.value = alt;
			}
			URIWYSIWYG.mediaPickerPreview(imgurl.value, altEl.value);
		});
		picker.open();
	}
	
	static mediaPickerPreview(src, alt) {
		var preview;
		preview = document.createElement('img');
		preview.src = src;
		preview.alt = alt;
		document.getElementById('wysiwyg-img-preview').innerHTML = '';
		document.getElementById('wysiwyg-img-preview').appendChild(preview);
	}
    
	static openPopup(target, ed, cName, wName) {
		var isTarget = false, sc, attributes;
		while ( isTarget === false && target.parentNode ) {
			if ( target.className.indexOf(cName) > -1 ) {
				isTarget = true;
			} else {
				if(target.parentNode) {
					target = target.parentNode;
				}
			}
		}

		if ( isTarget ) {
			sc = window.decodeURIComponent( target.getAttribute('data-shortcode') );
			attributes = URIWYSIWYG.parseShortCodeAttributes(sc);
			ed.execCommand(wName, attributes);
		}
   }
	
}