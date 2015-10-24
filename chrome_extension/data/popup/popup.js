	
	( function () {
		
		var iframe_height = 0;
		
		chrome.storage.local.get( ['log_in_obj'], function ( items ) {
			
			if ( typeof items[ 'log_in_obj' ] !== 'undefined' ) {
				dom_iframe.src = '../pages/tracker/tracker.html'
			} else {
				dom_iframe.src = '../pages/login/login.html'
			}
			
		} )
		
		setInterval( function () {
			
			if ( dom_iframe.contentDocument.body ) {
			
				var height = dom_iframe.contentDocument.body.clientHeight;
		
				if ( iframe_height !== height ) {
					
					document.body.style.height = height + 'px';
					iframe_height = height;
					
				}
			
			}
		
		}, 100 );
		
	} () )
	