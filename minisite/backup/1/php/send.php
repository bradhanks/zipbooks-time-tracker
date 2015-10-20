<?php

	include('httpful.phar');

	function get_data () {
		$body = file_get_contents('php://input');
		$data = json_decode( $body, true );
		return $data;
	}
	
	$response = \Httpful\Request::get();
	
?>