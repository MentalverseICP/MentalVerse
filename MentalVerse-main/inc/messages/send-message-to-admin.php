<?php
include('../session.php');
include("../../dev/messages/function.php");
include('../../../connection/connection.php');
include('../cleaninput.php');

session_start();

if($_SERVER['REQUEST_METHOD'] === 'POST'){
	$name = sanitize($_POST['name']);
    $message = $_POST['message']; 
    $email = sanitize($_POST['email']);

    if (empty($name) || empty($message) || empty($email)) {
        // Set an error message if any of the fields are empty
        $_SESSION['error'] = "All fields are required.";
        header("Location: ../../contactUs.php"); // Redirect back to the form page
        exit();
    }

	$run = insert_message($name, $message,  $email);
	
    if ($run) {
        $_SESSION['success'] = "Message sent successfully!";
        header("Location: ../../home.php"); // Redirect to a success page or the same page
    } else {
        $_SESSION['error'] = "Failed to send the message. Please try again.";
        header("Location: ../../contactUs.php"); // Redirect back to the form page
    }
}
