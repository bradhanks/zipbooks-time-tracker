	
	var V = {};

	V.EventHub = function ( hub_name, deps ) {
		
		var obj = {
			
			events: {},
	
			add_one: function ( name, observer ) {
			
				if ( typeof obj.events[ name ] === 'undefined' ) {
				
					obj.events[ name ] = [];

				}
				
				obj.events[ name ].push( observer );
			
			},
	
			add: function ( observers ) {
		
				Object.keys( observers ).forEach( function ( name ) {

					obj.add_one( name, observers[ name ] );

				});
			
			},
			
			remove: function ( name ) {
				obj.events[ name ] = undefined;
			},
			
			fire: function ( data ) {
				
				if ( obj.events[ data.name ] !== undefined && data.custom_event !== true ) {
				
					console.log( hub_name, 'fired', data );
					
					obj.events[ data.name ].forEach( function ( observer ) {
					
						observer( data );
					
					});
				
				};
				
				if ( data.custom_event === true && deps.window !== undefined ) {
					
					console.log( hub_name, 'dispatched', data );
					
					data.custom_event = false;
					
					deps.window.document.dispatchEvent(
						new CustomEvent(
							'V_CUSTOM_EVENT',
							{
								detail: data
							}
						)
					)
					
				};
			
				if ( data.runtime === true && deps.chrome !== undefined ) {
					
					console.log( hub_name, 'send_to_runtime', data );
					
					data.runtime = false;
					deps.chrome.runtime.sendMessage( data, data.callback );
					
				};
				
				if ( data.tab_id !== undefined && deps.chrome !== undefined ) {
					
					console.log( hub_name, 'send_to_tab', data );
					
					deps.chrome.tabs.sendMessage( data.tab_id, data, data.callback );
					
				};
				
			}
		
		};
		
		if ( deps.chrome !== undefined ) {
			deps.chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {
			
				console.log( hub_name, 'caught_runtime_message', message );
				
				message.callback = callback;
				message.sender = sender;
				message.tab_id = undefined;
				obj.fire( message );
				return true;
			});
		};
		
		if ( deps.window !== undefined ) {
			deps.window.document.addEventListener( 'V_CUSTOM_EVENT', function ( event ) {
			
				console.log( hub_name, 'caught_custom_event', event.detail );
				
				if ( event.detail ) {
					event.detail.custom_event = false;
					obj.fire( event.detail );
				}
			});
		};
	
		return {
			
			fire: obj.fire,
			add: obj.add
			
		};
		
	};
	