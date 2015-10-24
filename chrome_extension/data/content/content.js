
	V.PageManager = function ( window ) {
		
		return {
			
			get_task_name: function () {
				var element = window.document.querySelector('#details_property_sheet_title');
				if ( element ) {
					return element.value
				} else {
					return false;
				}
			},
			get_project_name: function () {
				var element = window.document.querySelector('.header-atm-title, #project_pane_header_name');
				if ( element ) {
					return element.innerText.replace( 'My Tasks in ', '' )
				} else {
					return false
				}
			}
			
		};
		
	};

	( function ( window ) {
		
		var obj = {};
		
		obj.hub = new V.EventHub( 'content_scirpt_hub', { window: window, chrome: chrome } );
		obj.page_manager = new V.PageManager( window );
		
		obj.hub.add({
			
			'page_data_request': function ( data ) {
				data.callback({
					task_name: obj.page_manager.get_task_name(),
					project_name: obj.page_manager.get_project_name()
				});
			}
			
		});
		
	} ( window ) );
	
	console.log( 'content script loaded' );
	
	
	
	
	
	
	