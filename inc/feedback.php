<?php
ob_clean();
session_start();
?>

<!-- // Display success message -->
<!-- if (isset($_SESSION['success'])) {
    echo "<div class='success'>" . $_SESSION['success'] . "</div>";
    unset($_SESSION['success']); // Clear the message after displaying it
} -->
<?php if(isset($_SESSION['success'])){ ?>
	<div class="alert alert-success">
		<button type="button" class="close" data-dismiss="alert">×</button>
		<?php
			echo $_SESSION['success'];
			unset($_SESSION['success']);
		?>
	</div>
<?php } ?>

<!-- Display error message -->
<?php if(isset($_SESSION['error'])){ ?>
	<div class="alert alert-error">
		<button type="button" class="close" data-dismiss="alert">×</button>
		<?php 
			echo $_SESSION['error'];
			unset($_SESSION['error']);
		?>
	</div>
<?php } ?>