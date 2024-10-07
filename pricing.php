<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$title = "Pricing";
include('connection/connection.php');
include('inc/cleaninput.php');
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
     <title>MentalVerse | Pricing</title>
</head>
<body>
    
     <!-- Pricing Plans -->
     <div class="d-flex justify-content-center align-items-center">
          <div class="container">
               <div class="col d-flex flex-column gap-3 p-5 justify-content-center align-items-center text-center">
                    <h6 class="title">PRICING PLANS</h6>
                    <h1 class="head w-50 mx-auto text-center">Affordable Care Packages</h1>
                    <p class="story text-center w-75 mx-auto">Vulputate bibendum erat morbi interdum diam sit. Eu sit dolor vel sodales sed nibh ut. Ac fringilla fames eget a aliquet. Gravida placerat viverra purus sed ac ultricies sem nulla.</p>
                    <div class="row gap-3">
                         <!-- Standard Plan -->
                         <div class="col d-flex flex-column gap-2 justify-content-start align-items-start vard">
                              <div class="plan">Standard Plan</div>
                              <div class="descrition">Vulputate bibendum erat morbi interdum diam sit. Eu sit dolor vel</div>
                              <div class="d-flex align-items-center gap-2">
                                   <div class="price">200</div>
                                   <div class="length">month</div>
                              </div>
                              <span class="span1">Service included</span>
                              <hr>
                              <ul class="custom-list">
                                   <li><span>Sessions:</span> 4 sessions/month</li>
                                   <li><span>Duration:</span> 60 minutes</li>
                                   <li>Individual Therapy</li>
                                   <li><span>Features:</span> Online Resources</li>
                              </ul>
                              <button class="getStart mx-auto justify-content-center align-items-center text-center d-flex flex-column"><span>GET</span> <span>STARTED</span></button>
                         </div>
                         <!-- Premium Plan -->
                         <div class="col d-flex flex-column gap-2 justify-content-start align-items-start vard">
                              <div class="plan">Premium Plan</div>
                              <div class="descrition">Vulputate bibendum erat morbi interdum diam sit. Eu sit dolor vel</div>
                              <div class="d-flex align-items-center gap-2">
                                   <div class="price">500</div>
                                   <div class="length">month</div>
                              </div>
                              <span class="span1">Service included</span>
                              <hr>
                              <ul class="custom-list">
                                   <li><span>Sessions:</span> Unlimited sessions</li>
                                   <li><span>Duration:</span> 60 minutes</li>
                                   <li>Individual & Group</li>
                                   <li><span>Features:</span> 24/7 Support</li>
                              </ul>
                              <button class="getStart mx-auto justify-content-center align-items-center text-center d-flex flex-column"><span>GET</span> <span>STARTED</span></button>
                         </div>
                         <!-- Family Plan -->
                         <div class="col d-flex flex-column gap-2 justify-content-start align-items-start vard">
                              <div class="plan">Family Plan</div>
                              <div class="descrition">Vulputate bibendum erat morbi interdum diam sit. Eu sit dolor vel</div>
                              <div class="d-flex align-items-center gap-2">
                                   <div class="price">200</div>
                                   <div class="length">month</div>
                              </div>
                              <span class="span1">Service included</span>
                              <hr>
                              <ul class="custom-list">
                                   <li><span>Sessions:</span> 8 sessions/month</li>
                                   <li><span>Duration:</span> 90 minutes</li>
                                   <li>Family & Group</li>
                                   <li><span>Features:</span>Group Workshop</li>
                              </ul>
                              <button class="getStart mx-auto justify-content-center align-items-center text-center d-flex flex-column"><span>GET</span> <span>STARTED</span></button>
                         </div>
                    </div>
               </div>
          </div>
     </div>

     <!-- ----------- Statistic -------------- -->
     <section class="statistics position-relative d-flex justify-content-center align-items-center" style="background-color: #EFF5F0;">
     <div class="container">
          <div class="row row-cols-2 align-items-center">
               <div class="col d-flex flex-column gap-3 p-5">
                    <h6 class="title">Statistic</h6>
                    <h1 class="head">The Zenlift Guiding Principles</h1>
                    <ul class="row row-cols-2 g-4 custom-list3">
                         <li><span>Compassion</span> Vulputate bibendum erat morbi interdum diam sit. Eu sit dolor vel sodales sed nibh ut.</li>
                         <li><span>Duration:</span> 60 minutes</li>
                         <li>Individual Therapy</li>
                         <li><span>Features:</span> Online Resources</li>
                    </ul> 
               </div>
               <div class="col">
                    <div class="position-absolute bg-light d-flex justify-content-center align-items-center gap-2 mw-100" style="border-radius: 99px; height: 20rem; transform: translateX(-90px); left: 50%; bottom: 10px; z-index: 10;">
                         <div class=" d-flex justify-content-center align-items-center flex-column num2"><span>25</span> <span>+</span></div>
                         <div class="numText2 w-50">Qualified Professionals</div>
                    </div>
                    <img src="images/Image-12.png.png" alt="">
               </div>
          </div>
     </div>
     </section>

     <!-- ----------- Why Choose Us -------------- -->
     <section class="d-flex justify-content-center align-items-center">
     <div class="container">
               <div class="row row-cols-2 align-items-center">
                    <div><img src="images/Image-7.png" alt=""></div>
                    <div class="col d-flex flex-column gap-3 p-5 align-items-start text-left justify-content-start">
                         <h6 class="text-left title">Why Choose Us</h6>
                         <h1 class="text-left head w-75">Why Trust Us with Your Mental Health</h1>
                         <p class="text-left story">Vulputate bibendum erat morbi interdum diam sit. Eu sit dolor vel sodales sed nibh ut. Ac fringilla fames eget a aliquet. Gravida placerat viverra purus sed ac ultricies sem nulla.</p>
                         <ul class="text-left custom-list2">
                              <li>Expert Team of Professionals</li>
                              <li>Personalized Treatment Plans</li>
                              <li>Holistic Approach to Wellness</li>
                              <li>Comprehensive Range of Services</li>
                         </ul>
                         <button class="text-left getStart">GET STARTED TODAY</button>
                    </div>
               </div>
     </div>
     </section>


     <!-- BootStrap Js -->
     <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
     <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
</body>
</html>