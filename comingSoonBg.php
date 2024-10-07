<?php
$title = "comingSoonBg";
include('../connection/connection.php');
include('inc/cleaninput.php');
include('inc/feedback.php');

?>
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link rel="shortcut icon" href="images/Logo mark with letter mark.png" type="image/x-icon">
     <!-- Font -->
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
     <!-- Bootstrap CSS -->
     <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
     <link rel="stylesheet" href="style.css">
     <link rel="stylesheet" href="all.css">
     <title>MentalVerse | Coming Soon</title>
</head>
<body class="overflow-hidden">
    
     <section class="position-relative coming">
          <div class="line position-absolute bottom-0"><img src="/images/Line (1).png" alt=""></div>
          <div class="line position-absolute bottom-0"><img src="/images/Line.png" alt=""></div>
          <div class="position-sticky d-flex justify-content-center align-items-center flex-column space-y-5 py-3" style="z-index: 1000;">
               <div class="logos">
                    <img src="images/Asset 3-1 1.png" alt="" class="object-fit-contain">
               </div>
               <div class="headText">COMING SOON</div>
               <div class="count d-flex justify-content-center align-items-center gap-5 md-gap-3">
                    <div class="d-flex justify-content-center align-items-center flex-column gap-2">
                         <span class="month"></span>
                         <span class="texts">Months</span>
                    </div>
                    <div>:</div>
                    <div class="d-flex justify-content-center align-items-center flex-column gap-2">
                         <span class="day"></span>
                         <span class="texts">days</span>
                    </div>
                    <div>:</div>
                    <div class="d-flex justify-content-center align-items-center flex-column gap-2">
                         <span class="hour"></span>
                         <span class="texts">hours</span>
                    </div>
                    <div>:</div>
                    <div class="d-flex justify-content-center align-items-center flex-column gap-2">
                         <span class="min"></span>
                         <span class="texts">mins</span>
                    </div>
               </div>
               <div class="informate">SignUp to get an update on our Launch Date</div>
               <form class="email d-flex jusfify-content-center align-items-center p-2">
                    <input type="email" placeholder="Your Email" />
                    <button type="submit">Notify me via email</button>
               </form>
               <div class="d-flex jusfify-content-center align-items-center gap-3">
                    <a href="#" class="icon08">
                         <i class="fa-brands fa-facebook-f"></i>
                    </a>
                    <a href="#" class="icon08">
                         <i class="fa-brands fa-twitter"></i>
                    </a>
                    <a href="#" class="icon08">
                         <i class="fa-brands fa-square-instagram"></i>
                    </a>
                    <a href="#" class="icon08">
                         <i class="fa-brands fa-linkedin"></i>
                    </a>
               </div>
          </div>
     </section>


      <!-- BootStrap Js -->
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
      <!-- Font Awsome -->
      <script src="https://kit.fontawesome.com/2a49fbdbb8.js" crossorigin="anonymous"></script>
      <script>
          // Select the elements by their class names
          const monthElement = document.querySelector('.month');
          const dayElement = document.querySelector('.day');
          const hourElement = document.querySelector('.hour');
          const minElement = document.querySelector('.min');

          // Function to calculate the countdown
          function startCountdown(targetDate) {
          const countdown = setInterval(() => {
               const now = new Date().getTime();
               const distance = targetDate - now;
               
               // Time calculations for months, days, hours, and minutes
               const months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
               const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
               const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
               const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
               
               // Update the countdown display
               monthElement.textContent = months;
               dayElement.textContent = days;
               hourElement.textContent = hours;
               minElement.textContent = minutes;
               
               // If the countdown is over, stop the interval
               if (distance < 0) {
                    clearInterval(countdown);
                    monthElement.textContent = '0';
                    dayElement.textContent = '0';
                    hourElement.textContent = '0';
                    minElement.textContent = '0';
               }
          }, 1000);  // Update every second
          }

          // Set the target date (change this date as needed)
          const targetDate = new Date('November 24, 2024 23:59:59').getTime();

          // Start the countdown
          startCountdown(targetDate);

      </script>
 </body>
 </html>