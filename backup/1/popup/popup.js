	
	( function () {
		
		chrome.storage.local.get( 'log_in_obj', function ( items ) {
			
			if ( typeof items[ 'log_in_obj' ] !== 'undefined' ) {
				dom_iframe.src = '/pages/tracker/tracker.html'
			} else {
				dom_iframe.src = '/pages/login/login.html'
			}
			
		} )
		
	} () )
	