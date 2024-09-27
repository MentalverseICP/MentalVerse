<?php 
//insert message
function insert_message($name, $message, $email){
	global $db;
	$query = "INSERT INTO messages (name, message, email) VALUES (?,?,?)";
	$query = $db->prepare($query);
	$query->bind_param('sss', $name, $message, $email);
	if($query->execute()){
		return true;
	}else{
		return false;
	}
}


function insert_subscriber( $email){
	global $db;
	$query = "INSERT INTO subscribers (email) VALUES (?)";
	$query = $db->prepare($query);
	$query->bind_param('s', $email);
	if($query->execute()){
		return true;
	}else{
		return false;
	}
}