$(document).ready(function(){



    var currentSeconds=0;
    var previousSeconds=0;
    var totalSeconds = 0;
    var startTime = false;
    var timerRunning = false;
    var previousLength = 4;

	var projects = [],
	tasks = [],
	customers = [],
	saved_project_id = 0,
	saved_task_id = 0,
	user_data,
	log_in_obj;
	
	
	
	function fallback () {
		window.location.href = '/pages/fallback/fallback.html'
	}
	
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
	
	function display_error ( text ) {
	
		dom_notify_bad.innerHTML = text;
		dom_notify_bad.style.display = 'block';
		setTimeout( function () {
			dom_notify_bad.style.display = 'none'
		}, 2000 )
	
	}
	
	function display_success ( text ) {
	
		dom_notify_good.innerHTML = text;
		dom_notify_good.style.display = 'block';
		setTimeout( function () {
			dom_notify_good.style.display = 'none'
		}, 2000 )
	
	}

	function save () {
		
		chrome.storage.local.set( {
			'saved_data': {
				notes: dom_note_textarea.value,
				project_id: dom_project_select.value,
				task_id: dom_task_select.value,
				startTime: startTime,
				previousSeconds: previousSeconds,
				timerRunning: timerRunning
			}
		} );
		
	}
	
    function time(){
        return new Date().getTime() / 1000;
    }

    function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

    function adjustCSS( timeString ) {

        // if (previousLength < timeString.length){
            // if (timeString.length==4){
                // $('#dom_timer').css('font-size', '80px');
            // } else if (timeString.length==5){
                // $('#dom_timer').css('font-size', '72px');
            // } else if (timeString.length==7) {
                // $('#dom_timer').css('font-size', '60px');
            // } else {
                // $('#dom_timer').css('font-size', '54px');
            // }

        // }

        // previousLength = timeString.length;
    }

	function display_time () {

		if ( startTime ) currentSeconds = Math.round(time() - startTime);
        totalSeconds = currentSeconds + previousSeconds;

        var hours = parseInt( totalSeconds / 3600 ) % 24;
        var minutes = parseInt( totalSeconds / 60 ) % 60;
        var seconds = pad(totalSeconds % 60);
        var timeString = (hours>0) ? hours+':'+pad(minutes)+':'+seconds : minutes+':'+seconds;

        adjustCSS(timeString);

        // Update timer
        $('#dom_timer').html(timeString);

	}

    function reset(){
        currentSeconds=0;
        previousSeconds=0;
        totalSeconds = 0;
        startTime = false;
        timerRunning = false;
        previousLength = 4;
        $('#dom_timer').html('0:00');
        $('#dom_button_stop').hide();
        $('#dom_button_submit').hide();
        $('#dom_button_reset').hide();
        $('#dom_button_start').show();
		save();
    }

    function ping(){
        $.get('https://app.zipbooks.com/ping');
    }
	
	function render_task_options( project_id ) {

        var $tasksSelect = $('#dom_task_select').selectize();
        var tasksSelectize = $tasksSelect[0].selectize;
        tasksSelectize.clearOptions();

		for ( var i = 0; i < tasks.length; i++ ) {
			if ( project_id == tasks[ i ].project_id ) {
				tasksSelectize.addOption(
					{
						value: tasks[i].id,
						text: tasks[i].name
					}
				);
			}
		}
		
	};

    function incrementTimer(){

        if (timerRunning){

            currentSeconds = Math.round(time() - startTime);
            totalSeconds = currentSeconds + previousSeconds;

            var hours = parseInt( totalSeconds / 3600 ) % 24;
            var minutes = parseInt( totalSeconds / 60 ) % 60;
            var seconds = pad(totalSeconds % 60);
            var timeString = (hours>0) ? hours+':'+pad(minutes)+':'+seconds : minutes+':'+seconds;

            adjustCSS(timeString);

            // Update timer
            $('#dom_timer').html(timeString);

        }

    }
	
	
	
	
	function projects_loaded ( event ) {
	
		var projects = event.detail.projects;
        var $projectsSelect = $('#dom_project_select').selectize();
        var projectsSelectize = $projectsSelect[0].selectize;
        projectsSelectize.clearOptions();

		for ( var i = 0; i < projects.length; i++ ) {
		
			projectsSelectize.addOption(
				{
					value: projects[i].id,
					text: projects[i].customer.name+' :: '+projects[i].name,
					selected: true
				}
			);

		}
		
		if ( saved_project_id ) {
			
			projectsSelectize.setValue( saved_project_id );
			project_select_changed();
			
		}
		
	}
	
	function tasks_loaded ( event ) {

		if ( saved_project_id && saved_task_id ) {

			var $tasksSelect = $('#dom_task_select').selectize();
			var tasksSelectize = $tasksSelect[0].selectize;
			tasksSelectize.clearOptions();
			var tasks = event.detail.tasks;

			for ( var i = 0; i < tasks.length; i++ ) {
				if ( saved_project_id == tasks[ i ].project_id ) {
					tasksSelectize.addOption(
						{
							value: tasks[i].id,
							text: tasks[i].name
						}
					);
				}
			}
			
			tasksSelectize.setValue( saved_task_id );
		
		}
		
	}
	
	function customers_loaded ( event ) {
	
		var customers = event.detail.customers;
        var $customersSelect = $('#dom_customer_select').selectize();
        var customersSelectize = $customersSelect[0].selectize;
        customersSelectize.clearOptions();

		for ( var i = 0; i < customers.length; i++ ) {
		
			customersSelectize.addOption(
				{
					value: customers[i].id,
					text: customers[i].name
				}
			);

		}
		
	}
	
	
	
	function project_deselected () {
		
		var $tasksSelect = $('#dom_task_select').selectize();
        var tasksSelectize = $tasksSelect[0].selectize;
        tasksSelectize.clearOptions();
		
		tasksSelectize.setValue('');
		
	}
	
	function project_select_changed () {
		
		if ( dom_project_select.value !== '' ) {
			
			if ( dom_project_select.value !== 'new_project' ) {
				dom_button_project_cancel_click();
			}
			
			document.dispatchEvent(
				new CustomEvent(
					'project_selected',
					{
						detail: {
							project_id: dom_project_select.value
						}
					}
				)
			)
			
		} else {
			project_deselected();
			dom_button_project_cancel_click();
		}
		
	}
	
	function task_select_changed () {
		
		if ( dom_task_select.value !== '' ) {
			
			if ( dom_project_select.value !== 'new_project' ) {
				dom_button_project_cancel_click();
			}
			
		} else {
			dom_button_task_cancel_click();
		}
		
	}
	
	function project_selected ( event ) {
		
		render_task_options( event.detail.project_id );
		
	}
	
	function project_select_create ( input, callback ) {
		callback({
			value: 'new_project',
			text: input
		});
		$('#dom_project_creator').slideDown();
	}
	
	function task_select_create ( input, callback ) {
		callback({
			value: 'new_task',
			text: input
		});
		$('#dom_task_creator').slideDown();
	}
	
	
	
	function dom_button_task_cancel_click () {
		
		$('#dom_task_creator').slideUp();
		$('#dom_task_select').selectize()[0].selectize.setValue('');
		$('#dom_task_select').selectize()[0].selectize.removeOption('new_task');
		
	}
	
	function dom_button_create_task_click () {
		
		{
			
			post(
				'https://api.zipbooks.com/v1/tasks?token='+log_in_obj.token,
				'name='+dom_task_select.nextElementSibling.querySelector('.item[data-value="new_task"]').innerHTML+
				'&project_id='+dom_project_select.value+
				'&billable='+'1',
				function ( responseText ) {
					
					var response = JSON.parse( responseText );
					if ( response.message == "Task created successfully." ) {
						display_success( 'Task created successfully.' );
							
						
										
						get(
							'https://api.zipbooks.com/v1/tasks?token=' + log_in_obj.token,
							function ( responseText ) {
								tasks = JSON.parse( responseText );
								project_select_changed();
								document.dispatchEvent( new CustomEvent(
									'tasks_loaded',
									{ detail: { tasks: tasks } }
								) );
							},
							fallback
						);
						
						dom_button_task_cancel_click();
						
						
							
					} else {
						display_error( 'Sorry, try creating later.' );
					}
				},
				function () {
					display_error( 'Sorry, try creating later.' );
				}
			)
			
		}
		
	}
	
	function dom_button_project_cancel_click () {
		
		$('#dom_project_creator').slideUp();
		if ( dom_project_select.value == 'new_project' ) {
			$('#dom_project_select').selectize()[0].selectize.setValue('');
		}
		$('#dom_project_select').selectize()[0].selectize.removeOption('new_project');
		
	}
	
	function dom_button_create_project_click () {
		
		if ( dom_input_project_rate.value === '' ) {
			display_error( 'Enter hourly rate.' );
		} else if ( !/[1-9][0-9]*/.test(dom_input_project_rate.value) ) {
			display_error( 'Invalid hourly rate' );
		} else if ( dom_customer_select.value === '' ) {
			display_error( 'Select a company.' );
		} else {
			
			post(
				'https://api.zipbooks.com/v1/projects?token='+log_in_obj.token,
				'name='+dom_project_select.nextElementSibling.querySelector('.item[data-value="new_project"]').innerHTML+
				'&customer_id='+dom_customer_select.value+
				'&billing_method='+'project_rate'+
				'&hourly_rate='+dom_input_project_rate.value,
				function ( responseText ) {
					var response = JSON.parse( responseText );
					if ( response.message == "Project created successfully." ) {
						display_success( 'Project created successfully.' );
						
							get(
								'https://api.zipbooks.com/v1/projects?token=' + log_in_obj.token,
								function ( responseText ) {
									projects = JSON.parse( responseText );
									document.dispatchEvent( new CustomEvent(
										'projects_loaded',
										{ detail: { projects: projects } }
									) );
								},
								fallback
							);
							dom_button_project_cancel_click();
							
							
					} else {
						display_error( 'Sorry, try creating later.' );
					}
				},
				function () {
					display_error( 'Sorry, try creating later.' );
				}
			)
			
		}
		
	}
	
	function start_click () {
        timerRunning = true;
		if ( !startTime ) startTime = time();
        $(this).hide();
        $('#dom_button_stop').show();
		save();
		
		if ( currentSeconds + previousSeconds === 0 ) {
			setTimeout( function () {
				dom_button_reset.style.display = 'block';
				dom_button_submit.style.display = 'block';
			}, 1000 )
		}
		
    }
	
	function stop_click () {
        timerRunning = false;
		startTime = 0;
        previousSeconds += currentSeconds;
        $(this).hide();
        $('#dom_button_start').show();
		save();
    }
	
	function submit_click () {
		
		var error = false;
		
        if (
			dom_project_select.value === ''
			|| dom_task_select.value === ''
		) {

            display_error( 'Select a project and a task.' );

        } else if (totalSeconds==0) {

           display_error( 'Log some time first.' );

        } else {
			
			post(
				'https://api.zipbooks.com/v1/time_entries?token='+log_in_obj.token,
				'user_id='+user_data.id+
				'&task_id='+dom_task_select.value+
				'&duration='+totalSeconds/3600+
				'&note='+dom_note_textarea.value,
				function ( responseText ) {
					var response = JSON.parse( responseText );
					if ( response.message == "Time entry added successfully." ) {
						display_success( 'Yay! Your time was logged.' );
						reset();
					} else {
						display_error( 'Sorry, try submitting later.' );
					}
				},
				function () {
					display_error( 'Sorry, try submitting later.' );
				}
			)
      
		}

    }
	
	
	
    $('#dom_button_start').click( start_click );
    $('#dom_button_stop').click( stop_click );
    $('#dom_button_reset').click( reset );
    $('#dom_button_submit').click( submit_click );
	$('#dom_project_select').change( project_select_changed )
    $('#dom_button_create_project').click( dom_button_create_project_click );
    $('#dom_button_project_cancel').click( dom_button_project_cancel_click );
    $('#dom_button_create_task').click( dom_button_create_task_click );
    $('#dom_button_task_cancel').click( dom_button_task_cancel_click );
	
	$('#dom_project_select').change( save )
	$('#dom_task_select').change( save )
	$('#dom_note_textarea').change( save )

	document.addEventListener( 'projects_loaded', projects_loaded );	
	document.addEventListener( 'tasks_loaded', tasks_loaded );	
	document.addEventListener( 'customers_loaded', customers_loaded );	
	document.addEventListener( 'project_selected', project_selected );	
	
	
	chrome.storage.local.get( [ 'log_in_obj', 'user_data', 'saved_data' ], function ( items ) {
		
		user_data = items[ 'user_data' ];
		log_in_obj = items[ 'log_in_obj' ];

		get(
			'https://api.zipbooks.com/v1/projects?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				projects = JSON.parse( responseText );
				document.dispatchEvent( new CustomEvent(
					'projects_loaded',
					{ detail: { projects: projects } }
				) );
			},
			fallback
		);
		get(
			'https://api.zipbooks.com/v1/tasks?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				tasks = JSON.parse( responseText );
				document.dispatchEvent( new CustomEvent(
					'tasks_loaded',
					{ detail: { tasks: tasks } }
				) );
			},
			fallback
		);
		get(
			'https://api.zipbooks.com/v1/customers?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				customers = JSON.parse( responseText );
				document.dispatchEvent( new CustomEvent(
					'customers_loaded',
					{ detail: { customers: customers } }
				) );
			},
			fallback
		);
		
		if ( typeof items[ 'saved_data' ] !== 'undefined' ) {
			
			var data = items[ 'saved_data' ];
			
			dom_note_textarea.value = data.notes || '';
			saved_project_id = data.project_id || 0;
			saved_task_id = data.task_id || 0;
			startTime = data.startTime || 0;
			previousSeconds = data.previousSeconds || 0;
			timerRunning = data.timerRunning || 0;
			
			display_time();
			
			if ( timerRunning ) {
				$('#dom_button_start').click();
				$('#dom_button_reset').show();
				$('#dom_button_submit').show();
			} else if ( previousSeconds ) {
				$('#dom_button_reset').show();
				$('#dom_button_submit').show();
			}
			
			// chrome.storage.local.remove('saved_data');
			// chrome.storage.local.remove('user_data');
			// chrome.storage.local.remove('log_in_obj');
			
		};
		
	} );	
	
	$('#dom_project_select').selectize({ create: project_select_create, createOnBlur: true });
	$('#dom_task_select').selectize({ create: task_select_create, createOnBlur: true });
	$('#dom_task_select').selectize();
	$('#dom_customer_select').selectize();

    setInterval(incrementTimer,1000);
	
    setInterval(ping,600000);

	parent.$ = $;
	
	
});