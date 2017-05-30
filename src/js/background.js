
	function timer () {

		var timer_data = {

			time: 0,
			active: false,
			last_breakpoint_ts: null,

		};

		var interval = null

		function time_to_str ( time ) {

			var full_hours = Math.floor( time / ( 60 * 60 * 1000 ) );
			var total_full_minutes = Math.floor( time / ( 60 * 1000 ) );
			var total_full_seconds = Math.floor( time / 1000 );

			var full_minutes = total_full_minutes - full_hours * 60;
			var full_seconds = total_full_seconds - total_full_minutes * 60;

			return full_hours + ":" + x.util.pad( full_minutes );

		};

		function render_timer_data ( timer_data ) {

			if ( timer_data.active ) {

				chrome.browserAction.setBadgeText({

					text: time_to_str( timer_data.time ),

				});

			} else {

				chrome.browserAction.setBadgeText({ text: "" });

			};

		};

		function tick () {

			if ( timer_data.active ) {

				increment_time();
				render_timer_data( timer_data );

			};

		};

		function increment_time () {

			var date_now = Date.now();

			timer_data.time += date_now - timer_data.last_breakpoint_ts;
			timer_data.last_breakpoint_ts = date_now;

		};

		( function () {

			render_timer_data( timer_data );

		} () );

		return {

			start: function ( data ) {

				timer_data.last_breakpoint_ts = data.ts;
				timer_data.active = true;
				inverval = setInterval( tick, 50 );

				render_timer_data( timer_data );

				return timer_data;

			},

			pause: function ( data ) {

				timer_data.active = false;
				clearInterval( interval );
				increment_time();

				render_timer_data( timer_data );

				return timer_data;

			},

			reset: function () {

				timer_data.time = 0;
				timer_data.active = false;
				clearInterval( interval );

				render_timer_data( timer_data );

				return timer_data;

			},

			get_timer_data: function () {

				return timer_data;

			},

		};

	};

	function storage () {

		var items = {};

		return {

			set: function ( data_arr ) {

				items[ data_arr[ 0 ] ] = data_arr[ 1 ];

			},

			get: function () {

				return items;

			}

		};

	};

	function api_manager () {

		var user_data = {

			autorized: false,
			token: null,
			user_id: null,

		};

		var pub = {

			submit_time: function ( data ) {

				var date = new Date();
				var date_str = date.getFullYear() + "-" + x.util.pad( date.getMonth() + 1 ) + "-" + date.getDate();

				return x.ajax({

					url: "https://app.zipbooks.com/v1/time_entries",
					method: "post_json_get_json",
					headers: {
						
						authorization: "Bearer " + user_data.token

					},
					body: {

						date: date_str,
						note: data.notes,
						task_id: data.task_id,
						duration: data.duration,
						user_id: user_data.user_id,

					}

				}).then( function ( response ) {

					if ( typeof response.message === "undefined" ) {

						return {

							success: true,

						};

					} else {

						return {

							success: false,
							messsage: response.messsage,

						};

					};

				});

			},

			get_tasks: function () {

				return x.ajax({

					method: "get_json",
					url: "https://app.zipbooks.com/v1/tasks",
					headers: {
						
						authorization: "Bearer " + user_data.token

					}

				});

			},

			get_api_data: function () {

				return new Promise( function ( resolve ) {

					if ( user_data.token ) {

						Promise.all([

							x.ajax({

								method: "get_json",
								url: "https://app.zipbooks.com/v2/users/me",
								headers: {

									authorization: "Bearer " + user_data.token,

								}

							}),
							x.ajax({

								method: "get_json",
								url: "https://app.zipbooks.com/v1/tasks",
								headers: {
									
									authorization: "Bearer " + user_data.token,

								}

							})

						]).then( function ( response_arr ) {

							if ( typeof response_arr[ 0 ].errors === "undefined" ) {

								resolve({

									tasks: response_arr[ 1 ],
									user_data: {
										
										autorized: true,
										token: user_data.token,
										user_id: response_arr[ 0 ].data.id,
										
									},

								});

							} else {

								resolve({

									tasks: null,
									user_data: {

										autorized: false,
										token: null,
										user_id: null,

									}

								});

							};

						});

					} else {

						resolve({

							tasks: null,
							user_data: {

								autorized: false,
								token: null,
								user_id: null,

							}

						});

					};

				});

			},

			update_api_data: function () {

				return pub.get_api_data()
				.then( function ( api_data ) {

					user_data = api_data.user_data;
					return api_data;

				});

			},

			set_token: function ( token ) {

				user_data.token = token;

			},

		};

		return pub;

	};

	( function () {

		x.bg_api.register( "timer", timer() );
		x.bg_api.register( "storage", storage() );
		x.bg_api.register( "api_manager", api_manager() );

	} () );