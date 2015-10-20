	
	// VARIABLES
	var
		button,
		panel;
		
	// FUNCTIONS
	function toggle_button_click ( state ) {
		if ( state.checked ) {
			panel.show({
				position: button
			});
		}
	}
	
	function panel_hide () {
		button.state( "window", {
			checked: false
		});
	}	
	
	// PROGRAM
	button = require('sdk/ui/button/toggle').ToggleButton({
		id: "zipbooks-popup",
		label: "zipbooks",
		icon: {
			"16": "./img/zipbooks.png",
			"32": "./img/zipbooks.png",
			"64": "./img/zipbooks.png"
		},
		onClick: toggle_button_click
	});

	panel = require('sdk/panel').Panel({
		width: 303,
		contentURL: "./popup/popup.html",
		contentScriptFile: "./popup/popup.js",
		onHide: panel_hide
	});
	
	panel.port.on( 'height_change', function( height ){
		panel.resize( 303, height + 3 );
	});
	
	
	
	
	