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
	saved_data = null,
	user_data,
	log_in_obj;
	
	
	function fallback () {
		window.location.href = '../fallback/fallback.html'
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
				
				project_id: dom_project_select.value,
				task_id: dom_task_select.value,
				customer_id: dom_customer_select.value,
				
				project_name: dom_project_select.textContent,
				task_name: dom_task_select.textContent,
				customer_name: dom_customer_select.textContent,
				
				startTime: startTime,
				previousSeconds: previousSeconds,
				timerRunning: timerRunning,
				notes: dom_note_textarea.value,
				dom_email: dom_email.value,
				dom_input_project_rate: dom_input_project_rate.value
				
			}
		} );
		
	}

    function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

	function display_time () {

		if ( startTime ) currentSeconds = Math.round(Date.now()/1000 - startTime);
        totalSeconds = currentSeconds + previousSeconds;

        var hours = parseInt( totalSeconds / 3600 ) % 24;
        var minutes = parseInt( totalSeconds / 60 ) % 60;
        var seconds = pad(totalSeconds % 60);
        var timeString = (hours>0) ? hours+':'+pad(minutes)+':'+seconds : minutes+':'+seconds;

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
        $('#dom_button_start').show();
		dom_project_select.selectize.setValue('');
		dom_task_select.selectize.setValue('');
		save();
    }

    function ping(){
        $.get('https://app.zipbooks.com/ping');
    }
	
	function render_task_options( project_id ) {

        var tasksSelectize = dom_task_select.selectize;
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

            currentSeconds = Math.round(Date.now()/1000 - startTime);
            totalSeconds = currentSeconds + previousSeconds;

            var hours = parseInt( totalSeconds / 3600 ) % 24;
            var minutes = parseInt( totalSeconds / 60 ) % 60;
            var seconds = pad(totalSeconds % 60);
            var timeString = (hours>0) ? hours+':'+pad(minutes)+':'+seconds : minutes+':'+seconds;

            // Update timer
            $('#dom_timer').html(timeString);

        }

    }
	
	
	function projects_changed ( event ) {
	
		var projects = event.detail.projects;
        var projectsSelectize = dom_project_select.selectize;
        projectsSelectize.clearOptions();
		
		console.log(projects)

		for ( var i = 0; i < projects.length; i++ ) {
			projectsSelectize.addOption(
				{
					value: projects[i].id,
					text: projects[i].customer.name+' :: '+projects[i].name
				}
			);
		}
		
		if ( saved_data.project_id ) {
			
			if ( saved_data.project_id === 'new_project' ) {
				projectsSelectize.addOption(
					{
						value: saved_data.project_id,
						text: saved_data.project_name
					}
				);
				projectsSelectize.setValue( saved_data.project_id );
				open_project_creator();
			} else {
				projectsSelectize.setValue( saved_data.project_id );
			}
			
			if ( saved_data.task_id ) tasks_changed( saved_data.project_id );
			
		}
		
	}
	
	function tasks_changed ( saved_project_id ) {

		var tasksSelectize = dom_task_select.selectize;
		tasksSelectize.clearOptions();

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
		
		if ( saved_data.task_id === 'new_task' ) {
			tasksSelectize.addOption(
				{
					value: saved_data.task_id,
					text: saved_data.task_name
				}
			);
			tasksSelectize.setValue( saved_data.task_id );
		} else {
			tasksSelectize.setValue( saved_data.task_id );
		}
		
	}
	
	function customers_changed ( event ) {
	
		var customers = event.detail.customers;
        var customersSelectize = dom_customer_select.selectize;
        customersSelectize.clearOptions();

		for ( var i = 0; i < customers.length; i++ ) {
		
			customersSelectize.addOption(
				{
					value: customers[i].id,
					text: customers[i].name
				}
			);

		}
		
		if ( saved_data.customer_id === 'new_customer' ) {
			customersSelectize.addOption(
				{
					value: saved_data.customer_id,
					text: saved_data.customer_name
				}
			);
			customersSelectize.setValue( saved_data.customer_id );
			open_customer_creator();
		} else {
			customersSelectize.setValue( saved_data.customer_id );
		}
		saved_data.customer_id = false;
	
	}
	
	
	//////////// making requests 
	function post_new_time_entry ( task_id ) {
		
		post(
			'https://api.zipbooks.com/v1/time_entries?token='+log_in_obj.token,
			'user_id='+user_data.id+
			'&task_id='+task_id+
			'&duration='+totalSeconds/3600+
			'&note='+dom_note_textarea.value,
			function ( responseText ) {
				
				display_success( 'Yay! Your time was logged.' );
				
				document.dispatchEvent( new CustomEvent(
					'projects_changed',
					{ detail: { projects: projects } }
				));
				
				document.dispatchEvent( new CustomEvent(
					'customers_changed',
					{ detail: { customers: customers } }
				) );
				
				reset();
				
			},
			request_failed
		)
		
	}
	
	function post_new_project ( name, customer_id, rate, success_callback ) {
		
		post(
			'https://api.zipbooks.com/v1/projects?token='+log_in_obj.token,
			'name='+name+
			'&customer_id='+customer_id+
			'&billing_method='+'project_rate'+
			'&hourly_rate='+rate,
			function ( responseText ) {
				
				var response = JSON.parse( responseText );
				
				response.customer = {
					name: dom_customer_select.textContent,
					id: customer_id
				};
				
				projects.push( response );
				
				success_callback( response.id );

			},
			request_failed
		)
		
	}
	
	function post_new_task ( name, project_id, success_callback ) {
		post(
			'https://api.zipbooks.com/v1/tasks?token='+log_in_obj.token,
			'name='+name+
			'&project_id='+project_id+
			'&billable='+'1',
			function ( responseText ) {

				var response = JSON.parse( responseText );
				success_callback( response.id );
				
				tasks.push( response );
				
			},
			request_failed
		)
	}
	
	function post_new_customer ( name, success_callback ) {
		post(
			'https://api.zipbooks.com/v1/customers?token='+log_in_obj.token,
			'name='+name+
			'&email='+dom_email.value,
			function ( responseText ) {
				
				response = JSON.parse( responseText );
				success_callback( response.id );
				
				customers.push( response );
				
			},
			request_failed
		)
	}	
	
	function request_failed () {
		display_error( 'Sorry, try submitting later.' );
	}
	
	
	
	function project_select_changed () {
	
		if ( dom_project_select.value !== 'new_project' ) {
			remove_new_project_option();
			close_project_creator();
		}
		
		if ( dom_project_select.value !== '' ) {
			
			render_task_options( dom_project_select.value );
		
		} else {
		
			dom_task_select.selectize.clearOptions();
			dom_task_select.selectize.setValue('');
			
		}
		
	}
	
	function task_select_changed () {
		if ( dom_task_select.value !== 'new_task' ) {
			remove_new_task_option();
		}
	}

	function customer_select_changed () {
		if ( dom_customer_select.value !== 'new_customer' ) {
			remove_new_customer_option();
			close_customer_creator();
		}
	}
	
	function project_select_create ( input, callback ) {
		remove_new_project_option();
		callback({
			value: 'new_project',
			text: input
		});
		open_project_creator();
	}
	
	function customer_select_create ( input, callback ) {
		remove_new_customer_option();
		callback({
			value: 'new_customer',
			text: input
		});
		open_customer_creator();
	}
	
	function task_select_create ( input, callback ) {
		remove_new_task_option();
		callback({
			value: 'new_task',
			text: input
		});
	}
	
	
	//// Opening and closing of panels
	function cancel_creation_customer () {
		close_customer_creator();
		dom_customer_select.selectize.setValue('');
		remove_new_customer_option();
	}
	
	function cancel_creation_project () {
		close_project_creator()
		dom_project_select.selectize.setValue('');
		remove_new_project_option();
	}
	
	function cancel_creation_task () {
		dom_task_select.selectize.setValue('');
		remove_new_task_option();
	}
	
	function remove_new_task_option () {
		dom_task_select.selectize.removeOption('new_task');
	}
	
	function remove_new_project_option () {
		dom_project_select.selectize.removeOption('new_project');
	}

	function remove_new_customer_option () {
		dom_customer_select.selectize.removeOption('new_customer');
	}
	
	function open_project_creator () {
		$('#dom_project_select + div').css({width:'68%'});
		$(dom_input_project_rate).css({display:'inline-block'}).animate({width:'30%', paddingLeft:'16px', paddingRight:'16px', opacity: 1 },200);
		$('#dom_customer_select + div').show();
		dom_customer_select.selectize.refreshOptions(false);
	}
	
	function open_customer_creator () {
		$(dom_customer_creator).slideDown();
	}
	
	function close_customer_creator () {
		$(dom_customer_creator).slideUp();
	}
	
	function close_project_creator () {
		$('#dom_project_select + div').css({width:'100%'});
		$(dom_input_project_rate).css({display:'none'}).css({width:'0%', paddingLeft:'0px', paddingRight:'0px', opacity: 0 },200);
		$('#dom_customer_select + div').hide();
		cancel_creation_customer();
	}
	
	
	
	function start_click () {
        timerRunning = true;
		if ( !startTime ) startTime = Date.now()/1000;
        $(this).hide();
        $('#dom_button_stop').show();
		save();
		
		if ( currentSeconds + previousSeconds === 0 ) {
			setTimeout( function () {
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
		
        if ( dom_project_select.value === '' || dom_task_select.value === '' ) {

            display_error( 'Select a project and a task.' );
			error = true;

        }
		
		if ( dom_project_select.value === 'new_project' ) {
			
			if ( dom_input_project_rate.value === '' ) {
				display_error( 'Enter hourly rate.' );
				error = true;
			} else if ( !/[1-9][0-9]*/.test(dom_input_project_rate.value) ) {
				display_error( 'Invalid hourly rate' );
				error = true;
			} else if ( dom_customer_select.value === '' ) {
				display_error( 'Select a company.' );
				error = true;
			};
			
		}
		
		if ( dom_customer_select.value === 'new_customer' ) {
			
			if ( dom_email.value === '' ) {
				display_error('Enter email.');
				error=true;
			} else if ( !dom_email.value.match(/.+@.+\..+/) ) {
				display_error('Enter email correctly.');
				error=true;
			}
			
		}
		
		if ( totalSeconds==0 ) {

           display_error( 'Log some time first.' );
		   error = true;

        }
		
		if ( !error ) {
		
			if ( dom_customer_select.value === 'new_customer' ) {
				post_new_customer(
					dom_customer_select.textContent,
					function ( customer_id ) {
						post_new_project(
							dom_project_select.textContent,
							customer_id,
							dom_input_project_rate.value,
							function ( project_id ) {
								post_new_task(
									dom_task_select.textContent,
									project_id,
									function ( task_id ) {
										post_new_time_entry( task_id );
									}
								);
							}
						);
					}
				);
				
			} else if ( dom_project_select.value === 'new_project' ) {
				post_new_project(
					dom_project_select.textContent,
					dom_customer_select.value,
					dom_input_project_rate.value,
					function ( project_id ) {
						post_new_task(
							dom_task_select.textContent,
							project_id,
							function ( task_id ) {
								post_new_time_entry( task_id );
							}
						);
					}
				);
			} else if ( dom_task_select.value === 'new_task' ) {
				post_new_task(
					dom_task_select.textContent,
					dom_project_select.value,
					function ( task_id ) {
						post_new_time_entry( task_id );
					}
				);
			} else {
				post_new_time_entry( dom_task_select.value );
			}
		
		}
		
    }


	$('#dom_button_start').click( start_click );
    $('#dom_button_stop').click( stop_click );
    $('#dom_button_submit').click( submit_click );
	
	$('#dom_project_select').change( project_select_changed )
	$('#dom_customer_select').change( customer_select_changed )
	
	$('#dom_project_select').change( save )
	$('#dom_input_project_rate').change( save )
	$('#dom_customer_select').change( save )
	$('#dom_email').change( save )
	$('#dom_task_select').change( save )
	$('#dom_note_textarea').change( save )

	document.addEventListener( 'projects_changed', projects_changed );	
	document.addEventListener( 'tasks_changed', tasks_changed );	
	document.addEventListener( 'customers_changed', customers_changed );	
	
	chrome.storage.local.get( [ 'log_in_obj', 'user_data', 'saved_data' ], function ( items ) {
		
		user_data = items[ 'user_data' ];
		log_in_obj = items[ 'log_in_obj' ];


		get(
			'https://api.zipbooks.com/v1/tasks?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				
				tasks = JSON.parse( responseText );
				
				get(
					'https://api.zipbooks.com/v1/projects?token=' + items[ 'log_in_obj' ].token,
					function ( responseText ) {
						projects = JSON.parse( responseText );
						document.dispatchEvent( new CustomEvent(
							'projects_changed',
							{ detail: { projects: projects } }
						) );
					},
					fallback
				);
				
			},
			fallback
		);
		get(
			'https://api.zipbooks.com/v1/customers?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				customers = JSON.parse( responseText );
				document.dispatchEvent( new CustomEvent(
					'customers_changed',
					{ detail: { customers: customers } }
				) );
			},
			fallback
		);
		
		if ( typeof items[ 'saved_data' ] !== 'undefined' ) {
			
			var data = items[ 'saved_data' ];
			saved_data = data;
			
			dom_note_textarea.value = data.notes || '';
			dom_input_project_rate.value = data.dom_input_project_rate || '';
			dom_email.value = data.dom_email || '';
			
			startTime = data.startTime || 0;
			previousSeconds = data.previousSeconds || 0;
			timerRunning = data.timerRunning || 0;
			
			display_time();
			
			if ( timerRunning ) {
				$('#dom_button_start').click();
				$('#dom_button_submit').show();
			} else if ( previousSeconds ) {
				$('#dom_button_submit').show();
			}
			
			// chrome.storage.local.remove('saved_data');
			// chrome.storage.local.remove('user_data');
			// chrome.storage.local.remove('log_in_obj');
			
		};
		
	} );	
	
	$('#dom_project_select').selectize({ create: project_select_create, createOnBlur: true });
	$('#dom_customer_select').selectize({ create: customer_select_create, createOnBlur: true });
	$('#dom_task_select').selectize({ create: task_select_create, createOnBlur: true });

    setInterval(incrementTimer,1000);
	
    setInterval(ping,600000);

	parent.$ = $;
	
});