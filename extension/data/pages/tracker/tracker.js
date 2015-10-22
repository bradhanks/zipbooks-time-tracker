
	V.UserData = function () {
		
		var obj = {
			
			user_data: {
				
				token: null,
				id: null,
				customers: null,
				projects: null,
				tasks: null
				
			}
			
		};
		
		return {
			
			get_user_id: function () {
				return obj.user_data.id;
			},
			get_token: function () {
				return obj.user_data.token;
			},
			get_tasks_by_project_id: function ( project_id ) {
				return obj.user_data.tasks.filter( function ( task ) {
					return task.project_id == project_id;
				});
			},
			get_tasks_by_name: function ( task_name ) {
				return obj.user_data.tasks.filter( function ( task ) {
					return task.name == task_name;
				});
			},
			get_projects_by_name: function ( project_name ) {
				return obj.user_data.projects.filter( function ( project ) {
					return project.name == project_name;
				});
			},
			get_customers_by_id: function ( customer_id ) {
				return obj.user_data.customers.filter( function ( customer ) {
					return customer.id == customer.id;
				});
			},
			
			add_customer: function ( customer ) {
				obj.user_data.customers.push( customer );
			},
			add_project: function ( project ) {
				obj.user_data.projects.push( project );
			},
			add_task: function ( task ) {
				obj.user_data.tasks.push( task );
			},
			
			set: function ( data ) {
				Object.keys( data ).forEach( function ( key ) {
					obj.user_data[ key ] = data[ key ];
				});
			},
			get: function () {
				return obj.user_data;
			}
			
		};
		
	};
	V.PageData = function () {
		
		var obj = {
		
			getters: {
				
				'selected_customer': function () {
					return {
						id: $('#dom_customer_select').val(),
						name: dom_customer_select.textContent
					};
				},
				'selected_project': function () {
					return {
						id: $('#dom_project_select').val(),
						name: dom_project_select.textContent
					};
				},
				'selected_task': function () {
					return {
						id: $('#dom_task_select').val(),
						name: dom_task_select.textContent
					};
				},
				
				'note': function () {
					return dom_note_textarea.value;
				}
				
			}
		
		};
		
		return {
			
			get_items: function ( item_names, callback ) {
				
				if ( item_names == null ) {
					
					var items = {};
					
					Object.keys( obj.getters ).forEach( function ( item_name ) {
						items[ item_name ] = obj.getters[ item_name ]();
					});
					
					callback( items );
					
				} else {
				
					var items = {};
					
					item_names.forEach( function ( item_name ) {
						items[ item_name ] = obj.getters[ item_name ]();
					});
					
					callback( items );
				
				}
				
			},
			
			get: function ( item_name ) {
				return obj.getters[ item_name ]();
			}
			
		};
	
	};
	V.StorageManager = function ( chrome ) {
		
		return {
			
			set: function ( data, callback ) {
				chrome.storage.local.set( data, callback );
			},
			
			get: function ( callback ) {
				chrome.storage.local.get( null, function ( items ) {
					callback( items );
				});
			}
			
		}
		
	};
	V.ApiManager = function ( $, user_data, page_data ) {
		
		var obj = {
			
		};
		
		return {
			
			create_a_time_entry: function ( time_entry_data, callback ) {
				$.ajax({
					url: 'https://api.zipbooks.com/v1/time_entries?token='+user_data.get_token(),
					type: 'POST',
					data: {
						'user_id': time_entry_data.user_id,
						'task_id': time_entry_data.task_id,
						'duration': time_entry_data.hours,
						'note': time_entry_data.note
					},
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					success: function ( response ) {
						callback( response );
					}
					
				});
			},
			
			create_a_customer: function ( customer_data, callback ) {
				
				$.ajax({
					url: 'https://api.zipbooks.com/v1/customers?token='+user_data.get_token(),
					type: 'POST',
					data: {
						'name': customer_data.name,
						'email': customer_data.email
					},
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					success: function ( response ) {
						callback( response );
					}
				});
	
			},
			create_a_project : function ( project_data, callback ) {
				$.ajax({
					url: 'https://api.zipbooks.com/v1/projects?token='+user_data.get_token(),
					type: 'POST',
					data: {
						'name': project_data.name,
						'customer_id': project_data.customer_id,
						'billing_method': 'project_rate',
						'hourly_rate': project_data.rate
					},
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					success: function ( response ) {
						callback( response );
					}
				});
			},
			create_a_task: function ( task_data, callback ) {
				$.ajax({
					url: 'https://api.zipbooks.com/v1/tasks?token='+user_data.get_token(),
					type: 'POST',
					data: {
						'name': task_data.name,
						'project_id': task_data.project_id,
						'billable': '1'
					},
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					success: function ( response ) {
						callback( response );
					}
				});
			},
			
			get_customers: function ( callback ) {
				$.ajax({
					url: 'https://api.zipbooks.com/v1/customers?token='+user_data.get_token(),
					type: 'GET',
					success: function ( response ) {
						callback( response );
					}
				});
			},
			get_projects: function ( callback ) {
				$.ajax({
					url: 'https://api.zipbooks.com/v1/projects?token='+user_data.get_token(),
					type: 'GET',
					success: function ( response ) {
						callback( response );
					}
				});
			},
			get_tasks: function ( callback ) {
				$.ajax({
					url: 'https://api.zipbooks.com/v1/tasks?token='+user_data.get_token(),
					type: 'GET',
					success: function ( response ) {
						callback( response );
					}
				});
			}
			
		};
		
	};
	V.Timer = function ( window, hub ) {
		
		var obj = {

			interval: 0,
			
			timer_data: {
				active: false,
				time: 0,
				start_timestamp: 0,
			},
			
			start: function () {
				obj.interval = window.setInterval( function () {
					obj.timer_data.time = Date.now() - obj.timer_data.start_timestamp;
					hub.fire({ name: 'timer_data_changed', timer_data: obj['timer_data'] });
				}, 1000 );
			}
			
		};
		
		return {
			
			start: function () {
				obj.timer_data.start_timestamp = Date.now() - obj.timer_data.time;
				obj.timer_data.active = true;
				obj.start();
				
				hub.fire({ name: 'timer_data_changed', timer_data: obj['timer_data'] });
			},
			
			pause: function () {
				obj.timer_data.time = Date.now() - obj.timer_data.start_timestamp;
				window.clearInterval( obj.interval );
				obj.timer_data.active = false;
				
				hub.fire({ name: 'timer_data_changed', timer_data: obj['timer_data'] });
			},
			
			reset: function () {
				obj.timer_data.time = 0;
				window.clearInterval( obj.interval );
				obj.timer_data.active = false;
				
				hub.fire({ name: 'timer_data_changed', timer_data: obj['timer_data'] });
			},
			
			get_data: function () {
				obj.timer_data.time = Date.now() - obj.timer_data.start_timestamp;
				return obj.timer_data;
			},
			set_data: function ( timer_data ) {
				
				if ( timer_data === undefined ) {
					obj['timer_data'] = {
						'start_timestamp': 0,
						'active': false,
						'time': 0,
					};
				} else if ( timer_data.active === true ) {
					obj['timer_data'] = {
						'start_timestamp': timer_data['start_timestamp'],
						'active': true,
						'time': Date.now() - timer_data['start_timestamp']
					};
					obj.start();
				} else if ( timer_data.active === false ) {
					obj['timer_data'] = {
						'start_timestamp': timer_data['start_timestamp'],
						'active': false,
						'time': timer_data['time']
					};
				}
				
				hub.fire({ name: 'timer_data_changed', timer_data: obj['timer_data'] });
				
			}
			
		};
		
	};
	V.Validator = function () {
		
		return {
			
			validate: function ( page_data ) {
				
				if ( page_data['selected_project'].id === '' || page_data['selected_task'].id === '' ) {

					return {
						valid: false,
						message: 'Select a project and a task.'
					}; 

				}
				
				if ( page_data['selected_project'].id === 'new_project' ) {
					
					if ( dom_input_project_rate.value === '' ) {
						return {
							valid: false,
							message: 'Enter hourly rate.'
						}
					} else if ( !/[1-9][0-9]*/.test(dom_input_project_rate.value) ) {
						return {
							valid: false,
							message: 'Invalid hourly rate'
						}
					} else if ( dom_customer_select.value === '' ) {
						return {
							valid: false,
							message: 'Select a company.'
						}
					};
					
				};
				
				if ( page_data['selected_customer'].id === 'new_customer' ) {
					
					if ( dom_email.value === '' ) {
						return {
							valid: false,
							message: 'Enter email.'
						}
					} else if ( !dom_email.value.match(/.+@.+\..+/) ) {
						return {
							valid: false,
							message: 'Enter email correctly.'
						}
					}
					
				};
				
				return {
					
					valid: true
					
				};
				
			}
			
		};
		
	};
	V.View = function ( $, hub ) {
		
		function pad ( n ) {
			return (n < 10) ? ("0" + n) : n;
		}

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
			$('#dom_customer_creator').slideDown();
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
		
		var obj = {
			
			project_select_create: function ( input, callback ) {
				callback({
					value: 'new_project',
					text: input
				});
			},
			
			customer_select_create: function ( input, callback ) {
				callback({
					value: 'new_customer',
					text: input
				});
			},
			
			task_select_create: function ( input, callback ) {
				callback({
					value: 'new_task',
					text: input
				});
			},
			
			decorators: {
				
				'error_message': function ( text ) {
					$('#dom_notify_bad').html( text );
					$('#dom_notify_bad').fadeIn().delay( 2000 ).fadeOut();
				},
				'success_message': function ( text ) {
					$('#dom_notify_good').html( text );
					$('#dom_notify_good').fadeIn().delay( 2000 ).fadeOut();
				},
				'time': function ( milliseconds ) {
					
					var seconds = parseInt( milliseconds / 1000 );
					var hours = parseInt( seconds / 3600 ) % 24;
					var minutes = parseInt( seconds / 60 ) % 60;
					var seconds = pad( seconds % 60 );
					var time_string = ( hours > 0 ) ? hours+':'+pad( minutes )+':'+seconds : minutes+':'+seconds;

					// Update timer
					$('#dom_timer').html( time_string );
					
					// Show submit button
					if ( seconds > 0 ) {
						$('#dom_button_submit').show();
					} else {
						$('#dom_button_submit').hide();
					}
					
				},
				'timer_active': function ( timer_active ) {
					if ( timer_active ) {
						$('#dom_button_start').hide();
						$('#dom_button_stop').show();
					} else {
						$('#dom_button_start').show();
						$('#dom_button_stop').hide();
					}
				},
				
				'selected_customer': function ( customer ) {
					if ( customer !== undefined ) {
						
						if ( customer.id === 'new_customer' ) {
							open_customer_creator();
						} else {
							
							close_customer_creator();
							remove_new_customer_option();
							
						}
						
						if ( dom_customer_select.value !== customer.id ) {
							dom_customer_select.selectize.addOption({
								value: customer.id,
								text: customer.name
							});
							dom_customer_select.selectize.refreshOptions( false );
							dom_customer_select.selectize.setValue( customer.id );
						};
						
					};
				},
				'selected_project': function ( project ) {
					if ( project !== undefined ) {
						
						if ( project.id === 'new_project' ) {
							
							open_project_creator();
							
						} else {
							
							close_customer_creator();
							close_project_creator();
							remove_new_project_option();
							remove_new_customer_option();
							
						}
						
						if ( dom_project_select.value !== project.id ) {
							dom_project_select.selectize.addOption({
								value: project.id,
								text: project.name
							});
							dom_project_select.selectize.refreshOptions( false );
							dom_project_select.selectize.setValue( project.id );
						};
					
					}
				},
				'selected_task': function ( task ) {
					if ( task !== undefined ) {
						
						if ( task.id === 'new_task' ) {
							
						} else {
							
							remove_new_task_option();
							
						}
						
						if ( dom_task_select.value !== task.id ) {
							dom_task_select.selectize.addOption({
								value: task.id,
								text: task.name
							});
							dom_task_select.selectize.refreshOptions( false );
							dom_task_select.selectize.setValue( task.id );
						};
					
					}
				},
				
				'customers': function ( customers ) {
					
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
			
				},
				'projects': function ( projects ) {
		
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
					
				},
				'tasks': function ( tasks ) {

					var tasksSelectize = dom_task_select.selectize;
					tasksSelectize.clearOptions();

					for ( var i = 0; i < tasks.length; i++ ) {
						tasksSelectize.addOption(
							{
								value: tasks[i].id,
								text: tasks[i].name
							}
						);
					}
				
				}
				
			}
			
		};
		
		function get_a_gun ( name ) {
			return function () {
				hub.fire({ name: name });
			};
		};
		
		$('#dom_button_start').click( get_a_gun("start_click") );
		$('#dom_button_stop').click( get_a_gun("pause_click") );
		$('#dom_button_submit').click( get_a_gun("submit_click") );
		
		$('#dom_customer_select').change( get_a_gun("customer_select_changed") );
		$('#dom_project_select').change( get_a_gun("project_select_changed") );
		$('#dom_task_select').change( get_a_gun("task_select_changed") );
		
		$('#dom_customer_select').selectize({ create: obj.customer_select_create, createOnBlur: true });
		$('#dom_project_select').selectize({ create: obj.project_select_create, createOnBlur: true });
		$('#dom_task_select').selectize({ create: obj.task_select_create, createOnBlur: true });
		
		return {
			
			update_view: function ( data ) {
				Object.keys( data ).forEach( function ( key ) {
					if ( obj.decorators[ key ] !== undefined ) {
						obj.decorators[ key ]( data[ key ] );
					}
				});
			},
			
			reset: function () {
				close_customer_creator();
				close_project_creator();
				dom_task_select.selectize.setValue('');
				dom_project_select.selectize.setValue('');
				dom_customer_select.selectize.setValue('');
			}
			
		}
		
	};
	
	( function ( window, $, chrome ) {
	
		var obj = {
			
			create_a_time_entry: function ( task_id ) {
				obj.api_manager.create_a_time_entry(
					{
						user_id: obj.user_data.get_user_id(),
						task_id: task_id,
						hours: obj.timer.get_data().time / ( 1000 * 60 * 60 ),
						note: obj.page_data.get('note')
					},
					function ( response ) {
						console.log( 'time_entry', response );
						obj.timer.reset();
						obj.view.reset();
						obj.view.update_view({
							'success_message': 'Yay! Your time was logged.'
						});
						obj.view.update_view({
							tasks: obj.user_data.get().tasks,
							projects: obj.user_data.get().projects,
							customers: obj.user_data.get().customers
						});
					}
				);
			},
			create_a_task: function ( project_id , callback ) {
				obj.api_manager.create_a_task(
					{
						name: dom_task_select.textContent,
						project_id: project_id
					},
					function ( response ) {
						console.log( 'task', response );
						callback( response.id );
						obj.user_data.add_task( response );
					}
				);
			},
			create_a_project: function ( customer_id, callback ) {
				obj.api_manager.create_a_project(
					{
						name: dom_project_select.textContent,
						customer_id: customer_id,
						rate: dom_input_project_rate.value,
					},
					function ( response ) {
						response.customer = {
							id: customer_id,
							name: obj.user_data.get_customers_by_id( customer_id )[0].name
						};
						console.log( 'project', response );
						callback( response.id );
						obj.user_data.add_project( response );
					}
				);
			},
			create_a_customer: function ( callback ) {
				obj.api_manager.create_a_customer(
					{
						name: dom_customer_select.textContent,
						email: dom_email.value
					},
					function ( response ) {
						console.log( 'customer', response );
						callback( response.id );
						obj.user_data.add_customer( response );
					}
				);
			}
			
		};
		
		obj.hub = new V.EventHub( 'main_hub', { chrome: chrome, window: window });
		obj.user_data = new V.UserData();
		obj.page_data = new V.PageData();
		obj.storage_manager = new V.StorageManager( chrome );
		obj.api_manager = new V.ApiManager( $, obj.user_data, obj.page_data );
		obj.timer = new V.Timer( window, obj.hub );
		obj.view = new V.View( $, obj.hub );
		obj.validator = new V.Validator();
		
		obj.hub.add({
			
			'ready': function () {
				
				obj.storage_manager.get( function ( items ) {
				
					obj.timer.set_data( items.timer_data );
					obj.user_data.set({
						'token': items['log_in_obj'].token,
						'id': items['user_data'].id
					});
					
					obj.api_manager.get_customers( function ( customers ) {
						obj.api_manager.get_projects( function ( projects ) {
							obj.api_manager.get_tasks( function ( tasks ) {
								console.log( 'tasks', tasks );
								console.log( 'projects', projects );
								console.log( 'customers', customers );
								obj.user_data.set({
									tasks: tasks,
									projects: projects,
									customers: customers
								});
								obj.view.update_view({
									tasks: tasks,
									projects: projects,
									customers: customers
								});
								obj.view.update_view({
									'selected_customer': items['selected_customer'],
									'selected_project': items['selected_project'],
									'selected_task': items['selected_task']
								});
								chrome.tabs.query({ active: true, currentWindow: true }, function ( tabs ) {
									obj.hub.fire({
										name: 'page_data_request',
										tab_id: tabs[0].id,
										callback: function ( page_data ) {
											if ( page_data !== undefined ) {
												
												var projects = obj.user_data.get_projects_by_name( page_data.project_name );
												var tasks = obj.user_data.get_tasks_by_name( page_data.task_name );
												
												if ( projects[ 0 ] && tasks[ 0 ] && tasks[ 0 ].project_id == projects[ 0 ].id ) {
												
													obj.view.update_view({
														'selected_project': {
															id: projects[ 0 ].id,
															name: page_data['project_name']
														},
														'selected_task': {
															id: tasks[ 0 ].id,
															name: page_data['task_name']
														}
													});
													
												} else {
												
													obj.view.update_view({
														'selected_project': {
															id: 'new_project',
															name: page_data['project_name']
														},
														'selected_task': {
															id: 'new_task',
															name: page_data['task_name']
														}
													});
													
												};
												
											}
										}
									});
								});
							});
						});
					});
					
				});
				
			},
			
			'start_click': function () {
				obj.timer.start();
			},
			'pause_click': function () {
				obj.timer.pause();
			},
			'submit_click': function () {
				
				obj.page_data.get_items( null, function ( page_data ) {
					
					var validation_result = obj.validator.validate( page_data );
					
					if ( validation_result.valid === false ) {
						
						obj.view.update_view({
							'error_message': validation_result.message
						});
						
					} else {
				
						if ( dom_customer_select.value === 'new_customer' ) {
							obj.create_a_customer( function ( customer_id ) {
								obj.create_a_project( customer_id, function ( project_id ) {
									obj.create_a_task( project_id, function ( task_id ) {
										obj.create_a_time_entry( task_id );
									});
								});
							});
						} else if ( dom_project_select.value === 'new_project' ) {
							obj.create_a_project( dom_customer_select.value, function ( project_id ) {
								obj.create_a_task( project_id, function ( task_id ) {
									obj.create_a_time_entry( task_id );
								});
							});
						} else if ( dom_task_select.value === 'new_task' ) {
							obj.create_a_task( dom_project_select.value, function ( task_id ) {
								obj.create_a_time_entry( task_id );
							});
						} else {
							obj.create_a_time_entry( obj.page_data.get('selected_task').id );
						}
					
					}
					
				});
				
			},
			
			'project_select_changed': function () {
				obj.page_data.get_items( [ 'selected_project' ], function ( items ) {
					obj.storage_manager.set({
						'selected_project': items['selected_project']
					});
					obj.view.update_view({
						'selected_project': items['selected_project'],
						'tasks': obj.user_data.get_tasks_by_project_id( items['selected_project'].id )
					});
				});
			},
			'customer_select_changed': function () {
				obj.page_data.get_items( [ 'selected_customer' ], function ( items ) {
					obj.storage_manager.set({
						'selected_customer': items['selected_customer']
					});
					obj.view.update_view({
						'selected_customer': items['selected_customer']
					});
				});
			},
			'task_select_changed': function () {
				obj.page_data.get_items( [ 'selected_task' ], function ( items ) {
					obj.storage_manager.set({
						'selected_task': items['selected_task']
					});
				});
			},
			
			'timer_data_changed': function ( data ) {
				obj.storage_manager.set({
					'timer_data': data.timer_data
				});
				obj.view.update_view({
					'time': data.timer_data.time,
					'timer_active': data.timer_data.active
				});
			}
			
		});
		
		obj.hub.fire({ name: 'ready' });

		V.obj = obj;
		
	} ( window, jQuery, chrome ) );
	
	
	
	
	
	
	
	
	
	