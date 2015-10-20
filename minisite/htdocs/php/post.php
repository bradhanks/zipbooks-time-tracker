<?php

	include('httpful.phar');
	
	class Zipbooks {
	
		private static $token;
		private static $invoice_id;
		private static $customer_id;
		private static $email = 'dummy@dummy.dummy';
		private static $password = 'dummydummydummy';
		
		private function post ( $url, $body ) {
			return \Httpful\Request::post( $url )
				->body( $body )
				->method('POST')
				->withoutStrictSsl()
				->expectsJson()
				->sendsType('application/x-www-form-urlencoded')
				->send();
		}
		private function put ( $url, $body ) {
			return \Httpful\Request::put( $url )
				->body( $body )
				->method('PUT')
				->withoutStrictSsl()
				->expectsJson()
				->sendsType('application/x-www-form-urlencoded')
				->send();
		}
	
		public static function get_token () {
			Zipbooks::$token =  Zipbooks::post( 
				'https://api.zipbooks.com/v1/auth/login',
				'email='.Zipbooks::$email.
				'&password='.Zipbooks::$password
			)->body->token;
			return Zipbooks::$token;
		}
		public static function update_account ( $data ) {
			Zipbooks::put(
				'https://api.zipbooks.com/v1/account?token='.Zipbooks::$token,
				'name='.$data['user_first_name']." ".$data['user_last_name'].
				'&address_1='.$data['user_address_1'].
				'&address_2='.$data['user_address_2'].
				'&city='.$data['user_city'].
				'&state='.$data['user_state'].
				'&country='.$data['user_country']
			);
		}
		public static function create_customer ( $data ) {
			Zipbooks::$customer_id = Zipbooks::post(
				'https://api.zipbooks.com/v1/customers?token='.Zipbooks::$token,
				'name='.$data['customer_name'].
				'&email='.$data['customer_email'].
				'&address_1='.$data['customer_address_1'].
				'&address_2='.$data['customer_address_2'].
				'&city='.$data['customer_city'].
				'&state='.$data['customer_state'].
				'&postal_code='.$data['customer_postal_code'].
				'&country='.$data['customer_country']
			)->body->id;
		}
		public static function create_invoice ( $data ) {
			Zipbooks::$invoice_id = Zipbooks::post(
				'https://api.zipbooks.com/v1/invoices?token='.Zipbooks::$token,
				'customer='.Zipbooks::$customer_id.
				'&number='.$data['number'].
				'&date='.$data['date'].
				'&discount='.$data['discount'].
				'&accept_credit_cards='.$data['accept_credit_cards'].
				'&terms='.$data['terms'].
				'&notes='.$data['notes'].
				$data['lineItems']
			)->body->id;
		}
		public static function send_invoice ( $data ) {
			Zipbooks::post(
				'https://api.zipbooks.com/v1/invoices/'.Zipbooks::$invoice_id.'/send?token='.Zipbooks::$token,
				'send_to='.$data['send_to'].
				'&subject='.$data['subject'].
				'&message='.$data['message'].
				'&attach_pdf='.$data['attach_pdf'].
				'&bcc='.$data['bcc']
			);
		}
		
	}
	
	function get_data () {
		$body = file_get_contents('php://input');
		$data = json_decode( $body, true );
		return $data;
	}
	
	$data = get_data();
	
	Zipbooks::get_token();
	Zipbooks::update_account( $data );
	Zipbooks::create_customer( $data );
	Zipbooks::create_invoice( $data );
	Zipbooks::send_invoice( $data );
	
	print('success');
	
?>