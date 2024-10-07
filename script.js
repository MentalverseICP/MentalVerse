const navActive = document.querySelectorAll('nav .nav-link'),
          menuOpen = document.querySelector('#menu_open'),
          menuList = document.querySelector('.nav-menu'),
          dropdowns = document.querySelectorAll('.dropdown')

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
  })
})

function previous() {
  const check = document.querySelector('.active')
  if (check) {
    check.classList.remove('active')
  }
}



// FAQ TOGGLE
const faq = document.querySelectorAll('.faq')

faq.forEach(qFaq => {
  qFaq.addEventListener('click', () => {
    if (qFaq.classList.contains('accordian')) {
      qFaq.classList.remove('accordian')
    } else {
      prevFaq()
      qFaq.classList.add('accordian')
    }
  })
})

function prevFaq() {
  const check = document.querySelector('.accordian')
  if (check) {
    check.classList.remove('accordian')
  }
}



// DROPDOWN MENU
dropdowns.forEach(dropdown => {
  const select = dropdown.querySelector('.select'),
            caret = dropdown.querySelector('.caret'),
            dropdownMenu = dropdown.querySelector('.dropdown_menu'),
            options = dropdown.querySelectorAll('.dropdown_menu li'),
            selected = dropdown.querySelector('.selected')

  select.addEventListener('click', () => {
    caret.classList.toggle('caret-rotate')
    dropdownMenu.classList.toggle('dropdown_menu-open')
  })

  options.forEach(option => {
    option.addEventListener('click', () => {
      //  to change the text from service to the selected item
      // selected.innerText = option.innerText;
      // selected.innerHTML = `<span class="material-symbols-outlined caret">play_for_work</span>`
      caret.classList.remove('caret-rotate')
      dropdownMenu.classList.remove('dropdown_menu-open')

      options.forEach(option => {
        option.classlist.remove('drop')
      })
      option.classList.add('drop')
    })
  })
})




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
