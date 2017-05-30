
	function general_conv () {

		return {

			tasks_to_project_data_arr: function ( tasks, conv ) {

				var saved_project_id_arr = [];
				var project_data_arr = [];

				tasks.forEach( function ( task ) {

					if ( task.project ) {

						if ( saved_project_id_arr.indexOf( task.project.id ) === -1 ) {

							project_data_arr.push({

								project_id: task.project.id,
									
								project_name: task.project.name,
								contact_name: task.project.customer.name,

							});

						};

					};

				});

				return project_data_arr;

			},

			tasks_to_task_data_arr: function ( tasks, conv ) {

				var task_data_arr = [];

				tasks.forEach( function ( task ) {

					task_data_arr.push({

						task_id: task.id,
						project_id: task.project ? task.project.id : null,

						task_name: task.name,
						project_name: task.project ? task.project.name : null,
						contact_name: task.project ? task.project.customer.name : null,

					});

				});

				return task_data_arr;

			},

			time_to_display: function ( time, conv ) {

				var full_hours = Math.floor( time / ( 60 * 60 * 1000 ) );
				var total_full_minutes = Math.floor( time / ( 60 * 1000 ) );
				var total_full_seconds = Math.floor( time / 1000 );

				var full_minutes = total_full_minutes - full_hours * 60;
				var full_seconds = total_full_seconds - total_full_minutes * 60;

				return x.util.pad( full_hours ) + ":" + x.util.pad( full_minutes ) + ":" + x.util.pad( full_seconds );

			},

		};

	};

	function main_ctrl ( $scope ) {

		$scope.token = null;

		$scope.state = "idle";

		$scope.project_selector_active = false;
		$scope.task_selector_active = false;

		$scope.project_data_arr = [];
		$scope.task_data_arr = [];

		$scope.selected_project_data = null;
		$scope.selected_task_data = null;
		$scope.notes = "";

		$scope.timer_data = {

			time: 0,
			active: false,
			last_breakpoint_ts: null,

		};

		$scope.user_data = {

			autorized: null,
			token: null,
			user_id: null,

		};

		$scope.$watch( "notes", function () {

			if ( $scope.notes ) {

				x.bg_api.exec( "storage", "set", [ "notes", $scope.notes ]);

			};

		});

		function increment_time () {

			var date_now = Date.now();

			$scope.timer_data.time += date_now - $scope.timer_data.last_breakpoint_ts;
			$scope.timer_data.last_breakpoint_ts = date_now;

		};

		$scope.root_click = function () {

			$scope.project_selector_active = false;
			$scope.task_selector_active = false;

		};

		$scope.project_input_click = function ( event ) {

			$scope.task_selector_active = false;
			$scope.project_selector_active = true;

			event.stopPropagation();

		};

		$scope.task_input_click = function ( event ) {

			$scope.task_selector_active = true;
			$scope.project_selector_active = false;

			event.stopPropagation();

		};

		$scope.select_project_data = function ( project_data ) {

			$scope.selected_project_data = project_data;

			x.bg_api.exec( "storage", "set", [ "selected_project_data", project_data ] );

		};

		$scope.select_task_data = function ( task_data ) {

			$scope.project_data_arr.forEach( function ( project_data ) {

				if ( project_data.project_id === task_data.project_id ) {

					$scope.selected_project_data = project_data;

				};

			});

			$scope.selected_task_data = task_data;

			x.bg_api.exec( "storage", "set", [ "selected_project_data", $scope.selected_project_data ] );
			x.bg_api.exec( "storage", "set", [ "selected_task_data", $scope.selected_task_data ] );

		};

		$scope.project_input_blur = function () {

			

		};

		$scope.task_input_blur = function () {


		};

		$scope.time_to_display = function ( time ) {

			return x.conv( "general_conv", "time", "display", time );

		};

		$scope.login_button_click = function () {

			chrome.tabs.create({

				active: true,
				url: "https://app.zipbooks.com/login",

			});

		};

		$scope.start_button_click = function () {

			x.bg_api.exec( "timer", "start", {

				ts: Date.now()

			}).then( function ( timer_data ) {

				$scope.timer_data = timer_data;
				$scope.$apply();

			});

		};

		$scope.pause_button_click = function () {

			x.bg_api.exec( "timer", "pause", {

				ts: Date.now()

			}).then( function ( timer_data ) {

				$scope.timer_data = timer_data;
				$scope.$apply();

			});

		};

		$scope.submit_button_click = function () {

			$scope.state = "uploading_time_entry";

			var duration = Math.floor( $scope.timer_data.time / 1000 );

			x.bg_api.exec( "api_manager", "submit_time", {

				duration: duration,
				task_id: $scope.selected_task_data ? $scope.selected_task_data.task_id : null,
				notes: $scope.notes

			})
			.then( function ( response ) {

				if ( response.success ) {

					$scope.state = "after_good_time_entry";
					$scope.$apply();

					setTimeout( function () {

						$scope.state = "idle";
						$scope.$apply();

					}, 1000 );

					x.bg_api.exec( "timer", "reset" ).then( function ( timer_data ) {

						$scope.timer_data = timer_data;
						$scope.$apply();

					});

				} else {

					$scope.state = "after_bad_time_entry";
					$scope.$apply();

					setTimeout( function () {

						$scope.state = "idle";
						$scope.$apply();

					}, 1000 );

				};

			});

		};

		setInterval( function () {

			if ( $scope.timer_data.active ) {

				$scope.$apply( function () {

					if ( $scope.timer_data && $scope.timer_data.active ) {

						increment_time();

					};

				});

			};

		}, 50 );

		x.bg_api.exec( "timer", "get_timer_data" )
		.then( function ( timer_data ) {

			$scope.timer_data = timer_data;

		});

		x.bg_api.exec( "api_manager", "update_api_data" )
		.then( function ( api_data ) {

			var user_data = api_data.user_data;
			var tasks = api_data.tasks;

			$scope.user_data = user_data;

			if ( $scope.user_data.autorized ) {

				$scope.project_data_arr = x.conv( "general_conv", "tasks", "project_data_arr", tasks );
				$scope.task_data_arr = x.conv( "general_conv", "tasks", "task_data_arr", tasks );

				x.bg_api.exec( "storage", "get" ).then( function ( items ) {

					$scope.selected_task_data = items[ "selected_task_data" ];
					$scope.selected_project_data = items[ "selected_project_data" ];
					$scope.notes = items[ "notes" ];

					$scope.$apply();

				});

			} else {

				$scope.$apply();

			};

		});

	};

	( function () {

		x.conv.set_options({ debug: false });
		x.conv.register( "general_conv", general_conv() );

		var app = angular.module( "app", [] ); 

		app.controller( "main_ctrl", [ "$scope", main_ctrl ] );

		angular.bootstrap( [ document.body.querySelector( "#root" ) ], [ 'app' ] );

	} () );
