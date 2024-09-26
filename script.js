const navActive = document.querySelectorAll('nav .nav-link'),
          menuOpen = document.querySelector('#menu_open'),
          menuList = document.querySelector('.nav-menu')
          // logoContainer = document.querySelector('.about_bottom')
          // logoList = document.querySelectorAll('.about_bottom img')

// WINDOW SCROLL
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('window-scroll', window.scrollY > 0)
})

// TOGGLE MENU BAR
menuOpen.addEventListener('click', () => {
  menuList.classList.toggle('open')
})

// ACTIVE NAVBAR
navActive.forEach(links => {
  links.addEventListener('click', () => {
    links.classList.contains('active') ? links.classList.remove('active') : previous(); links.classList.add('active')
  console.log('done')
  })
})

function previous() {
  const check = document.querySelector('.active')
  if (check) {
    check.classList.remove('active')
  }
}

// SWIPER
var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 10,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: true,
    pauseOnMouseEnter: true,
    reverseDirection: false,
    stopOnLastSlide: false,
    waitForTransition: true,
  },            
  //when window width is >= 600px
  breakpoints: {
    1000: {
      slidesPerView: 2,
    }
  },
});

// LOGO SCROLL
//  console.log(logoList)
//  logoList.forEach(logo => {
//   const clone = logo.cloneNode(true);
//   logoContainer.appendChild(clone)
//  })