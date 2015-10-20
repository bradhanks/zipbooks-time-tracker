
	( function () {
		
		
		
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
						window.location.href = '/pages/tracker/tracker.html'
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
		
		
		
		dom_button.addEventListener( 'click', dom_button_click );
		
		
		
		chrome.storage.local.get( 'log_in_obj', function ( items ) {
			
			if ( typeof items[ 'log_in_obj' ] !== 'undefined' ) {
				window.location.href = '/pages/tracker/tracker.html'
			}
			
		} )
		
		
		
	} () )