
	var chrome = {
		storage: {
			local: {
				set: function ( obj ) {
					Object.keys( obj ).forEach( function ( key ) {
						localStorage[ key ] = JSON.stringify( obj[ key ] );
					} )
				},
				get: function ( arr, callback ) {
					var items = [];
					arr.forEach( function ( val ) {
						items[ val ] = localStorage[ val ];
					} )
					callback( items );
				}
			}
		}
	};
	
	
	function get ( url, success_callback, error_callback ) {
		
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
			// Success!
			success_callback( request.responseText );
		  } else {
			// We reached our target server, but it returned an error
			error_callback();
		  }
		};

		request.onerror = function() {
		  // There was a connection error of some sort
		  error_callback();
		};

		request.send();

	}
	
	function post ( url, data, success_callback, error_callback ) {
		
		var request = new XMLHttpRequest();
		request.open('POST', url, true);

		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
			// Success!
			success_callback( request.responseText );
		  } else {
			// We reached our target server, but it returned an error
			error_callback();
		  }
		};

		request.onerror = function() {
		  // There was a connection error of some sort
		  error_callback();
		};
		
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send(data);

	}

	window.addEventListener( 'message', function ( e ) {
		
		if ( typeof e != 'undefined' ) {
			
			data = JSON.parse( e.data );
			
			console.log('****');
			console.log(data.request_id);
			console.log('****');
			
			function success_callback ( responseText ) {
			
			console.log('+++++');
			console.log(data.request_id);
			console.log('+++++');
			
				dom_iframe.contentWindow.postMessage(
					JSON.stringify({
						success: true,
						responseText: responseText,
						request_id: data.request_id
					}),
					"*"
				)
			}
			
			function error_callback () {
				dom_iframe.contentWindow.postMessage(
					JSON.stringify({
						success: false,
						request_id: data.request_id
					}),
					"*"
				);
			}
	
			
			if ( data.method == 'post' ) {
				post(
					data.url,
					data.data,
					success_callback,
					error_callback
				)
			} else if ( data.method == 'get' ) {
				get(
					data.url,
					success_callback,
					error_callback
				)
			} else {
				console.log( data );
			}
		
		} else {
			console.log( 'evnt ndfnd' );
		}
	
	} );


	
	var iframe_height = 0;
	
	chrome.storage.local.get([ 'log_in_obj'], function ( items ) {
		
		if ( typeof items[ 'log_in_obj' ] !== 'undefined' ) {
			dom_iframe.src = '../pages/tracker/tracker.html'
		} else {
			dom_iframe.src = '../pages/login/login.html'
		}
		
	});
	
	setInterval( function () {
		
		if ( dom_iframe.contentDocument.body ) {
		
			var height = dom_iframe.contentDocument.body.clientHeight;
	
			if ( iframe_height !== height ) {
				
				document.body.style.height = height + 'px';
				iframe_height = height;
				self.port.emit( 'height_change', height );
				
			}
		
		}
	
	}, 100 );
	
