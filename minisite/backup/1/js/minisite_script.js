	
	( function () {
		
		var data = {
			
			
		}
		
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
		
		var form = {
			
			// USER DATA
			
			user_email: function () {
				var number = document.getElementsByName('new_user_email')[0].value;
				if ( number ) {
					return number;
				} else {
					throw 'number';
				}
			},
			
			// CUSTOMER DATA
			
			customer_name: function () {
				var customer_name = document.getElementsByName('new_customer_name')[0].value;
				if ( customer_name ) {
					return customer_name;
				} else {
					throw 'customer_name';
				}
			},
			
			customer_email: function () {
				var customer_email = document.getElementsByName('new_customer_email')[0].value;
				if ( customer_email ) {
					return customer_email;
				} else {
					throw 'customer_email';
				}
			},
			
			
			//INVOICE DATA
			
			number: function () {
				var number = document.getElementsByName('number')[0].value
				if ( number ) {
					return number;
				} else {
					throw 'number';
				}
			},
			
			date: function () {
				var date = document.getElementsByName('date')[0].value;
				if ( date && /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/.test( date ) ) {
					var components = date.split('/');
					return components[2]+'-'+components[0]+'-'+components[1];
				} else {
					throw 'date';
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
			}
			
		}
		
		var zipbooks = {
			
			create_user: function ( data, success_callback, failure_callback ) {
				ajax.post(
					'https://api.zipbooks.com/v1/auth/signup',
					'email='+data.email+
					'&password='+data.password,
					success_callback,
					failure_callback
				);
			},
			
			create_customer: function ( data, success_callback, failure_callback ) {
				ajax.post(
					'https://api.zipbooks.com/v1/customers?token='+data.token,
					'name='+data.name+
					'&email='+data.email,
					success_callback,
					failure_callback
				);
			},
			
			create_invoice: function ( data, success_callback, failure_callback ) {
				ajax.post(
					'https://api.zipbooks.com/v1/invoices?token='+data.token,
					'customer='+data.customer+
					'&number='+data.number+
					'&date='+data.date+
					'&discount='+data.discount+
					'&accept_credit_cards='+data.accept_credit_cards+
					'&terms='+data.terms+
					'&notes='+data.notes+
					data.lineItems,
					success_callback,
					failure_callback
				);
			},
			
			send_invoice: function ( data, success_callback, failure_callback ) {
				ajax.post(
					'https://api.zipbooks.com/v1/invoices/'+data.id+'/send?token='+data.token,
					'send_to='+data.send_to+
					'&subject='+data.subject+
					'&message='+data.message+
					'&attach_pdf='+data.attach_pdf,
					success_callback,
					failure_callback
				);
			},
			
			delete_user: function ( data, success_callback, failure_callback ) {
				ajax.delete(
					'https://api.zipbooks.com/v1/users/'+data.id+'?token='+data.token,
					success_callback,
					failure_callback
				);
			}
			
		}
		
		var observers = {

			'send_invoice_click': function () {
				zipbooks.create_user(
					{
						email: form.user_email(),
						password: 'password'
					},
					function ( response ) {
						observers['zipbooks_user_created']( JSON.parse(response) );
					},
					function () {
						
					}
				)
			},

			'zipbooks_user_created': function ( response ) {
				data.user = response;
				zipbooks.create_customer(
					{
						token: data.user.token,
						name: form.customer_name(),
						email: form.customer_email()
					},
					function ( response ) {
						observers['zipbooks_customer_created']( JSON.parse(response) );
					},
					function () {}
				);
			},
		
			'zipbooks_customer_created': function ( response ) {		
				data.customer = response;
				zipbooks.create_invoice(
					{
						token: data.user.token,
						customer: response.id,
						number: form.number(),
						date: form.date(),
						discount: form.discount(),
						accept_credit_cards: 0,
						terms: form.terms(),
						notes: form.notes(),
						lineItems: form.lineItems()
					},
					function ( response ) {
						observers['zipbooks_invoice_created']( JSON.parse(response) );
					},
					function () {}
				);
			},
			
			'zipbooks_invoice_created': function ( response ) {
				data.invoice = response;
				zipbooks.send_invoice(
					{
						token: data.user.token,
						id: data.invoice.id,
						send_to: data.customer.email,
						subject: 'ZipBooks Email',
						message: 'ZipBooks Email',
						attach_pdf: 1
					},
					function ( response ) {
						observers['zipbooks_invoice_sent']( JSON.parse(response) );
					},
					function () {}
				);
			},
			
			'zipbooks_invoice_sent': function ( response ) {
				zipbooks.delete_user(
					{
						token: data.user.token,
						id: data.customer.account_id
					},
					function ( response ) {
						
					},
					function () {}
				)
			}
		
		}
		
		minisite_send_invoice.addEventListener( 'click', observers[ 'send_invoice_click' ] );
		
	} () );