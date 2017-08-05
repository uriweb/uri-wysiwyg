/**
 * Helper functions for URI WYSIWYG
 */

class URIWYSIWYG {

	//
	static escapeQuotesDeep(a) {
		for(i in a) {
			if(typeof a[i] === 'string') {
				a[i] = this.escapeQuotes(a[i]);
			}
		}
		return a;
	}
	//
	static escapeQuotes(s) {
		return s.replace(/"/g, '%25');
	}
	
	//
	static unEscapeQuotesDeep(a) {
		for(i in a) {
			if(typeof a[i] === 'string') {
				a[i] = this.unEscapeQuotes(a[i]);
			}
		}
		return a;
	}
	//
	static unEscapeQuotes(s) {
		return s.replace(/%25/g, '"');
	}
	
	//
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