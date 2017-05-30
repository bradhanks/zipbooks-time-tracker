
	( function () {

		function tick () {

			x.bg_api.exec( "api_manager", "set_token", localStorage[ "production-zb-token" ] );

		};

		setInterval( tick, 1000 );
		tick();

	} () );