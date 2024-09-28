<?php
include('../../../connection/connection.php');
include('../cleaninput.php');
include("../../dev/messages/function.php");
include('../session.php');

session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email']);
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Insert into database
        $run = insert_subscriber($email);

        if ($run) {
            $_SESSION['success'] = "Succsessfully Subscribed";
            header("Location: ../../home.php"); // Redirect to a success page or the same page
        } else {
            $_SESSION['error'] = "Subscription Failed";
            header("Location: ../../home.php"); // Redirect back to the form page
        }
    }
}
