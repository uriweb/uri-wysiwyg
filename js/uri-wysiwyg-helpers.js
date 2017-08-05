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

	// replace " with %25
	static escapeQuotes(s) {
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
	
	// replace a button with a callback
	static replaceShortcodes( content, shortcodeName, callback ) {
		var re = new RegExp("\\[" + shortcodeName + "([^\\]]*)\\]", "g");
		return content.replace( re, function( match ) {
			return callback( match );
		});
	}

	
	// parses a short code and returns an array of attributes
	static parseShortCodeAttributes(sc) {
		var attributes, atts, x, t;
				
		attributes = {};
		atts = sc.match(/[\w-]+="[^"]*"/gi);

		for ( x in atts ) {
			t = atts[x].split('=');
			t[1] = t[1].replace(/\"/gi, '');	
			attributes[t[0]] = t[1];
		}

		return attributes;
	}
	
}