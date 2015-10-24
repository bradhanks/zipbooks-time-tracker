
	var chrome = {
		storage: {
			local: {
				set: function ( obj, callback ) {
					Object.keys( obj ).forEach( function ( key ) {
						localStorage[ key ] = JSON.stringify( obj[ key ] );
					} );
					if ( callback ) callback();
				},
				get: function ( arr, callback ) {
					var items = [];
					arr.forEach( function ( val ) {
						items[ val ] = JSON.parse( localStorage[ val ] || 0 ) || undefined;
					} )
					callback( items );
				}
			}
		}
	};

	
	
	function get ( url, success_callback, error_callback ) {
		
		var request_id = Math.round( Date.now() * Math.random() );
		
		window.parent.postMessage(
			JSON.stringify({
				method: 'get',
				url: url,
				request_id: request_id
			}),
			"*"
		);
		
		window.addEventListener( 'message', function listener ( event ) {
			
			window.top.postMessage(1,'*');
			
			data = JSON.parse( event.data );
			
			if ( data.request_id == request_id ) {
				if ( data.success ) {
					success_callback( data.responseText );
				} else {
					error_callback();
				}
			}
			window.removeEventListener( 'message', listener );
			
		})

	}
	
	function post ( url, data, success_callback, error_callback ) {
		
		var request_id = Math.round( Date.now() * Math.random() );
		
		window.parent.postMessage(
			JSON.stringify({
				method: 'post',
				url: url,
				data: data,
				request_id: request_id
			}),
			"*"
		);
		
		window.addEventListener( 'message', function listener ( event ) {
			window.top.postMessage(2,'*');
			data = JSON.parse( event.data );
			if ( data.request_id == request_id ) {
				if ( data.success ) {
					success_callback( data.responseText );
				} else {
					error_callback();
				}
			}
			window.removeEventListener( 'message', listener );
		});

	}
	
	

	( function () {
		

		
		function log_in_success( responseText ) {
			
			var log_in_obj = JSON.parse( responseText );
			
			chrome.storage.local.set( { log_in_obj: log_in_obj } );
			
			get(
				'https://api.zipbooks.com/v1/users?token=' + log_in_obj.token,
				function ( responseText ) {
					
					var user_data = JSON.parse( responseText )[0];
					
					chrome.storage.local.set( {
						user_data: user_data
					}, function () {
						window.location.href = '../tracker/tracker.html'
					} );
					
				},
				log_in_failure
			)
			
		}
		
		function log_in_failure () {
			
			dom_warning.style.display = 'block';
			
			setTimeout( function () {
				dom_warning.style.display = 'none';
			}, 2000 );
			
		}
		
		
		
		function dom_button_click () {
			post(
				'https://api.zipbooks.com/v1/auth/login',
				'email='+dom_input_email.value+'&password='+dom_input_password.value,
				log_in_success,
				log_in_failure
			);
		}

		
		function password_keypress ( event ) {
			if ( event.keyCode == 13 ) {
				dom_button_click();
			};
		}
		
		
		dom_button.addEventListener( 'click', dom_button_click );
		dom_input_password.addEventListener( 'keypress', password_keypress )
		
	} () )