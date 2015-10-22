
	V.PageManager = function ( window ) {
		
		return {
			
			get_task_name: function () {
				return window.document.querySelector('#details_property_sheet_title').value;
			},
			get_project_name: function () {
				return window.document.querySelector('.header-atm-title').innerHTML.replace( 'My Tasks in ', '' );
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
	
	
	
	
	
	
	