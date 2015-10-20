$(document).ready(function(){



    var currentSeconds=0;
    var previousSeconds=0;
    var totalSeconds = 0;
    var startTime = false;
    var timerRunning = false;
    var previousLength = 4;
	
	
	
	var projects = [],
	tasks = [],
	current_project_id=0,
	current_task_id=0,
	user_id=0,
	log_in_obj;
	
	
	
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
	
	function projects_changed ( projects ) {
		
		var template = '<li role="presentation"><a role="menuitem" tabindex="-1" class = "project" href="#" data-project_id="{{PROJECT_ID}}">{{TEXT}}</a></li>',
		html_to_create = '';
		
		for ( var i = 0; i < projects.length; i++ ) {
			
			if ( projects[ i ].id == current_project_id ) {
				
				dom_project_grey_text.innerHTML = projects[i].customer.name+' :: '+projects[i].name;
				
			}
			
			html_to_create += template.replace( '{{PROJECT_ID}}', projects[i].id ).replace( '{{TEXT}}', projects[i].customer.name+' :: '+projects[i].name );
			
		}
		
		dom_projects_list.innerHTML = html_to_create;
		
	}
	
	function tasks_changed ( tasks ) {
		
		project_changed( current_project_id );
		
		for ( var i = 0; i < tasks.length; i++ ) {
			
			if ( tasks[ i ].id == current_task_id ) {
				
				dom_task_grey_text.innerHTML = tasks[ i ].name;
				
			}
			
		}
		
	}
	
	function project_changed ( project_id ) {
		
		current_project_id = project_id;
		save();
		
		var template = '<li role="presentation"><a role="menuitem" tabindex="-1" class = "task" href="#" data-task_id="{{TASK_ID}}">{{TEXT}}</a></li>',
		html_to_create = '';
		
		for ( var i = 0; i < tasks.length; i++ ) {
			
			if ( tasks[i].project_id == project_id ) {
			
				html_to_create += template.replace( '{{TASK_ID}}', tasks[i].id ).replace( '{{TEXT}}', tasks[i].name );
			
			}
			
		}
		
		dom_tasks_list.innerHTML = html_to_create;
		
	}
	
	function task_changed ( task_id ) {
		
		current_task_id = task_id;
		save();
		
	}
	
	function display_error ( error ) {
	
		dom_notify_bad.innerHTML = error;
		dom_notify_bad.style.display = 'block';
		setTimeout( function () {
			dom_notify_bad.style.display = 'none'
		}, 2000 )
	
	}
	
	function display_success () {
	
		dom_notify_good.style.display = 'block';
		setTimeout( function () {
			dom_notify_good.style.display = 'none'
		}, 2000 )
	
	}

	function save () {
		
		chrome.storage.local.set( {
			'saved_data': {
				notes: dom_note_textarea.value,
				project_id: current_project_id,
				task_id: current_task_id,
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

    function adjustCSS(timeString) {

        if (previousLength < timeString.length){
            if (timeString.length==4){
                $('#dom_timer').css('font-size', '80px');
            } else if (timeString.length==5){
                $('#dom_timer').css('font-size', '72px');
            } else if (timeString.length==7) {
                $('#dom_timer').css('font-size', '60px');
            } else {
                $('#dom_timer').css('font-size', '54px');
            }

        }

        previousLength = timeString.length;
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

    function reset(){
        currentSeconds=0;
        previousSeconds=0;
        totalSeconds = 0;
        startTime = false;
        timerRunning = false;
        previousLength = 4;
        $('#dom_timer').html('0:00');
        $('#dom_button_stop').hide();
        $('#dom_button_start').show();
		save();
    }

    $('#dom_button_start').click(function(){
        timerRunning = true;
		if ( !startTime ) startTime = time();
        $(this).hide();
        $('#dom_button_stop').show();
		save();
    });

    $('#dom_button_stop').click(function(){
        timerRunning = false;
		startTime = 0;
        previousSeconds += currentSeconds;
        $(this).hide();
        $('#dom_button_start').show();
		save();
    });
	
    $('#dom_button_reset').click( reset );

    setInterval(incrementTimer,1000);

	

    // Submit time
    $('#dom_button_submit').click(function() {
		
		var error = false;
		
        if ( typeof current_project_id === 'undefined' || typeof current_task_id === 'undefined' || current_project_id === 0 || current_task_id === 0 ) {

            display_error( 'Select a project and a task.' );

        } else if (totalSeconds==0) {

           display_error( 'Log some time first.' );

        } else {
			
			post( 
				'https://api.zipbooks.com/v1/time_entries?token='+log_in_obj.token,
				'user_id='+user_id+
				'&task_id='+current_task_id+
				'&duration='+totalSeconds/3600+
				'&note='+dom_note_textarea.value,
				function ( responseText ) {
					var response = JSON.parse( responseText );
					if ( response.message == "Time entry added successfully." ) {
						display_success();
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

    } );

    // Ask if user wants to navigate away if time not submitted
    $(window).on('beforeunload', function () {
        if (totalSeconds>0) {
            return 'You have a time entry you haven\'t saved.';
        }
    });

    setInterval(ping,600000);

    // This is just to keep the session alive for very long-running time tracking
    function ping(){
        $.get('https://app.zipbooks.com/ping');
    }

	// get user's projects from the very beginning
	
	
	dom_note_textarea.addEventListener( 'change', save );
	
	document.addEventListener( 'click', function ( event ) {
		
		if ( event.target.className === 'project' ) {
			
			dom_project_grey_text.innerHTML = event.target.innerHTML;
			project_changed( event.target.dataset.project_id );
			
		} else if ( event.target.className === 'task' ) {
			
			dom_task_grey_text.innerHTML = event.target.innerHTML;
			task_changed( event.target.dataset.task_id );
			
		}
		
	} );
	
	chrome.storage.local.get( [ 'log_in_obj', 'user_data', 'saved_data' ], function ( items ) {
		
		user_id = items[ 'user_data' ].id;
		log_in_obj = items[ 'log_in_obj' ];

		get(
			'https://api.zipbooks.com/v1/projects?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				projects = JSON.parse( responseText );
				projects_changed( projects );
			},
			function () {}
		);
		get(
			'https://api.zipbooks.com/v1/tasks?token=' + items[ 'log_in_obj' ].token,
			function ( responseText ) {
				tasks = JSON.parse( responseText );
				tasks_changed( tasks );
			},
			function () {}
		);
		
		if ( typeof items[ 'saved_data' ] !== 'undefined' ) {
			
			var data = items[ 'saved_data' ];
			
			dom_note_textarea.value = data.notes || '';
			current_project_id = data.project_id || 0;
			current_task_id = data.task_id || 0;
			startTime = data.startTime || 0;
			previousSeconds = data.previousSeconds || 0;
			timerRunning = data.timerRunning || 0;
			
			display_time();
			
			if ( timerRunning ) {
				$('#dom_button_start').click();
			}
			
			// chrome.storage.local.remove('saved_data');
			// chrome.storage.local.remove('user_data');
			// chrome.storage.local.remove('log_in_obj');
			
		};
		
	} );	
	
	
});