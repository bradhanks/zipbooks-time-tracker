$(document).ready(function(){

    var currentSeconds=0;
    var previousSeconds=0;
    var totalSeconds = 0;
    var startTime = false;
    var timerRunning = false;
    var previousLength = 4;

    function time(){
        return new Date().getTime() / 1000;
    }

    function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

    function adjustCSS(timeString) {

        if (previousLength < timeString.length){
            if (timeString.length==4){
                $('h1#timer').css('font-size', '80px');
            } else if (timeString.length==5){
                $('h1#timer').css('font-size', '72px');
            } else if (timeString.length==7) {
                $('h1#timer').css('font-size', '60px');
            } else {
                $('h1#timer').css('font-size', '54px');
            }

        }

        previousLength = timeString.length;
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
            $('#timer').html(timeString);

        }

    }

    function reset(){
        currentSeconds=0;
        previousSeconds=0;
        totalSeconds = 0;
        startTime = false;
        timerRunning = false;
        previousLength = 4;
        $('#timer').html('0:00');
        $('#stopTimer').hide();
        $('#startTimer').show();
    }

    $('#startTimer').click(function(){
        timerRunning = true;
        startTime = time();
        $(this).hide();
        $('#stopTimer').show();
    });

    $('#stopTimer').click(function(){
        timerRunning = false;
        previousSeconds += currentSeconds;
        $(this).hide();
        $('#startTimer').show();
    });

    setInterval(incrementTimer,1000);


    // Get tasks for a certain project and populate dropdown
    $('select[name=project_id]').change(function(){

        var projectId = $(this).val();


        $.get('https://app.phlo.co/api/v1/tasks', {project_id: projectId }, function(response){

            var options = '<option value="0">Select Task</option>';


            var $tasksSelect = $('select[name=task_id]').selectize();
            var tasksSelectize = $tasksSelect[0].selectize;
            tasksSelectize.clearOptions();

            if (response.success==true){

                var i;

                for (i = 0; i < response.tasks.length; i++) {

                    options += '<option value="'+response.tasks[i].id+'">'+response.tasks[i].name+'</option>';

                    tasksSelectize.addOption({value:response.tasks[i].id,text:response.tasks[i].name});

                }

            }

        });

    });


    // Submit time

    $('a#submitTimer').click(function(){

        var projectId = $('select[name=project_id]').val();
        var taskId = $('select[name=task_id]').val();
        var note = $('textarea[name=note]').val();

        if (projectId==0 || projectId==null || taskId==0 || taskId==null){

            var error = 'You need to select a project and a task before submitting.';

        } else if (totalSeconds==0) {

            var error = 'Whoops! Log some time before submitting.'

        } else {

			$.post('https://app.phlo.com/api/v1/time_entries/create', {

                project_id: projectId,
                task_id: taskId,
                note: note,
                duration: totalSeconds,
                _token: csrfToken

            }, function (response) {

                if (response.success==true){

                    $('#notificationContainer').hide().html('<div class="alert alert-success" role="alert"><p>' + response.message + '</p></div>').fadeIn(100).delay(3000).fadeOut(100);
                    reset();

                } else {
                    $('#notificationContainer').hide().html('<div class="alert alert-danger" role="alert"><p>' + response.error + '</p></div>').fadeIn(100).delay(3000).fadeOut(100);
                }
            }).error(function() {
                $('#notificationContainer').hide().html('<div class="alert alert-danger" role="alert"><p>There was an error.  Please log your time manually <a href="https://app.phlo.co/time">here</a>.</p></div>').fadeIn(100).delay(3000).fadeOut(100);
            });
        }

        if (error){
            $('#notificationContainer').hide().html('<div class="alert alert-danger" role="alert"><p>' + error + '</p></div>').fadeIn(100).delay(3000).fadeOut(100);
        } else {
            // clean slate
        }

    });

    // Ask if user wants to navigate away if time not submitted
    $(window).on('beforeunload', function () {
        if (totalSeconds>0) {
            return 'You have a time entry you haven\'t saved.';
        }
    });

    setInterval(ping,600000);

    // This is just to keep the session alive for very long-running time tracking
    function ping(){
        $.get('https://app.phlo.co/ping');
    }


});