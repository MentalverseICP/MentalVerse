<?php
ob_clean();
session_start();

// Display success message
if (isset($_SESSION['success'])) {
    echo "<div class='success'>" . $_SESSION['success'] . "</div>";
    unset($_SESSION['success']); // Clear the message after displaying it
}

// Display error message
if (isset($_SESSION['error'])) {
    echo "<div class='error'>" . $_SESSION['error'] . "</div>";
    unset($_SESSION['error']); // Clear the message after displaying it
}
