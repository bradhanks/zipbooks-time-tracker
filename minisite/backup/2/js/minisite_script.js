	
	( function ( document ) {

		var ajax = {
		
			get: function ( url, success_callback, failure_callback ) {
				
				var request = new XMLHttpRequest();
				request.open('GET', url, true);

				request.onload = function() {
				  if (request.status >= 200 && request.status < 400) {
					// Success!
					success_callback( request.responseText );
				  } else {
					// We reached our target server, but it returned an error
					failure_callback();
				  }
				};

				request.onerror = function() {
				  // There was a connection error of some sort
				  failure_callback();
				};

				request.send();

			},
			
			post: function ( url, data, success_callback, failure_callback ) {
				
				var request = new XMLHttpRequest();
				request.open('POST', url, true);

				request.onload = function() {
				  if (request.status >= 200 && request.status < 400) {
					// Success!
					success_callback( request.responseText );
				  } else {
					// We reached our target server, but it returned an error
					failure_callback();
				  }
				};

				request.onerror = function() {
				  // There was a connection error of some sort
				  failure_callback();
				};
				
				request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				request.send(data);

			},
		
			delete: function ( url, success_callback, failure_callback ) {
				
				var request = new XMLHttpRequest();
				request.open('DELETE', url, true);

				request.onload = function() {
				  if (request.status >= 200 && request.status < 400) {
					// Success!
					success_callback( request.responseText );
				  } else {
					// We reached our target server, but it returned an error
					failure_callback();
				  }
				};

				request.onerror = function() {
				  // There was a connection error of some sort
				  failure_callback();
				};

				request.send();

			}
		
		}
		
		var view = {
			
			display_message: function ( message ) {
				alert( message );
			}			
			
		};
		
		var form = {
			
			// USER DATA
			user_email: function () {
				var number = document.getElementsByName('new_user_email')[0].value;
				if ( number ) {
					return number;
				} else {
					throw "Your Email";
				}
			},
			user_first_name: function () {
				var name = document.getElementsByName('new_user_first_name')[0].value;
				if ( name ) {
					return name;
				} else {
					throw "Your First Name";
				}
			},
			user_last_name: function () {
				var name = document.getElementsByName('new_user_last_name')[0].value;
				if ( name ) {
					return name;
				} else {
					throw "Your Last Name";
				}
			},
			user_address_1: function () {
				return document.getElementsByName('new_user_address_1')[0].value || '';
			},
			user_address_2: function () {
				return document.getElementsByName('new_user_address_2')[0].value || '';
			},
			user_city: function () {
				return document.getElementsByName('new_user_city')[0].value || '';
			},
			user_state: function () {
				return document.getElementsByName('new_user_state')[0].value || '';
			},
			user_postal_code: function () {
				return document.getElementsByName('new_user_postal_code')[0].value || '';
			},
			user_country: function () {
				return document.getElementsByName('new_user_country')[0].value || '';
			},
			
			// CUSTOMER DATA
			customer_name: function () {
				var customer_name = document.getElementsByName('new_customer_name')[0].value;
				if ( customer_name ) {
					return customer_name;
				} else {
					throw "Customer's Name";
				}
			},
			customer_email: function () {
				var customer_email = document.getElementsByName('new_customer_email')[0].value;
				if ( customer_email ) {
					return customer_email;
				} else {
					throw "Customer's Email";
				}
			},
			customer_address_1: function () {
				return document.getElementsByName('new_customer_address_1')[0].value || '';
			},
			customer_address_2: function () {
				return document.getElementsByName('new_customer_address_2')[0].value || '';
			},
			customer_city: function () {
				return document.getElementsByName('new_customer_city')[0].value || '';
			},
			customer_state: function () {
				return document.getElementsByName('new_customer_state')[0].value || '';
			},
			customer_postal_code: function () {
				return document.getElementsByName('new_customer_postal_code')[0].value || '';
			},
			customer_country: function () {
				return document.getElementsByName('new_customer_country')[0].value || '';
			},
			
			//INVOICE DATA
			number: function () {
				var number = document.getElementsByName('number')[0].value
				if ( number ) {
					return number;
				} else {
					throw 'Invoice Number';
				}
			},
			date: function () {
				var date = document.getElementsByName('date')[0].value;
				if ( date && /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/.test( date ) ) {
					var components = date.split('/');
					return components[2]+'-'+components[0]+'-'+components[1];
				} else {
					throw 'Invoice Date';
				}
			},
			discount: function () {
				var discount = document.getElementsByName('discount')[0].value;
				if ( discount && /^[0-9]+\.?[0-9]*%$/.test(discount) ) {
					return discount;
				} else {
					return '';
				}
			},
			terms: function () {
				return document.getElementsByName('terms')[0].value || '';
			},
			notes: function () {
				return document.getElementsByName('notes')[0].value || '';
			},
			lineItems: function () {
				var items = document.querySelectorAll('*[name^="lineItems"]');
				var items_string = '';
				for ( var i = 0; i < items.length; i++ ) {
					items_string += '&' + items[i].name + '=' + items[i].value;
				}
				return items_string;
			},
			
			// MISC
			total: function () {
				return document.querySelector('.text-right.total').innerText || '$0.00';				
			},
			
			// SUMMARY
			get_data: function () {
				try {
					return {
						
						'user_email': form.user_email(),
						'user_first_name': form.user_first_name(),
						'user_last_name': form.user_last_name(),
						'user_address_1': form.user_address_1(),
						'user_address_2': form.user_address_2(),
						'user_city': form.user_city(),
						'user_state': form.user_state(),
						'user_postal_code': form.user_postal_code(),
						'user_country': form.user_country(),
						
						'customer_name': form.customer_name(),
						'customer_email': form.customer_email(),
						'customer_address_1': form.customer_address_1(),
						'customer_address_2': form.customer_address_2(),
						'customer_city': form.customer_city(),
						'customer_state': form.customer_state(),
						'customer_postal_code': form.customer_postal_code(),
						'customer_country': form.customer_country(),
						
						'number': form.number(),
						'date': form.date(),
						'discount': form.discount(),
						'accept_credit_cards': '1',
						'terms': form.terms(),
						'notes': form.notes(),
						'lineItems': form.lineItems(),
						
						'total': form.total()
						
					};
				} catch ( message ) {
					view.display_message( 'Please, Enter ' + message );
					return false;
				}
			}
			
		};

		var observers = {

			'send_invoice_click': function () {
				
				var data = form.get_data();
				console.log( data );
				
				if ( data ) {
					ajax.post(
						'php/post.php',
						JSON.stringify( data ),
						function ( response ) {
							console.log( response );
							if ( response === 'success' ) {
								view.display_message( 'Your Invoice Has Been Sent' );
							} else {
								view.display_message( 'Your Invoice Has Not Been Sent' );
							}
						},
						function () {
							view.display_message( 'Sorry, Network Error' );
						}
					);
				}
			
			}

		};
		
		minisite_send_invoice.addEventListener( 'click', observers[ 'send_invoice_click' ] );
		
	} ( document ) );
	
	
	
	
	